import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import { log } from './vite';

interface EmailConfig {
  htmlFile: string;
  subjectsFile?: string;
  recipientsFile?: string;
  testEmail?: string;
  fromName: string;
  sendMethod: string;
  apiKey?: string;
  smtpMode?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpCredentialsFile?: string;  // New: Path to file with SMTP credentials
  rotateSmtp?: boolean;          // New: Whether to rotate through SMTP servers
  sendSpeed?: number;
  trackOpens?: boolean;
  trackLinks?: boolean;
  trackReplies?: boolean;
  
  // Template variables support
  usedTemplateVars?: boolean;
  templateVarEmail?: string;
  templateVarName?: string;
  templateVarDomain?: string;
}

/**
 * Send a test email using the Python script
 */
export async function sendTestEmail(config: EmailConfig, wss: WebSocketServer): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if the Python script exists
    const scriptPath = path.resolve('./attached_assets/send_email.py');
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Python script not found at ${scriptPath}`);
    }
    
    // Broadcast to all connected clients that we're sending the test email
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'log',
          message: `Sending test email to ${config.testEmail}...`,
          logType: 'info'
        }));
      }
    });
    
    // Construct command with proper arguments
    const command = [
      'python3', // Use python3 executable
      scriptPath,
      '--test',
      `--email=${config.testEmail}`,
      `--from-name="${config.fromName}"`, // Quoted to handle spaces
      `--send-method=${config.sendMethod}`,
    ];
    
    // Add API key if using API method
    if (config.sendMethod === 'API' && config.apiKey) {
      command.push(`--api-key="${config.apiKey}"`);
    }
    
    // Add HTML file if provided
    if (config.htmlFile) {
      command.push(`--html="${config.htmlFile}"`);
    }
    
    // Add optional arguments if provided
    if (config.subjectsFile) {
      command.push(`--subjects="${config.subjectsFile}"`);
    }
    
    // Add SMTP settings if needed
    if (config.sendMethod === 'SMTP') {
      command.push(`--smtp-mode=${config.smtpMode || 'localhost'}`);
      
      // Handle SMTP credentials file if provided
      if (config.smtpCredentialsFile) {
        command.push(`--smtp-credentials-file="${config.smtpCredentialsFile}"`);
        
        // Add rotate SMTP option if enabled
        if (config.rotateSmtp) {
          command.push('--rotate-smtp');
        }
      } else {
        // Use traditional single SMTP server configuration
        if (config.smtpHost) command.push(`--smtp-host="${config.smtpHost}"`);
        if (config.smtpPort) command.push(`--smtp-port=${config.smtpPort}`);
        if (config.smtpUsername) command.push(`--smtp-username="${config.smtpUsername}"`);
        if (config.smtpPassword) command.push(`--smtp-password="${config.smtpPassword}"`);
      }
    }
    
    // Add tracking options
    if (config.trackOpens) command.push('--track-opens');
    if (config.trackLinks) command.push('--track-links');
    if (config.trackReplies) command.push('--track-replies');
    
    log(`Executing command: ${command.join(' ')}`, 'email-service');
    
    // Execute the Python script and handle output in a structured way
    return new Promise((resolve, reject) => {
      const process = exec(command.join(' '));
      
      let output = '';
      let errorOutput = '';
      
      process.stdout?.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        output += data.toString();
        
        // Process each line
        lines.forEach((line: string) => {
          if (line.trim()) {
            // Broadcast to WebSocket clients
            wss.clients.forEach(client => {
              if (client.readyState === 1) {
                client.send(JSON.stringify({
                  type: 'log',
                  message: line.trim(),
                  logType: 'info'
                }));
              }
            });
          }
        });
      });
      
      process.stderr?.on('data', (data) => {
        errorOutput += data.toString();
        
        // Broadcast stderr to WebSocket clients
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'log',
              message: data.toString().trim(),
              logType: 'error'
            }));
          }
        });
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          log(`Test email sent successfully to ${config.testEmail}`, 'email-service');
          
          // Broadcast success to WebSocket clients
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'log',
                message: `Test email sent successfully to ${config.testEmail}`,
                logType: 'success'
              }));
            }
          });
          
          resolve({ success: true });
        } else {
          const errorMessage = errorOutput || `Process exited with code ${code}`;
          log(`Error sending test email: ${errorMessage}`, 'email-service');
          
          // Broadcast error to WebSocket clients
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'log',
                message: `Error: ${errorMessage}`,
                logType: 'error'
              }));
            }
          });
          
          resolve({ 
            success: false, 
            error: errorMessage
          });
        }
      });
      
      process.on('error', (error) => {
        const errorMessage = `Error executing Python script: ${error.message}`;
        log(errorMessage, 'email-service');
        
        // Broadcast error to WebSocket clients
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'log',
              message: errorMessage,
              logType: 'error'
            }));
          }
        });
        
        resolve({ 
          success: false, 
          error: errorMessage
        });
      });
    });
    
  } catch (error) {
    const errorMessage = `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`;
    log(errorMessage, 'email-service');
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

/**
 * Start an email campaign using the Python script
 */
export async function startEmailCampaign(config: EmailConfig, wss: WebSocketServer): Promise<number> {
  try {
    // Generate a unique campaign ID
    const campaignId = Date.now();
    
    // Check if the Python script exists
    const scriptPath = path.resolve('./attached_assets/send_email.py');
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Python script not found at ${scriptPath}`);
    }
    
    // Construct command with proper arguments
    const command = [
      'python3', // Use python3 executable
      scriptPath,
      '--campaign',
      `--campaign-id=${campaignId}`,
      `--html="${config.htmlFile}"`,
      `--subjects="${config.subjectsFile}"`,
      `--recipients="${config.recipientsFile}"`,
      `--from-name="${config.fromName}"`,
      `--send-method=${config.sendMethod}`,
      `--send-speed=${config.sendSpeed || 10}`,
    ];
    
    // Add API key if using API method
    if (config.sendMethod === 'API' && config.apiKey) {
      command.push(`--api-key="${config.apiKey}"`);
    }
    
    // Add tracking options
    if (config.trackOpens) command.push('--track-opens');
    if (config.trackLinks) command.push('--track-links');
    if (config.trackReplies) command.push('--track-replies');
    
    // Add SMTP settings if needed
    if (config.sendMethod === 'SMTP') {
      command.push(`--smtp-mode=${config.smtpMode || 'localhost'}`);
      
      // Handle SMTP credentials file if provided
      if (config.smtpCredentialsFile) {
        command.push(`--smtp-credentials-file="${config.smtpCredentialsFile}"`);
        
        // Add rotate SMTP option if enabled
        if (config.rotateSmtp) {
          command.push('--rotate-smtp');
        }
      } else {
        // Use traditional single SMTP server configuration
        if (config.smtpHost) command.push(`--smtp-host="${config.smtpHost}"`);
        if (config.smtpPort) command.push(`--smtp-port=${config.smtpPort}`);
        if (config.smtpUsername) command.push(`--smtp-username="${config.smtpUsername}"`);
        if (config.smtpPassword) command.push(`--smtp-password="${config.smtpPassword}"`);
      }
    }
    
    // Broadcast to all connected clients that we're starting the campaign
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'log',
          message: `Starting email campaign (ID: ${campaignId})...`,
          logType: 'info'
        }));
      }
    });
    
    // Execute the Python script in the background
    log(`Executing command: ${command.join(' ')}`, 'email-service');
    
    const process = exec(command.join(' '));
    
    process.stdout?.on('data', (data) => {
      // Parse the output to look for status updates
      const output = data.toString().trim();
      log(`Python output: ${output}`, 'email-service');
      
      try {
        // Check if the output is JSON with status information
        if (output.startsWith('{') && output.endsWith('}')) {
          const statusData = JSON.parse(output);
          
          // Broadcast to WebSocket clients
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'status',
                campaignId,
                ...statusData
              }));
            }
          });
        } else {
          // Regular log output
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'log',
                message: output,
                logType: 'info'
              }));
            }
          });
        }
      } catch (error) {
        // If not JSON, just send as log
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'log',
              message: output,
              logType: 'info'
            }));
          }
        });
      }
    });
    
    process.stderr?.on('data', (data) => {
      const errorOutput = data.toString().trim();
      log(`Python error: ${errorOutput}`, 'email-service');
      
      // Broadcast to WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'log',
            message: errorOutput,
            logType: 'error'
          }));
        }
      });
    });
    
    process.on('error', (error) => {
      const errorMessage = `Error executing Python script: ${error.message}`;
      log(errorMessage, 'email-service');
      
      // Broadcast to WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'log',
            message: errorMessage,
            logType: 'error'
          }));
        }
      });
    });
    
    process.on('close', (code) => {
      const message = code === 0 
        ? `Campaign ${campaignId} completed successfully` 
        : `Campaign ${campaignId} exited with code ${code}`;
      
      log(message, 'email-service');
      
      // Broadcast to WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'log',
            message,
            logType: code === 0 ? 'success' : 'error',
          }));
          
          // Also send a completion status
          client.send(JSON.stringify({
            type: 'status',
            campaignId,
            completed: true
          }));
        }
      });
    });
    
    return campaignId;
    
  } catch (error) {
    const errorMessage = `Failed to start email campaign: ${error instanceof Error ? error.message : 'Unknown error'}`;
    log(errorMessage, 'email-service');
    
    // Broadcast error to WebSocket clients
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'log',
          message: errorMessage,
          logType: 'error'
        }));
      }
    });
    
    throw error;
  }
}