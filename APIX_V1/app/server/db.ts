/**
 * Database stub implementation to support the in-memory storage solution
 * 
 * This file serves as a compatibility layer for code that expects a database connection.
 * It provides a stub implementation that works without an actual database.
 */

import * as schema from '@shared/schema';

// Stub implementation of the database client
export const db = {
  query: async () => [],
  select: () => ({ from: () => ({ where: () => [] }) }),
  insert: () => ({ values: () => ({ returning: () => [] }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
  delete: () => ({ where: () => ({ returning: () => [] }) }),
};

/**
 * Tests if the database connection is available
 * Always returns true since we're using in-memory storage
 */
export async function testDatabaseConnection(): Promise<boolean> {
  return true;
}

/**
 * Initializes the database
 * No-op function since we're using in-memory storage
 */
export function initDatabase(): void {
  console.log('Using in-memory storage instead of database');
}

/**
 * Closes the database connection
 * No-op function since we're using in-memory storage
 */
export function closeDatabase(): void {
  // Nothing to do
}