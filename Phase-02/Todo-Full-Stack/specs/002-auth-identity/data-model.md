# Data Model: Authentication & Identity

**Feature**: 002-auth-identity
**Date**: 2026-01-15
**Status**: Complete

## Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│      user       │         │     session     │
├─────────────────┤         ├─────────────────┤
│ id (PK, UUID)   │◄────────│ userId (FK)     │
│ email (UNIQUE)  │         │ id (PK, TEXT)   │
│ emailVerified   │         │ token (UNIQUE)  │
│ name            │         │ expiresAt       │
│ image           │         │ ipAddress       │
│ createdAt       │         │ userAgent       │
│ updatedAt       │         │ createdAt       │
└─────────────────┘         │ updatedAt       │
        │                   └─────────────────┘
        │
        │                   ┌─────────────────┐
        │                   │    account      │
        └──────────────────►├─────────────────┤
                            │ id (PK, TEXT)   │
                            │ userId (FK)     │
                            │ accountId       │
                            │ providerId      │
                            │ password (hash) │
                            │ createdAt       │
                            │ updatedAt       │
                            └─────────────────┘
```

## Table Definitions

### user

Core identity table managed by Better Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique user identifier |
| email | TEXT | NOT NULL, UNIQUE | User's email address |
| emailVerified | BOOLEAN | DEFAULT false | Email verification status |
| name | TEXT | NOT NULL | Display name |
| image | TEXT | NULLABLE | Profile image URL |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Account creation time |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update time |

**Indexes**:
- `user_email_idx` UNIQUE on `email`

---

### session

Session tracking table managed by Better Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Session identifier |
| token | TEXT | NOT NULL, UNIQUE | Session token (hashed) |
| expiresAt | TIMESTAMPTZ | NOT NULL | Session expiration time |
| userId | UUID | FK → user.id ON DELETE CASCADE | Owner user |
| ipAddress | TEXT | NULLABLE | Client IP address |
| userAgent | TEXT | NULLABLE | Client user agent |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Session creation time |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last activity time |

**Indexes**:
- `session_token_idx` UNIQUE on `token`
- `session_userId_idx` on `userId`

---

### account

Authentication provider credentials managed by Better Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Account identifier |
| userId | UUID | FK → user.id ON DELETE CASCADE | Owner user |
| accountId | TEXT | NOT NULL | Provider-specific ID |
| providerId | TEXT | NOT NULL | Auth provider (e.g., "credential") |
| password | TEXT | NULLABLE | Hashed password (for email/password) |
| accessToken | TEXT | NULLABLE | OAuth access token |
| refreshToken | TEXT | NULLABLE | OAuth refresh token |
| accessTokenExpiresAt | TIMESTAMPTZ | NULLABLE | Token expiration |
| scope | TEXT | NULLABLE | OAuth scopes |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Account creation time |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update time |

**Indexes**:
- `account_userId_idx` on `userId`
- `account_provider_idx` on `(providerId, accountId)`

---

### verification

Verification tokens for email/password reset (future use).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Verification identifier |
| identifier | TEXT | NOT NULL | Email or other identifier |
| value | TEXT | NOT NULL | Verification token |
| expiresAt | TIMESTAMPTZ | NOT NULL | Token expiration |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Token creation time |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update time |

**Indexes**:
- `verification_identifier_idx` on `identifier`

---

## JWT Token Structure

The JWT payload issued by Better Auth and validated by FastAPI.

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "exp": 1705341600,
  "iat": 1705340700
}
```

| Claim | Type | Description |
|-------|------|-------------|
| sub | string (UUID) | User identifier - maps to `user.id` |
| email | string | User's email address |
| exp | integer (UNIX timestamp) | Token expiration time |
| iat | integer (UNIX timestamp) | Token issued at time |

---

## State Transitions

### User Lifecycle

```
[Anonymous] ──signup──► [Registered] ──signin──► [Authenticated]
                              │                        │
                              │                        │signout
                              │                        ▼
                              └─────────────────► [Anonymous]
```

### Session Lifecycle

```
[None] ──login──► [Active] ──access──► [Active]
                      │                    │
                      │                    │token_expires
                      │                    ▼
                      │               [Expired] ──refresh──► [Active]
                      │                    │
                      │signout             │signout
                      ▼                    ▼
                 [Terminated]         [Terminated]
```

---

## Validation Rules

### User Registration
- **email**: Valid email format (RFC 5322)
- **password**: Minimum 8 characters (configured in Better Auth)
- **name**: Non-empty string

### Authentication
- **email**: Must exist in `user` table
- **password**: Must match hashed value in `account` table

### Token Validation (Backend)
- **exp**: Must be in the future (with 30s tolerance for clock skew)
- **sub**: Must be valid UUID format
- **signature**: Must verify with JWT_SECRET using HS256

---

## Migration Strategy

1. **Initial Migration**: Create all four tables with indexes
2. **Foreign Keys**: user → session, user → account with CASCADE delete
3. **Future**: Add verification table when email verification is implemented

**Note**: Better Auth can auto-generate migrations using `npx @better-auth/cli generate`
