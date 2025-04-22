import { Request, Response } from 'express';
import axios from 'axios';

/**
 * Interface for the template analysis request
 */
interface TemplateAnalysisRequest {
  htmlContent: string;
  purpose?: string;
  industry?: string;
  audience?: string;
}

/**
 * Interface for template recommendation
 */
export interface SmartTemplateRecommendation {
  id: string;
  type: 'improvement' | 'warning' | 'suggestion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  htmlSnippet?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

/**
 * Interface for template suggestion
 */
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
 * Analyze template using DeepSeek AI
 * This performs an in-depth analysis of the template structure, content,
 * and design elements to provide intelligent recommendations
 */
export async function analyzeTemplateWithAI(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { htmlContent, purpose, industry, audience } = req.body as TemplateAnalysisRequest;
    
    if (!htmlContent) {
      res.status(400).json({
        success: false,
        error: 'HTML content is required'
      });
      return;
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      res.status(500).json({
        success: false,
        error: 'DeepSeek API key is not configured'
      });
      return;
    }

    // Analyze HTML content with DeepSeek AI
    const recommendations = await getTemplateRecommendations(
      htmlContent,
      purpose || '',
      industry || '',
      audience || ''
    );

    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Template analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during template analysis'
    });
  }
}

/**
 * Get template suggestions using DeepSeek AI
 * This finds similar templates and provides personalized suggestions
 */
export async function getSmartTemplateSuggestions(
  req: Request, 
  res: Response
): Promise<void> {
  try {
    const { htmlContent, purpose, industry, audience } = req.body as TemplateAnalysisRequest;
    
    if (!htmlContent) {
      res.status(400).json({
        success: false,
        error: 'HTML content is required'
      });
      return;
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      res.status(500).json({
        success: false,
        error: 'DeepSeek API key is not configured'
      });
      return;
    }

    // Get suggestions from DeepSeek AI
    const suggestions = await getTemplateSuggestions(
      htmlContent,
      purpose || '',
      industry || '',
      audience || ''
    );

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Template suggestions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while getting template suggestions'
    });
  }
}

/**
 * Use DeepSeek AI to get intelligent template recommendations
 */
async function getTemplateRecommendations(
  htmlContent: string,
  purpose: string,
  industry: string,
  audience: string
): Promise<SmartTemplateRecommendation[]> {
  try {
    // Prepare the prompt for DeepSeek
    const prompt = buildRecommendationsPrompt(htmlContent, purpose, industry, audience);
    
    // Call DeepSeek API
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketing specialist with deep knowledge of HTML email template design, accessibility, deliverability, and best practices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    const result = response.data.choices[0].message.content;
    return JSON.parse(result).recommendations || [];
  } catch (error: any) {
    console.error('DeepSeek API error (recommendations):', error);
    
    // Fallback to local analysis
    return performLocalAnalysis(htmlContent);
  }
}

/**
 * Use DeepSeek AI to get intelligent template suggestions
 */
async function getTemplateSuggestions(
  htmlContent: string,
  purpose: string,
  industry: string,
  audience: string
): Promise<SmartTemplateSuggestion[]> {
  try {
    // Prepare the prompt for DeepSeek
    const prompt = buildSuggestionsPrompt(htmlContent, purpose, industry, audience);
    
    // Call DeepSeek API
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketing specialist with deep knowledge of HTML email template design, accessibility, deliverability, and best practices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    const result = response.data.choices[0].message.content;
    return JSON.parse(result).suggestions || [];
  } catch (error: any) {
    console.error('DeepSeek API error (suggestions):', error);
    
    // Fallback to local analysis
    return performLocalSuggestions(htmlContent);
  }
}

/**
 * Build the prompt for recommendations
 */
function buildRecommendationsPrompt(
  htmlContent: string,
  purpose: string,
  industry: string,
  audience: string
): string {
  return `
I need you to analyze this HTML email template and provide detailed recommendations for improvements.

${purpose ? `The purpose of this email is: ${purpose}` : ''}
${industry ? `Industry: ${industry}` : ''}
${audience ? `Target audience: ${audience}` : ''}

Please provide a comprehensive analysis focusing on:
1. Design issues, accessibility problems, and mobile responsiveness
2. Email deliverability concerns (elements that might trigger spam filters)
3. Content improvements (clarity, call-to-action effectiveness)
4. Technical HTML issues
5. Personalization opportunities

For each recommendation, provide:
- A clear title describing the issue
- A detailed description explaining why it matters
- A priority level (high, medium, low)
- A suggested HTML snippet to fix the issue where applicable
- The sentiment (positive for enhancements, negative for issues, neutral for informational)

Please format your response as a JSON object with an array of recommendations:
{
  "recommendations": [
    {
      "id": "unique-id",
      "type": "improvement|warning|suggestion",
      "title": "Issue title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "htmlSnippet": "HTML code to fix issue (if applicable)",
      "sentiment": "positive|negative|neutral"
    }
  ]
}

Here is the HTML template to analyze:
\`\`\`html
${htmlContent}
\`\`\`
`;
}

/**
 * Build the prompt for template suggestions
 */
function buildSuggestionsPrompt(
  htmlContent: string,
  purpose: string,
  industry: string,
  audience: string
): string {
  return `
I need you to analyze this HTML email template and suggest similar but improved templates.

${purpose ? `The purpose of this email is: ${purpose}` : ''}
${industry ? `Industry: ${industry}` : ''}
${audience ? `Target audience: ${audience}` : ''}

Please provide 3-5 template suggestions that would be better suited for this purpose,
considering best practices for email design, accessibility, and deliverability.

For each suggestion, include:
- A unique ID and meaningful name
- A short description
- The category it belongs to (newsletter, promotional, transactional, etc.)
- A similarity score from 0.0 to 1.0 showing how similar it is to the original
- A list of matched features from the original template
- Audience segments this template would be ideal for
- Areas for further improvement

Generate complete HTML content for each suggestion that demonstrates best practices.
The templates should be fully functional and ready to use.

Please format your response as a JSON object with an array of suggestions:
{
  "suggestions": [
    {
      "id": "unique-id",
      "name": "Template Name",
      "description": "Template description",
      "category": "newsletter|promotional|transactional|announcement|welcome",
      "similarityScore": 0.85,
      "htmlContent": "Complete HTML for the template",
      "matchedFeatures": ["feature1", "feature2"],
      "idealFor": ["audience1", "audience2"],
      "improvementAreas": ["area1", "area2"]
    }
  ]
}

Here is the HTML template to analyze:
\`\`\`html
${htmlContent}
\`\`\`
`;
}

/**
 * Fallback local analysis when AI API is not available
 */
function performLocalAnalysis(htmlContent: string): SmartTemplateRecommendation[] {
  const recommendations: SmartTemplateRecommendation[] = [];
  const lowercaseHtml = htmlContent.toLowerCase();
  
  // Check for missing alt text in images
  if (/<img[^>]+src="[^"]+"(?![^>]*alt=)[^>]*>/i.test(htmlContent)) {
    recommendations.push({
      id: 'missing-alt-text',
      type: 'warning',
      title: 'Missing alt text on images',
      description: 'Some images in your email are missing alt text. This can affect accessibility and may cause issues with some email clients.',
      priority: 'high',
      sentiment: 'negative',
      htmlSnippet: '<img src="image.jpg" alt="Descriptive text about the image">'
    });
  }
  
  // Check for responsive design
  if (!/<meta[^>]+viewport[^>]+>/i.test(htmlContent) && !htmlContent.includes('media query')) {
    recommendations.push({
      id: 'responsive-design',
      type: 'improvement',
      title: 'Enhance responsive design',
      description: 'Your email template might not display well on mobile devices. Adding responsive design elements will improve the user experience on all devices.',
      priority: 'high',
      sentiment: 'negative',
      htmlSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    });
  }
  
  // Check for personalization
  if (!/{{\w+}}/.test(htmlContent) && !/{(\w+)}/.test(htmlContent)) {
    recommendations.push({
      id: 'personalization',
      type: 'suggestion',
      title: 'Add personalization with mail merge',
      description: 'Personalized emails typically have higher engagement rates. Consider adding variables like {{emailname}} or {{first_name}} to personalize your content.',
      priority: 'medium',
      sentiment: 'neutral',
      htmlSnippet: '<h2>Hello {{emailname}},</h2>'
    });
  }
  
  // Check for unsubscribe link
  const hasUnsubscribe = lowercaseHtml.includes('unsubscribe') || 
                         lowercaseHtml.includes('opt out') || 
                         lowercaseHtml.includes('opt-out');
  if (!hasUnsubscribe) {
    recommendations.push({
      id: 'missing-unsubscribe',
      type: 'warning',
      title: 'Missing unsubscribe link',
      description: 'Your email should include an unsubscribe link to comply with anti-spam regulations like CAN-SPAM and GDPR.',
      priority: 'high',
      sentiment: 'negative',
      htmlSnippet: '<p style="font-size: 12px; color: #999;">If you no longer wish to receive these emails, you can <a href="#" style="color: #666;">unsubscribe here</a>.</p>'
    });
  }
  
  return recommendations;
}

/**
 * Fallback local suggestions when AI API is not available
 */
function performLocalSuggestions(htmlContent: string): SmartTemplateSuggestion[] {
  // Import sample templates from the recommendation service
  const { sampleTemplates, TemplateCategory } = require('../client/src/lib/templateRecommendationService');
  
  const lowercaseHtml = htmlContent.toLowerCase();
  
  // Determine template category
  let categoryScore = {
    [TemplateCategory.Newsletter]: 0,
    [TemplateCategory.Promotional]: 0,
    [TemplateCategory.Transactional]: 0,
    [TemplateCategory.Announcement]: 0,
    [TemplateCategory.Welcome]: 0,
  };
  
  // Check for newsletter indicators
  if (
    lowercaseHtml.includes('newsletter') || 
    lowercaseHtml.includes('update') || 
    lowercaseHtml.includes('monthly') || 
    lowercaseHtml.includes('weekly')
  ) {
    categoryScore[TemplateCategory.Newsletter] += 0.5;
  }
  
  // Check for promotional indicators
  if (
    lowercaseHtml.includes('sale') || 
    lowercaseHtml.includes('discount') || 
    lowercaseHtml.includes('offer') || 
    lowercaseHtml.includes('limited time')
  ) {
    categoryScore[TemplateCategory.Promotional] += 0.5;
  }
  
  // Check for transactional indicators
  if (
    lowercaseHtml.includes('order') || 
    lowercaseHtml.includes('transaction') || 
    lowercaseHtml.includes('receipt') || 
    lowercaseHtml.includes('invoice')
  ) {
    categoryScore[TemplateCategory.Transactional] += 0.5;
  }
  
  // Check for announcement indicators
  if (
    lowercaseHtml.includes('announcement') || 
    lowercaseHtml.includes('introducing') || 
    lowercaseHtml.includes('new feature') || 
    lowercaseHtml.includes('launching')
  ) {
    categoryScore[TemplateCategory.Announcement] += 0.5;
  }
  
  // Check for welcome indicators
  if (
    lowercaseHtml.includes('welcome') || 
    lowercaseHtml.includes('onboarding') || 
    lowercaseHtml.includes('getting started') || 
    lowercaseHtml.includes('thank you for joining')
  ) {
    categoryScore[TemplateCategory.Welcome] += 0.5;
  }
  
  return sampleTemplates
    .map((template: any) => {
      let score = categoryScore[template.category] || 0;
      
      // Add some randomization to create variance in similarity
      score += Math.random() * 0.3;
      
      // Ensure score is between 0 and 1
      score = Math.min(Math.max(score, 0.3), 0.95);
      
      // Enhanced suggestion with more details
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        similarityScore: score,
        htmlContent: template.htmlContent,
        matchedFeatures: [
          "Layout structure",
          "Color scheme",
          "Typography style",
          "Content sections"
        ],
        idealFor: getIdealAudienceForCategory(template.category),
        improvementAreas: ["Mobile responsiveness", "Personalization", "Call-to-action clarity"]
      };
    })
    .sort((a: any, b: any) => b.similarityScore - a.similarityScore)
    .slice(0, 5);  // Return top 5 matches
}

/**
 * Helper to determine ideal audience based on template category
 */
function getIdealAudienceForCategory(category: string): string[] {
  switch (category) {
    case 'newsletter':
      return ["Existing subscribers", "Regular customers", "Blog readers"];
    case 'promotional':
      return ["Potential customers", "Past purchasers", "Deal seekers"];
    case 'transactional':
      return ["Active customers", "Recent purchasers", "Account holders"];
    case 'announcement':
      return ["All customers", "Stakeholders", "Product users"];
    case 'welcome':
      return ["New subscribers", "New customers", "Trial users"];
    default:
      return ["General audience"];
  }
}