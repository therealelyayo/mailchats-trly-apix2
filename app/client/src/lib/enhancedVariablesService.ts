import { apiRequest } from "./queryClient";

/**
 * Interface for personalization variable
 */
export interface PersonalizationVariable {
  name: string;
  description: string;
  example: string;
  category: 'basic' | 'contact' | 'date' | 'advanced' | 'custom';
}

/**
 * Fetch available personalization variables from the server
 */
export async function getAvailableVariables(): Promise<PersonalizationVariable[]> {
  try {
    const response = await apiRequest('GET', '/api/email/personalization-variables');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching personalization variables:', error);
    return [];
  }
}

/**
 * Fetch HTML documentation for personalization variables
 */
export async function getVariablesDocumentation(): Promise<string> {
  try {
    const response = await apiRequest('GET', '/api/email/personalization-documentation');
    const data = await response.json();
    return data.documentation || '';
  } catch (error) {
    console.error('Error fetching personalization documentation:', error);
    return '';
  }
}

/**
 * Parse a recipient line to extract variables
 */
export async function parseRecipientLine(recipientLine: string): Promise<Record<string, string>> {
  try {
    const response = await apiRequest('POST', '/api/email/parse-recipient', { recipientLine });
    const data = await response.json();
    return data.variables || {};
  } catch (error) {
    console.error('Error parsing recipient line:', error);
    return {};
  }
}

/**
 * Apply enhanced mail merge to a template
 */
export async function applyEnhancedMailMerge(template: string, recipientLine: string): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/email/apply-enhanced-merge', {
      template,
      recipientLine
    });
    const data = await response.json();
    return data.result || template;
  } catch (error) {
    console.error('Error applying enhanced mail merge:', error);
    return template;
  }
}

/**
 * Interface for enhanced email configuration
 */
export interface EnhancedEmailConfig {
  htmlFile: File | null;
  subjectsFile?: File | null;
  recipientsFile?: File | null;
  testEmail?: string;
  fromName: string;
  sendMethod: "API" | "SMTP";
  apiKey?: string;
  smtpMode?: "localhost" | "smtp";
  smtpHost?: string;
  smtpPort?: string;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpCredentialsFile?: File | null;
  rotateSmtp?: boolean;
  sendSpeed?: number;
  trackOpens?: boolean;
  trackLinks?: boolean;
  trackReplies?: boolean;
  useEnhancedVariables?: boolean;
  enhancedRecipientFormat?: boolean;
}

/**
 * Format recipient line for enhanced personalization
 */
export function formatEnhancedRecipientLine(
  email: string,
  customFields: Record<string, string> = {}
): string {
  let result = email;
  
  // Add custom fields if any
  const customEntries = Object.entries(customFields);
  if (customEntries.length > 0) {
    customEntries.forEach(([key, value]) => {
      if (value.trim()) {
        result += `|${key}=${value}`;
      }
    });
  }
  
  return result;
}

/**
 * Extract variables from a template
 */
export function extractVariablesFromTemplate(template: string): string[] {
  const variables: Set<string> = new Set();
  
  // Match single braces format: {variable}
  const singleBracePattern = /{([^{}]+)}/g;
  let match;
  
  while ((match = singleBracePattern.exec(template)) !== null) {
    variables.add(match[1]);
  }
  
  // Match double braces format: {{variable}}
  const doubleBracePattern = /{{([^{}]+)}}/g;
  while ((match = doubleBracePattern.exec(template)) !== null) {
    variables.add(match[1]);
  }
  
  return Array.from(variables).sort();
}

/**
 * Generate a sample enhanced recipient with all fields
 */
export function generateSampleRecipient(): string {
  return "john.doe@example.com|firstname=John|lastname=Doe|company=Example Inc|position=CEO|industry=Technology|phone=123-456-7890|city=New York|state=NY|country=USA";
}

/**
 * Generate example template with all variables
 */
export function generateExampleTemplate(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Email Template with All Variables</title>
</head>
<body>
  <h1>Hello, {firstname} {lastname}!</h1>
  <p>We hope this email finds you well.</p>
  
  <h2>Your Information</h2>
  <ul>
    <li>Email: {email}</li>
    <li>Username: {emailname}</li>
    <li>Domain: {domain}</li>
    <li>Company: {company}</li>
    <li>Position: {position}</li>
    <li>Industry: {industry}</li>
    <li>Phone: {phone}</li>
    <li>Location: {city}, {state}, {country}</li>
  </ul>
  
  <h2>Date Information</h2>
  <p>This email was sent on {day}, {month} {date}, {year} at {time}.</p>
  
  <h2>Advanced Information</h2>
  <p>Your unique identifier is {random_number}.</p>
  
  <hr>
  <p>If you wish to unsubscribe, <a href="{unsubscribe}">click here</a>.</p>
</body>
</html>`;
}