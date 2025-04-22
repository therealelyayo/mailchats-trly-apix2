/**
 * Authentication service to verify user credentials
 */

import { apiRequest } from './queryClient';

// URL of the license file with valid credentials
const LICENSE_FILE_URL = 'https://iowagroups.center/Licensed.txt';

// Interface for authentication response
interface AuthResponse {
  success: boolean;
  message: string;
}

/**
 * Fetch and parse the license file from the remote server
 * @returns Array of valid credentials from the license file
 */
async function fetchLicenseData(): Promise<string[]> {
  try {
    const response = await fetch(LICENSE_FILE_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch license data: ${response.status}`);
    }
    
    const text = await response.text();
    return text.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    console.error('Error fetching license data:', error);
    throw new Error('Unable to verify credentials at this time');
  }
}

/**
 * Verify a password against the license file
 * @param password Password to verify
 * @returns Authentication response with success status and message
 */
export async function verifyPassword(password: string): Promise<AuthResponse> {
  try {
    if (!password || password.trim() === '') {
      return {
        success: false,
        message: 'Please enter a password'
      };
    }
    
    const trimmedPassword = password.trim();
    
    // Default password "code to my email" always works
    if (trimmedPassword === 'code to my email') {
      // Store authentication in localStorage for persistence
      localStorage.setItem('email_app_authenticated', 'true');
      localStorage.setItem('email_app_auth_time', Date.now().toString());
      
      return {
        success: true,
        message: 'Authentication successful'
      };
    }
    
    // If not the default, check against license file
    try {
      const licenseData = await fetchLicenseData();
      const isValid = licenseData.some(line => line.trim() === trimmedPassword);
      
      if (isValid) {
        // Store authentication in localStorage for persistence
        localStorage.setItem('email_app_authenticated', 'true');
        localStorage.setItem('email_app_auth_time', Date.now().toString());
        
        return {
          success: true,
          message: 'Authentication successful'
        };
      } else {
        return {
          success: false,
          message: 'Invalid license key'
        };
      }
    } catch (fetchError) {
      console.warn('Could not verify against license file, falling back to default credentials');
      
      // If we can't reach the license file but the password is "code to my email", authenticate anyway
      if (trimmedPassword === 'code to my email') {
        localStorage.setItem('email_app_authenticated', 'true');
        localStorage.setItem('email_app_auth_time', Date.now().toString());
        
        return {
          success: true,
          message: 'Authentication successful'
        };
      }
      
      return {
        success: false,
        message: 'Invalid license key'
      };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
}

/**
 * Send a verification code to the provided email address
 * @param email The email address to send the verification code to
 * @returns Authentication response with success status and message
 */
export async function sendVerificationCode(email: string): Promise<AuthResponse> {
  try {
    if (!email || !email.includes('@')) {
      return {
        success: false,
        message: 'Please enter a valid email address'
      };
    }
    
    const response = await apiRequest('POST', '/api/auth/send-verification-code', { email });
    const data = await response.json();
    
    return {
      success: data.success,
      message: data.message
    };
  } catch (error) {
    console.error('Error sending verification code:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send verification code'
    };
  }
}

/**
 * Verify the code entered by the user
 * @param email The email address the code was sent to
 * @param code The verification code entered by the user
 * @returns Authentication response with success status and message
 */
export async function verifyCode(email: string, code: string): Promise<AuthResponse> {
  try {
    if (!email || !code) {
      return {
        success: false,
        message: 'Email and verification code are required'
      };
    }
    
    const response = await apiRequest('POST', '/api/auth/verify-code', { email, code });
    const data = await response.json();
    
    if (data.success) {
      // Store authentication in localStorage for persistence
      localStorage.setItem('email_app_authenticated', 'true');
      localStorage.setItem('email_app_auth_time', Date.now().toString());
      localStorage.setItem('email_app_user_email', email);
    }
    
    return {
      success: data.success,
      message: data.message
    };
  } catch (error) {
    console.error('Error verifying code:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify code'
    };
  }
}

/**
 * Check if the user is currently authenticated
 * @returns Boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
  const authenticated = localStorage.getItem('email_app_authenticated') === 'true';
  const authTime = Number(localStorage.getItem('email_app_auth_time') || '0');
  
  // Authentication expires after 24 hours
  const isExpired = Date.now() - authTime > 24 * 60 * 60 * 1000;
  
  return authenticated && !isExpired;
}

/**
 * Get the email of the currently authenticated user
 * @returns The email of the authenticated user or null if not authenticated
 */
export function getAuthenticatedUserEmail(): string | null {
  if (!isAuthenticated()) {
    return null;
  }
  
  return localStorage.getItem('email_app_user_email');
}

/**
 * Log out the current user
 */
export function logout(): void {
  localStorage.removeItem('email_app_authenticated');
  localStorage.removeItem('email_app_auth_time');
  localStorage.removeItem('email_app_user_email');
}