# Better Auth JWT Plugin Configuration - Research Summary

**Feature**: 002-auth-identity
**Date**: 2026-01-15
**Research Focus**: Optimal JWT plugin configuration for Next.js 16.0.10 + FastAPI architecture

---

## Executive Summary

This document provides research-backed decisions for configuring the Better Auth JWT plugin in a Next.js frontend with FastAPI backend architecture, using a shared secret for stateless authentication.

**Key Decisions**:
- **Algorithm**: HS256 (symmetric, shared secret)
- **Access Token Expiration**: 15 minutes
- **Refresh Token Expiration**: 7 days (handled by Better Auth)
- **JWT Claims**: `sub` (user_id), `email`, `exp`, `iat`, `iss`, `aud`
- **Database Tables**: `user`, `session`, `account`, `verification`

---

## Research Questions & Decisions

### 1. JWT Algorithm: HS256 vs RS256

**Decision**: Use **HS256** (HMAC with SHA-256)

**Rationale**:

**Context**: Our architecture features a trusted internal boundary between Next.js frontend (with Better Auth) and FastAPI backend. Both services are under the same administrative control and share infrastructure.

**Why HS256 is Optimal for This Use Case**:

1. **Simplified Key Management**: Single shared secret (`BETTER_AUTH_SECRET`) is easier to manage across two tightly-coupled services in the same trust boundary
2. **Performance**: HS256 is significantly faster than RS256, requiring less computational resources for signing and verification [1]
3. **Lower Complexity**: No public/private key pair management, rotation complexity, or JWKS endpoint required
4. **Appropriate Security Model**: Since both auth issuance (Better Auth) and validation (FastAPI) are within our controlled infrastructure, the symmetric key model is sufficient
5. **Better Auth Default**: Better Auth's JWT plugin is optimized for HS256 with shared secrets

**When RS256 Would Be Preferred**:
- Multiple third-party services need to verify tokens (require public key distribution)
- Enhanced non-repudiation is required (only private key holder can sign)
- Microservices architecture with untrusted service boundaries

**Security Requirements with HS256**:
- Secret MUST be at least 256 bits (32 bytes) and cryptographically random
- Secret MUST be stored in environment variables only (never in code)
- Secret rotation requires coordinated deployment to both services
- Use secure environment variable management (e.g., Vercel environment variables, Docker secrets)

**Sources**:
- [RS256 vs HS256: What's the difference? | Auth0](https://auth0.com/blog/rs256-vs-hs256-whats-the-difference/)
- [Compare RS256 vs HS256 JWT algorithms | SuperTokens](https://supertokens.com/blog/rs256-vs-hs256)
- [RS256 vs HS256: Why You Should Switch to Asymmetric JWT for Production | Medium](https://medium.com/@sindhujad6/rs256-vs-hs256-why-you-should-switch-to-asymmetric-jwt-for-production-7c0f130d25e9)

---

### 2. Token Expiration Time

**Decision**:
- **Access Token**: 15 minutes (900 seconds)
- **Refresh Token**: 7 days (604800 seconds) - handled automatically by Better Auth

**Rationale**:

**Access Token (15 minutes)**:
1. **Security Best Practice**: Industry standard for high-security web applications balances security with user experience [2]
2. **Minimized Attack Window**: If a token is stolen, the damage window is limited to 15 minutes
3. **Stateless Backend**: Short-lived tokens reduce the need for token blacklisting on the stateless FastAPI backend
4. **Refresh Token Pattern**: Paired with a 7-day refresh token to maintain user sessions without requiring re-authentication

**Refresh Token (7 days)**:
1. **User Experience**: Users remain authenticated for a week without re-entering credentials
2. **Better Auth Managed**: Better Auth automatically handles refresh token issuance, storage (HttpOnly cookies), and rotation
3. **Security**: Refresh tokens are stored in HttpOnly cookies (not accessible to JavaScript), reducing XSS risk

**Alternative Configurations Considered**:
- **5 minutes**: Too aggressive; would require frequent refreshes and impact UX
- **1 hour**: Increases attack window 4x; not justified for this use case
- **24 hours**: Violates security best practices; excessive risk if token is compromised

**Implementation**:
```typescript
// Better Auth JWT plugin configuration
jwt({
  jwt: {
    expirationTime: "15m", // Access token: 15 minutes
    issuer: process.env.NEXT_PUBLIC_APP_URL,
    audience: process.env.NEXT_PUBLIC_APP_URL,
  }
})

// Better Auth session configuration (controls refresh tokens)
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
}
```

**Sources**:
- [Understanding JWT Expiration Time claim (exp) | Security Boulevard](https://securityboulevard.com/2025/09/understanding-jwt-expiration-time-claim-exp/)
- [Token Best Practices | Auth0 Docs](https://auth0.com/docs/secure/tokens/token-best-practices)
- [JWT Security Best Practices for 2025 | JWT.app](https://jwt.app/blog/jwt-best-practices/)
- [Token Expiry Best Practices | Zuplo Learning Center](https://zuplo.com/learning-center/token-expiry-best-practices)

---

### 3. definePayload Configuration

**Decision**: Use `definePayload` to include `user_id` (as `sub`), `email`, and standard claims

**Rationale**:

1. **Minimal Payload Principle**: Only include claims required by the backend for authorization and user identification
2. **Backend Requirements**: FastAPI needs `user_id` (mapped to JWT `sub` claim) and `email` for user identification and data filtering
3. **Standard Compliance**: Follow JWT best practices by using standard claim names (`sub`, `email`, `exp`, `iat`, `iss`, `aud`)
4. **Performance**: Smaller tokens reduce network overhead and improve parsing performance

**Configuration**:

```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    // Database configuration
  },
  plugins: [
    jwt({
      jwt: {
        // Algorithm (HS256 is default with shared secret)

        // Expiration
        expirationTime: "15m", // 15 minutes

        // Issuer and Audience (for validation)
        issuer: process.env.NEXT_PUBLIC_APP_URL, // e.g., "http://localhost:3000"
        audience: process.env.NEXT_PUBLIC_APP_URL,

        // Custom subject (default is user.id, but can be customized)
        getSubject: (session) => {
          return session.user.id; // Maps to JWT 'sub' claim
        },

        // Custom payload with only required claims
        definePayload: ({ user }) => {
          return {
            // sub: user.id is automatically added by getSubject
            email: user.email,
            // exp, iat, iss, aud are automatically added by Better Auth
          };
        }
      }
    })
  ]
});
```

**Resulting JWT Payload**:
```json
{
  "sub": "user_uuid_here",           // user.id (from getSubject)
  "email": "user@example.com",       // from definePayload
  "exp": 1737900000,                 // expiration timestamp (auto)
  "iat": 1737899100,                 // issued at timestamp (auto)
  "iss": "http://localhost:3000",    // issuer (auto)
  "aud": "http://localhost:3000"     // audience (auto)
}
```

**Backend Extraction (FastAPI)**:
```python
from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET"),  # Same as BETTER_AUTH_SECRET
            algorithms=["HS256"],
            audience=os.getenv("NEXT_PUBLIC_APP_URL"),
            issuer=os.getenv("NEXT_PUBLIC_APP_URL"),
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": True,
                "require_exp": True,
            }
        )

        user_id = payload.get("sub")  # Extract user_id from sub claim
        email = payload.get("email")  # Extract email

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {"user_id": user_id, "email": email}

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Sources**:
- Better Auth documentation (Context7: `/better-auth/better-auth`)
- [JWT Best Practices | Curity](https://curity.io/resources/learn/jwt-best-practices/)

---

### 4. Database Tables Required by Better Auth

**Decision**: Implement four core tables: `user`, `session`, `account`, `verification`

**Rationale**:

Better Auth requires these tables to manage authentication state, even though the backend API is stateless. The frontend (Better Auth) manages sessions, while the backend validates JWTs without touching these tables.

**Required Tables**:

#### 4.1 `user` Table
Stores user identity information.

```sql
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Purpose**: Core user identity; referenced by sessions and accounts.

#### 4.2 `session` Table
Stores active user sessions managed by Better Auth.

```sql
CREATE TABLE "session" (
  id TEXT PRIMARY KEY,
  expires_at TIMESTAMP NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX session_user_id_idx ON "session"(user_id);
```

**Purpose**: Session management for refresh token rotation and session validation.

#### 4.3 `account` Table
Stores authentication provider credentials (email/password in our case).

```sql
CREATE TABLE "account" (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at TIMESTAMP,
  refresh_token_expires_at TIMESTAMP,
  scope TEXT,
  password TEXT,  -- Hashed password for email/password auth
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX account_user_id_idx ON "account"(user_id);
```

**Purpose**: Stores hashed passwords for email/password authentication; extensible for future OAuth providers.

#### 4.4 `verification` Table
Stores tokens for email verification and password reset flows.

```sql
CREATE TABLE "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX verification_identifier_idx ON "verification"(identifier);
```

**Purpose**: Future-proofing for email verification and password reset features (currently out of scope per spec).

**Database ORM (SQLModel)**:

Use SQLModel for type-safe database models in the backend (for future admin/user management features):

```python
# backend/app/models/user.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "user"

    id: str = Field(primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    email_verified: bool = Field(default=False)
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Important Notes**:
- The **backend does NOT query these tables for authentication**
- Authentication is stateless via JWT validation only
- These tables are used by Better Auth on the frontend for session management
- Backend may use `user` table for admin features or user profile management in the future

**Sources**:
- Better Auth database schema documentation (Context7: `/better-auth/better-auth`)
- [Session Table Schema Definition | Better Auth Docs](https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/concepts/database.mdx)

---

### 5. Frontend to Backend JWT Transmission

**Decision**: Use `Authorization: Bearer <token>` HTTP header for API requests

**Rationale**:

1. **Industry Standard**: RFC 6750 OAuth 2.0 Bearer Token standard
2. **CORS Compatibility**: Works seamlessly with cross-origin requests
3. **Security**: Tokens are sent only when explicitly attached to requests (not automatically like cookies)
4. **Better Auth Integration**: Better Auth client provides `getAccessToken()` method for easy token retrieval

**Implementation**:

#### Frontend (Next.js API Client)

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

// src/services/api.ts
import { authClient } from "@/lib/auth-client";

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }

  private async getHeaders(): Promise<HeadersInit> {
    const session = await authClient.getSession();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Attach JWT token if user is authenticated
    if (session?.data?.accessToken) {
      headers["Authorization"] = `Bearer ${session.data.accessToken}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // ... other methods (PATCH, DELETE)
}

export const api = new ApiClient();
```

#### Backend (FastAPI Dependency)

```python
# backend/app/dependencies.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError
import os

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Validates JWT token from Authorization header and extracts user identity.

    Returns:
        dict: {"user_id": str, "email": str}

    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET"),  # Same as BETTER_AUTH_SECRET
            algorithms=["HS256"],
            audience=os.getenv("NEXT_PUBLIC_APP_URL"),
            issuer=os.getenv("NEXT_PUBLIC_APP_URL"),
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": True,
                "verify_iss": True,
                "require_exp": True,
                "require_iat": True,
            }
        )

        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token: missing user_id"
            )

        return {"user_id": user_id, "email": email}

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {str(e)}"
        )

# Usage in protected routes
from fastapi import APIRouter

router = APIRouter()

@router.get("/todos")
async def list_todos(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    # Query todos filtered by user_id
    return {"todos": [], "user_id": user_id}
```

**Security Considerations**:
- Tokens are transmitted over HTTPS only (enforce in production)
- Tokens are NOT stored in localStorage (XSS vulnerability) - Better Auth uses memory storage
- Refresh tokens are stored in HttpOnly cookies (managed by Better Auth)
- CORS is configured to allow frontend origin only

**Alternative Approaches (Not Recommended)**:
- **Cookies for JWT**: Complicates CORS; Better Auth already uses cookies for refresh tokens
- **Query Parameters**: Security risk; tokens visible in logs and browser history
- **Custom Headers**: Non-standard; breaks compatibility with API gateways and proxies

**Sources**:
- [RFC 6750: OAuth 2.0 Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750)
- Better Auth client documentation (Context7: `/better-auth/better-auth`)

---

## Complete Configuration Examples

### Better Auth Configuration (Frontend)

```typescript
// frontend/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },

  secret: process.env.BETTER_AUTH_SECRET, // Minimum 32 characters

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days for refresh tokens
  },

  plugins: [
    jwt({
      jwt: {
        expirationTime: "15m", // Access token: 15 minutes
        issuer: process.env.NEXT_PUBLIC_APP_URL,
        audience: process.env.NEXT_PUBLIC_APP_URL,

        // Use user.id as the JWT subject (sub claim)
        getSubject: (session) => session.user.id,

        // Include only required claims in JWT payload
        definePayload: ({ user }) => ({
          email: user.email,
          // sub, exp, iat, iss, aud are added automatically
        }),
      },
    }),
  ],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Password requirements enforced here
  },
});
```

### FastAPI JWT Validation (Backend)

```python
# backend/app/dependencies.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError, JWTClaimsError
from pydantic import BaseModel
import os

security = HTTPBearer()

class CurrentUser(BaseModel):
    user_id: str
    email: str

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> CurrentUser:
    """
    Dependency for protected routes.
    Validates JWT and returns authenticated user identity.
    """
    token = credentials.credentials
    jwt_secret = os.getenv("JWT_SECRET")  # Must match BETTER_AUTH_SECRET
    app_url = os.getenv("NEXT_PUBLIC_APP_URL")

    if not jwt_secret:
        raise HTTPException(
            status_code=500,
            detail="JWT_SECRET not configured"
        )

    try:
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            audience=app_url,
            issuer=app_url,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": True,
                "verify_iss": True,
                "require_exp": True,
                "require_iat": True,
                "leeway": 10,  # 10 seconds clock skew tolerance
            }
        )

        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id or not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload"
            )

        return CurrentUser(user_id=user_id, email=email)

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )
    except JWTClaimsError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token claims: {str(e)}"
        )
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Token validation failed: {str(e)}"
        )

# Example protected route
from fastapi import APIRouter

router = APIRouter()

@router.get("/api/todos")
async def get_todos(current_user: CurrentUser = Depends(get_current_user)):
    # Access user identity
    user_id = current_user.user_id
    email = current_user.email

    # Query todos filtered by user_id
    # ...

    return {"todos": [], "user": {"id": user_id, "email": email}}
```

### Environment Variables

#### Frontend (.env.local)
```bash
# Better Auth
BETTER_AUTH_SECRET=your-32-plus-character-secret-key-here-use-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:3000

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Database (shared with backend or separate)
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
```

#### Backend (.env)
```bash
# JWT Validation (MUST match BETTER_AUTH_SECRET)
JWT_SECRET=your-32-plus-character-secret-key-here-use-openssl-rand-base64-32

# App URLs (for token validation)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db

# Environment
ENVIRONMENT=development
```

**Critical**: `JWT_SECRET` in backend MUST exactly match `BETTER_AUTH_SECRET` in frontend.

---

## Security Checklist

- [ ] **Secret Strength**: `BETTER_AUTH_SECRET` is minimum 32 characters, cryptographically random
- [ ] **Secret Storage**: Secrets stored in environment variables only, never in code or version control
- [ ] **HTTPS Only**: Production deployment uses HTTPS for all communication
- [ ] **CORS Configuration**: FastAPI CORS restricted to frontend origin only
- [ ] **Token Expiration**: Access tokens expire in 15 minutes
- [ ] **Refresh Tokens**: Stored in HttpOnly cookies (managed by Better Auth)
- [ ] **Clock Skew**: Backend JWT validation includes 10-second leeway for time drift
- [ ] **Error Messages**: Generic error messages for authentication failures (don't reveal whether user exists)
- [ ] **Audience Validation**: Backend validates `iss` and `aud` claims match expected values
- [ ] **Algorithm Whitelist**: Backend explicitly requires `HS256` algorithm (prevents algorithm confusion attacks)

---

## Migration Path to RS256 (Future Enhancement)

If the application evolves to require RS256 (e.g., third-party integrations, enhanced security requirements):

1. **Generate RSA Key Pair**:
   ```bash
   openssl genrsa -out private.pem 2048
   openssl rsa -in private.pem -pubout -out public.pem
   ```

2. **Update Better Auth**:
   ```typescript
   jwt({
     jwt: {
       algorithm: "RS256",
       privateKey: process.env.JWT_PRIVATE_KEY,
       publicKey: process.env.JWT_PUBLIC_KEY,
     }
   })
   ```

3. **Update FastAPI**:
   ```python
   from cryptography.hazmat.primitives import serialization

   public_key = serialization.load_pem_public_key(
       os.getenv("JWT_PUBLIC_KEY").encode()
   )

   payload = jwt.decode(
       token,
       public_key,
       algorithms=["RS256"]
   )
   ```

4. **Deployment Strategy**: Blue-green deployment with overlapping key support during rotation

---

## References

1. [RS256 vs HS256: What's the difference? | Auth0](https://auth0.com/blog/rs256-vs-hs256-whats-the-difference/)
2. [Understanding JWT Expiration Time claim (exp) | Security Boulevard](https://securityboulevard.com/2025/09/understanding-jwt-expiration-time-claim-exp/)
3. [Token Best Practices | Auth0 Docs](https://auth0.com/docs/secure/tokens/token-best-practices)
4. [JWT Security Best Practices for 2025 | JWT.app](https://jwt.app/blog/jwt-best-practices/)
5. [Better Auth Documentation | Context7](https://github.com/better-auth/better-auth)
6. [Python-JOSE Documentation | Context7](https://context7.com/mpdavis/python-jose)
7. [Compare RS256 vs HS256 JWT algorithms | SuperTokens](https://supertokens.com/blog/rs256-vs-hs256)
8. [Token Expiry Best Practices | Zuplo Learning Center](https://zuplo.com/learning-center/token-expiry-best-practices)

---

**Document Status**: Complete
**Next Steps**: Update `specs/002-auth-identity/plan.md` with these decisions and proceed to task breakdown
