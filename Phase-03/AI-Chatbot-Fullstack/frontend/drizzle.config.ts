import type { Config } from "drizzle-kit";

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Better Auth uses these table names
  tablesFilter: ["user", "session", "account", "verification", "jwks"],
} satisfies Config;
