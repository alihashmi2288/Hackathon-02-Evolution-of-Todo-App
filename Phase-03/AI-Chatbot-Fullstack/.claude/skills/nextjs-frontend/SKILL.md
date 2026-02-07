---
name: nextjs-frontend
description: Expert Next.js 14/15 (App Router) frontend development. Use for building React components, managing server/client components, Tailwind CSS styling, and frontend API integration in the Todo app.
---

# Next.js Frontend Skill

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (Icons)
- Shadcn UI (Components)

## Core Patterns
- **Server Components**: Use by default for data fetching and static content.
- **Client Components**: Use `'use client'` only for interactivity (hooks, event listeners).
- **API Integration**: Use `@/lib/api.ts` for all backend communication.
- **Styling**: Strict adherence to Tailwind CSS. Use `cn()` utility for conditional classes.

## Guidelines
- Follow the directory structure in `/frontend`.
- Ensure mobile responsiveness for all UI components.
- Use Next.js Metadata API for SEO.
- Implement loading states with `loading.tsx` and error boundaries with `error.tsx`.
