import axios from 'axios';

interface SubjectGenerationOptions {
  emailContent: string;
  tone?: 'professional' | 'casual' | 'persuasive' | 'urgent' | 'friendly';
  industry?: string;
  targetAudience?: string;
  maxLength?: number;
  count?: number;
}

interface SubjectGenerationResponse {
  success: boolean;
  subjects: string[];
  error?: string;
}

/**
 * Generate email subject lines using DeepSeek AI
 */
export async function generateSubjectLines(options: SubjectGenerationOptions): Promise<SubjectGenerationResponse> {
  try {
    const {
      emailContent,
      tone = 'professional',
      industry = '',
      targetAudience = '',
      maxLength = 70,
      count = 5
    } = options;

    // Sanitize and truncate email content if too long
    const truncatedContent = emailContent.length > 4000 
      ? emailContent.substring(0, 4000) + "..."
      : emailContent;

    // Build the prompt for DeepSeek AI
    const prompt = buildSubjectLinePrompt(
      truncatedContent, 
      tone, 
      industry, 
      targetAudience, 
      maxLength,
      count
    );

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY environment variable is not set");
    }

    // Call DeepSeek API
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: "deepseek-chat", // Using DeepSeek's chat model
        messages: [
          {
            role: "system",
            content: "You are an expert email marketing specialist who creates highly effective subject lines."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    // Parse the response
    const content = response.data.choices[0].message.content;
    let subjects: string[] = [];
    
    try {
      // Try to parse as JSON
      const jsonResponse = JSON.parse(content);
      subjects = Array.isArray(jsonResponse.subjects) ? jsonResponse.subjects : [];
    } catch (error) {
      // If not JSON, extract subject lines from text
      subjects = extractSubjectLinesFromText(content, count);
    }

    return {
      success: true,
      subjects: subjects.slice(0, count) // Ensure we don't return more than requested
    };
  } catch (error) {
    console.error('Error generating subject lines:', error);
    return {
      success: false,
      subjects: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Extract subject lines from text response
 */
function extractSubjectLinesFromText(text: string, count: number): string[] {
  // Try to identify numbered or bulleted subject lines
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const subjectLines: string[] = [];
  
  for (const line of lines) {
    // Remove numbers, bullets, quotes, etc.
    const cleanLine = line.replace(/^[•\-*#0-9.\s"']+/, '').trim();
    if (cleanLine && !cleanLine.toLowerCase().includes('subject line') && cleanLine.length <= 100) {
      subjectLines.push(cleanLine);
    }
    
    if (subjectLines.length >= count) break;
  }
  
  return subjectLines;
}

/**
 * Build the prompt for generating subject lines
 */
function buildSubjectLinePrompt(
  emailContent: string, 
  tone: string, 
  industry: string, 
  targetAudience: string, 
  maxLength: number,
  count: number
): string {
  let prompt = `Generate ${count} compelling email subject lines for the following email content. 
Each subject line should be no more than ${maxLength} characters.`;

  if (tone) {
    prompt += `\nThe tone should be ${tone}.`;
  }
  
  if (industry) {
    prompt += `\nThis is for the ${industry} industry.`;
  }
  
  if (targetAudience) {
    prompt += `\nThe target audience is ${targetAudience}.`;
  }
  
  prompt += `\n\nPlease respond with a JSON object containing an array of subject lines in the format:
{
  "subjects": [
    "Subject line 1",
    "Subject line 2",
    ...
  ]
}

Email content:
${emailContent}`;

  return prompt;
}