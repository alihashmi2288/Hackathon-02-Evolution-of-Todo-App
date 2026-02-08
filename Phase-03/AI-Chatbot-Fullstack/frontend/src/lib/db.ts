/**
 * Neon database connection for Better Auth.
 *
 * Task Reference: T005 - Create frontend/src/lib/db.ts
 * Feature: 002-auth-identity
 *
 * Provides:
 * - Neon serverless PostgreSQL connection
 * - Drizzle ORM instance for Better Auth
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../drizzle/schema";

// Neon serverless connection
const sql = neon(process.env.DATABASE_URL!);

// Drizzle ORM instance with schema
export const db = drizzle(sql, { schema });

// Export for type inference
export type Database = typeof db;
