/**
 * Better Auth server configuration.
 *
 * Task Reference: T009, T010 - Add JWT plugin and Drizzle adapter
 * Feature: 002-auth-identity
 *
 * Server-side auth configuration for API routes.
 *
 * Configured with:
 * - Email/password authentication
 * - JWT plugin for stateless backend auth (HS256, 15-min expiry)
 * - Drizzle database adapter for Neon PostgreSQL
 */

import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getServerConfig } from "./env";
import { db } from "./db";
import * as schema from "../../drizzle/schema";

/**
 * Better Auth server instance.
 */
export const auth = betterAuth({
  secret: getServerConfig().betterAuthSecret,

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // Drizzle database adapter for Neon PostgreSQL
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      jwks: schema.jwks,
    },
  }),

  // JWT plugin configuration per research.md decisions
  plugins: [
    jwt({
      jwt: {
        // HS256 algorithm (symmetric) - per AD-1 decision
        // 15-minute expiration - per AD-2 decision
        expirationTime: "15m",

        // Custom payload with sub (user_id) and email - per FR-005, FR-006
        definePayload: ({ user }) => ({
          sub: user.id,
          email: user.email,
        }),
      },
    }),
  ],

  // Session configuration
  session: {
    // Use JWT strategy so the session token is a verifiable JWT
    // This is required because our Python backend expects to verify the token signature
    strategy: "jwt",
    // Cookie settings for session management
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },
});
