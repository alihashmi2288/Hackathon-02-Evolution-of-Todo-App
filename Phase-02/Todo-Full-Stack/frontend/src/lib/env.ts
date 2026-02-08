/**
 * Environment variable validation for the frontend.
 *
 * Task Reference: T030 - Create frontend/src/lib/env.ts
 * Task Reference: T052 - Add environment check for BETTER_AUTH_SECRET presence
 * Feature: 001-project-init-architecture, 002-auth-identity
 *
 * Validates required environment variables at build/runtime and provides
 * type-safe access throughout the application.
 */

/**
 * Client-side environment variables (exposed to browser).
 * Must be prefixed with NEXT_PUBLIC_ in .env
 */
interface ClientEnv {
  /** Backend API URL */
  apiUrl: string;
  /** Frontend app URL (for auth callbacks) */
  appUrl: string;
}

/**
 * Server-side environment variables (not exposed to browser).
 * Access only in Server Components, API routes, or server actions.
 */
interface ServerEnv {
  /** Better Auth secret key */
  betterAuthSecret: string;
}

/**
 * Validate and retrieve client-side environment variables.
 * Safe to use in both client and server components.
 */
function getClientEnv(): ClientEnv {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!apiUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL environment variable. " +
        "Please check your .env.local file."
    );
  }

  if (!appUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_APP_URL environment variable. " +
        "Please check your .env.local file."
    );
  }

  return {
    apiUrl,
    appUrl,
  };
}

/**
 * Validate and retrieve server-side environment variables.
 * Only use in Server Components, API routes, or server actions.
 */
function getServerEnv(): ServerEnv {
  const betterAuthSecret = process.env.BETTER_AUTH_SECRET;

  if (!betterAuthSecret) {
    throw new Error(
      "Missing BETTER_AUTH_SECRET environment variable. " +
        "Please check your .env.local file."
    );
  }

  if (betterAuthSecret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be at least 32 characters long."
    );
  }

  return {
    betterAuthSecret,
  };
}

/**
 * Client environment - safe for browser use
 */
export const clientEnv = getClientEnv();

/**
 * Server environment - only use server-side
 * Wrapped in a getter to avoid client-side access errors
 */
export function getServerConfig(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error(
      "getServerConfig() cannot be called on the client side. " +
        "Use clientEnv for client-accessible variables."
    );
  }
  return getServerEnv();
}

/**
 * Type-safe environment access
 */
export const env = {
  /** Backend API URL */
  apiUrl: clientEnv.apiUrl,
  /** Frontend app URL */
  appUrl: clientEnv.appUrl,
  /** Check if running in development */
  isDevelopment: process.env.NODE_ENV === "development",
  /** Check if running in production */
  isProduction: process.env.NODE_ENV === "production",
} as const;
