import { EmailConfiguration } from "@/pages/Home";

interface EmailResponse {
  success: boolean;
  message: string;
  campaignId?: number;
}

/**
 * Send a test email with the provided configuration and support for template variables
 */
export async function sendTestEmail(
  config: EmailConfiguration,
  testEmail: string,
  templateVars?: {
    name?: string;
    domain?: string;
  }
): Promise<EmailResponse> {
  try {
    // Create FormData object for file uploads
    const formData = new FormData();
    
    // Process HTML file with template variables if needed
    if (config.htmlFile) {
      try {
        // If we have template vars, process the HTML file first
        if (templateVars && Object.keys(templateVars).length > 0) {
          const htmlContent = await config.htmlFile.text();
          
          // Extract email parts
          const emailParts = testEmail.split('@');
          const emailName = templateVars.name || (emailParts.length > 0 ? emailParts[0] : '');
          const domain = templateVars.domain || (emailParts.length > 1 ? emailParts[1] : '');
          
          // Current time for {{time}} placeholder
          const currentTime = new Date().toLocaleString();
          
          // Replace template variables
          let processedHtml = htmlContent
            // Single braces format
            .replace(/{email}/g, testEmail)
            .replace(/{emailname}/g, emailName)
            .replace(/{domain}/g, domain)
            .replace(/{time}/g, currentTime)
            .replace(/{recipient_email}/g, testEmail)
            
            // Double braces format (used in Python script)
            .replace(/{{recipient_email}}/g, testEmail)
            .replace(/{{domain}}/g, domain)
            .replace(/{{emailname}}/g, emailName)
            .replace(/{{time}}/g, currentTime);
          
          // Create a new file blob with the processed content
          const processedFile = new File([processedHtml], config.htmlFile.name, {
            type: config.htmlFile.type
          });
          
          formData.append('htmlFile', processedFile);
          
          // Send template variable information to the server
          formData.append('usedTemplateVars', 'true');
          formData.append('templateVarEmail', testEmail);
          formData.append('templateVarName', emailName);
          formData.append('templateVarDomain', domain);
        } else {
          // Just append the original file
          formData.append('htmlFile', config.htmlFile);
        }
      } catch (error) {
        console.error('Error processing HTML template:', error);
        // If processing fails, use the original file
        formData.append('htmlFile', config.htmlFile);
      }
    }
    
    if (config.subjectsFile) formData.append('subjectsFile', config.subjectsFile);
    
    // Append other configuration values
    formData.append('testEmail', testEmail);
    formData.append('fromName', config.fromName);
    formData.append('sendMethod', config.sendMethod);
    
    // Append API key if using API method
    if (config.sendMethod === 'API') {
      formData.append('apiKey', config.apiKey);
    }
    
    // Append SMTP settings if needed
    if (config.sendMethod === 'SMTP') {
      formData.append('smtpMode', config.smtpMode);
      
      // Add SMTP credentials file if provided
      if (config.smtpCredentialsFile) {
        formData.append('smtpCredentialsFile', config.smtpCredentialsFile);
        formData.append('rotateSmtp', config.rotateSmtp.toString());
      } else {
        // Use normal SMTP settings
        formData.append('smtpHost', config.smtpHost);
        formData.append('smtpPort', config.smtpPort.toString());
        formData.append('smtpUsername', config.smtpUsername);
        formData.append('smtpPassword', config.smtpPassword);
      }
    }
    
    // Send the request
    const response = await fetch('/api/email/test', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || `Error: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Test email sent successfully'
    };
    
  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Start an email campaign with the provided configuration
 */
export async function startEmailCampaign(
  config: EmailConfiguration
): Promise<EmailResponse> {
  try {
    // Create FormData object for file uploads
    const formData = new FormData();
    
    // Append files if they exist
    if (config.htmlFile) formData.append('htmlFile', config.htmlFile);
    if (config.subjectsFile) formData.append('subjectsFile', config.subjectsFile);
    if (config.recipientsFile) formData.append('recipientsFile', config.recipientsFile);
    
    // Append other configuration values
    formData.append('fromName', config.fromName);
    formData.append('sendMethod', config.sendMethod);
    
    // Append API key if using API method
    if (config.sendMethod === 'API') {
      formData.append('apiKey', config.apiKey);
    }
    
    // Append SMTP settings if needed
    if (config.sendMethod === 'SMTP') {
      formData.append('smtpMode', config.smtpMode);
      
      // Add SMTP credentials file if provided
      if (config.smtpCredentialsFile) {
        formData.append('smtpCredentialsFile', config.smtpCredentialsFile);
        formData.append('rotateSmtp', config.rotateSmtp.toString());
      } else {
        // Use normal SMTP settings
        formData.append('smtpHost', config.smtpHost);
        formData.append('smtpPort', config.smtpPort.toString());
        formData.append('smtpUsername', config.smtpUsername);
        formData.append('smtpPassword', config.smtpPassword);
      }
    }
    
    // Append tracking options
    formData.append('sendSpeed', config.sendSpeed.toString());
    formData.append('trackOpens', config.trackOpens.toString());
    formData.append('trackLinks', config.trackLinks.toString());
    formData.append('trackReplies', config.trackReplies.toString());
    
    // Send the request
    const response = await fetch('/api/email/send', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || `Error: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Email campaign started successfully',
      campaignId: data.campaignId
    };
    
  } catch (error) {
    console.error('Error starting email campaign:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}