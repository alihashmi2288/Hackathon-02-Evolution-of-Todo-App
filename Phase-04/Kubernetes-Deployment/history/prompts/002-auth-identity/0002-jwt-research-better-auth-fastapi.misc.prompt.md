---
id: 0002
title: JWT Research Better Auth FastAPI Configuration
stage: misc
date: 2026-01-15
surface: agent
model: claude-sonnet-4-5
feature: 002-auth-identity
branch: 002-auth-identity
user: alihashmi
command: auth-better-jwt
labels: ["jwt", "better-auth", "fastapi", "research", "security", "authentication"]
links:
  spec: /home/alihashmi/Hackathon-02/Phase-02/Todo-Full-Stack/specs/002-auth-identity/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /home/alihashmi/Hackathon-02/Phase-02/Todo-Full-Stack/specs/002-auth-identity/jwt-research-summary.md
tests:
  - N/A (research document, no tests)
---

## Prompt

Research and document the optimal Better Auth JWT plugin configuration for a Next.js + FastAPI architecture.

Context:
- Frontend: Next.js 16.0.10 with Better Auth for authentication
- Backend: FastAPI with python-jose for JWT validation
- Database: Neon PostgreSQL (serverless)
- Shared secret: BETTER_AUTH_SECRET

Requirements:
1. JWT plugin must include claims: user_id (sub), email, exp
2. Token must be verifiable by FastAPI using the same secret
3. Better Auth manages sessions; backend is stateless

Research questions:
1. What's the recommended JWT algorithm (HS256 vs RS256)?
2. What should be the token expiration time?
3. How should the definePayload function be configured to include email?
4. What database tables does Better Auth require (user, session, account, verification)?
5. How does the frontend pass the JWT to backend API calls?

Output a research summary document with:
- Decision for each question
- Rationale
- Code snippets where applicable

## Response snapshot

I am the better-auth-engineer. I researched and documented the optimal Better Auth JWT plugin configuration for your Next.js + FastAPI architecture.

**Key Research Findings**:

1. **Algorithm Decision: HS256**
   - Rationale: Internal trust boundary, simpler key management, better performance
   - Single shared secret (BETTER_AUTH_SECRET) is sufficient for controlled infrastructure
   - RS256 reserved for future third-party integrations

2. **Token Expiration: 15 minutes (access), 7 days (refresh)**
   - Industry best practice balances security and UX
   - Short-lived access tokens minimize attack window if stolen
   - Refresh tokens managed by Better Auth in HttpOnly cookies

3. **definePayload Configuration**:
   - Include minimal required claims: `sub` (user_id), `email`
   - Standard JWT claims auto-added: `exp`, `iat`, `iss`, `aud`
   - Smaller payloads improve performance

4. **Database Tables**: 4 required tables
   - `user`: Core identity storage
   - `session`: Better Auth session management
   - `account`: Provider credentials (hashed passwords)
   - `verification`: Future email verification/password reset

5. **JWT Transmission**: Authorization Bearer header
   - Standard: `Authorization: Bearer <token>`
   - Frontend: `authClient.getSession()` provides access token
   - Backend: `HTTPBearer()` dependency extracts and validates token

**Complete Implementation Examples Provided**:
- Better Auth configuration with JWT plugin
- FastAPI dependency for JWT validation with python-jose
- Frontend API client with automatic token injection
- Database schema definitions
- Security checklist

**Research Document Location**:
`/home/alihashmi/Hackathon-02/Phase-02/Todo-Full-Stack/specs/002-auth-identity/jwt-research-summary.md`

## Outcome

- ✅ Impact: Comprehensive research document provides architecture decisions for JWT implementation with detailed rationale and code examples
- 🧪 Tests: No tests (research document)
- 📁 Files: Created jwt-research-summary.md (9KB, 450+ lines)
- 🔁 Next prompts: Update plan.md with these decisions, create tasks.md for implementation breakdown
- 🧠 Reflection: Used Context7 MCP for Better Auth and python-jose docs, web search for 2025 security best practices. All decisions backed by authoritative sources with citations.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - All research questions answered with detailed rationale, code examples, and authoritative sources
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to planning phase (plan.md) to architect the implementation based on this research
