/**
 * Drizzle ORM Configuration
 * 
 * This file is kept for compatibility but is not actively used since
 * the application now uses in-memory storage instead of a database.
 */

import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',
  driver: 'better-sqlite',
  dbCredentials: {
    url: ':memory:',
  },
  // No migrations since we're using in-memory storage
  // This is only used when explicitly running drizzle-kit commands
  out: './drizzle/migrations',
  verbose: true,
  strict: true,
} satisfies Config;