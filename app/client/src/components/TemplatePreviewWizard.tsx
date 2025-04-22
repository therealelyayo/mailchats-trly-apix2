import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import TemplateRecommendations from '@/components/TemplateRecommendations';
import TemplateSuggestions from '@/components/TemplateSuggestions';
import InteractivePreview from '@/components/InteractivePreview';
import VariableAnalysis from '@/components/VariableAnalysis';
import { FileWarning, MessageCircle, CheckCircle, Lightbulb, Mail, Wand2 } from 'lucide-react';
import { SuggestedTemplate } from '@/lib/templateRecommendationService';

interface TemplatePreviewWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTest: (updatedContent?: string) => void;
  fromName: string;
  htmlPreview: { html: string; subject: string } | null;
}

export default function TemplatePreviewWizard({
  isOpen,
  onClose,
  onSendTest,
  fromName,
  htmlPreview,
}: TemplatePreviewWizardProps) {
  const [activeTab, setActiveTab] = useState('preview');
  const [editedHtml, setEditedHtml] = useState<string | null>(null);
  
  // Handle selecting a template suggestion
  const handleSelectTemplate = (template: SuggestedTemplate) => {
    setEditedHtml(template.htmlContent);
    setActiveTab('preview');
  };
  
  // Handle applying a recommendation
  const handleApplySuggestion = (updatedHtml: string) => {
    setEditedHtml(updatedHtml);
    setActiveTab('preview');
  };
  
  // Send test email with the current HTML content
  const handleSendTest = () => {
    onSendTest(editedHtml !== null ? editedHtml : undefined);
  };
  
  // Update the edited HTML
  const handleApplyChanges = (updatedHtml: string) => {
    setEditedHtml(updatedHtml);
  };
  
  // The current HTML content to use
  const currentHtml = editedHtml !== null ? editedHtml : (htmlPreview?.html || '');
  
  // Check if the template has mail merge variables
  const hasMailMergeVariables = (html: string): boolean => {
    const singleBracePattern = /\{([^}]+)\}/;
    const doubleBracePattern = /\{\{([^}]+)\}\}/;
    return singleBracePattern.test(html) || doubleBracePattern.test(html);
  };
  
  return (
    <Dialog open={isOpen && !!htmlPreview} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Template Preview
            {htmlPreview && hasMailMergeVariables(htmlPreview.html) && (
              <Badge variant="outline" className="ml-2">
                Personalization Variables
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Preview and optimize your email template before sending
          </DialogDescription>
        </DialogHeader>
        
        <Tabs
          defaultValue="preview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mb-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Interactive Preview
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Template Suggestions
            </TabsTrigger>
            <TabsTrigger value="variables" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Variable Analysis
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="preview" className="m-0">
              {htmlPreview && (
                <InteractivePreview
                  htmlContent={currentHtml}
                  subject={htmlPreview.subject}
                  onApplyChanges={handleApplyChanges}
                />
              )}
            </TabsContent>
            
            <TabsContent value="recommendations" className="pt-4">
              {htmlPreview && (
                <TemplateRecommendations
                  htmlContent={currentHtml}
                  onApplySuggestion={handleApplySuggestion}
                />
              )}
            </TabsContent>
            
            <TabsContent value="templates" className="pt-4">
              {htmlPreview && (
                <TemplateSuggestions
                  currentHtml={currentHtml}
                  onSelectTemplate={handleSelectTemplate}
                />
              )}
            </TabsContent>
            
            <TabsContent value="variables" className="pt-4">
              {htmlPreview && (
                <VariableAnalysis htmlContent={currentHtml} />
              )}
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between mt-4 gap-2">
          <div className="flex items-center">
            {editedHtml !== null && (
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Template modified
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleSendTest}>
              Send Test to {fromName}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}