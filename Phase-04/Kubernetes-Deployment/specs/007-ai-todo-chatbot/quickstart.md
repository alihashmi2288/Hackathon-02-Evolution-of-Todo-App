# Quickstart: AI Todo Chatbot

## Prerequisites

- Python 3.12+ installed
- Node.js 20+ installed
- Neon PostgreSQL database provisioned
- Gemini API key (free tier) from Google AI Studio

## Environment Setup

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters
JWT_SECRET=same-as-better-auth-secret
GEMINI_API_KEY=your-gemini-api-key
ENVIRONMENT=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
```

## Run Backend

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Verify Chatbot

1. Open http://localhost:3000
2. Sign in (or register if first time)
3. Navigate to the Chat page
4. Type "Add a task to buy groceries"
5. Verify the assistant confirms task creation
6. Type "Show my tasks"
7. Verify the task list is returned
8. Type "Delete the buy groceries task"
9. Verify deletion confirmation

## Troubleshooting

- **401 on chat**: Ensure BETTER_AUTH_SECRET matches between frontend
  and backend. Check that the JWT token is being sent in Authorization
  header.
- **Agent errors**: Check GEMINI_API_KEY is set and valid. Verify the
  model name `gemini-2.5-flash` is accessible with your key.
- **Empty tool results**: Check backend logs for tool execution errors.
  Ensure database migrations are up to date (`alembic upgrade head`).
