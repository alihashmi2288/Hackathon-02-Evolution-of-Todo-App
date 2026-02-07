# Quickstart: Authentication & Identity

**Feature**: 002-auth-identity
**Date**: 2026-01-15

## Prerequisites

1. Node.js 18+ installed
2. Python 3.12+ installed
3. Neon PostgreSQL database provisioned
4. Environment variables configured

## Environment Setup

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-32-char-cryptographically-random-secret
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname
```

### Backend (.env)

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname
JWT_SECRET=your-32-char-cryptographically-random-secret
JWT_ALGORITHM=HS256
ENVIRONMENT=development
```

**IMPORTANT**: `BETTER_AUTH_SECRET` and `JWT_SECRET` must be identical!

## Quick Start Commands

### 1. Install Dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && pip install -r requirements.txt
```

### 2. Generate Auth Tables (Frontend)

```bash
cd frontend
npx @better-auth/cli generate
npx @better-auth/cli migrate
```

### 3. Start Services

```bash
# Terminal 1 - Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 4. Verify Health

```bash
# Backend health
curl http://localhost:8000/health

# Frontend auth endpoint
curl http://localhost:3000/api/auth/session
```

## Usage Examples

### Frontend: Register User

```typescript
import { authClient } from '@/lib/auth';

const result = await authClient.signUp.email({
  email: 'user@example.com',
  password: 'SecurePass123!',
  name: 'John Doe',
});

if (result.error) {
  console.error(result.error.message);
} else {
  console.log('Registered:', result.data.user);
}
```

### Frontend: Sign In

```typescript
import { authClient } from '@/lib/auth';

const result = await authClient.signIn.email({
  email: 'user@example.com',
  password: 'SecurePass123!',
});

if (result.error) {
  console.error(result.error.message);
} else {
  console.log('Signed in:', result.data.user);
}
```

### Frontend: Get Session & Token

```typescript
import { authClient, getSessionToken } from '@/lib/auth';

// Get full session
const session = await authClient.getSession();
console.log('User:', session?.data?.user);

// Get JWT token for backend API calls
const token = await getSessionToken();
```

### Frontend: Call Protected Backend API

```typescript
import { getSessionToken } from '@/lib/auth';

async function fetchTodos() {
  const token = await getSessionToken();

  const response = await fetch('http://localhost:8000/todos', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}
```

### Backend: Protected Endpoint

```python
from fastapi import APIRouter, Depends
from app.dependencies import CurrentUserDep

router = APIRouter()

@router.get("/todos")
async def list_todos(user: CurrentUserDep):
    # user.id contains the authenticated user's UUID
    return {"user_id": str(user.id), "todos": []}
```

## Testing Authentication

### Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'
```

### Test Sign In

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Test Protected Endpoint

```bash
# Get token from sign-in response, then:
curl http://localhost:8000/health \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Subagents & Skills for Implementation

When implementing this feature, Claude will use specialized subagents:

| Agent | Purpose |
|-------|---------|
| `better-auth-engineer` | Configure Better Auth JWT plugin, database adapter |
| `fastapi-backend-architect` | Update JWT validation, add protected routes |
| `database-architect` | Create auth table migrations with Alembic |
| `nextjs-frontend` | Implement auth UI components |
| `security-auditor` | Review auth implementation for vulnerabilities |

### Skill Usage

```bash
# Use auth-better-jwt skill for auth configuration
/auth-better-jwt

# Use database-sqlmodel skill for migrations
/database-sqlmodel

# Use fastapi-backend skill for protected endpoints
/fastapi-backend
```

## Troubleshooting

### "Invalid token" errors

1. Verify `BETTER_AUTH_SECRET` matches `JWT_SECRET`
2. Check token is not expired (15 minute default)
3. Ensure frontend and backend use same algorithm (HS256)

### "Database connection failed"

1. Verify `DATABASE_URL` is correct in both .env files
2. Check Neon database is accessible
3. Run migrations: `npx @better-auth/cli migrate`

### "CORS errors"

1. Verify `CORS_ORIGINS` includes frontend URL
2. Check backend is running on port 8000
3. Ensure frontend is using correct `NEXT_PUBLIC_API_URL`

## Next Steps

After quickstart:

1. Run `/sp.tasks` to generate implementation tasks
2. Implement auth tables migration
3. Configure Better Auth JWT plugin
4. Add login/register UI components
5. Test end-to-end auth flow
