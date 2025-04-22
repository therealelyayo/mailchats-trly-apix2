import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Copy, CheckCircle2, PlusCircle, Brain } from 'lucide-react';
import { generateSubjectLines, SubjectGenerationOptions } from '@/lib/subjectGenerationService';
import { useToast } from "@/hooks/use-toast";

interface SubjectGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailContent: string;
  onSelectSubject: (subject: string) => void;
}

export default function SubjectGeneratorModal({
  isOpen,
  onClose,
  emailContent,
  onSelectSubject
}: SubjectGeneratorModalProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Generation options
  const [options, setOptions] = useState<SubjectGenerationOptions>({
    emailContent,
    tone: 'professional',
    count: 5,
    maxLength: 70
  });

  // Handle option changes
  const handleOptionChange = (field: keyof SubjectGenerationOptions, value: any) => {
    setOptions({
      ...options,
      [field]: value
    });
  };

  // Generate subject lines
  const handleGenerate = async () => {
    setGenerating(true);
    setSubjects([]);
    setSelectedSubject(null);
    
    try {
      // Make sure we're using the latest email content
      const result = await generateSubjectLines({
        ...options,
        emailContent: emailContent || options.emailContent
      });
      
      if (result.success) {
        setSubjects(result.subjects);
        if (result.subjects.length > 0) {
          toast({
            title: "Subject Lines Generated",
            description: `Generated ${result.subjects.length} subject lines.`,
            variant: "default"
          });
        } else {
          toast({
            title: "No Subject Lines Generated",
            description: "Try adjusting your options or providing more content.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Generation Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  // Copy subject to clipboard
  const handleCopy = (subject: string, index: number) => {
    navigator.clipboard.writeText(subject).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      
      toast({
        title: "Copied",
        description: "Subject line copied to clipboard",
        variant: "default"
      });
    });
  };

  // Select subject and close modal
  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject);
    onSelectSubject(subject);
    
    toast({
      title: "Subject Selected",
      description: "The subject line has been applied",
      variant: "default"
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Subject Line Generator
          </DialogTitle>
          <DialogDescription className="text-foreground/80">
            Generate engaging subject lines for your email using DeepSeek AI.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Generation Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select 
                value={options.tone} 
                onValueChange={(value) => handleOptionChange('tone', value)}
              >
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="count">Number of Suggestions</Label>
              <Select 
                value={options.count?.toString()} 
                onValueChange={(value) => handleOptionChange('count', parseInt(value))}
              >
                <SelectTrigger id="count">
                  <SelectValue placeholder="Number of suggestions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry (Optional)</Label>
              <Input
                id="industry"
                value={options.industry || ''}
                onChange={(e) => handleOptionChange('industry', e.target.value)}
                placeholder="e.g. Technology, Finance"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience (Optional)</Label>
              <Input
                id="audience"
                value={options.targetAudience || ''}
                onChange={(e) => handleOptionChange('targetAudience', e.target.value)}
                placeholder="e.g. Executives, Customers"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="max-length" className="text-foreground">Maximum Length: {options.maxLength} characters</Label>
            </div>
            <Slider
              id="max-length"
              defaultValue={[options.maxLength || 70]}
              min={30}
              max={100}
              step={5}
              onValueChange={(values) => handleOptionChange('maxLength', values[0])}
              className="py-2"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email-content">Email Content Preview</Label>
            <Textarea
              id="email-content"
              value={emailContent}
              className="h-24 text-sm text-foreground opacity-80"
              readOnly
            />
          </div>
          
          {/* Generated Subject Lines */}
          {subjects.length > 0 && (
            <div className="space-y-2 mt-2">
              <Label className="text-lg font-medium">Generated Subject Lines</Label>
              <div className="border rounded-md p-1 bg-secondary/20">
                {subjects.map((subject, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-md mb-1 group hover:bg-secondary/40 transition-colors ${
                      selectedSubject === subject ? 'bg-primary/10 border border-primary/30' : 'bg-card'
                    }`}
                  >
                    <div className="flex-1 mr-2 text-foreground">{subject}</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleCopy(subject, index)}
                      >
                        {copiedIndex === index ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="default" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleSelectSubject(subject)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Generate Subject Lines
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}