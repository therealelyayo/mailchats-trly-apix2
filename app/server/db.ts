import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { log } from './vite';

// Configure Neon database to use WebSockets
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Log a message when the database is connected
pool.on('connect', () => {
  log('Connected to database', 'database');
});

// Log errors when they occur
pool.on('error', (err) => {
  log(`Database error: ${err.message}`, 'database-error');
});

// Create function to test the database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    log(`Database connection successful: ${result.rows[0].now}`, 'database');
    return true;
  } catch (error) {
    log(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'database-error');
    return false;
  }
}