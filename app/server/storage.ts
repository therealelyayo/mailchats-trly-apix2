import { 
  users, emailCampaigns, emailStatuses,
  type User, type InsertUser, 
  type Campaign, type InsertCampaign,
  type EmailStatus, type InsertEmailStatus 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Campaign storage methods
  createCampaign(campaign: Campaign): Promise<Campaign>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign | undefined>;
  getAllCampaigns(): Promise<Campaign[]>;
  
  // Email status storage methods
  createEmailStatus(status: EmailStatus): Promise<EmailStatus>;
  getEmailStatusesByCampaign(campaignId: number): Promise<EmailStatus[]>;
  updateEmailStatus(id: number, updates: Partial<EmailStatus>): Promise<EmailStatus | undefined>;
  getCampaignStats(campaignId: number): Promise<{ total: number; sent: number; success: number; failed: number }>;
}

// Database storage implementation that uses Drizzle ORM
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Campaign methods
  async createCampaign(campaign: Campaign): Promise<Campaign> {
    // Create a campaign insertion object by omitting the id if it exists
    const { id, ...campaignData } = campaign;
    
    const [newCampaign] = await db
      .insert(emailCampaigns)
      .values(campaignData)
      .returning();
    
    return newCampaign;
  }
  
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db
      .select()
      .from(emailCampaigns)
      .where(eq(emailCampaigns.id, id));
    
    return campaign;
  }
  
  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const [updatedCampaign] = await db
      .update(emailCampaigns)
      .set(updates)
      .where(eq(emailCampaigns.id, id))
      .returning();
    
    return updatedCampaign;
  }
  
  async getAllCampaigns(): Promise<Campaign[]> {
    return db.select().from(emailCampaigns);
  }
  
  // Email status methods
  async createEmailStatus(status: EmailStatus): Promise<EmailStatus> {
    // Create an email status insertion object by omitting the id if it exists
    const { id, ...statusData } = status;
    
    const [newStatus] = await db
      .insert(emailStatuses)
      .values(statusData)
      .returning();
    
    return newStatus;
  }
  
  async getEmailStatusesByCampaign(campaignId: number): Promise<EmailStatus[]> {
    return db
      .select()
      .from(emailStatuses)
      .where(eq(emailStatuses.campaignId, campaignId));
  }
  
  async updateEmailStatus(id: number, updates: Partial<EmailStatus>): Promise<EmailStatus | undefined> {
    const [updatedStatus] = await db
      .update(emailStatuses)
      .set(updates)
      .where(eq(emailStatuses.id, id))
      .returning();
    
    return updatedStatus;
  }
  
  async getCampaignStats(campaignId: number): Promise<{ total: number; sent: number; success: number; failed: number }> {
    // Get campaign to get total recipient count
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) {
      return { total: 0, sent: 0, success: 0, failed: 0 };
    }
    
    // Count sent emails
    const sentCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailStatuses)
      .where(and(
        eq(emailStatuses.campaignId, campaignId),
        eq(emailStatuses.sent, true)
      ))
      .then(result => Number(result[0]?.count || 0));
    
    // Count successful emails (sent but not failed)
    const successCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailStatuses)
      .where(and(
        eq(emailStatuses.campaignId, campaignId),
        eq(emailStatuses.sent, true),
        eq(emailStatuses.failed, false)
      ))
      .then(result => Number(result[0]?.count || 0));
    
    // Count failed emails
    const failedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailStatuses)
      .where(and(
        eq(emailStatuses.campaignId, campaignId),
        eq(emailStatuses.failed, true)
      ))
      .then(result => Number(result[0]?.count || 0));
    
    return { 
      total: campaign.recipientCount, 
      sent: sentCount, 
      success: successCount, 
      failed: failedCount 
    };
  }
}

// Export database storage as the application storage
export const storage = new DatabaseStorage();
