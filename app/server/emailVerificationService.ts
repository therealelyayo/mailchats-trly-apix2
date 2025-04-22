import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { log } from './vite';

// Store verification codes in memory
interface VerificationCode {
  email: string;
  code: string;
  expiresAt: number;
}

const verificationCodes: VerificationCode[] = [];

// Generate a random 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create an SMTP transporter using the provided credentials
function createSMTPTransporter() {
  return nodemailer.createTransport({
    host: 'mail.westbrookfloor.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: 'io@westbrookfloor.com',
      pass: 'Chi@3454@@ch',
    },
  });
}

// Send verification code to the user's email
export async function sendVerificationCode(req: Request, res: Response) {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  try {
    // Generate a new verification code
    const code = generateVerificationCode();
    
    // Set expiration time (10 minutes)
    const expiresAt = Date.now() + 10 * 60 * 1000;
    
    // Create SMTP transporter with provided credentials
    const transporter = createSMTPTransporter();
    
    // Create the email content
    const mailOptions = {
      from: '"MailChats.com" <io@westbrookfloor.com>',
      to: email,
      subject: 'MailChats - Your Email Verification Code',
      text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nVisit mailchats.com for any questions or support.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 20px 0; text-align: center; background-color: #4a6cf7; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MailChats.com</h1>
            <p style="color: white; margin: 5px 0 0 0; font-size: 16px;">Powerful Email Marketing Platform</p>
          </div>
          <div style="background-color: #ffffff; padding: 30px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
            <h2 style="color: #333; text-align: center; margin-top: 0;">Welcome to MailChats</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
              Please use the verification code below to complete your login:
            </p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4a6cf7;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #4a5568; background: #f0f4ff; padding: 10px; border-radius: 4px; border: 1px dashed #4a6cf7;">${code}</div>
              <p style="margin-bottom: 0; color: #666;">This code will expire in 10 minutes.</p>
            </div>
            <p style="color: #555; font-size: 15px; line-height: 1.5; text-align: center;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          <div style="background-color: #f5f7ff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0;">
            <p style="margin: 0 0 10px 0; color: #666;">
              Need help? Contact our support team:
            </p>
            <a href="mailto:support@mailchats.com" style="color: #4a6cf7; text-decoration: none;">support@mailchats.com</a>
            <div style="margin-top: 15px;">
              <a href="https://mailchats.com" style="display: inline-block; margin: 0 5px; color: #4a6cf7; text-decoration: none;">Website</a> |
              <a href="https://mailchats.com/pricing" style="display: inline-block; margin: 0 5px; color: #4a6cf7; text-decoration: none;">Pricing</a> |
              <a href="https://mailchats.com/help" style="display: inline-block; margin: 0 5px; color: #4a6cf7; text-decoration: none;">Help Center</a>
            </div>
          </div>
          <p style="font-size: 12px; color: #718096; margin-top: 20px; text-align: center;">
            © ${new Date().getFullYear()} MailChats.com. All rights reserved.
          </p>
        </div>
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    log(`Verification code sent to ${email}: ${code}`, 'email-verification');
    
    // Store the verification code
    // First remove any existing codes for this email
    const existingIndex = verificationCodes.findIndex(vc => vc.email === email);
    if (existingIndex !== -1) {
      verificationCodes.splice(existingIndex, 1);
    }
    
    verificationCodes.push({
      email,
      code,
      expiresAt
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Verification code sent successfully',
    });
  } catch (error) {
    log(`Error sending verification code: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code'
    });
  }
}

// Verify the code entered by the user
export function verifyCode(req: Request, res: Response) {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: 'Email and verification code are required'
    });
  }
  
  // Find the verification code
  const verificationIndex = verificationCodes.findIndex(
    vc => vc.email === email && vc.code === code && vc.expiresAt > Date.now()
  );
  
  if (verificationIndex === -1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification code'
    });
  }
  
  // Remove the used verification code
  verificationCodes.splice(verificationIndex, 1);
  
  log(`Verification successful for ${email}`, 'email-verification');
  
  return res.status(200).json({
    success: true,
    message: 'Verification successful'
  });
}