# Frontend CLAUDE.md

## Overview
Next.js 16.0.10 frontend for the Todo Full-Stack application using App Router.

**IMPORTANT**: This project uses **Next.js 16.0.10** exactly. Do not upgrade or downgrade.

## Tech Stack
- **Framework**: Next.js 16.0.10 (App Router) - EXACT VERSION REQUIRED
- **Language**: TypeScript 5.6+
- **React**: React 19.x
- **Styling**: Tailwind CSS 3.4+
- **Authentication**: Better Auth (handles JWT tokens)
- **State Management**: React hooks + server components

## Directory Structure
```
frontend/
├── src/
│   ├── app/                 # App Router pages and layouts
│   │   ├── (auth)/          # Auth-related routes (login, register)
│   │   ├── api/             # API routes (Better Auth handler)
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/
│   │   └── ui/              # Reusable UI components
│   ├── lib/                 # Utility functions
│   │   ├── auth.ts          # Better Auth client config
│   │   └── env.ts           # Environment validation
│   └── services/
│       └── api.ts           # Backend API client
├── public/                  # Static assets
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Commands
```bash
# Development
npm run dev          # Start dev server on port 3000

# Build
npm run build        # Production build
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Type checking
npm run typecheck    # Run TypeScript type checking
```

## Environment Variables
Required in `.env` or `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
```

## Authentication Flow
1. User authenticates via Better Auth on frontend
2. Better Auth issues JWT token
3. Frontend includes token in API requests to backend
4. Backend verifies JWT signature (stateless)

## API Integration
Use the typed API client in `src/services/api.ts`:
```typescript
import { api } from '@/services/api';

// Example: Fetch todos
const todos = await api.todos.list();
```

## Component Guidelines
- Use server components by default (Next.js 16.0.10 default)
- Add `'use client'` only when needed (interactivity, hooks)
- Place reusable components in `src/components/ui/`
- Use Tailwind for styling, avoid inline styles

## Next.js 16.0.10 Specific Notes
- App Router is the default architecture
- Route handlers use `route.ts` convention
- Server Components are default (no directive needed)
- Client Components require `'use client'` directive
- Use `next/headers` for server-side header access
- Use `next/navigation` for client-side navigation

## Version Verification
To verify correct Next.js version:
```bash
npm list next
# Should show: next@16.0.10
```

## Testing
```bash
npm run test         # Run tests (when configured)
```
