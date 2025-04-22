import { insertUserSchema, insertCampaignSchema, insertEmailStatusSchema } from '../schema';

describe('User Schema Validation', () => {
  test('validates a correct user', () => {
    const validUser = {
      username: 'testuser',
      password: 'password123'
    };
    
    const result = insertUserSchema.safeParse(validUser);
    expect(result.success).toBeTruthy();
  });
  
  test('rejects a user without username', () => {
    const invalidUser = {
      password: 'password123'
    };
    
    const result = insertUserSchema.safeParse(invalidUser);
    expect(result.success).toBeFalsy();
  });
  
  test('rejects a user without password', () => {
    const invalidUser = {
      username: 'testuser'
    };
    
    const result = insertUserSchema.safeParse(invalidUser);
    expect(result.success).toBeFalsy();
  });
});

describe('Campaign Schema Validation', () => {
  test('validates a correct email campaign', () => {
    const validCampaign = {
      name: 'Test Campaign',
      fromName: 'Test Sender',
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
    
    const result = insertCampaignSchema.safeParse(validCampaign);
    expect(result.success).toBeTruthy();
  });
  
  test('rejects a campaign without required fields', () => {
    const invalidCampaign = {
      name: 'Test Campaign'
    };
    
    const result = insertCampaignSchema.safeParse(invalidCampaign);
    expect(result.success).toBeFalsy();
  });
});

describe('Email Status Schema Validation', () => {
  test('validates a correct email status', () => {
    const validEmailStatus = {
      campaignId: 1,
      email: 'recipient@example.com',
      subject: 'Test Email Subject',
      sent: false,
      delivered: false,
      opened: false,
      clicked: false,
      replied: false,
      failed: false
    };
    
    const result = insertEmailStatusSchema.safeParse(validEmailStatus);
    expect(result.success).toBeTruthy();
  });
  
  test('rejects an email status without required fields', () => {
    const invalidEmailStatus = {
      campaignId: 1
    };
    
    const result = insertEmailStatusSchema.safeParse(invalidEmailStatus);
    expect(result.success).toBeFalsy();
  });
});