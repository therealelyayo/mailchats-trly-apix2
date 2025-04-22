import { useState, ChangeEvent, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { FileUp, Eye, Send, FileText, HelpCircle, RefreshCw, Braces } from 'lucide-react';
import { EmailConfiguration } from '@/pages/Home';
import SubjectGeneratorButton from './SubjectGeneratorButton';
import EnhancedVariablesModal from './EnhancedVariablesModal';

// Sample files for testing mail merge features
import SampleTemplateText from '../assets/sample_template.html?raw';
import SampleSubjectsText from '../assets/sample_subjects.txt?raw';
import SampleRecipientsText from '../assets/sample_recipients.txt?raw';

interface ConfigurationFormProps {
  config: EmailConfiguration;
  setConfig: React.Dispatch<React.SetStateAction<EmailConfiguration>>;
  recipientCount: number;
  setRecipientCount: React.Dispatch<React.SetStateAction<number>>;
  isSending: boolean;
  onPreviewHtml: (preview: { html: string; subject: string }) => void;
  onOpenPreviewModal: () => void;
  onSendTestEmail: () => void;
  onStartSending: () => void;
  addConsoleMessage: (message: string, type?: string) => void;
}

export default function ConfigurationForm({
  config,
  setConfig,
  recipientCount,
  setRecipientCount,
  isSending,
  onPreviewHtml,
  onOpenPreviewModal,
  onSendTestEmail,
  onStartSending,
  addConsoleMessage
}: ConfigurationFormProps) {
  const [htmlFileName, setHtmlFileName] = useState('gm.html');
  const [subjectsFileName, setSubjectsFileName] = useState('gmsj.txt');
  const [recipientsFileName, setRecipientsFileName] = useState('recipients.txt');
  const [smtpCredentialsFileName, setSmtpCredentialsFileName] = useState('smtp_credentials.txt');
  const [showEnhancedVariablesModal, setShowEnhancedVariablesModal] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, type: 'html' | 'subjects' | 'recipients' | 'smtpCredentials') => {
    const file = e.target.files?.[0];
    if (!file) return;

    switch (type) {
      case 'html':
        setHtmlFileName(file.name);
        setConfig(prev => ({ ...prev, htmlFile: file }));
        addConsoleMessage(`Loaded ${file.name}`, 'info');
        
        // Preview the HTML file and detect template variables
        try {
          const text = await file.text();
          
          // Check if the HTML contains template variables with both single and double braces
          // First check single braces format: {variable}
          const singleBracePattern = /{([^{}]+)}/g;
          const templateVars = new Set<string>();
          let match;
          
          while ((match = singleBracePattern.exec(text)) !== null) {
            templateVars.add(match[1]);
          }
          
          // Then check double braces format: {{variable}}
          const doubleBracePattern = /{{([^{}]+)}}/g;
          while ((match = doubleBracePattern.exec(text)) !== null) {
            templateVars.add(match[1]);
          }
          
          if (templateVars.size > 0) {
            const varList = Array.from(templateVars);
            
            // Sort variables alphabetically for a cleaner display
            varList.sort();
            
            // Create a more descriptive message
            addConsoleMessage(
              `Found ${varList.length} template variables in HTML: ${varList.join(', ')}`, 
              'info'
            );
            
            // More detailed message about available variables
            addConsoleMessage(
              `These variables will be replaced when sending emails. You can preview with sample values in the Preview window.`,
              'info'
            );
          } else {
            // If no variables were found, suggest using them
            addConsoleMessage(
              `No template variables found in HTML. You can use variables like {email}, {emailname}, {domain}, or {time} in your template.`,
              'info'
            );
          }
          
          const mockSubject = "Your account has been verified"; // Placeholder subject 
          
          // If a subjects file is loaded, try to use the first line as subject
          if (config.subjectsFile) {
            try {
              const subjectText = await config.subjectsFile.text();
              const firstLine = subjectText.split('\n')[0].trim();
              if (firstLine) {
                onPreviewHtml({ html: text, subject: firstLine });
                return;
              }
            } catch (e) {
              // Silently fail and use mock subject
            }
          }
          
          onPreviewHtml({ html: text, subject: mockSubject });
        } catch (error) {
          addConsoleMessage(`Error reading HTML file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
        break;
        
      case 'subjects':
        setSubjectsFileName(file.name);
        setConfig(prev => ({ ...prev, subjectsFile: file }));
        addConsoleMessage(`Loaded ${file.name}`, 'info');
        break;
        
      case 'recipients':
        setRecipientsFileName(file.name);
        setConfig(prev => ({ ...prev, recipientsFile: file }));
        
        try {
          const text = await file.text();
          const lines = text.split('\n').filter(line => line.trim().length > 0);
          setRecipientCount(lines.length);
          addConsoleMessage(`Loaded ${lines.length} recipients from ${file.name}`, 'info');
        } catch (error) {
          addConsoleMessage(`Error reading recipients file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
        break;
        
      case 'smtpCredentials':
        setSmtpCredentialsFileName(file.name);
        setConfig(prev => ({ ...prev, smtpCredentialsFile: file }));
        
        try {
          const text = await file.text();
          const lines = text.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 0 && !trimmed.startsWith('#');
          });
          
          // Count valid SMTP server configs (host,port,username,password)
          const validServerCount = lines.filter(line => {
            const parts = line.split(',');
            return parts.length >= 4;
          }).length;
          
          if (validServerCount > 0) {
            addConsoleMessage(`Loaded ${validServerCount} SMTP servers from ${file.name}`, 'info');
            
            // Automatically enable rotation if multiple servers are found
            if (validServerCount > 1 && !config.rotateSmtp) {
              setConfig(prev => ({ ...prev, rotateSmtp: true }));
              addConsoleMessage(`SMTP server rotation automatically enabled for ${validServerCount} servers`, 'info');
            }
          } else {
            addConsoleMessage(`Warning: No valid SMTP server configurations found in file. Format should be: host,port,username,password (one per line)`, 'warning');
          }
        } catch (error) {
          addConsoleMessage(`Error reading SMTP credentials file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
        break;
    }
  };

  const handlePreviewHtml = () => {
    if (!config.htmlFile) {
      addConsoleMessage('No HTML file selected for preview', 'warning');
      return;
    }
    onOpenPreviewModal();
  };
  
  // Load the sample template with mail merge variables for easy testing
  const loadSampleTemplate = useCallback(async () => {
    try {
      // Create file objects from sample files
      const htmlBlob = new Blob([SampleTemplateText], { type: 'text/html' });
      const htmlFile = new File([htmlBlob], 'sample_mail_merge_template.html', { type: 'text/html' });
      
      const subjectsBlob = new Blob([SampleSubjectsText], { type: 'text/plain' });
      const subjectsFile = new File([subjectsBlob], 'sample_subjects.txt', { type: 'text/plain' });
      
      const recipientsBlob = new Blob([SampleRecipientsText], { type: 'text/plain' });
      const recipientsFile = new File([recipientsBlob], 'sample_recipients.txt', { type: 'text/plain' });
      
      // Update file names
      setHtmlFileName(htmlFile.name);
      setSubjectsFileName(subjectsFile.name);
      setRecipientsFileName(recipientsFile.name);
      
      // Set files in configuration
      setConfig(prev => ({ 
        ...prev, 
        htmlFile: htmlFile, 
        subjectsFile: subjectsFile,
        recipientsFile: recipientsFile
      }));
      
      // Update recipient count
      const recipientLines = SampleRecipientsText.split('\n').filter(line => line.trim().length > 0);
      setRecipientCount(recipientLines.length);
      
      // Process the template to detect variables
      const templateVars = new Set<string>();
      let match;
      
      // Check single brace pattern
      const singleBracePattern = /{([^{}]+)}/g;
      while ((match = singleBracePattern.exec(SampleTemplateText)) !== null) {
        templateVars.add(match[1]);
      }
      
      // Check double brace pattern
      const doubleBracePattern = /{{([^{}]+)}}/g;
      while ((match = doubleBracePattern.exec(SampleTemplateText)) !== null) {
        templateVars.add(match[1]);
      }
      
      // Process subjects file to detect variables
      const subjectVars = new Set<string>();
      
      // Check for variables in the subjects file
      while ((match = singleBracePattern.exec(SampleSubjectsText)) !== null) {
        subjectVars.add(match[1]);
      }
      
      while ((match = doubleBracePattern.exec(SampleSubjectsText)) !== null) {
        subjectVars.add(match[1]);
      }
      
      // Show found variables and loaded files in the console
      if (templateVars.size > 0) {
        const varList = Array.from(templateVars).sort();
        addConsoleMessage(
          `Loaded sample template with ${varList.length} mail merge variables: ${varList.join(', ')}`,
          'success'
        );
      }
      
      if (subjectVars.size > 0) {
        const varList = Array.from(subjectVars).sort();
        addConsoleMessage(
          `Loaded sample subjects with ${varList.length} mail merge variables: ${varList.join(', ')}`,
          'info'
        );
      }
      
      addConsoleMessage(
        `Loaded ${recipientLines.length} sample recipient emails`,
        'info'
      );
      
      addConsoleMessage(
        `Click "Preview" to see the interactive mail merge preview in action.`,
        'info'
      );
      
      // Get first subject line for preview
      const firstSubject = SampleSubjectsText.split('\n')[0].trim();
      
      // Set the preview with the first subject line
      onPreviewHtml({ 
        html: SampleTemplateText, 
        subject: firstSubject || "Sample Template with Mail Merge Variables" 
      });
      
    } catch (error) {
      addConsoleMessage(
        `Error loading sample templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  }, [SampleTemplateText, SampleSubjectsText, SampleRecipientsText, addConsoleMessage, onPreviewHtml, setConfig, setRecipientCount]);

  return (
    <form 
      className="space-y-6" 
      onSubmit={(e) => {
        e.preventDefault();
        onStartSending();
      }}
    >
      {/* Email Templates Card */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <FileUp className="h-5 w-5 text-primary mr-2" />
            Email Templates
          </h2>
          
          {/* HTML Template File */}
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2" htmlFor="htmlFile">
              HTML Email Template
            </Label>
            <div className="flex items-center space-x-2">
              <div className="flex-grow relative border rounded-lg overflow-hidden">
                <Input 
                  type="file" 
                  id="htmlFile" 
                  accept=".html" 
                  className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                  onChange={(e) => handleFileChange(e, 'html')}
                  disabled={isSending}
                />
                
                <div className="flex items-center px-4 py-3">
                  <FileUp className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-muted-foreground">{htmlFileName}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  type="button" 
                  onClick={handlePreviewHtml}
                  disabled={!config.htmlFile || isSending}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  type="button"
                  onClick={loadSampleTemplate}
                  disabled={isSending}
                  variant="outline"
                  className="flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Load Example
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowEnhancedVariablesModal(true)}
                  variant="ghost"
                  className="flex items-center"
                >
                  <Braces className="h-4 w-4 mr-1" />
                  Variables
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-muted-foreground">Default: gm.html</p>
              <p className="text-xs text-blue-500">Try the "Load Example" button to test mail merge variables!</p>
            </div>
          </div>
          
          {/* Subjects File */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium" htmlFor="subjectsFile">
                Email Subjects File
              </Label>
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Auto-rotation enabled
              </Badge>
            </div>
            <div className="flex-grow relative border rounded-lg overflow-hidden">
              <Input 
                type="file" 
                id="subjectsFile" 
                accept=".txt" 
                className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                onChange={(e) => handleFileChange(e, 'subjects')}
                disabled={isSending}
              />
              <div className="flex items-center px-4 py-3">
                <FileUp className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">{subjectsFileName}</span>
              </div>
            </div>
            <div className="mt-1 flex flex-col text-xs">
              <p className="text-muted-foreground">Default: gmsj.txt - Each line will be used as a subject in rotation</p>
              <p className="text-blue-500 mt-0.5">Mail merge variables like {"{email}"} and {"{time}"} also work in subjects!</p>
            </div>
            
            {/* AI Subject Generator Button */}
            <div className="mt-2">
              <SubjectGeneratorButton 
                emailContent={config.htmlFile ? (async () => {
                  try {
                    // TypeScript non-null assertion - we've already checked config.htmlFile is not null
                    const file = config.htmlFile as File;
                    return await file.text();
                  } catch (error) {
                    console.error("Error reading HTML file:", error);
                    return "Error reading HTML content";
                  }
                }) : "No HTML content available"}
                onSelectSubject={(subject) => {
                  // Create a text file with the generated subject line
                  const subjectBlob = new Blob([subject], { type: 'text/plain' });
                  const subjectFile = new File([subjectBlob], 'ai_generated_subject.txt', { type: 'text/plain' });
                  
                  // Update file name and configuration
                  setSubjectsFileName(subjectFile.name);
                  setConfig(prev => ({ ...prev, subjectsFile: subjectFile }));
                  
                  // Log the action
                  addConsoleMessage(`AI generated subject line: "${subject}"`, 'info');
                }}
                disabled={isSending || !config.htmlFile}
              />
            </div>
          </div>
          
          {/* Recipients File */}
          <div>
            <Label className="block text-sm font-medium mb-2" htmlFor="recipientsFile">
              Recipients List
            </Label>
            <div className="flex-grow relative border rounded-lg overflow-hidden">
              <Input 
                type="file" 
                id="recipientsFile" 
                accept=".txt" 
                className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                onChange={(e) => handleFileChange(e, 'recipients')}
                disabled={isSending}
              />
              <div className="flex items-center px-4 py-3">
                <FileUp className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">{recipientsFileName}</span>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-primary mr-1 text-sm">ℹ</span>
              <span className="text-muted-foreground">{recipientCount} recipients loaded</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sending Options Card */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Send className="h-5 w-5 text-primary mr-2" />
            Sending Options
          </h2>
          
          {/* From Name */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium" htmlFor="fromName">
                From Name
              </Label>
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                Supports mail merge
              </Badge>
            </div>
            <Input 
              type="text" 
              id="fromName" 
              placeholder="Email Support" 
              value={config.fromName}
              onChange={(e) => setConfig(prev => ({ ...prev, fromName: e.target.value }))}
              disabled={isSending}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              You can use mail merge variables here too: {"{emailname}"}, {"{domain}"}, etc.
            </p>
          </div>
          
          {/* Sending Method */}
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2">
              Sending Method
            </Label>
            <RadioGroup 
              value={config.sendMethod} 
              onValueChange={(value) => {
                setConfig(prev => ({ ...prev, sendMethod: value as "API" | "SMTP" }));
                addConsoleMessage(`Send method changed to ${value}`, 'info');
              }}
              className="flex space-x-4"
              disabled={isSending}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="API" id="apiMethod" />
                <Label htmlFor="apiMethod">API</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SMTP" id="smtpMethod" />
                <Label htmlFor="smtpMethod">SMTP</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* API Options */}
          {config.sendMethod === "API" && (
            <div className="border rounded-lg p-4 mb-4 bg-secondary/10">
              <div className="mb-3">
                <Label className="block text-sm font-medium mb-2" htmlFor="apiKey">
                  API Key
                </Label>
                <div className="relative">
                  <Input 
                    type="text" 
                    id="apiKey" 
                    placeholder="nyk_v0_..." 
                    value={config.apiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    disabled={isSending}
                    className="pr-20"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full px-3 text-xs"
                    onClick={() => {
                      setConfig(prev => ({ 
                        ...prev, 
                        apiKey: "nyk_v0_IDxmJtl9h5BGx1ZCpKBxssPwrLTTmrDheQoZhBFNzeYiFSyQFeDOsq61FAIvPGOf" 
                      }));
                      addConsoleMessage("API key reset to default", "info");
                    }}
                    disabled={isSending}
                  >
                    Reset
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Your Nylas API key is used to authenticate with the email service. Default key is provided but you can use your own.</p>
              </div>
            </div>
          )}
          
          {/* SMTP Options */}
          {config.sendMethod === "SMTP" && (
            <div className="border rounded-lg p-4 mb-4 bg-secondary/10">
              <div className="mb-3">
                <Label className="block text-sm font-medium mb-2">
                  SMTP Mode
                </Label>
                <RadioGroup 
                  value={config.smtpMode} 
                  onValueChange={(value) => {
                    setConfig(prev => ({ ...prev, smtpMode: value as "localhost" | "smtp" }));
                    addConsoleMessage(`SMTP mode changed to ${value}`, 'info');
                  }}
                  className="flex space-x-4"
                  disabled={isSending}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="localhost" id="localhostMode" />
                    <Label htmlFor="localhostMode">Localhost</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="smtp" id="remoteMode" />
                    <Label htmlFor="remoteMode">Remote SMTP</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* SMTP Credentials */}
              {config.smtpMode === "smtp" && (
                <div className="space-y-3">
                  <div>
                    <Label className="block text-sm font-medium mb-2" htmlFor="smtpHost">
                      SMTP Host
                    </Label>
                    <Input 
                      type="text" 
                      id="smtpHost" 
                      placeholder="smtp.example.com" 
                      value={config.smtpHost}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                      disabled={isSending}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2" htmlFor="smtpPort">
                      SMTP Port
                    </Label>
                    <Input 
                      type="number" 
                      id="smtpPort" 
                      placeholder="587" 
                      value={config.smtpPort}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                      disabled={isSending}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2" htmlFor="smtpUsername">
                      SMTP Username
                    </Label>
                    <Input 
                      type="text" 
                      id="smtpUsername" 
                      placeholder="username@example.com" 
                      value={config.smtpUsername}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpUsername: e.target.value }))}
                      disabled={isSending}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2" htmlFor="smtpPassword">
                      SMTP Password
                    </Label>
                    <Input 
                      type="password" 
                      id="smtpPassword" 
                      placeholder="•••••••••" 
                      value={config.smtpPassword}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      disabled={isSending}
                    />
                  </div>
                  
                  {/* SMTP Credentials File */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium" htmlFor="smtpCredentialsFile">
                        SMTP Credentials File
                      </Label>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0.5 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                      >
                        New feature
                      </Badge>
                    </div>
                    <div className="flex-grow relative border rounded-lg overflow-hidden mb-2">
                      <Input 
                        type="file" 
                        id="smtpCredentialsFile" 
                        accept=".txt" 
                        className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                        onChange={(e) => handleFileChange(e, 'smtpCredentials')}
                        disabled={isSending}
                      />
                      <div className="flex items-center px-4 py-3">
                        <FileUp className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-muted-foreground">{smtpCredentialsFileName}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload a text file containing SMTP credentials, one server per line in the format:<br/>
                      <code className="bg-muted/50 px-1 py-0.5 rounded text-primary">host,port,username,password</code>
                    </p>
                    
                    {/* SMTP Rotation Toggle */}
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch 
                        id="rotateSmtp" 
                        checked={config.rotateSmtp}
                        onCheckedChange={(checked) => {
                          setConfig(prev => ({ ...prev, rotateSmtp: checked }));
                          if (checked) {
                            addConsoleMessage("SMTP server rotation enabled - will rotate between available servers", "info");
                          } else {
                            addConsoleMessage("SMTP server rotation disabled", "info");
                          }
                        }}
                        disabled={isSending || !config.smtpCredentialsFile}
                      />
                      <Label htmlFor="rotateSmtp" className={`${!config.smtpCredentialsFile ? 'text-muted-foreground' : ''}`}>
                        Enable SMTP server rotation
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      When enabled, the system will automatically rotate between SMTP servers for better deliverability.
                      {config.smtpCredentialsFile && config.rotateSmtp ? (
                        <span className="text-primary mt-1 block">
                          Automatic failover is also enabled for improved reliability.
                        </span>
                      ) : !config.smtpCredentialsFile ? (
                        <span className="text-amber-500 mt-1 block">
                          Upload an SMTP credentials file to enable this feature.
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Sending Speed */}
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2" htmlFor="sendSpeed">
              Sending Speed (emails per second): {config.sendSpeed}
            </Label>
            <Slider 
              id="sendSpeed"
              min={1} 
              max={50} 
              step={1}
              value={[config.sendSpeed]}
              onValueChange={(value) => setConfig(prev => ({ ...prev, sendSpeed: value[0] }))}
              disabled={isSending}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Slower (1)</span>
              <span>Faster (50)</span>
            </div>
          </div>
          
          {/* Email Tracking Options */}
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2">
              Tracking Options
            </Label>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="trackOpens" 
                  checked={config.trackOpens}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, trackOpens: checked }))}
                  disabled={isSending}
                />
                <Label htmlFor="trackOpens">Track Opens</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="trackLinks" 
                  checked={config.trackLinks}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, trackLinks: checked }))}
                  disabled={isSending}
                />
                <Label htmlFor="trackLinks">Track Links</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="trackReplies" 
                  checked={config.trackReplies}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, trackReplies: checked }))}
                  disabled={isSending}
                />
                <Label htmlFor="trackReplies">Track Replies</Label>
              </div>
            </div>
          </div>
          
          {/* Enhanced Personalization Options */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">
                Enhanced Personalization
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={() => setShowEnhancedVariablesModal(true)}
              >
                <Braces className="h-4 w-4 mr-1" />
                Variables
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="useEnhancedVariables" 
                  checked={config.useEnhancedVariables}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, useEnhancedVariables: checked }))}
                  disabled={isSending}
                />
                <Label htmlFor="useEnhancedVariables">Use Enhanced Variables</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enhancedRecipientFormat" 
                  checked={config.enhancedRecipientFormat}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enhancedRecipientFormat: checked }))}
                  disabled={isSending || !config.useEnhancedVariables}
                />
                <Label htmlFor="enhancedRecipientFormat">
                  Enhanced Recipient Format
                  <span className="ml-1 text-xs text-muted-foreground">(email@example.com|firstname=John)</span>
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between sm:space-x-4 space-y-2 sm:space-y-0">
        <Button 
          type="button" 
          variant="secondary"
          className="flex items-center justify-center"
          onClick={onSendTestEmail}
          disabled={isSending || !config.htmlFile}
        >
          <Send className="mr-2 h-4 w-4" />
          Send Test Email
        </Button>
        <Button 
          type="submit" 
          className="flex items-center justify-center"
          disabled={isSending || !config.htmlFile || !config.subjectsFile || !config.recipientsFile || recipientCount === 0}
        >
          {isSending ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Start Sending Campaign
            </>
          )}
        </Button>
      </div>
      {/* Enhanced Variables Modal */}
      <EnhancedVariablesModal
        isOpen={showEnhancedVariablesModal}
        onClose={() => setShowEnhancedVariablesModal(false)}
      />
    </form>
  );
}
