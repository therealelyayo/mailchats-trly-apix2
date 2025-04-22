/**
 * In-memory storage implementation for MailChats Trly APIX2
 * 
 * This file implements the storage interface using in-memory data structures
 * instead of a database. All data is stored in memory and will be reset when
 * the application is restarted.
 */

import { 
  User, InsertUser, 
  Campaign, InsertCampaign, 
  EmailStatus, InsertEmailStatus 
} from '@shared/schema';
import session from 'express-session';
import { createMemoryStore } from 'memorystore';

const MemoryStore = createMemoryStore(session);

// Storage interface defining all required methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Campaign methods
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<Campaign | undefined>;
  
  // Email status methods
  getEmailStatuses(campaignId: number): Promise<EmailStatus[]>;
  getEmailStatus(id: number): Promise<EmailStatus | undefined>;
  createEmailStatus(status: InsertEmailStatus): Promise<EmailStatus>;
  updateEmailStatus(id: number, status: Partial<EmailStatus>): Promise<EmailStatus | undefined>;
  deleteEmailStatus(id: number): Promise<EmailStatus | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

/**
 * In-memory storage implementation
 */
export class MemStorage implements IStorage {
  private users: User[] = [];
  private campaigns: Campaign[] = [];
  private emailStatuses: EmailStatus[] = [];
  
  private nextUserId = 1;
  private nextCampaignId = 1;
  private nextEmailStatusId = 1;
  
  public sessionStore: session.Store;
  
  constructor() {
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add a default user if none exists
    if (process.env.DEFAULT_LOGIN_EMAIL && process.env.DEFAULT_USER_PASSWORD) {
      this.createUser({
        username: process.env.DEFAULT_LOGIN_EMAIL,
        password: process.env.DEFAULT_USER_PASSWORD
      }).catch(err => console.error('Failed to create default user:', err));
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    const now = new Date();
    const user: User = {
      id: this.nextUserId++,
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    this.users.push(user);
    return user;
  }
  
  // Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    return [...this.campaigns];
  }
  
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.find(c => c.id === id);
  }
  
  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const now = new Date();
    const campaign: Campaign = {
      id: this.nextCampaignId++,
      ...campaignData,
      status: 'draft',
      startedAt: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now
    };
    
    this.campaigns.push(campaign);
    return campaign;
  }
  
  async updateCampaign(id: number, campaignData: Partial<Campaign>): Promise<Campaign | undefined> {
    const index = this.campaigns.findIndex(c => c.id === id);
    if (index === -1) {
      return undefined;
    }
    
    const campaign = this.campaigns[index];
    const updatedCampaign: Campaign = {
      ...campaign,
      ...campaignData,
      updatedAt: new Date()
    };
    
    this.campaigns[index] = updatedCampaign;
    return updatedCampaign;
  }
  
  async deleteCampaign(id: number): Promise<Campaign | undefined> {
    const index = this.campaigns.findIndex(c => c.id === id);
    if (index === -1) {
      return undefined;
    }
    
    const campaign = this.campaigns[index];
    this.campaigns.splice(index, 1);
    
    // Delete all email statuses associated with this campaign
    this.emailStatuses = this.emailStatuses.filter(s => s.campaignId !== id);
    
    return campaign;
  }
  
  // Email status methods
  async getEmailStatuses(campaignId: number): Promise<EmailStatus[]> {
    return this.emailStatuses.filter(s => s.campaignId === campaignId);
  }
  
  async getEmailStatus(id: number): Promise<EmailStatus | undefined> {
    return this.emailStatuses.find(s => s.id === id);
  }
  
  async createEmailStatus(statusData: InsertEmailStatus): Promise<EmailStatus> {
    const now = new Date();
    const status: EmailStatus = {
      id: this.nextEmailStatusId++,
      ...statusData,
      sentAt: null,
      openedAt: null,
      clickedAt: null,
      repliedAt: null,
      createdAt: now,
      updatedAt: now
    };
    
    this.emailStatuses.push(status);
    return status;
  }
  
  async updateEmailStatus(id: number, statusData: Partial<EmailStatus>): Promise<EmailStatus | undefined> {
    const index = this.emailStatuses.findIndex(s => s.id === id);
    if (index === -1) {
      return undefined;
    }
    
    const status = this.emailStatuses[index];
    let updatedStatus: EmailStatus = {
      ...status,
      ...statusData,
      updatedAt: new Date()
    };
    
    // Update timestamp fields based on status flags
    if (statusData.sent && !status.sent) {
      updatedStatus.sentAt = new Date();
    }
    if (statusData.opened && !status.opened) {
      updatedStatus.openedAt = new Date();
    }
    if (statusData.clicked && !status.clicked) {
      updatedStatus.clickedAt = new Date();
    }
    if (statusData.replied && !status.replied) {
      updatedStatus.repliedAt = new Date();
    }
    
    this.emailStatuses[index] = updatedStatus;
    return updatedStatus;
  }
  
  async deleteEmailStatus(id: number): Promise<EmailStatus | undefined> {
    const index = this.emailStatuses.findIndex(s => s.id === id);
    if (index === -1) {
      return undefined;
    }
    
    const status = this.emailStatuses[index];
    this.emailStatuses.splice(index, 1);
    return status;
  }
}

// Create and export a singleton instance
export const storage = new MemStorage();