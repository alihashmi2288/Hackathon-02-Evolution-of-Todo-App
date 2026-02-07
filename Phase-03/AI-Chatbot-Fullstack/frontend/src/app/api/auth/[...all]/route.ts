/**
 * Better Auth API route handler.
 *
 * Task Reference: T037 - Create Better Auth handler
 * Feature: 001-project-init-architecture
 *
 * Handles all auth-related API routes:
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-out
 * - GET /api/auth/session
 */

import { auth } from "@/lib/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
