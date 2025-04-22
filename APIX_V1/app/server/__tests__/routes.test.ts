import express from 'express';
import request from 'supertest';
import { IStorage } from '../storage';
import { User, Campaign, EmailStatus } from '@shared/schema';

// Mock storage implementation
const mockStorage: jest.Mocked<IStorage> = {
  getUser: jest.fn(),
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
  getCampaigns: jest.fn(),
  getCampaign: jest.fn(),
  createCampaign: jest.fn(),
  updateCampaign: jest.fn(),
  deleteCampaign: jest.fn(),
  getEmailStatuses: jest.fn(),
  getEmailStatus: jest.fn(),
  createEmailStatus: jest.fn(),
  updateEmailStatus: jest.fn(),
  deleteEmailStatus: jest.fn(),
  sessionStore: {} as any
};

// Mock for the express session
jest.mock('express-session', () => {
  return () => (req: any, res: any, next: any) => {
    req.session = {
      passport: {
        user: 1
      }
    };
    req.isAuthenticated = jest.fn().mockReturnValue(true);
    next();
  };
});

// Mock for passport
jest.mock('passport', () => ({
  initialize: () => (req: any, res: any, next: any) => next(),
  session: () => (req: any, res: any, next: any) => next(),
  authenticate: () => (req: any, res: any, next: any) => {
    req.user = { id: 1, username: 'testuser' };
    next();
  },
  use: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn()
}));

// Mock user data
const mockUser: User = {
  id: 1,
  username: 'testuser',
  password: 'hashedpassword',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock campaign data
const mockCampaign: Campaign = {
  id: 1,
  name: 'Test Campaign',
  fromName: 'Test Sender',
  sendMethod: 'smtp',
  smtpMode: 'direct',
  smtpHost: 'mail.example.com',
  smtpPort: 587,
  smtpUsername: 'user@example.com',
  smtpPassword: 'password123',
  apiKey: null,
  rotateSmtp: false,
  sendSpeed: 100,
  trackOpens: true,
  trackLinks: true,
  trackReplies: false,
  recipientCount: 10,
  startedAt: new Date(),
  completedAt: null,
  status: 'processing'
};

// Mock email status data
const mockEmailStatus: EmailStatus = {
  id: 1,
  campaignId: 1,
  email: 'recipient@example.com',
  subject: 'Test Subject',
  sent: true,
  delivered: true,
  opened: false,
  clicked: false,
  replied: false,
  failed: false,
  failureReason: null,
  sentAt: new Date(),
  openedAt: null,
  clickedAt: null,
  repliedAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Import routes function and pass mockStorage
jest.mock('../storage', () => ({
  storage: mockStorage
}));

import { registerRoutes } from '../routes';

describe('API Routes', () => {
  let app: express.Express;
  let server: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    server = registerRoutes(app);
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock returns
    mockStorage.getUser.mockResolvedValue(mockUser);
    mockStorage.getUserByUsername.mockResolvedValue(mockUser);
    mockStorage.createUser.mockResolvedValue(mockUser);
    mockStorage.getCampaigns.mockResolvedValue([mockCampaign]);
    mockStorage.getCampaign.mockResolvedValue(mockCampaign);
    mockStorage.createCampaign.mockResolvedValue(mockCampaign);
    mockStorage.getEmailStatuses.mockResolvedValue([mockEmailStatus]);
    mockStorage.getEmailStatus.mockResolvedValue(mockEmailStatus);
  });

  afterEach(() => {
    if (server && server.close) {
      server.close();
    }
  });

  describe('User Authentication', () => {
    test('GET /api/user should return current user if authenticated', async () => {
      const response = await request(app).get('/api/user');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('username', 'testuser');
    });

    test('POST /api/login should authenticate user', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/login')
        .send(loginData);
      
      expect(response.status).toBe(200);
    });

    test('POST /api/register should create a new user', async () => {
      // Setup mock to simulate no existing user
      mockStorage.getUserByUsername.mockResolvedValueOnce(undefined);
      
      const registerData = {
        username: 'newuser',
        password: 'newpassword'
      };
      
      const response = await request(app)
        .post('/api/register')
        .send(registerData);
      
      expect(response.status).toBe(201);
      expect(mockStorage.createUser).toHaveBeenCalled();
    });
  });

  describe('Campaign Endpoints', () => {
    test('GET /api/campaigns should return all campaigns', async () => {
      const response = await request(app).get('/api/campaigns');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('name', 'Test Campaign');
      expect(mockStorage.getCampaigns).toHaveBeenCalled();
    });

    test('GET /api/campaigns/:id should return a specific campaign', async () => {
      const response = await request(app).get('/api/campaigns/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'Test Campaign');
      expect(mockStorage.getCampaign).toHaveBeenCalledWith(1);
    });

    test('POST /api/campaigns should create a new campaign', async () => {
      const campaignData = {
        name: 'New Campaign',
        fromName: 'New Sender',
        sendMethod: 'smtp',
        smtpMode: 'direct',
        smtpHost: 'mail.example.com',
        smtpPort: 587,
        smtpUsername: 'user@example.com',
        smtpPassword: 'password123',
        rotateSmtp: false,
        sendSpeed: 100,
        trackOpens: true,
        trackLinks: true,
        trackReplies: false,
        recipientCount: 0
      };
      
      const response = await request(app)
        .post('/api/campaigns')
        .send(campaignData);
      
      expect(response.status).toBe(201);
      expect(mockStorage.createCampaign).toHaveBeenCalled();
    });
  });

  describe('Email Status Endpoints', () => {
    test('GET /api/campaigns/:campaignId/emails should return all email statuses for a campaign', async () => {
      const response = await request(app).get('/api/campaigns/1/emails');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('email', 'recipient@example.com');
      expect(mockStorage.getEmailStatuses).toHaveBeenCalledWith(1);
    });

    test('GET /api/emails/:id should return a specific email status', async () => {
      const response = await request(app).get('/api/emails/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('email', 'recipient@example.com');
      expect(mockStorage.getEmailStatus).toHaveBeenCalledWith(1);
    });
  });
});