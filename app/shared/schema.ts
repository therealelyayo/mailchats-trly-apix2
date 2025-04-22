import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table (keeping existing table)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Email campaigns table
export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fromName: text("from_name").notNull(),
  sendMethod: text("send_method").notNull(),
  apiKey: text("api_key"),
  smtpMode: text("smtp_mode"),
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port"),
  smtpUsername: text("smtp_username"),
  smtpPassword: text("smtp_password"),
  rotateSmtp: boolean("rotate_smtp").notNull().default(false),
  sendSpeed: integer("send_speed").notNull(),
  trackOpens: boolean("track_opens").notNull().default(true),
  trackLinks: boolean("track_links").notNull().default(true),
  trackReplies: boolean("track_replies").notNull().default(false),
  recipientCount: integer("recipient_count").notNull().default(0),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull().default("processing"),
});

// Define relations for campaigns
export const campaignsRelations = relations(emailCampaigns, ({ many }) => ({
  emailStatuses: many(emailStatuses),
}));

// Email status schema
export const emailStatuses = pgTable("email_statuses", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => emailCampaigns.id),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  sent: boolean("sent").notNull().default(false),
  delivered: boolean("delivered").default(false),
  opened: boolean("opened").default(false),
  clicked: boolean("clicked").default(false),
  replied: boolean("replied").default(false),
  failed: boolean("failed").default(false),
  failureReason: text("failure_reason"),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations for email statuses
export const emailStatusesRelations = relations(emailStatuses, ({ one }) => ({
  campaign: one(emailCampaigns, {
    fields: [emailStatuses.campaignId],
    references: [emailCampaigns.id],
  }),
}));

export const insertCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  completedAt: true,
  startedAt: true,
  status: true,
});

export const insertEmailStatusSchema = createInsertSchema(emailStatuses).omit({
  id: true,
  sentAt: true,
  openedAt: true,
  clickedAt: true,
  repliedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof emailCampaigns.$inferSelect;

export type InsertEmailStatus = z.infer<typeof insertEmailStatusSchema>;
export type EmailStatus = typeof emailStatuses.$inferSelect;
