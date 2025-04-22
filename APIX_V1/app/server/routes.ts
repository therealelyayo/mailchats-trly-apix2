/**
 * API routes for MailChats Trly APIX2
 * 
 * This file registers all API routes for the application.
 */

import express, { Request, Response, NextFunction } from 'express';
import { createServer, Server } from 'http';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { storage } from './storage';
import { 
  insertUserSchema, 
  insertCampaignSchema, 
  insertEmailStatusSchema,
  User
} from '@shared/schema';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { sendVerificationCode, verifyCode } from './emailVerificationService';

const scryptAsync = promisify(scrypt);

// Add User interface to Express namespace for TypeScript
declare global {
  namespace Express {
    interface User extends User {}
  }
}

/**
 * Hash a password using scrypt
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compare a password with a hashed password
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Set up authentication
 */
function setupAuth(app: express.Express): void {
  // Configure session
  const sessionSecret = process.env.SESSION_SECRET || 'mailchats_dev_session_secret';
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Authentication endpoints
  app.post('/api/register', async (req, res) => {
    try {
      // Validate request body
      const parseResult = insertUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      // Log in user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login failed after registration' });
        }
        
        return res.status(201).json({
          id: user.id,
          username: user.username,
          createdAt: user.createdAt
        });
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: info.message || 'Authentication failed' });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          id: user.id,
          username: user.username
        });
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = req.user as User;
    res.json({
      id: user.id,
      username: user.username
    });
  });

  // Email verification endpoints
  app.post('/api/auth/send-verification-code', sendVerificationCode);
  app.post('/api/auth/verify-code', verifyCode);
}

/**
 * Register all API routes
 */
export function registerRoutes(app: express.Express): Server {
  // Parse JSON bodies
  app.use(express.json());

  // Set up authentication
  setupAuth(app);

  // Middleware to check authentication for API routes
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // Campaign endpoints
  app.get('/api/campaigns', requireAuth, async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  });

  app.get('/api/campaigns/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid campaign ID' });
      }

      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      res.json(campaign);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      res.status(500).json({ error: 'Failed to fetch campaign' });
    }
  });

  app.post('/api/campaigns', requireAuth, async (req, res) => {
    try {
      const parseResult = insertCampaignSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error });
      }

      const campaign = await storage.createCampaign(parseResult.data);
      res.status(201).json(campaign);
    } catch (err) {
      console.error('Error creating campaign:', err);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  });

  app.patch('/api/campaigns/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid campaign ID' });
      }

      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      const updatedCampaign = await storage.updateCampaign(id, req.body);
      res.json(updatedCampaign);
    } catch (err) {
      console.error('Error updating campaign:', err);
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  });

  app.delete('/api/campaigns/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid campaign ID' });
      }

      const campaign = await storage.deleteCampaign(id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      res.json({ message: 'Campaign deleted successfully' });
    } catch (err) {
      console.error('Error deleting campaign:', err);
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  });

  // Email status endpoints
  app.get('/api/campaigns/:campaignId/emails', requireAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      if (isNaN(campaignId)) {
        return res.status(400).json({ error: 'Invalid campaign ID' });
      }

      const emailStatuses = await storage.getEmailStatuses(campaignId);
      res.json(emailStatuses);
    } catch (err) {
      console.error('Error fetching email statuses:', err);
      res.status(500).json({ error: 'Failed to fetch email statuses' });
    }
  });

  app.get('/api/emails/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid email status ID' });
      }

      const emailStatus = await storage.getEmailStatus(id);
      if (!emailStatus) {
        return res.status(404).json({ error: 'Email status not found' });
      }

      res.json(emailStatus);
    } catch (err) {
      console.error('Error fetching email status:', err);
      res.status(500).json({ error: 'Failed to fetch email status' });
    }
  });

  app.post('/api/campaigns/:campaignId/emails', requireAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      if (isNaN(campaignId)) {
        return res.status(400).json({ error: 'Invalid campaign ID' });
      }

      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      const parseResult = insertEmailStatusSchema.safeParse({
        ...req.body,
        campaignId
      });
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error });
      }

      const emailStatus = await storage.createEmailStatus(parseResult.data);
      res.status(201).json(emailStatus);
    } catch (err) {
      console.error('Error creating email status:', err);
      res.status(500).json({ error: 'Failed to create email status' });
    }
  });

  app.patch('/api/emails/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid email status ID' });
      }

      const emailStatus = await storage.getEmailStatus(id);
      if (!emailStatus) {
        return res.status(404).json({ error: 'Email status not found' });
      }

      const updatedEmailStatus = await storage.updateEmailStatus(id, req.body);
      res.json(updatedEmailStatus);
    } catch (err) {
      console.error('Error updating email status:', err);
      res.status(500).json({ error: 'Failed to update email status' });
    }
  });

  app.delete('/api/emails/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid email status ID' });
      }

      const emailStatus = await storage.deleteEmailStatus(id);
      if (!emailStatus) {
        return res.status(404).json({ error: 'Email status not found' });
      }

      res.json({ message: 'Email status deleted successfully' });
    } catch (err) {
      console.error('Error deleting email status:', err);
      res.status(500).json({ error: 'Failed to delete email status' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}