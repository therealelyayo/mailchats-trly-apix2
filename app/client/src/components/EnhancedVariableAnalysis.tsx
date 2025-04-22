import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Copy, Check, Wand2, Mail, User, Building, Calendar, Hash, Braces } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useEnhancedVariables } from "@/hooks/use-enhanced-variables";
import { generateExampleTemplate } from "@/lib/enhancedVariablesService";

// Local personalization variable types for display
type DisplayPersonalizationVariable = {
  name: string;
  description: string;
  example: string;
  category: 'basic' | 'contact' | 'date' | 'advanced' | 'custom';
  icon: React.ReactNode;
};

// List of all available personalization variables
const personalizationVariables: DisplayPersonalizationVariable[] = [
  // Basic email variables
  { 
    name: 'email', 
    description: 'Full email address of recipient', 
    example: 'john.doe@example.com',
    category: 'basic',
    icon: <Mail className="h-4 w-4" />
  },
  { 
    name: 'recipient_email', 
    description: 'Same as email', 
    example: 'john.doe@example.com',
    category: 'basic',
    icon: <Mail className="h-4 w-4" />
  },
  { 
    name: 'emailname', 
    description: 'Username part of email address', 
    example: 'john.doe',
    category: 'basic',
    icon: <User className="h-4 w-4" />
  },
  { 
    name: 'domain', 
    description: 'Domain part of email address', 
    example: 'example.com',
    category: 'basic',
    icon: <Building className="h-4 w-4" />
  },
  
  // Contact information (derived or custom)
  { 
    name: 'firstname', 
    description: 'First name derived from email or custom field', 
    example: 'John',
    category: 'contact',
    icon: <User className="h-4 w-4" />
  },
  { 
    name: 'lastname', 
    description: 'Last name derived from email or custom field', 
    example: 'Doe',
    category: 'contact',
    icon: <User className="h-4 w-4" />
  },
  { 
    name: 'company', 
    description: 'Company name derived from domain or custom field', 
    example: 'Example',
    category: 'contact',
    icon: <Building className="h-4 w-4" />
  },
  { 
    name: 'position', 
    description: 'Job position (requires custom field)', 
    example: 'CEO',
    category: 'contact',
    icon: <Building className="h-4 w-4" />
  },
  
  // Date & time variables
  { 
    name: 'time', 
    description: 'Current date and time', 
    example: '2025-04-18 14:30:45',
    category: 'date',
    icon: <Calendar className="h-4 w-4" />
  },
  { 
    name: 'date', 
    description: 'Current date', 
    example: '2025-04-18',
    category: 'date',
    icon: <Calendar className="h-4 w-4" />
  },
  { 
    name: 'day', 
    description: 'Current day of week', 
    example: 'Friday',
    category: 'date',
    icon: <Calendar className="h-4 w-4" />
  },
  { 
    name: 'month', 
    description: 'Current month', 
    example: 'April',
    category: 'date',
    icon: <Calendar className="h-4 w-4" />
  },
  { 
    name: 'year', 
    description: 'Current year', 
    example: '2025',
    category: 'date',
    icon: <Calendar className="h-4 w-4" />
  },
  
  // Advanced variables
  { 
    name: 'random_number', 
    description: 'Unique 3-digit number based on email', 
    example: '123',
    category: 'advanced',
    icon: <Hash className="h-4 w-4" />
  },
  { 
    name: 'unsubscribe', 
    description: 'Unsubscribe link with email parameter', 
    example: 'https://example.com/unsubscribe?email=john.doe@example.com',
    category: 'advanced',
    icon: <Mail className="h-4 w-4" />
  },
];

interface EnhancedVariableAnalysisProps {
  onClose?: () => void;
}

export default function EnhancedVariableAnalysis({ onClose }: EnhancedVariableAnalysisProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('variables');
  const [copied, setCopied] = useState<string | null>(null);
  
  // Use our enhanced variables context
  const {
    variables,
    isLoading,
    error,
    sampleRecipient,
    setSampleRecipient,
    loadSampleRecipient
  } = useEnhancedVariables();
  
  // Create display variables with icons based on context variables
  const variablesWithIcons = variables.map(v => {
    let icon;
    switch(v.category) {
      case 'basic':
        icon = v.name.includes('email') ? <Mail className="h-4 w-4" /> : <User className="h-4 w-4" />;
        break;
      case 'contact':
        icon = v.name.includes('company') || v.name.includes('position') ? 
               <Building className="h-4 w-4" /> : <User className="h-4 w-4" />;
        break;
      case 'date':
        icon = <Calendar className="h-4 w-4" />;
        break;
      case 'advanced':
        icon = v.name.includes('number') ? <Hash className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />;
        break;
      default:
        icon = <Info className="h-4 w-4" />;
    }
    
    return { ...v, icon } as DisplayPersonalizationVariable;
  });
  
  // Group variables by category - use the static variables until API is ready
  // This will gracefully fall back to these if the API fails
  const staticBasicVariables = personalizationVariables.filter(v => v.category === 'basic');
  const staticContactVariables = personalizationVariables.filter(v => v.category === 'contact');
  const staticDateVariables = personalizationVariables.filter(v => v.category === 'date');
  const staticAdvancedVariables = personalizationVariables.filter(v => v.category === 'advanced');
  
  // Use API variables if available, otherwise use static ones
  const basicVariables = variablesWithIcons.filter(v => v.category === 'basic').length > 0 
    ? variablesWithIcons.filter(v => v.category === 'basic')
    : staticBasicVariables;
    
  const contactVariables = variablesWithIcons.filter(v => v.category === 'contact').length > 0
    ? variablesWithIcons.filter(v => v.category === 'contact')
    : staticContactVariables;
    
  const dateVariables = variablesWithIcons.filter(v => v.category === 'date').length > 0
    ? variablesWithIcons.filter(v => v.category === 'date')
    : staticDateVariables;
    
  const advancedVariables = variablesWithIcons.filter(v => v.category === 'advanced').length > 0
    ? variablesWithIcons.filter(v => v.category === 'advanced')
    : staticAdvancedVariables;
  
  // Load sample recipient when clicking "Load Sample"
  useEffect(() => {
    // If there's an error in the context, show a toast
    if (error) {
      toast({
        title: "Error loading variables",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Generate example with all variables
  const generateTemplateExample = () => {
    return generateExampleTemplate();
  }
  
  // Copy variable to clipboard
  const copyVariable = (variable: string, format: 'single' | 'double') => {
    const toCopy = format === 'single' ? `{${variable}}` : `{{${variable}}}`;
    navigator.clipboard.writeText(toCopy);
    setCopied(variable + format);
    
    toast({
      title: "Copied to clipboard",
      description: `${toCopy} has been copied to the clipboard`,
      duration: 2000,
    });
    
    setTimeout(() => setCopied(null), 2000);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Braces className="h-5 w-5 text-primary" /> 
          Enhanced Personalization Variables
        </CardTitle>
        <CardDescription>
          Use these variables in your email templates for advanced personalization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="variables" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="variables">Available Variables</TabsTrigger>
            <TabsTrigger value="format">Recipient Format</TabsTrigger>
            <TabsTrigger value="example">Template Example</TabsTrigger>
          </TabsList>
          
          <TabsContent value="variables" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Use these variables with single braces {"{variable}"} or double braces {"{{variable}}"}
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Basic Email Variables
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Variable</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[200px]">Example</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {basicVariables.map((variable) => (
                      <TableRow key={variable.name}>
                        <TableCell className="font-medium">{variable.name}</TableCell>
                        <TableCell>{variable.description}</TableCell>
                        <TableCell className="text-muted-foreground">{variable.example}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={() => copyVariable(variable.name, 'single')}
                            >
                              {copied === variable.name + 'single' ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Contact Information Variables
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Variable</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[200px]">Example</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactVariables.map((variable) => (
                      <TableRow key={variable.name}>
                        <TableCell className="font-medium">{variable.name}</TableCell>
                        <TableCell>{variable.description}</TableCell>
                        <TableCell className="text-muted-foreground">{variable.example}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={() => copyVariable(variable.name, 'single')}
                            >
                              {copied === variable.name + 'single' ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Date & Time Variables
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Variable</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[200px]">Example</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dateVariables.map((variable) => (
                      <TableRow key={variable.name}>
                        <TableCell className="font-medium">{variable.name}</TableCell>
                        <TableCell>{variable.description}</TableCell>
                        <TableCell className="text-muted-foreground">{variable.example}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={() => copyVariable(variable.name, 'single')}
                            >
                              {copied === variable.name + 'single' ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Advanced Variables
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Variable</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[200px]">Example</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advancedVariables.map((variable) => (
                      <TableRow key={variable.name}>
                        <TableCell className="font-medium">{variable.name}</TableCell>
                        <TableCell>{variable.description}</TableCell>
                        <TableCell className="text-muted-foreground">{variable.example}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={() => copyVariable(variable.name, 'single')}
                            >
                              {copied === variable.name + 'single' ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Braces className="h-4 w-4 text-primary" />
                    Custom Fields
                  </span>
                  <Badge variant="outline" className="font-normal text-xs">
                    Any field in recipient format
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Any custom field you add in your recipient list with the format shown in the "Recipient Format" tab 
                  becomes available as a variable. For example, if you add <code>industry=Technology</code> to a recipient, 
                  you can use <code>{"{industry}"}</code> in your template.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="format">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Enhanced Recipient Format</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To use custom fields, format your recipients list with pipe-separated values as shown below:
                </p>
                
                <div className="p-3 bg-muted/40 rounded-md">
                  <code className="text-sm">email@example.com|firstname=John|lastname=Doe|company=Acme Inc|position=CEO</code>
                </div>
                
                <h3 className="text-sm font-medium mt-6 mb-2">Sample Recipient</h3>
                <Textarea 
                  value={sampleRecipient} 
                  onChange={(e) => setSampleRecipient(e.target.value)}
                  className="font-mono text-sm"
                  rows={3}
                />
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Parsed Variables</h4>
                  <div className="border rounded-md p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {sampleRecipient.split('|').map((part, index) => {
                        if (index === 0) {
                          return (
                            <div key={index} className="contents">
                              <div className="font-medium">email:</div>
                              <div className="text-muted-foreground">{part}</div>
                              
                              <div className="font-medium">emailname:</div>
                              <div className="text-muted-foreground">
                                {part.includes('@') ? part.split('@')[0] : 'unknown'}
                              </div>
                              
                              <div className="font-medium">domain:</div>
                              <div className="text-muted-foreground">
                                {part.includes('@') ? part.split('@')[1].split('.')[0] : 'unknown'}
                              </div>
                              
                              <div className="font-medium">full_domain:</div>
                              <div className="text-muted-foreground">
                                {part.includes('@') ? part.split('@')[1] : 'unknown'}
                              </div>
                            </div>
                          );
                        } else if (part.includes('=')) {
                          const [key, value] = part.split('=', 2);
                          return (
                            <div key={index} className="contents">
                              <div className="font-medium">{key}:</div>
                              <div className="text-muted-foreground">{value}</div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="example">
            <div className="space-y-4">
              <div className="flex justify-between mb-2">
                <h3 className="text-sm font-medium">Template Example with All Variables</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs flex items-center gap-1"
                  onClick={() => {
                    navigator.clipboard.writeText(generateTemplateExample());
                    toast({
                      title: "Template Copied",
                      description: "Example template has been copied to clipboard",
                      duration: 2000,
                    });
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Example
                </Button>
              </div>
              
              <div className="border rounded-md">
                <Textarea 
                  value={generateTemplateExample()}
                  readOnly
                  className="font-mono text-xs min-h-[300px] p-4"
                />
              </div>
              
              <p className="text-sm text-muted-foreground mt-2">
                This example shows how to use all the available personalization variables in your email template.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="max-w-xs text-xs">
                  Personalization variables are replaced with recipient-specific values when emails are sent.
                  Both single braces {"{variable}"} and double braces {"{{variable}}"} formats are supported.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-xs text-muted-foreground">
            Enhanced Variables Documentation
          </span>
        </div>
        
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}