/**
 * Vite development server configuration
 * 
 * This file sets up the Vite development server for a better development experience.
 * It is only used in development mode and not included in production builds.
 */

import { Express } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Log function for structured logging
 */
export function log(message: string, category = 'app'): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${category}] ${message}`);
}

/**
 * Set up Vite middleware for development
 */
export function setupVite(app: Express): void {
  log('Setting up Vite development server', 'vite');
  
  // Create Vite dev server
  const viteServerPromise = import('vite').then(vite => {
    return vite.createServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.join(__dirname, '../client')
    });
  });
  
  // Handle Vite middleware requests
  app.use(async (req, res, next) => {
    try {
      // Skip API requests
      if (req.url.startsWith('/api/')) {
        return next();
      }
      
      const vite = await viteServerPromise;
      
      // Use Vite middleware
      const middleware = vite.middlewares as any;
      middleware(req, res, next);
    } catch (err) {
      log(`Vite middleware error: ${err}`, 'error');
      next(err);
    }
  });
  
  log('Vite development server initialized', 'vite');
}