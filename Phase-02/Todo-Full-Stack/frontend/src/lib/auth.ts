/**
 * Better Auth client configuration.
 *
 * Task Reference: T036 - Create frontend/src/lib/auth.ts
 * Task Reference: T017 - Export signUp method with proper typing
 * Feature: 001-project-init-architecture, 002-auth-identity
 *
 * Configures Better Auth for the frontend with:
 * - Email/password authentication
 * - JWT plugin for token-based auth
 * - Session management
 */

import { createAuthClient } from "better-auth/react";
import { env } from "./env";

/**
 * Better Auth client instance.
 *
 * Usage in components:
 *   import { authClient } from '@/lib/auth';
 *
 *   // Sign in
 *   await authClient.signIn.email({ email, password });
 *
 *   // Sign up
 *   await authClient.signUp.email({ email, password, name });
 *
 *   // Sign out
 *   await authClient.signOut();
 *
 *   // Get session (React hook)
 *   const { data: session } = authClient.useSession();
 */
export const authClient = createAuthClient({
  baseURL: env.appUrl,
});

/**
 * Auth hooks for React components
 */
export const { useSession, signIn, signUp, signOut } = authClient;

/**
 * Sign up credentials interface.
 *
 * Task Reference: T017 - Export signUp method with proper typing
 */
export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

/**
 * Sign up result interface.
 */
export interface SignUpResult {
  data: {
    user: User;
    session: Session;
  } | null;
  error: {
    message: string;
    status?: number;
    code?: string;
  } | null;
}

/**
 * Sign up with email/password.
 *
 * Task Reference: T017 - Export signUp method with proper typing
 *
 * @param credentials - Email, password, and name
 * @returns Promise with user data or error
 *
 * @example
 * const result = await signUpWithEmail({
 *   email: 'user@example.com',
 *   password: 'securepassword',
 *   name: 'John Doe'
 * });
 *
 * if (result.error) {
 *   console.error(result.error.message);
 * } else {
 *   console.log('Welcome', result.data?.user.name);
 * }
 */
export async function signUpWithEmail(
  credentials: SignUpCredentials
): Promise<SignUpResult> {
  try {
    const result = await authClient.signUp.email({
      email: credentials.email,
      password: credentials.password,
      name: credentials.name,
    });

    return {
      data: result.data
        ? {
          user: {
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.name ?? undefined,
            image: result.data.user.image ?? undefined,
          },
          session: {
            user: {
              id: result.data.user.id,
              email: result.data.user.email,
              name: result.data.user.name ?? undefined,
              image: result.data.user.image ?? undefined,
            },
            token: result.data.token ?? "",
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Default 7 days if not provided
          },
        }
        : null,
      error: result.error
        ? {
          message: result.error.message ?? "Registration failed",
          status: result.error.status,
          code: result.error.code,
        }
        : null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

/**
 * Sign in credentials interface.
 *
 * Task Reference: T025 - Export signIn method with proper typing
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Sign in result interface.
 */
export interface SignInResult {
  data: {
    user: User;
    session: Session;
  } | null;
  error: {
    message: string;
    status?: number;
    code?: string;
  } | null;
}

/**
 * Sign in with email/password.
 *
 * Task Reference: T025 - Export signIn method with proper typing
 *
 * @param credentials - Email and password
 * @returns Promise with user data or error
 *
 * @example
 * const result = await signInWithEmail({
 *   email: 'user@example.com',
 *   password: 'securepassword'
 * });
 *
 * if (result.error) {
 *   console.error(result.error.message);
 * } else {
 *   console.log('Welcome back', result.data?.user.name);
 * }
 */
export async function signInWithEmail(
  credentials: SignInCredentials
): Promise<SignInResult> {
  try {
    const result = await authClient.signIn.email({
      email: credentials.email,
      password: credentials.password,
    });

    return {
      data: result.data
        ? {
          user: {
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.name ?? undefined,
            image: result.data.user.image ?? undefined,
          },
          session: {
            user: {
              id: result.data.user.id,
              email: result.data.user.email,
              name: result.data.user.name ?? undefined,
              image: result.data.user.image ?? undefined,
            },
            token: result.data.token ?? "",
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Default 7 days if not provided
          },
        }
        : null,
      error: result.error
        ? {
          message: result.error.message ?? "Sign in failed",
          status: result.error.status,
          code: result.error.code,
        }
        : null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
    };
  }
}

/**
 * Get the current JWT token for API calls.
 *
 * Task Reference: T033 - Update getSessionToken to return JWT from session
 * Feature: 002-auth-identity
 *
 * When the JWT plugin is enabled, Better Auth provides a JWT token
 * that can be used for stateless authentication with the backend.
 *
 * Usage:
 *   const token = await getSessionToken();
 *   fetch('/api/endpoint', {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 *
 * @returns JWT token string or null if not authenticated
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    const session = await authClient.getSession();

    // Better Auth JWT plugin stores the token in session
    // The token is a JWT signed with BETTER_AUTH_SECRET
    if (session?.data?.session) {
      // Cast to any to access token if it exists but isn't in main type
      // or rely on standard property if typed correctly
      const sessionData = session.data.session as any;
      if (sessionData.token) {
        return sessionData.token;
      }
    }

    return null;
  } catch (error) {
    // If session fetch fails, return null (unauthenticated)
    console.error("Failed to get session token:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await authClient.getSession();
  return !!session?.data?.user;
}

/**
 * Type definitions for auth state
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: Date;
}

/**
 * Sign out result interface.
 *
 * Task Reference: T041 - Export signOut method with proper typing
 */
export interface SignOutResult {
  success: boolean;
  error: {
    message: string;
  } | null;
}

/**
 * Sign out the current user.
 *
 * Task Reference: T041 - Export signOut method with proper typing
 * Task Reference: T045 - Clear local storage/cookies on sign out
 *
 * This function:
 * 1. Calls Better Auth's signOut method
 * 2. Clears the session cookie and any local storage
 * 3. Invalidates the current session
 *
 * @returns Promise with success status or error
 *
 * @example
 * const result = await signOutUser();
 * if (result.success) {
 *   router.push('/login');
 * }
 */
export async function signOutUser(): Promise<SignOutResult> {
  try {
    // Better Auth signOut clears cookies and session automatically (T045)
    await authClient.signOut();

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to sign out",
      },
    };
  }
}
