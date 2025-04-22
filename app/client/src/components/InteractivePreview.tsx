import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Monitor,
  Tablet,
  SunMoon,
  Moon,
  Eye,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Mail,
  Layout,
  Code,
} from 'lucide-react';

interface InteractivePreviewProps {
  htmlContent: string;
  subject: string;
  onApplyChanges?: (updatedHtml: string) => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type ThemeMode = 'light' | 'dark';

export default function InteractivePreview({ 
  htmlContent, 
  subject,
  onApplyChanges
}: InteractivePreviewProps) {
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [zoom, setZoom] = useState<number>(100);
  const [showHeader, setShowHeader] = useState<boolean>(true);
  const [editedHtml, setEditedHtml] = useState<string>(htmlContent);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [variableValues, setVariableValues] = useState<{[key: string]: string}>({
    email: 'recipient@example.com',
    emailname: 'recipient',
    domain: 'example.com',
    time: new Date().toLocaleTimeString(),
  });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Update edited HTML when htmlContent prop changes
  useEffect(() => {
    setEditedHtml(htmlContent);
  }, [htmlContent]);
  
  // Reset zoom when device changes
  useEffect(() => {
    setZoom(100);
  }, [device]);
  
  // Refresh preview with new values
  const refreshPreview = () => {
    setPreviewKey(prevKey => prevKey + 1);
  };
  
  // Apply variable substitutions to HTML
  const getProcessedHtml = (): string => {
    let processed = editedHtml;
    
    // Process both single and double brace formats
    Object.entries(variableValues).forEach(([key, value]) => {
      // Replace {{variable}} format
      processed = processed.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'), 
        value
      );
      
      // Replace {variable} format
      processed = processed.replace(
        new RegExp(`\\{${key}\\}`, 'g'), 
        value
      );
    });
    
    // Add dark mode styles if needed
    if (theme === 'dark') {
      processed = `
        <style>
          body {
            background-color: #1a1a1a !important;
            color: #e0e0e0 !important;
          }
          a { color: #3d8bfd !important; }
          h1, h2, h3, h4, h5, h6 { color: #ffffff !important; }
        </style>
        ${processed}
      `;
    }
    
    // Add email header if needed
    if (showHeader) {
      processed = `
        <div style="border-bottom: 1px solid #e0e0e0; padding: 10px; background-color: ${theme === 'dark' ? '#2a2a2a' : '#f9f9f9'}; color: ${theme === 'dark' ? '#e0e0e0' : '#333333'};">
          <div style="font-family: Arial, sans-serif;">
            <div style="font-weight: bold; margin-bottom: 5px;">Subject: ${subject}</div>
            <div>From: Email Campaign Manager &lt;noreply@email-campaign.com&gt;</div>
            <div>To: ${variableValues.email}</div>
          </div>
        </div>
        ${processed}
      `;
    }
    
    return processed;
  };
  
  // Handle HTML editor changes
  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedHtml(e.target.value);
  };
  
  // Apply changes to parent component
  const handleApplyChanges = () => {
    if (onApplyChanges) {
      onApplyChanges(editedHtml);
    }
  };
  
  // Extract variable names from HTML content
  const extractVariables = (): string[] => {
    const variables = new Set<string>();
    
    // Match {{variable}} pattern
    const doubleBraceMatches = editedHtml.match(/\\{\\{([^}]+)\\}\\}/g) || [];
    doubleBraceMatches.forEach(match => {
      const variable = match.replace(/\\{\\{|\\}\\}/g, '');
      variables.add(variable);
    });
    
    // Match {variable} pattern
    const singleBraceMatches = editedHtml.match(/\\{([^}]+)\\}/g) || [];
    singleBraceMatches.forEach(match => {
      const variable = match.replace(/\\{|\\}/g, '');
      variables.add(variable);
    });
    
    return Array.from(variables);
  };
  
  // Update a specific variable value
  const updateVariableValue = (name: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Render device frame
  const renderDeviceFrame = () => {
    const deviceStyles: Record<DeviceType, React.CSSProperties> = {
      desktop: { width: '100%', maxWidth: '900px', height: '600px', border: '1px solid #e0e0e0' },
      tablet: { width: '768px', height: '1024px', border: '12px solid #e0e0e0', borderRadius: '20px' },
      mobile: { width: '375px', height: '667px', border: '16px solid #e0e0e0', borderRadius: '30px' }
    };
    
    const zoomStyles: React.CSSProperties = {
      transform: `scale(${zoom / 100})`,
      transformOrigin: 'top center',
      width: '100%',
      height: '100%',
      transition: 'transform 0.2s ease-in-out'
    };
    
    return (
      <div className="flex justify-center mt-4 overflow-auto" style={{ maxHeight: '70vh' }}>
        <div style={deviceStyles[device]}>
          <div style={{ overflow: 'hidden', height: '100%' }}>
            <iframe
              key={previewKey}
              ref={iframeRef}
              title="Email Preview"
              srcDoc={getProcessedHtml()}
              style={zoomStyles}
              className="w-full h-full bg-white border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Render variable controls
  const renderVariableControls = () => {
    const knownVariables = ['email', 'emailname', 'domain', 'time', 'recipient_email'];
    // Combine known variables with any extracted from the template
    const allVariables = Array.from(new Set([...knownVariables, ...extractVariables()]));
    
    return (
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {allVariables.map(variable => (
          <div key={variable} className="space-y-2">
            <Label htmlFor={`var-${variable}`}>{variable}</Label>
            <Input
              id={`var-${variable}`}
              value={variableValues[variable] || ''}
              onChange={(e) => updateVariableValue(variable, e.target.value)}
              className="w-full"
            />
          </div>
        ))}
        <div className="col-span-full flex justify-end mt-2">
          <Button onClick={refreshPreview} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Preview
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="w-full overflow-hidden">
      <div className="border-b">
        <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 py-2 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code className="h-4 w-4" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="variables" className="gap-2">
                <Layout className="h-4 w-4" />
                Variables
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              {activeTab === 'preview' && (
                <>
                  <Select value={device} onValueChange={(v) => setDevice(v as DeviceType)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Device" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <span>Desktop</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="tablet">
                        <div className="flex items-center gap-2">
                          <Tablet className="h-4 w-4" />
                          <span>Tablet</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mobile">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <span>Mobile</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  >
                    {theme === 'light' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <SunMoon className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                      disabled={zoom <= 50}
                      title="Zoom out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline" className="text-xs">
                      {zoom}%
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setZoom(Math.min(150, zoom + 10))}
                      disabled={zoom >= 150}
                      title="Zoom in"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-header"
                      checked={showHeader}
                      onCheckedChange={setShowHeader}
                    />
                    <Label htmlFor="show-header" className="text-xs">
                      Email Header
                    </Label>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <TabsContent value="preview" className="p-0 m-0">
            {renderDeviceFrame()}
          </TabsContent>
          
          <TabsContent value="code" className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Edit HTML</h3>
                <Button onClick={handleApplyChanges} disabled={editedHtml === htmlContent}>
                  Apply Changes
                </Button>
              </div>
              <textarea
                className="w-full h-[500px] font-mono text-sm p-4 border rounded-md resize-none bg-muted/50"
                value={editedHtml}
                onChange={handleHtmlChange}
                spellCheck={false}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="variables" className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Personalization Variables</h3>
                <p className="text-sm text-muted-foreground">
                  Customize the values that will replace variables in your email template.
                  The preview will update to show how your email will look with these values.
                </p>
              </div>
              {renderVariableControls()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}