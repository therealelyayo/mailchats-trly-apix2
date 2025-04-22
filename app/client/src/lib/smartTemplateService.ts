import { apiRequest } from "./queryClient";

// Define types for the Smart Template Engine
export interface SmartTemplateRecommendation {
  id: string;
  type: 'improvement' | 'warning' | 'suggestion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  htmlSnippet?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface SmartTemplateSuggestion {
  id: string;
  name: string;
  description: string;
  category: string;
  similarityScore: number;
  htmlContent: string;
  matchedFeatures: string[];
  idealFor: string[];
  improvementAreas: string[];
}

/**
 * Interface for template analysis request
 */
interface TemplateAnalysisRequest {
  htmlContent: string;
  purpose?: string;
  industry?: string;
  audience?: string;
}

/**
 * Interface for template analysis response
 */
interface TemplateAnalysisResponse {
  success: boolean;
  recommendations: SmartTemplateRecommendation[];
  error?: string;
}

/**
 * Interface for template suggestions response
 */
interface TemplateSuggestionsResponse {
  success: boolean;
  suggestions: SmartTemplateSuggestion[];
  error?: string;
}

/**
 * Get smart recommendations for a template using DeepSeek AI
 */
export async function getSmartRecommendations(
  request: TemplateAnalysisRequest
): Promise<TemplateAnalysisResponse> {
  try {
    const response = await apiRequest('POST', '/api/template/analyze', request);
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        recommendations: [],
        error: errorData.error || 'Failed to analyze template'
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting smart recommendations:', error);
    return {
      success: false,
      recommendations: [],
      error: error instanceof Error ? error.message : 'An error occurred'
    };
  }
}

/**
 * Get smart template suggestions using DeepSeek AI
 */
export async function getSmartTemplateSuggestions(
  request: TemplateAnalysisRequest
): Promise<TemplateSuggestionsResponse> {
  try {
    const response = await apiRequest('POST', '/api/template/suggestions', request);
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        suggestions: [],
        error: errorData.error || 'Failed to get template suggestions'
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting smart template suggestions:', error);
    return {
      success: false,
      suggestions: [],
      error: error instanceof Error ? error.message : 'An error occurred'
    };
  }
}