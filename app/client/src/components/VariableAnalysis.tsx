import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, AlertCircle, Info, Hash, Mail, User, Globe, Clock, AlertTriangle } from 'lucide-react';

interface VariableAnalysisProps {
  htmlContent: string;
}

type VariableInfo = {
  name: string;
  count: number;
  description: string;
  icon: React.ReactNode;
  examples: string[];
};

export default function VariableAnalysis({ htmlContent }: VariableAnalysisProps) {
  // Function to get description of standard variables
  const getVariableDescription = (variableName: string): string => {
    switch (variableName.toLowerCase()) {
      case 'email':
      case 'recipient_email':
        return 'The recipient\'s email address.';
      case 'emailname':
        return 'The username part of the recipient\'s email (before @).';
      case 'domain':
        return 'The domain part of the recipient\'s email (after @).';
      case 'time':
        return 'The current time when the email is sent.';
      case 'name':
      case 'firstname':
        return 'The recipient\'s first name.';
      case 'lastname':
        return 'The recipient\'s last name.';
      case 'company':
        return 'The recipient\'s company name.';
      case 'date':
        return 'The current date when the email is sent.';
      default:
        return 'Custom variable.';
    }
  };
  
  // Function to get icon for variable type
  const getVariableIcon = (variableName: string) => {
    switch (variableName.toLowerCase()) {
      case 'email':
      case 'recipient_email':
        return <Mail className="h-4 w-4" />;
      case 'emailname':
        return <User className="h-4 w-4" />;
      case 'domain':
        return <Globe className="h-4 w-4" />;
      case 'time':
      case 'date':
        return <Clock className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };
  
  // Function to extract all variables from the HTML content
  const extractVariables = (): VariableInfo[] => {
    const variables = new Map<string, { count: number; examples: Set<string> }>();
    
    // Find all variables in the format {{variable}}
    const doubleBraceRegex = /\\{\\{([^}]+)\\}\\}/g;
    let match;
    while ((match = doubleBraceRegex.exec(htmlContent)) !== null) {
      const varName = match[1].trim();
      const example = match[0];
      const existing = variables.get(varName);
      
      if (existing) {
        existing.count++;
        existing.examples.add(example);
      } else {
        variables.set(varName, { count: 1, examples: new Set([example]) });
      }
    }
    
    // Find all variables in the format {variable}
    const singleBraceRegex = /\\{([^}]+)\\}/g;
    while ((match = singleBraceRegex.exec(htmlContent)) !== null) {
      const varName = match[1].trim();
      const example = match[0];
      const existing = variables.get(varName);
      
      if (existing) {
        existing.count++;
        existing.examples.add(example);
      } else {
        variables.set(varName, { count: 1, examples: new Set([example]) });
      }
    }
    
    // Convert to array and sort by count (descending)
    return Array.from(variables.entries()).map(([name, { count, examples }]) => ({
      name,
      count,
      description: getVariableDescription(name),
      icon: getVariableIcon(name),
      examples: Array.from(examples),
    })).sort((a, b) => b.count - a.count);
  };
  
  const variables = extractVariables();
  
  // Check if there are inconsistencies in variable formats
  const checkForInconsistencies = () => {
    const singleBraceVars = new Set<string>();
    const doubleBraceVars = new Set<string>();
    
    // Extract all single brace variables
    const singleBraceRegex = /\\{([^}]+)\\}/g;
    let match;
    while ((match = singleBraceRegex.exec(htmlContent)) !== null) {
      singleBraceVars.add(match[1].trim());
    }
    
    // Extract all double brace variables
    const doubleBraceRegex = /\\{\\{([^}]+)\\}\\}/g;
    while ((match = doubleBraceRegex.exec(htmlContent)) !== null) {
      doubleBraceVars.add(match[1].trim());
    }
    
    // Find variables that exist in both formats
    const inconsistentVars = Array.from(singleBraceVars).filter(v => doubleBraceVars.has(v));
    
    return inconsistentVars;
  };
  
  const inconsistentVariables = checkForInconsistencies();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Variable Usage Analysis
          </CardTitle>
          <CardDescription>
            Analysis of personalization variables used in your email template
          </CardDescription>
        </CardHeader>
        <CardContent>
          {variables.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No variables detected</AlertTitle>
              <AlertDescription>
                Your email template doesn't contain any personalization variables. 
                Consider adding variables like {'{email}'}, {'{name}'}, or {'{company}'} to personalize your content.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="gap-1">
                  <Hash className="h-3 w-3" />
                  {variables.length} unique variables
                </Badge>
                
                {inconsistentVariables.length > 0 && (
                  <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 hover:bg-amber-50">
                    <AlertTriangle className="h-3 w-3" />
                    Inconsistent formats detected
                  </Badge>
                )}
                
                <Badge variant="outline" className="gap-1">
                  Supports both {'{single}'} and {'{{double}}'} braces
                </Badge>
              </div>
              
              {inconsistentVariables.length > 0 && (
                <Alert className="mb-6 bg-amber-50 text-amber-700 border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Inconsistent Variable Formats</AlertTitle>
                  <AlertDescription>
                    The following variables appear in both single {'{variable}'} and double {'{{variable}}'} brace formats: 
                    <span className="font-semibold">{inconsistentVariables.join(', ')}</span>.
                    While both formats work, using consistent formats improves maintainability.
                  </AlertDescription>
                </Alert>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variable</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="hidden lg:table-cell">Example</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variables.map((variable) => (
                    <TableRow key={variable.name}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {variable.icon}
                        {variable.name}
                      </TableCell>
                      <TableCell>{variable.count}</TableCell>
                      <TableCell className="hidden md:table-cell">{variable.description}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground font-mono text-xs">
                        {variable.examples[0]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Variable Formats</AlertTitle>
              <AlertDescription>
                Your template supports both {'{single}'} and {'{{double}}'} brace formats for variables.
              </AlertDescription>
            </Alert>
            
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Standard Variables</AlertTitle>
              <AlertDescription>
                Using standard variable names like {'{email}'} and {'{name}'} helps maintain consistency.
              </AlertDescription>
            </Alert>
            
            <Alert variant={variables.length > 0 ? "default" : "destructive"} 
              className={variables.length > 0 ? 
                "bg-green-50 text-green-800 border-green-200" : 
                undefined}
            >
              {variables.length > 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>Personalization</AlertTitle>
              <AlertDescription>
                {variables.length > 0 ? (
                  "Your template includes personalization variables for a tailored experience."
                ) : (
                  "No personalization detected. Consider adding variables to improve engagement."
                )}
              </AlertDescription>
            </Alert>
            
            <Alert variant={inconsistentVariables.length === 0 ? "default" : "destructive"}
              className={inconsistentVariables.length === 0 ? 
                "bg-green-50 text-green-800 border-green-200" : 
                undefined}
            >
              {inconsistentVariables.length === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>Consistency</AlertTitle>
              <AlertDescription>
                {inconsistentVariables.length === 0 ? (
                  "Variables are used consistently throughout your template."
                ) : (
                  "Some variables use inconsistent formats. Consider standardizing for better maintainability."
                )}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}