# Research: Authentication & Identity Model

**Feature**: 002-auth-identity
**Date**: 2026-01-15
**Status**: Complete

## Research Questions & Decisions

### 1. JWT Algorithm Selection

**Decision**: HS256 (HMAC with SHA-256)

**Rationale**:
- Architecture has trusted internal boundary between Next.js and FastAPI
- Both services under same administrative control
- Symmetric key encryption is optimal for performance (~10x faster than RS256)
- Simpler secret management (one shared secret vs key pair)

**Alternatives Considered**:
- RS256 (asymmetric): Better for third-party integrations, but adds complexity
- ES256: Smaller signatures, but not widely supported by FastAPI ecosystem

**Source**: [Auth0 - RS256 vs HS256](https://auth0.com/blog/rs256-vs-hs256-whats-the-difference/)

---

### 2. Token Expiration Times

**Decision**:
- Access Token: 15 minutes
- Refresh Token: 7 days (managed by Better Auth)

**Rationale**:
- 15 minutes balances security (minimal attack window) with UX
- Better Auth handles automatic token refresh transparently
- Industry standard for session-based applications

**Alternatives Considered**:
- 1 hour access tokens: Less secure, larger attack window
- 5 minute tokens: Too aggressive, poor UX on slow networks

**Source**: [Auth0 Token Best Practices](https://auth0.com/docs/secure/tokens/token-best-practices)

---

### 3. JWT Payload Structure

**Decision**: Include `sub` (user_id), `email`, `exp`, `iat`

**Rationale**:
- `sub`: Standard claim for user identity (UUID)
- `email`: Needed for backend user identification without DB lookup
- `exp`: Required for expiration validation
- `iat`: Useful for token age analysis and security audits

**Configuration**:
```typescript
jwt({
  jwt: {
    expirationTime: "15m",
    definePayload: ({ user }) => ({
      sub: user.id,
      email: user.email,
    }),
  },
})
```

---

### 4. Database Schema for Better Auth

**Decision**: Use Better Auth's standard tables with PostgreSQL

**Tables Required**:
| Table | Purpose |
|-------|---------|
| `user` | Core identity (id, email, name, emailVerified) |
| `session` | Session tracking (token, expiresAt, userId) |
| `account` | Provider credentials (password hash, providerId) |
| `verification` | Future email verification/password reset |

**Rationale**:
- Better Auth requires these tables for session management
- Using standard schema ensures compatibility with Better Auth CLI
- UUIDs for primary keys (aligns with backend CurrentUser model)

---

### 5. Frontend-to-Backend JWT Transmission

**Decision**: `Authorization: Bearer <token>` HTTP header

**Rationale**:
- RFC 6750 standard for OAuth 2.0 Bearer tokens
- Supported by FastAPI's HTTPBearer security scheme
- Already implemented in `backend/app/dependencies.py`

**Frontend Implementation**:
```typescript
// In api.ts service
const token = await getSessionToken();
fetch('/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

### 6. Secret Key Requirements

**Decision**: Minimum 32 characters, cryptographically random

**Rationale**:
- HS256 security depends entirely on secret strength
- 32 characters = 256 bits minimum entropy
- Must be identical across frontend (BETTER_AUTH_SECRET) and backend (JWT_SECRET)

**Environment Configuration**:
```bash
# Frontend .env
BETTER_AUTH_SECRET=your-32-char-cryptographically-random-secret

# Backend .env
JWT_SECRET=your-32-char-cryptographically-random-secret  # Same value!
```

---

## Existing Code Analysis

### Frontend (Already Implemented)
- `frontend/src/lib/auth.ts`: Better Auth client configured
- `frontend/src/lib/auth-server.ts`: Server handler (needs JWT plugin)
- `frontend/src/app/api/auth/[...all]/route.ts`: Auth routes active

### Backend (Already Implemented)
- `backend/app/dependencies.py`: JWT validation dependency functional
- `backend/app/config.py`: JWT_SECRET and JWT_ALGORITHM configured
- Uses python-jose for JWT verification

### Gap Analysis
| Component | Status | Action Needed |
|-----------|--------|---------------|
| Better Auth JWT plugin | Missing | Add jwt() plugin to auth-server.ts |
| Database adapter | Missing | Configure drizzle/prisma adapter |
| Auth tables | Missing | Create migration for user/session/account |
| Frontend API client | Partial | Add Authorization header to api.ts |

---

## Security Considerations

1. **Secret Synchronization**: BETTER_AUTH_SECRET and JWT_SECRET must be identical
2. **HTTPS Required**: JWT in Authorization header must use TLS in production
3. **Token Storage**: Better Auth handles secure storage (HttpOnly cookies)
4. **Clock Skew**: Backend should allow ~30s tolerance for exp validation

---

## References

1. [Better Auth JWT Plugin](https://www.better-auth.com/docs/plugins/jwt)
2. [Auth0 RS256 vs HS256](https://auth0.com/blog/rs256-vs-hs256-whats-the-difference/)
3. [Auth0 Token Best Practices](https://auth0.com/docs/secure/tokens/token-best-practices)
4. [RFC 6750 - Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750)
5. [python-jose Documentation](https://python-jose.readthedocs.io/)
