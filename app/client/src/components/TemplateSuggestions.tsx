import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, CheckCircle, Code, Copy, Eye, RefreshCw, Sparkles } from 'lucide-react';
import { 
  TemplateCategory, 
  getSuggestedTemplates, 
  SuggestedTemplate 
} from '@/lib/templateRecommendationService';
import { getSmartTemplateSuggestions, SmartTemplateSuggestion } from '@/lib/smartTemplateService';

interface TemplateSuggestionsProps {
  currentHtml: string;
  onSelectTemplate: (template: SuggestedTemplate) => void;
}

export default function TemplateSuggestions({ 
  currentHtml, 
  onSelectTemplate 
}: TemplateSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SuggestedTemplate | null>(null);
  const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview');
  
  // Load suggested templates when component mounts or HTML changes
  useEffect(() => {
    if (!currentHtml) return;
    loadSuggestions();
  }, [currentHtml]);
  
  // Load suggested templates based on current HTML
  const loadSuggestions = async () => {
    try {
      setLoading(true);
      
      // Try to get AI-powered suggestions first
      const response = await getSmartTemplateSuggestions({
        htmlContent: currentHtml,
        purpose: 'email marketing'
      });
      
      if (response.success && response.suggestions.length > 0) {
        // Convert AI suggestions to the format our component expects
        const aiSuggestions: SuggestedTemplate[] = response.suggestions.map(suggestion => ({
          id: suggestion.id,
          name: suggestion.name,
          description: suggestion.description,
          category: suggestion.category as TemplateCategory,
          similarityScore: suggestion.similarityScore,
          htmlContent: suggestion.htmlContent
        }));
        
        setSuggestions(aiSuggestions);
      } else {
        // Fallback to local suggestions if the API fails
        const localSuggestions = getSuggestedTemplates(currentHtml);
        setSuggestions(localSuggestions);
      }
    } catch (error) {
      console.error('Error loading template suggestions:', error);
      // Fallback to local suggestions on error
      const localSuggestions = getSuggestedTemplates(currentHtml);
      setSuggestions(localSuggestions);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle template selection
  const handleSelectTemplate = (template: SuggestedTemplate) => {
    setSelectedTemplate(template);
    setPreviewTab('preview');
  };
  
  // Handle confirming template selection
  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };
  
  // Calculate category display name
  const getCategoryName = (category: TemplateCategory): string => {
    switch (category) {
      case TemplateCategory.Newsletter:
        return 'Newsletter';
      case TemplateCategory.Promotional:
        return 'Promotional';
      case TemplateCategory.Transactional:
        return 'Transactional';
      case TemplateCategory.Announcement:
        return 'Announcement';
      case TemplateCategory.Welcome:
        return 'Welcome';
      default:
        return category;
    }
  };
  
  // Calculate variant based on similarity score
  const getSimilarityVariant = (score: number) => {
    if (score >= 0.7) return 'default';
    if (score >= 0.4) return 'secondary';
    return 'outline';
  };
  
  // Format similarity score
  const formatSimilarityScore = (score: number) => {
    return Math.round(score * 100);
  };
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-md">
          <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
          Template Recommendations
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              Analyzing your template...
            </span>
          </div>
        ) : selectedTemplate ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">{selectedTemplate.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(null)}>
                Back to List
              </Button>
            </div>
            
            <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as 'preview' | 'code')} className="w-full">
              <div className="border-b px-2">
                <TabsList className="bg-transparent h-10">
                  <TabsTrigger value="preview" className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    HTML
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="preview" className="overflow-auto max-h-[400px] border rounded-md mt-2">
                <div 
                  className="p-4" 
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }}
                />
              </TabsContent>
              
              <TabsContent value="code" className="overflow-auto max-h-[400px] bg-muted/5 border rounded-md mt-2">
                <pre className="p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                  {selectedTemplate.htmlContent}
                </pre>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 flex justify-end">
              <Button onClick={handleConfirmSelection} className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </div>
          </div>
        ) : suggestions.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.slice(0, 4).map((template) => (
                <Card 
                  key={template.id}
                  className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="p-3 border-b flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                    </div>
                    <Badge 
                      variant={getSimilarityVariant(template.similarityScore)}
                      className="text-xs whitespace-nowrap"
                    >
                      {formatSimilarityScore(template.similarityScore)}% match
                    </Badge>
                  </div>
                  
                  <div className="h-32 overflow-hidden relative">
                    <div 
                      dangerouslySetInnerHTML={{ __html: template.htmlContent }}
                      className="scale-50 origin-top-left w-[200%] h-[200%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 flex items-end justify-center pb-2">
                      <Badge className="text-xs">
                        {getCategoryName(template.category)}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {suggestions.length > 4 && (
              <div className="mt-3 text-center">
                <Button 
                  variant="link" 
                  onClick={() => loadSuggestions()}
                  className="text-xs"
                >
                  View more suggestions 
                  <span className="text-muted-foreground ml-1">({suggestions.length - 4} more)</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-500 mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-muted-foreground text-sm">
              No template suggestions available. Upload or enter an HTML template for recommendations.
            </p>
          </div>
        )}
      </CardContent>
      
      {!selectedTemplate && suggestions.length > 0 && (
        <CardFooter className="bg-muted/5 justify-center p-3 border-t">
          <Button 
            variant="outline" 
            onClick={loadSuggestions}
            className="text-xs flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Recommendations
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}