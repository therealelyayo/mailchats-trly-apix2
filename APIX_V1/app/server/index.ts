/**
 * MailChats Trly APIX2 - Server Entry Point
 * 
 * This file serves as the entry point for the server, setting up necessary
 * middleware and starting the HTTP server.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { registerRoutes } from './routes';
import { initDatabase } from './db';

// Setup dirname for ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logging function
export function log(message: string, type = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

// Create Express app
const app = express();

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Set up Vite for development
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const viteModule = await import('./vite');
      viteModule.setupVite(app);
    } catch (err) {
      console.error('Failed to load Vite configuration:', err);
    }
  }
}

// Logging middleware
app.use((req, res, next) => {
  const start = new Date();
  const originalEnd = res.end;
  
  // Create log object for structured logging
  const logData: Record<string, any> = {
    method: req.method,
    url: req.url,
    userAgent: req.get('user-agent')
  };
  
  res.end = function(...args: any[]) {
    const responseTime = new Date().getTime() - start.getTime();
    logData.statusCode = res.statusCode;
    logData.responseTime = `${responseTime}ms`;
    
    log(`${req.method} ${req.url} - ${res.statusCode} (${responseTime}ms)`, 
        res.statusCode >= 400 ? 'error' : 'info');
    
    // Anonymize sensitive URLs when logging
    const sensitiveUrlParts = ['password', 'token', 'key', 'secret', 'auth'];
    const isSensitive = sensitiveUrlParts.some(part => req.url.toLowerCase().includes(part));
    
    if (isSensitive) {
      logData.url = req.url.slice(0, req.url.lastIndexOf('/') + 1) + '***';
    }
    
    // Log in JSON format for easier parsing
    if (process.env.LOG_FORMAT === 'json') {
      log(JSON.stringify(logData), 'access');
    }
    
    return originalEnd.apply(res, args);
  };
  
  next();
});

// Initialize database (no-op with in-memory storage)
async function init() {
  // Initialize the database (in-memory storage)
  initDatabase();
  
  // Set up Vite for development
  await setupVite();
  
  // Register API routes and get HTTP server
  const httpServer = registerRoutes(app);
  
  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    const clientDir = path.join(__dirname, '../client');
    
    // Serve client files if client directory exists
    if (fs.existsSync(clientDir)) {
      app.use(express.static(clientDir));
      
      // Serve index.html for client-side routing
      app.get('*', (req, res) => {
        res.sendFile(path.join(clientDir, 'index.html'));
      });
    }
  }
  
  // Start the server
  const port = process.env.PORT || 3000;
  httpServer.listen(port, '0.0.0.0', () => {
    log(`Server listening at http://0.0.0.0:${port}`);
  });
  
  // Handle server shutdown
  const shutdown = () => {
    log('Shutting down server...', 'info');
    httpServer.close(() => {
      log('Server shutdown complete', 'info');
      process.exit(0);
    });
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Start server
init().catch(err => {
  log(`Error starting server: ${err}`, 'error');
  process.exit(1);
});