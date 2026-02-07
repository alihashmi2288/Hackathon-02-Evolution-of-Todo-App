---
name: auth-better-jwt
description: Security expert for Better-Auth and JWT token orchestration. Use for implementing secure login, session management, and protected routes across Next.js and FastAPI.
---

# Auth & JWT Skill

## Stack
- Better-Auth
- JWT (JSON Web Tokens)
- Secure HttpOnly Cookies
- Next.js Middleware

## Core Patterns
- **Token Storage**: Access tokens in memory/short-lived; Refresh tokens in HttpOnly cookies.
- **Verification**: Backend must verify JWT signature on every protected request.
- **Frontend Protection**: Use Next.js Middleware or HOCs for route guarding.
- **Propagation**: Pass Bearer token in the `Authorization` header.

## Guidelines
- Implement robust token expiration and refresh logic.
- Ensure CSRF protection is active.
- Use secure hashing (bcrypt/argon2) for passwords if managed locally.
- Validate JWT `sub` and `exp` claims strictly.
