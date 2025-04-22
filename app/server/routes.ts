import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { WebSocketServer, WebSocket } from "ws";
import { log } from "./vite";
import fs from "fs";
import path from "path";
import { startEmailCampaign, sendTestEmail } from "./emailService";
import { sendVerificationCode, verifyCode } from "./emailVerificationService";
import { updateTheme, getTheme } from "./themeService";
import { generateSubjectLines } from "./deepSeekService";
import { 
  getAvailableVariables,
  generateVariablesDocumentation,
  applyEnhancedMailMerge,
  parseRecipientLine,
  sendEnhancedTestEmail,
  startEnhancedEmailCampaign
} from "./enhancedEmailService";
import {
  analyzeTemplateWithAI,
  getSmartTemplateSuggestions
} from "./smartTemplateService";

// Set up multer for file uploads
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Create a websocket server with a specific path for client connections
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  wss.on('connection', (ws) => {
    log(`WebSocket client connected`, 'ws-info');
    
    // Send a welcome message to confirm connection
    ws.send(JSON.stringify({
      type: 'log',
      message: 'WebSocket connected to server',
      logType: 'info'
    }));
    
    ws.on('error', (error) => {
      log(`WebSocket error: ${error.message}`, 'ws-error');
    });
    
    ws.on('close', () => {
      log(`WebSocket client disconnected`, 'ws-info');
    });
  });
  
  // API Routes
  app.post('/api/email/test', upload.fields([
    { name: 'htmlFile', maxCount: 1 },
    { name: 'subjectsFile', maxCount: 1 },
    { name: 'smtpCredentialsFile', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const htmlFile = files.htmlFile?.[0];
      const subjectsFile = files.subjectsFile?.[0];
      const smtpCredentialsFile = files.smtpCredentialsFile?.[0];
      
      if (!htmlFile) {
        return res.status(400).json({ message: 'HTML template file is required' });
      }
      
      const testEmail = req.body.testEmail;
      if (!testEmail) {
        return res.status(400).json({ message: 'Test email address is required' });
      }
      
      // Check if template variables were used
      const usedTemplateVars = req.body.usedTemplateVars === 'true';
      
      // Log information about template variable usage
      if (usedTemplateVars) {
        log(`Using template variables for test email to ${testEmail}`, 'email-service');
        log(`Email: ${req.body.templateVarEmail}, Name: ${req.body.templateVarName}, Domain: ${req.body.templateVarDomain}`, 'email-service');
      }
      
      const result = await sendTestEmail({
        htmlFile: htmlFile.path,
        subjectsFile: subjectsFile?.path,
        testEmail,
        fromName: req.body.fromName || 'Email Support',
        sendMethod: req.body.sendMethod || 'API',
        apiKey: req.body.apiKey || 'nyk_v0_IDxmJtl9h5BGx1ZCpKBxssPwrLTTmrDheQoZhBFNzeYiFSyQFeDOsq61FAIvPGOf',
        
        // SMTP settings
        smtpMode: req.body.smtpMode || 'localhost',
        smtpHost: req.body.smtpHost,
        smtpPort: req.body.smtpPort,
        smtpUsername: req.body.smtpUsername,
        smtpPassword: req.body.smtpPassword,
        
        // Add SMTP credentials file if provided
        ...(smtpCredentialsFile ? {
          smtpCredentialsFile: smtpCredentialsFile.path,
          rotateSmtp: req.body.rotateSmtp === 'true'
        } : {}),
        
        // Add template variable support
        usedTemplateVars,
        templateVarEmail: req.body.templateVarEmail,
        templateVarName: req.body.templateVarName,
        templateVarDomain: req.body.templateVarDomain
      }, wss);
      
      if (result.success) {
        res.status(200).json({ message: 'Test email sent successfully' });
      } else {
        res.status(500).json({ message: result.error });
      }
    } catch (error) {
      log(`Error sending test email: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ message: 'An error occurred while sending the test email' });
    }
  });
  
  app.post('/api/email/send', upload.fields([
    { name: 'htmlFile', maxCount: 1 },
    { name: 'subjectsFile', maxCount: 1 },
    { name: 'recipientsFile', maxCount: 1 },
    { name: 'smtpCredentialsFile', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const htmlFile = files.htmlFile?.[0];
      const subjectsFile = files.subjectsFile?.[0];
      const recipientsFile = files.recipientsFile?.[0];
      const smtpCredentialsFile = files.smtpCredentialsFile?.[0];
      
      if (!htmlFile || !subjectsFile || !recipientsFile) {
        return res.status(400).json({ 
          message: 'HTML template, subjects, and recipients files are required' 
        });
      }
      
      // Start the email campaign in the background
      const campaignId = await startEmailCampaign({
        htmlFile: htmlFile.path,
        subjectsFile: subjectsFile.path,
        recipientsFile: recipientsFile.path,
        fromName: req.body.fromName || 'Email Support',
        sendMethod: req.body.sendMethod || 'API',
        apiKey: req.body.apiKey || 'nyk_v0_IDxmJtl9h5BGx1ZCpKBxssPwrLTTmrDheQoZhBFNzeYiFSyQFeDOsq61FAIvPGOf',
        
        // SMTP settings
        smtpMode: req.body.smtpMode || 'localhost',
        smtpHost: req.body.smtpHost,
        smtpPort: req.body.smtpPort,
        smtpUsername: req.body.smtpUsername,
        smtpPassword: req.body.smtpPassword,
        
        // Add SMTP credentials file if provided
        ...(smtpCredentialsFile ? {
          smtpCredentialsFile: smtpCredentialsFile.path,
          rotateSmtp: req.body.rotateSmtp === 'true'
        } : {}),
        
        // Email sending and tracking options
        sendSpeed: parseInt(req.body.sendSpeed) || 10,
        trackOpens: req.body.trackOpens === 'true',
        trackLinks: req.body.trackLinks === 'true',
        trackReplies: req.body.trackReplies === 'true'
      }, wss);
      
      // Store campaign in memory for status tracking
      await storage.createCampaign({
        id: campaignId,
        name: `Campaign-${campaignId}`,
        fromName: req.body.fromName || 'Email Support',
        sendMethod: req.body.sendMethod || 'API',
        apiKey: req.body.apiKey || 'nyk_v0_IDxmJtl9h5BGx1ZCpKBxssPwrLTTmrDheQoZhBFNzeYiFSyQFeDOsq61FAIvPGOf',
        smtpMode: req.body.smtpMode || 'localhost',
        smtpHost: req.body.smtpHost || '',
        smtpPort: parseInt(req.body.smtpPort) || 587,
        smtpUsername: req.body.smtpUsername || '',
        smtpPassword: req.body.smtpPassword || '',
        rotateSmtp: req.body.rotateSmtp === 'true',
        sendSpeed: parseInt(req.body.sendSpeed) || 10,
        trackOpens: req.body.trackOpens === 'true',
        trackLinks: req.body.trackLinks === 'true',
        trackReplies: req.body.trackReplies === 'true',
        recipientCount: 0,  // Will be updated during processing
        startedAt: new Date(),
        completedAt: null,
        status: 'processing'
      });
      
      res.status(200).json({ 
        message: 'Email campaign started',
        campaignId
      });
    } catch (error) {
      log(`Error starting email campaign: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ message: 'An error occurred while starting the email campaign' });
    }
  });
  
  app.get('/api/email/campaigns', async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.status(200).json(campaigns);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while fetching campaigns' });
    }
  });
  
  app.get('/api/email/campaigns/:id', async (req, res) => {
    try {
      const campaign = await storage.getCampaign(parseInt(req.params.id));
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      res.status(200).json(campaign);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while fetching the campaign' });
    }
  });
  
  // Email verification endpoints
  app.post('/api/auth/send-verification-code', async (req, res) => {
    try {
      await sendVerificationCode(req, res);
    } catch (error) {
      log(`Error sending verification code: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while sending the verification code' 
      });
    }
  });
  
  app.post('/api/auth/verify-code', async (req, res) => {
    try {
      verifyCode(req, res);
    } catch (error) {
      log(`Error verifying code: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while verifying the code' 
      });
    }
  });
  
  // Theme endpoints
  app.get('/api/theme', async (req, res) => {
    try {
      await getTheme(req, res);
    } catch (error) {
      log(`Error getting theme: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ error: 'An error occurred while getting the theme' });
    }
  });
  
  app.post('/api/theme', async (req, res) => {
    try {
      await updateTheme(req, res);
      
      // Let all connected WebSocket clients know the theme has changed
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'theme-changed',
            theme: req.body
          }));
        }
      });
      
    } catch (error) {
      log(`Error updating theme: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ error: 'An error occurred while updating the theme' });
    }
  });

  // Enhanced Personalization Variables API endpoints
  app.get('/api/email/personalization-variables', async (req, res) => {
    try {
      const variables = await getAvailableVariables();
      res.status(200).json(variables);
    } catch (error) {
      log(`Error getting personalization variables: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while getting personalization variables' 
      });
    }
  });
  
  app.get('/api/email/personalization-documentation', async (req, res) => {
    try {
      const documentation = await generateVariablesDocumentation();
      res.status(200).json({ 
        success: true, 
        documentation 
      });
    } catch (error) {
      log(`Error generating documentation: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while generating documentation' 
      });
    }
  });
  
  app.post('/api/email/parse-recipient', async (req, res) => {
    try {
      const { recipientLine } = req.body;
      
      if (!recipientLine) {
        return res.status(400).json({ 
          success: false, 
          message: 'Recipient line is required' 
        });
      }
      
      const variables = await parseRecipientLine(recipientLine);
      res.status(200).json({ 
        success: true, 
        variables 
      });
    } catch (error) {
      log(`Error parsing recipient line: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while parsing recipient line' 
      });
    }
  });
  
  app.post('/api/email/apply-enhanced-merge', async (req, res) => {
    try {
      const { template, recipientLine } = req.body;
      
      if (!template || !recipientLine) {
        return res.status(400).json({ 
          success: false, 
          message: 'Template and recipient line are required' 
        });
      }
      
      const result = await applyEnhancedMailMerge(template, recipientLine);
      res.status(200).json({ 
        success: true, 
        result 
      });
    } catch (error) {
      log(`Error applying enhanced mail merge: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while applying enhanced mail merge' 
      });
    }
  });

  // Enhanced Test Email API endpoint
  app.post('/api/email/enhanced-test', upload.fields([
    { name: 'htmlFile', maxCount: 1 },
    { name: 'subjectsFile', maxCount: 1 },
    { name: 'smtpCredentialsFile', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const htmlFile = files.htmlFile?.[0];
      const subjectsFile = files.subjectsFile?.[0];
      const smtpCredentialsFile = files.smtpCredentialsFile?.[0];
      
      if (!htmlFile) {
        return res.status(400).json({ message: 'HTML template file is required' });
      }
      
      const testEmail = req.body.testEmail;
      if (!testEmail) {
        return res.status(400).json({ message: 'Test email address is required' });
      }
      
      // Use enhanced variables if requested
      const useEnhancedVariables = req.body.useEnhancedVariables === 'true';
      const enhancedRecipientFormat = req.body.enhancedRecipientFormat === 'true';
      
      // Log information about enhanced variables usage
      if (useEnhancedVariables) {
        log(`Using enhanced variables for test email to ${testEmail}`, 'email-service');
      }
      
      const result = await sendEnhancedTestEmail({
        htmlFile: htmlFile.path,
        subjectsFile: subjectsFile?.path,
        testEmail,
        fromName: req.body.fromName || 'Email Support',
        sendMethod: req.body.sendMethod || 'API',
        apiKey: req.body.apiKey || 'nyk_v0_IDxmJtl9h5BGx1ZCpKBxssPwrLTTmrDheQoZhBFNzeYiFSyQFeDOsq61FAIvPGOf',
        
        // SMTP settings
        smtpMode: req.body.smtpMode || 'localhost',
        smtpHost: req.body.smtpHost,
        smtpPort: req.body.smtpPort,
        smtpUsername: req.body.smtpUsername,
        smtpPassword: req.body.smtpPassword,
        
        // Add SMTP credentials file if provided
        ...(smtpCredentialsFile ? {
          smtpCredentialsFile: smtpCredentialsFile.path,
          rotateSmtp: req.body.rotateSmtp === 'true'
        } : {}),
        
        // Enhanced variables support
        useEnhancedVariables,
        enhancedRecipientFormat,
      }, wss);
      
      if (result.success) {
        res.status(200).json({ message: 'Enhanced test email sent successfully' });
      } else {
        res.status(500).json({ message: result.error });
      }
    } catch (error) {
      log(`Error sending enhanced test email: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ message: 'An error occurred while sending the enhanced test email' });
    }
  });
  
  // AI-powered subject line generator endpoint
  app.post('/api/email/generate-subjects', async (req, res) => {
    try {
      const { 
        emailContent, 
        tone, 
        industry, 
        targetAudience, 
        maxLength, 
        count 
      } = req.body;
      
      if (!emailContent) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email content is required'
        });
      }
      
      log(`Generating subject lines using DeepSeek AI...`, 'ai-service');
      
      // Broadcast to WebSocket clients that generation has started
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'log',
            message: 'Generating AI subject lines...',
            logType: 'info'
          }));
        }
      });
      
      const result = await generateSubjectLines({
        emailContent,
        tone: tone || 'professional',
        industry: industry || '',
        targetAudience: targetAudience || '',
        maxLength: maxLength ? parseInt(maxLength) : 70,
        count: count ? parseInt(count) : 5
      });
      
      // Send the generation result to WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'log',
            message: result.success 
              ? `Generated ${result.subjects.length} subject lines` 
              : `Failed to generate subject lines: ${result.error}`,
            logType: result.success ? 'success' : 'error'
          }));
        }
      });
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      log(`Error generating subject lines: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({ 
        success: false, 
        subjects: [],
        error: 'An error occurred while generating subject lines' 
      });
    }
  });

  // Smart Template Recommendation Engine endpoints
  app.post('/api/template/analyze', async (req, res) => {
    try {
      await analyzeTemplateWithAI(req, res);
    } catch (error) {
      log(`Error analyzing template: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({
        success: false,
        error: 'An error occurred while analyzing the template'
      });
    }
  });

  app.post('/api/template/suggestions', async (req, res) => {
    try {
      await getSmartTemplateSuggestions(req, res);
    } catch (error) {
      log(`Error getting template suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      res.status(500).json({
        success: false,
        error: 'An error occurred while getting template suggestions'
      });
    }
  });

  return httpServer;
}
