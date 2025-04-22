/**
 * Data schema for the MailChats Trly APIX2 application
 */

import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { sqliteTable, text, integer, boolean } from 'drizzle-orm/sqlite-core';

// User model
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Campaign model
export const campaigns = sqliteTable('campaigns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  fromName: text('from_name').notNull(),
  sendMethod: text('send_method').notNull(),
  smtpMode: text('smtp_mode').notNull(),
  smtpHost: text('smtp_host').notNull(),
  smtpPort: integer('smtp_port').notNull(),
  smtpUsername: text('smtp_username').notNull(),
  smtpPassword: text('smtp_password').notNull(),
  apiKey: text('api_key'),
  rotateSmtp: boolean('rotate_smtp').notNull().default(false),
  sendSpeed: integer('send_speed').notNull().default(100),
  trackOpens: boolean('track_opens').notNull().default(true),
  trackLinks: boolean('track_links').notNull().default(true),
  trackReplies: boolean('track_replies').notNull().default(false),
  recipientCount: integer('recipient_count').notNull().default(0),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  status: text('status').default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Email status model
export const emailStatuses = sqliteTable('email_statuses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  campaignId: integer('campaign_id').notNull().references(() => campaigns.id),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  sent: boolean('sent').notNull().default(false),
  delivered: boolean('delivered').notNull().default(false),
  opened: boolean('opened').notNull().default(false),
  clicked: boolean('clicked').notNull().default(false),
  replied: boolean('replied').notNull().default(false),
  failed: boolean('failed').notNull().default(false),
  failureReason: text('failure_reason'),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  openedAt: integer('opened_at', { mode: 'timestamp' }),
  clickedAt: integer('clicked_at', { mode: 'timestamp' }),
  repliedAt: integer('replied_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ 
  id: true, 
  status: true, 
  startedAt: true, 
  completedAt: true,
  createdAt: true, 
  updatedAt: true 
});
export const insertEmailStatusSchema = createInsertSchema(emailStatuses).omit({ 
  id: true, 
  sentAt: true, 
  openedAt: true, 
  clickedAt: true, 
  repliedAt: true,
  createdAt: true, 
  updatedAt: true 
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type EmailStatus = typeof emailStatuses.$inferSelect;
export type InsertEmailStatus = z.infer<typeof insertEmailStatusSchema>;