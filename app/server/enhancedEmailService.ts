import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import { log } from './vite';
import { spawn } from 'child_process';

/**
 * Interface for enhanced email configuration
 */
export interface EnhancedEmailConfig {
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
  smtpCredentialsFile?: string;
  rotateSmtp?: boolean;
  sendSpeed?: number;
  trackOpens?: boolean;
  trackLinks?: boolean;
  trackReplies?: boolean;
  
  // Enhanced support for template variables with additional recipient data
  useEnhancedVariables?: boolean;
  enhancedRecipientFormat?: boolean;
}

/**
 * Get available personalization variables
 * Uses the EnhancedEmailParser Python class to retrieve all available variables
 */
export async function getAvailableVariables(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve('./attached_assets/enhanced_email_parser.py');
    
    if (!fs.existsSync(scriptPath)) {
      reject(new Error('Enhanced email parser script not found'));
      return;
    }
    
    // Execute Python script to get variable documentation
    const pythonProcess = spawn('python3', [scriptPath, '--get-variables']);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const variables = JSON.parse(stdout);
        resolve(variables);
      } catch (error) {
        reject(new Error(`Failed to parse variables: ${error}`));
      }
    });
  });
}

/**
 * Generate HTML documentation for personalization variables
 */
export async function generateVariablesDocumentation(): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve('./attached_assets/enhanced_email_parser.py');
    
    if (!fs.existsSync(scriptPath)) {
      reject(new Error('Enhanced email parser script not found'));
      return;
    }
    
    // Execute Python script to get variable documentation
    const pythonProcess = spawn('python3', [scriptPath, '--generate-docs']);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        return;
      }
      
      resolve(stdout);
    });
  });
}

/**
 * Apply enhanced mail merge to a template with a recipient line
 */
export async function applyEnhancedMailMerge(template: string, recipientLine: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve('./attached_assets/enhanced_email_parser.py');
    
    if (!fs.existsSync(scriptPath)) {
      reject(new Error('Enhanced email parser script not found'));
      return;
    }
    
    // Create temporary files for the template and recipient
    const tempDir = path.resolve('./tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const templatePath = path.join(tempDir, `template_${Date.now()}.html`);
    const recipientPath = path.join(tempDir, `recipient_${Date.now()}.txt`);
    
    fs.writeFileSync(templatePath, template);
    fs.writeFileSync(recipientPath, recipientLine);
    
    // Execute Python script to apply mail merge
    const pythonProcess = spawn('python3', [
      scriptPath, 
      '--apply-merge',
      '--template', templatePath,
      '--recipient', recipientPath
    ]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      // Clean up temp files
      try {
        fs.unlinkSync(templatePath);
        fs.unlinkSync(recipientPath);
      } catch (err) {
        console.error('Error cleaning up temp files:', err);
      }
      
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        return;
      }
      
      resolve(stdout);
    });
  });
}

/**
 * Parse a recipient line to extract all available variables
 */
export async function parseRecipientLine(recipientLine: string): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve('./attached_assets/enhanced_email_parser.py');
    
    if (!fs.existsSync(scriptPath)) {
      reject(new Error('Enhanced email parser script not found'));
      return;
    }
    
    // Execute Python script to parse recipient line
    const pythonProcess = spawn('python3', [
      scriptPath, 
      '--parse-recipient',
      '--recipient-line', recipientLine
    ]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const variables = JSON.parse(stdout);
        resolve(variables);
      } catch (error) {
        reject(new Error(`Failed to parse variables: ${error}`));
      }
    });
  });
}

/**
 * Update the Python script to include enhanced functionality
 * This method modifies the send_email.py script to include imports and integration
 * with the EnhancedEmailParser class
 */
export async function updatePythonScriptForEnhancedVariables(): Promise<boolean> {
  try {
    // Check if the Python script exists
    const scriptPath = path.resolve('./attached_assets/send_email.py');
    const enhancedParserPath = path.resolve('./attached_assets/enhanced_email_parser.py');
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Python script not found at ${scriptPath}`);
    }
    
    if (!fs.existsSync(enhancedParserPath)) {
      throw new Error(`Enhanced email parser not found at ${enhancedParserPath}`);
    }
    
    // Read the script content
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Check if integration is already done
    if (scriptContent.includes('from enhanced_email_parser import EnhancedEmailParser')) {
      // Already integrated
      return true;
    }
    
    // Add import statement after other imports
    let updatedContent = scriptContent.replace(
      'from datetime import datetime',
      'from datetime import datetime\nimport os.path\n\n# Import the enhanced email parser if available\nenhanced_parser = None\ntry:\n    from enhanced_email_parser import EnhancedEmailParser\n    enhanced_parser = EnhancedEmailParser()\nexcept ImportError:\n    print("Enhanced email parser not available, using basic parser")'
    );
    
    // Update the apply_mail_merge function to use the enhanced parser if available
    updatedContent = updatedContent.replace(
      'def apply_mail_merge(template, email, emailname, domain, current_time):',
      'def apply_mail_merge(template, email, emailname, domain, current_time):\n    # Use enhanced parser if available\n    if enhanced_parser and email:\n        try:\n            # Try to use enhanced parser first\n            return enhanced_parser.apply_enhanced_mail_merge(template, email)\n        except Exception as e:\n            print(f"Enhanced parser failed, falling back to basic parser: {e}")'
    );
    
    // Save the updated script
    fs.writeFileSync(scriptPath, updatedContent);
    
    return true;
  } catch (error) {
    console.error('Error updating Python script:', error);
    return false;
  }
}

/**
 * Send a test email with enhanced personalization variables
 */
export async function sendEnhancedTestEmail(
  config: EnhancedEmailConfig, 
  wss: WebSocketServer
): Promise<{ success: boolean; error?: string }> {
  try {
    // Ensure the Python script is updated for enhanced variables
    await updatePythonScriptForEnhancedVariables();
    
    // Proceed with sending test email
    // This part is similar to the original emailService.sendTestEmail
    // but adds the enhanced variables flags
    const scriptPath = path.resolve('./attached_assets/send_email.py');
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Python script not found at ${scriptPath}`);
    }
    
    // Broadcast to clients
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'log',
          message: `Sending enhanced test email to ${config.testEmail}...`,
          messageType: 'info'
        }));
      }
    });
    
    // Build command with enhanced variables support
    let command = `python3 "${scriptPath}" --test --test-email ${config.testEmail} --from-name "${config.fromName}" --send-method ${config.sendMethod}`;
    
    if (config.sendMethod === "API" && config.apiKey) {
      command += ` --api-key ${config.apiKey}`;
    } else if (config.sendMethod === "SMTP") {
      command += ` --smtp-mode ${config.smtpMode}`;
      
      if (config.smtpMode === "smtp") {
        command += ` --smtp-host ${config.smtpHost} --smtp-port ${config.smtpPort} --smtp-username ${config.smtpUsername} --smtp-password ${config.smtpPassword}`;
      }
    }
    
    // Add enhanced variables flag
    if (config.useEnhancedVariables) {
      command += ` --use-enhanced-variables`;
    }
    
    // Execute the command
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        // Log output to console
        console.log(`Test email stdout: ${stdout}`);
        if (stderr) {
          console.error(`Test email stderr: ${stderr}`);
        }
        
        if (error) {
          console.error(`Test email exec error: ${error.message}`);
          
          // Broadcast error to clients
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'log',
                message: `Error sending test email: ${error.message}`,
                messageType: 'error'
              }));
            }
          });
          
          resolve({ success: false, error: error.message });
          return;
        }
        
        // Check for success message in output
        if (stdout.includes("Test email sent successfully")) {
          // Broadcast success to clients
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'log',
                message: `Test email sent successfully to ${config.testEmail}`,
                messageType: 'success'
              }));
            }
          });
          
          resolve({ success: true });
        } else {
          // If we didn't find explicit success message but no error occurred, assume success
          const message = `Test email sent to ${config.testEmail}. Check logs for details.`;
          
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'log',
                message,
                messageType: 'info'
              }));
            }
          });
          
          resolve({ success: true });
        }
      });
    });
  } catch (error) {
    console.error('Error sending enhanced test email:', error);
    
    // Broadcast error to clients
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'log',
          message: `Error sending enhanced test email: ${error instanceof Error ? error.message : String(error)}`,
          messageType: 'error'
        }));
      }
    });
    
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Start an email campaign with enhanced personalization variables
 */
export async function startEnhancedEmailCampaign(
  config: EnhancedEmailConfig, 
  wss: WebSocketServer
): Promise<number> {
  try {
    // Ensure the Python script is updated for enhanced variables
    await updatePythonScriptForEnhancedVariables();
    
    // Generate a campaign ID (timestamp)
    const campaignId = Date.now();
    
    // Check if required files exist
    if (!config.htmlFile || !config.recipientsFile) {
      throw new Error("HTML template and recipients file are required");
    }
    
    // Create command to execute Python script
    const scriptPath = path.resolve('./attached_assets/send_email.py');
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Python script not found at ${scriptPath}`);
    }
    
    let command = `python3 "${scriptPath}" --html "${config.htmlFile}" --recipients "${config.recipientsFile}" --from-name "${config.fromName}" --send-method ${config.sendMethod}`;
    
    // Add subjects file if provided
    if (config.subjectsFile) {
      command += ` --subjects "${config.subjectsFile}"`;
    }
    
    // Add API key if using API method
    if (config.sendMethod === "API" && config.apiKey) {
      command += ` --api-key ${config.apiKey}`;
    } 
    // Add SMTP settings if using SMTP method
    else if (config.sendMethod === "SMTP") {
      command += ` --smtp-mode ${config.smtpMode}`;
      
      if (config.smtpMode === "smtp") {
        command += ` --smtp-host ${config.smtpHost} --smtp-port ${config.smtpPort} --smtp-username ${config.smtpUsername} --smtp-password ${config.smtpPassword}`;
        
        // Add SMTP credentials file if provided
        if (config.smtpCredentialsFile) {
          command += ` --smtp-credentials ${config.smtpCredentialsFile}`;
        }
        
        // Add SMTP rotation flag if enabled
        if (config.rotateSmtp) {
          command += ` --rotate-smtp`;
        }
      }
    }
    
    // Add tracking options
    if (config.trackOpens) command += ` --track-opens`;
    if (config.trackLinks) command += ` --track-links`;
    if (config.trackReplies) command += ` --track-replies`;
    
    // Add send speed if specified
    if (config.sendSpeed) {
      command += ` --send-speed ${config.sendSpeed}`;
    }
    
    // Add campaign ID for tracking
    command += ` --campaign-id ${campaignId}`;
    
    // Add enhanced variables flags
    if (config.useEnhancedVariables) {
      command += ` --use-enhanced-variables`;
    }
    
    if (config.enhancedRecipientFormat) {
      command += ` --enhanced-recipient-format`;
    }
    
    // Log the command
    console.log(`Executing command: ${command}`);
    
    // Broadcast initial campaign status
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'campaignStatus',
          campaignId,
          status: {
            total: 0,
            sent: 0,
            success: 0,
            failed: 0,
            startTime: Date.now()
          }
        }));
        
        client.send(JSON.stringify({
          type: 'log',
          message: `Starting email campaign with ID: ${campaignId}`,
          messageType: 'info'
        }));
      }
    });
    
    // Execute the command asynchronously
    const childProcess = exec(command);
    
    // Handle stdout
    childProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(`Campaign output: ${output}`);
      
      // Try to parse JSON status updates
      try {
        if (output.trim().startsWith('{') && output.includes('"total":')) {
          const status = JSON.parse(output);
          
          // Broadcast status to clients
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'campaignStatus',
                campaignId,
                status: {
                  ...status,
                  startTime: Date.now()
                }
              }));
            }
          });
        } else {
          // Regular log message
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'log',
                message: output,
                messageType: 'info'
              }));
            }
          });
        }
      } catch (e) {
        // Not a JSON message, just send as log
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'log',
              message: output,
              messageType: 'info'
            }));
          }
        });
      }
    });
    
    // Handle stderr
    childProcess.stderr?.on('data', (data) => {
      const error = data.toString();
      console.error(`Campaign error: ${error}`);
      
      // Broadcast error to clients
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'log',
            message: error,
            messageType: 'error'
          }));
        }
      });
    });
    
    // Handle process exit
    childProcess.on('exit', (code) => {
      console.log(`Campaign process exited with code ${code}`);
      
      // Broadcast completion to clients
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'log',
            message: `Campaign ${campaignId} completed with exit code ${code}`,
            messageType: code === 0 ? 'success' : 'warning'
          }));
        }
      });
    });
    
    return campaignId;
  } catch (error) {
    console.error('Error starting enhanced email campaign:', error);
    
    // Broadcast error to clients
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'log',
          message: `Error starting campaign: ${error instanceof Error ? error.message : String(error)}`,
          messageType: 'error'
        }));
      }
    });
    
    return -1;
  }
}