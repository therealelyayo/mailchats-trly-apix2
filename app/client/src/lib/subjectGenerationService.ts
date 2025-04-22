import { apiRequest } from './queryClient';

export interface SubjectGenerationOptions {
  emailContent: string;
  tone?: 'professional' | 'casual' | 'persuasive' | 'urgent' | 'friendly';
  industry?: string;
  targetAudience?: string;
  maxLength?: number;
  count?: number;
}

export interface SubjectGenerationResponse {
  success: boolean;
  subjects: string[];
  error?: string;
}

/**
 * Generate email subject lines using the AI service
 */
export async function generateSubjectLines(options: SubjectGenerationOptions): Promise<SubjectGenerationResponse> {
  try {
    const response = await apiRequest('POST', '/api/email/generate-subjects', options);
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        subjects: [],
        error: errorData.message || errorData.error || 'Failed to generate subject lines'
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating subject lines:', error);
    return {
      success: false,
      subjects: [],
      error: error instanceof Error ? error.message : 'Unknown error generating subject lines'
    };
  }
}