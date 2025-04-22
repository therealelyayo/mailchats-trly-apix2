import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sendTestEmail } from "@/lib/emailService";
import { EmailConfiguration } from "@/pages/Home";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromName: string;
  config: EmailConfiguration;
  addConsoleMessage: (message: string, type?: string) => void;
}

export default function TestEmailModal({ 
  isOpen, 
  onClose, 
  fromName,
  config,
  addConsoleMessage
}: TestEmailModalProps) {
  const [testEmail, setTestEmail] = useState("user@example.com");
  const [testName, setTestName] = useState("user");
  const [testDomain, setTestDomain] = useState("example.com");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extract name and domain when email changes
  useEffect(() => {
    try {
      const [name, domain] = testEmail.split('@');
      if (name && domain) {
        setTestName(name);
        setTestDomain(domain);
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }, [testEmail]);
  
  // Generate a random test email
  const generateRandomEmail = () => {
    const names = ["john", "sarah", "michael", "emma", "alex", "lisa"];
    const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "example.com"];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    
    setTestEmail(`${name}${randomNum}@${domain}`);
  };
  
  async function handleSendTest() {
    if (!testEmail) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!config.htmlFile) {
      setError("HTML template file is required");
      return;
    }
    
    setError(null);
    setIsSending(true);
    addConsoleMessage(`Sending test email to ${testEmail}...`);
    
    try {
      // Pass template variables for personalization
      const result = await sendTestEmail(config, testEmail, {
        name: testName,
        domain: testDomain
      });
      
      if (result.success) {
        addConsoleMessage(`Test email sent successfully to ${testEmail} with personalized content`, "success");
        onClose();
      } else {
        setError(result.message);
        addConsoleMessage(`Failed to send test email: ${result.message}`, "error");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      addConsoleMessage(`Error sending test email: ${message}`, "error");
    } finally {
      setIsSending(false);
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Send Test Email
            <Badge variant="outline" className="text-xs px-2 py-1 rounded-md flex items-center ml-2">
              <Mail className="h-3 w-3 mr-1" />
              From: {fromName}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Send a test email with personalized content to verify your template.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          <div>
            <Label htmlFor="testEmail" className="text-sm mb-1.5 block">
              Test Recipient Email
            </Label>
            <div className="flex gap-2">
              <Input
                id="testEmail"
                placeholder="recipient@example.com"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={generateRandomEmail}
                title="Generate random test email"
                type="button"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              This email will receive the test message and its information will replace variables in your template.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testName" className="text-sm mb-1.5 block">
                Name (before @)
              </Label>
              <Input
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                disabled={isSending}
              />
            </div>
            
            <div>
              <Label htmlFor="testDomain" className="text-sm mb-1.5 block">
                Domain (after @)
              </Label>
              <Input
                id="testDomain"
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value)}
                disabled={isSending}
              />
            </div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md mt-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              The test email will include these mail merge variables:
            </p>
            <p className="text-xs text-blue-500 mb-2">
              Both single-brace {"{variable}"} and double-brace {"{{variable}}"} formats are supported!
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="grid grid-cols-2 gap-x-2">
                <div>
                  <span className="font-mono text-primary">{"{email}"}</span> / <span className="font-mono text-primary">{"{{recipient_email}}"}</span>
                </div>
                <div>= {testEmail}</div>
              </div>
              <div className="grid grid-cols-2 gap-x-2">
                <div>
                  <span className="font-mono text-primary">{"{emailname}"}</span> / <span className="font-mono text-primary">{"{{emailname}}"}</span>
                </div>
                <div>= {testName}</div>
              </div>
              <div className="grid grid-cols-2 gap-x-2">
                <div>
                  <span className="font-mono text-primary">{"{domain}"}</span> / <span className="font-mono text-primary">{"{{domain}}"}</span>
                </div>
                <div>= {testDomain}</div>
              </div>
              <div className="grid grid-cols-2 gap-x-2">
                <div>
                  <span className="font-mono text-primary bg-yellow-100/50 px-1">{"{time}"}</span> / <span className="font-mono text-primary bg-yellow-100/50 px-1">{"{{time}}"}</span>
                </div>
                <div>= Current time <span className="text-yellow-600 font-medium">(New!)</span></div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSendTest} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Test Email"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}