import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, ThumbsUp, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { getSmartRecommendations } from '@/lib/smartTemplateService';

interface TemplateRecommendationsProps {
  htmlContent: string;
  onApplySuggestion: (suggestion: string) => void;
}

// Recommendations engine for email templates
export default function TemplateRecommendations({ 
  htmlContent, 
  onApplySuggestion 
}: TemplateRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{
    id: string;
    type: 'improvement' | 'warning' | 'suggestion';
    title: string;
    description: string;
    fixAction?: string;
  }>>([]);

  // Analyze the template when HTML content changes
  useEffect(() => {
    if (!htmlContent) {
      setRecommendations([]);
      return;
    }

    analyzeTemplate(htmlContent);
  }, [htmlContent]);

  // This function analyzes the email template and provides recommendations
  const analyzeTemplate = async (html: string) => {
    try {
      setLoading(true);
      
      // Use AI-powered analysis for smarter recommendations
      const response = await getSmartRecommendations({
        htmlContent: html,
        purpose: 'email marketing',
      });
      
      if (response.success && response.recommendations.length > 0) {
        // Format recommendations from the AI service to match component expectations
        const aiRecommendations = response.recommendations.map(rec => ({
          id: rec.id,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          fixAction: rec.type === 'improvement' 
            ? 'Implement improvement' 
            : rec.type === 'warning' 
              ? 'Fix issue' 
              : 'Apply suggestion'
        }));
        
        setRecommendations(aiRecommendations);
      } else {
        // Fallback to local analysis if API fails
        const newRecommendations = [];
        const lowercaseHtml = html.toLowerCase();
        
        // Check for missing alt text in images
        if (/<img[^>]+src="[^"]+"(?![^>]*alt=)[^>]*>/i.test(html)) {
          newRecommendations.push({
            id: 'alt-text',
            type: 'warning' as const,
            title: 'Missing alt text on images',
            description: 'Some images in your email are missing alt text. This can affect accessibility and may cause issues with some email clients.',
            fixAction: 'Add alt="Description" to all image tags'
          });
        }
        
        // Check for responsive design
        if (!/<meta[^>]+viewport[^>]+>/i.test(html) && !html.includes('media query')) {
          newRecommendations.push({
            id: 'responsive',
            type: 'improvement' as const,
            title: 'Enhance responsive design',
            description: 'Your email template might not display well on mobile devices. Consider adding responsive design elements.',
            fixAction: 'Add responsive meta tags and media queries'
          });
        }
        
        // Check for mail merge variables
        if (!/{{\w+}}/.test(html) && !/{(\w+)}/.test(html)) {
          newRecommendations.push({
            id: 'mail-merge',
            type: 'suggestion' as const,
            title: 'Add personalization with mail merge',
            description: 'Use mail merge variables like {{emailname}} to personalize your emails for better engagement.',
            fixAction: 'Add mail merge variables'
          });
        }
        
        // Check for unsubscribe link
        const hasUnsubscribe = lowercaseHtml.includes('unsubscribe') || 
                              lowercaseHtml.includes('opt out') || 
                              lowercaseHtml.includes('opt-out');
        if (!hasUnsubscribe) {
          newRecommendations.push({
            id: 'unsubscribe',
            type: 'warning' as const,
            title: 'Missing unsubscribe link',
            description: 'Your email should include an unsubscribe link to comply with anti-spam regulations like CAN-SPAM and GDPR.',
            fixAction: 'Add unsubscribe link'
          });
        }
        
        // Check for call to action
        const hasCallToAction = lowercaseHtml.includes('click here') || 
                                lowercaseHtml.includes('sign up') || 
                                lowercaseHtml.includes('buy now') || 
                                lowercaseHtml.includes('learn more') ||
                                lowercaseHtml.includes('get started');
        if (!hasCallToAction) {
          newRecommendations.push({
            id: 'call-to-action',
            type: 'suggestion' as const,
            title: 'Add clear call to action',
            description: 'Your email may benefit from a clearer call to action to guide recipients on what to do next.',
            fixAction: 'Add call to action button'
          });
        }
        
        setRecommendations(newRecommendations);
      }
    } catch (error) {
      console.error('Error analyzing template:', error);
      // Show an error in recommendations
      setRecommendations([{
        id: 'error',
        type: 'warning' as const,
        title: 'Analysis Error',
        description: 'An error occurred while analyzing your template. Please try again later.',
        fixAction: 'Retry analysis'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh recommendations
  const handleRefresh = () => {
    analyzeTemplate(htmlContent);
  };

  if (!htmlContent) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
          Smart Template Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              Analyzing template...
            </span>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="border rounded-md p-3">
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {rec.type === 'improvement' && <ThumbsUp className="h-4 w-4 text-blue-500" />}
                    {rec.type === 'warning' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                    {rec.type === 'suggestion' && <Lightbulb className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm">{rec.title}</h3>
                      <Badge 
                        variant={
                          rec.type === 'warning' ? 'destructive' : 
                          rec.type === 'improvement' ? 'secondary' : 'outline'
                        }
                        className="text-xs px-1.5 py-0"
                      >
                        {rec.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                    {rec.fixAction && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-7 mt-1"
                        onClick={() => onApplySuggestion(rec.id)}
                      >
                        {rec.fixAction}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                className="flex items-center text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh analysis
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-500 mb-4">
              <ThumbsUp className="h-6 w-6" />
            </div>
            <p className="text-muted-foreground text-sm">
              No recommendations found. Your template looks great!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}