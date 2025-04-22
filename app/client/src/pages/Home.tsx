import { useState, useEffect } from "react";
import ConfigurationForm from "@/components/ConfigurationForm";
import StatusPanel from "@/components/StatusPanel";
import PreviewModal from "@/components/PreviewModal";
import TestEmailModal from "@/components/TestEmailModal";
import ConfirmModal from "@/components/ConfirmModal";
import ThemePanel from "@/components/ThemePanel";
import ProductivityWidgets from "@/components/ProductivityWidgets";
import LiveChat from "@/components/LiveChat";
import { Badge } from "@/components/ui/badge";
import { Mail, HelpCircle, Paintbrush, LogOut, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { startEmailCampaign } from "@/lib/emailService";
import { websocketService } from "@/lib/websocket";

interface EmailStatus {
  isSending: boolean;
  total: number;
  sent: number;
  success: number;
  failed: number;
  startTime: number | null;
}

export interface EmailConfiguration {
  htmlFile: File | null;
  subjectsFile: File | null;
  recipientsFile: File | null;
  fromName: string;
  sendMethod: "API" | "SMTP";
  apiKey: string;
  smtpMode: "localhost" | "smtp";
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpCredentialsFile: File | null;
  rotateSmtp: boolean;
  sendSpeed: number;
  trackOpens: boolean;
  trackLinks: boolean;
  trackReplies: boolean;
  useEnhancedVariables: boolean;
  enhancedRecipientFormat: boolean;
}

// Helper function to get saved data from localStorage
const getSavedConfig = (): Partial<EmailConfiguration> => {
  try {
    const savedConfig = localStorage.getItem('emailConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (e) {
    console.error('Failed to parse saved config', e);
  }
  return {};
};

const getSavedEmailStatus = (): Partial<EmailStatus> => {
  try {
    const savedStatus = localStorage.getItem('emailStatus');
    if (savedStatus) {
      return JSON.parse(savedStatus);
    }
  } catch (e) {
    console.error('Failed to parse saved status', e);
  }
  return {};
};

const getSavedRecipientCount = (): number => {
  try {
    const savedCount = localStorage.getItem('recipientCount');
    if (savedCount) {
      return parseInt(savedCount, 10);
    }
  } catch (e) {
    console.error('Failed to parse recipient count', e);
  }
  return 0;
};

const getSavedConsoleMessages = (): Array<{ message: string; type: string }> => {
  try {
    const savedMessages = localStorage.getItem('consoleMessages');
    if (savedMessages) {
      return JSON.parse(savedMessages);
    }
  } catch (e) {
    console.error('Failed to parse console messages', e);
  }
  return [
    { message: "=================Welcome to Thrly Api Sender V2==================", type: "command" },
    { message: "License validated successfully", type: "success" },
    { message: "Ready to send emails. Configure options and click Start.", type: "info" },
  ];
};

export default function Home() {
  // Initialize with defaults + any saved values from localStorage
  const savedConfig = getSavedConfig();
  const [config, setConfig] = useState<EmailConfiguration>({
    htmlFile: null,
    subjectsFile: null,
    recipientsFile: null,
    fromName: savedConfig.fromName || "Email Support",
    sendMethod: savedConfig.sendMethod || "API",
    apiKey: savedConfig.apiKey || "nyk_v0_IDxmJtl9h5BGx1ZCpKBxssPwrLTTmrDheQoZhBFNzeYiFSyQFeDOsq61FAIvPGOf",
    smtpMode: savedConfig.smtpMode || "localhost",
    smtpHost: savedConfig.smtpHost || "",
    smtpPort: savedConfig.smtpPort || 587,
    smtpUsername: savedConfig.smtpUsername || "",
    smtpPassword: savedConfig.smtpPassword || "",
    smtpCredentialsFile: null,
    rotateSmtp: savedConfig.rotateSmtp || false,
    sendSpeed: savedConfig.sendSpeed || 10,
    trackOpens: savedConfig.trackOpens !== undefined ? savedConfig.trackOpens : true,
    trackLinks: savedConfig.trackLinks !== undefined ? savedConfig.trackLinks : true,
    trackReplies: savedConfig.trackReplies !== undefined ? savedConfig.trackReplies : false,
    useEnhancedVariables: savedConfig.useEnhancedVariables !== undefined ? savedConfig.useEnhancedVariables : true,
    enhancedRecipientFormat: savedConfig.enhancedRecipientFormat !== undefined ? savedConfig.enhancedRecipientFormat : false,
  });

  const savedStatus = getSavedEmailStatus();
  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    isSending: false, // Always start with not sending, regardless of saved state
    total: savedStatus.total || 0,
    sent: savedStatus.sent || 0,
    success: savedStatus.success || 0,
    failed: savedStatus.failed || 0,
    startTime: savedStatus.startTime || null,
  });

  const [recipientCount, setRecipientCount] = useState(getSavedRecipientCount());
  const [consoleMessages, setConsoleMessages] = useState<Array<{ message: string; type: string }>>(
    getSavedConsoleMessages()
  );

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  const [htmlPreview, setHtmlPreview] = useState<{
    html: string;
    subject: string;
  } | null>(null);

  const addConsoleMessage = (message: string, type: string = "info") => {
    setConsoleMessages(prev => [...prev, { message, type }]);
  };

  const handleStartSending = () => {
    setIsConfirmModalOpen(true);
  };

  // Save data to localStorage whenever it changes
  useEffect(() => {
    // Save config (excluding file objects)
    const configToSave = { ...config };
    // File objects can't be serialized to JSON, so create a new object without them
    const serializable = {
      fromName: configToSave.fromName,
      sendMethod: configToSave.sendMethod,
      apiKey: configToSave.apiKey,
      smtpMode: configToSave.smtpMode,
      smtpHost: configToSave.smtpHost,
      smtpPort: configToSave.smtpPort,
      smtpUsername: configToSave.smtpUsername,
      smtpPassword: configToSave.smtpPassword,
      rotateSmtp: configToSave.rotateSmtp,
      sendSpeed: configToSave.sendSpeed,
      trackOpens: configToSave.trackOpens,
      trackLinks: configToSave.trackLinks,
      trackReplies: configToSave.trackReplies,
      useEnhancedVariables: configToSave.useEnhancedVariables,
      enhancedRecipientFormat: configToSave.enhancedRecipientFormat
    };
    
    localStorage.setItem('emailConfig', JSON.stringify(serializable));
  }, [config]);
  
  useEffect(() => {
    localStorage.setItem('emailStatus', JSON.stringify(emailStatus));
  }, [emailStatus]);
  
  useEffect(() => {
    localStorage.setItem('recipientCount', recipientCount.toString());
  }, [recipientCount]);
  
  useEffect(() => {
    localStorage.setItem('consoleMessages', JSON.stringify(consoleMessages));
  }, [consoleMessages]);
  
  // Set up WebSocket connection and handlers
  useEffect(() => {
    // Handler for status updates from the server
    const handleStatusUpdate = (data: any) => {
      // Update the email status with the latest statistics
      setEmailStatus(prev => ({
        ...prev,
        sent: typeof data.sent === 'number' ? data.sent : prev.sent,
        success: typeof data.success === 'number' ? data.success : prev.success,
        failed: typeof data.failed === 'number' ? data.failed : prev.failed,
        total: typeof data.total === 'number' ? data.total : prev.total,
        isSending: data.completed ? false : prev.isSending
      }));
      
      // Log important status updates but avoid too much spam
      if (typeof data.sent === 'number') {
        if (data.sent % 5 === 0 || data.sent === 1) {
          addConsoleMessage(`Progress update: ${data.sent}/${data.total || recipientCount} emails processed`, 'info');
        }
      }
      
      // Log completion message
      if (data.completed) {
        addConsoleMessage(`Campaign complete! Sent ${data.success || 0} emails successfully with ${data.failed || 0} failures.`, 'success');
      }
    };
    
    // Handler for log messages
    const handleLogMessage = (data: any) => {
      if (data.message) {
        addConsoleMessage(data.message, data.logType || 'info');
        
        // Try to extract JSON statistics from the message
        try {
          const message = data.message.trim();
          if (message.startsWith('{') && message.endsWith('}')) {
            const jsonData = JSON.parse(message);
            
            // Check if this is a stats update
            if (jsonData.sent !== undefined || jsonData.success !== undefined || jsonData.failed !== undefined) {
              // Update stats
              setEmailStatus(prev => ({
                ...prev,
                sent: typeof jsonData.sent === 'number' ? jsonData.sent : prev.sent,
                success: typeof jsonData.success === 'number' ? jsonData.success : prev.success,
                failed: typeof jsonData.failed === 'number' ? jsonData.failed : prev.failed
              }));
            }
          }
        } catch (e) {
          // Silently ignore parsing errors
        }
      }
    };
    
    // Register WebSocket message handlers
    websocketService.registerHandler('status', handleStatusUpdate);
    websocketService.registerHandler('log', handleLogMessage);
    
    // Connect to WebSocket server
    websocketService.connect();
    
    // Cleanup on unmount
    return () => {
      websocketService.unregisterHandler('status', handleStatusUpdate);
      websocketService.unregisterHandler('log', handleLogMessage);
      websocketService.disconnect();
    };
  }, [recipientCount, addConsoleMessage]);

  const handleConfirmSend = async () => {
    setIsConfirmModalOpen(false);
    
    if (emailStatus.isSending) return;
    
    setEmailStatus({
      isSending: true,
      total: recipientCount,
      sent: 0,
      success: 0,
      failed: 0,
      startTime: Date.now(),
    });
    
    addConsoleMessage(`Starting email campaign to ${recipientCount} recipients using ${config.sendMethod} method`);
    addConsoleMessage(`Send speed: ${config.sendSpeed} emails/second`);
    
    try {
      // Use our emailService function which handles FormData correctly
      const result = await startEmailCampaign(config);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      addConsoleMessage(result.message, 'success');
      
      // WebSocket connection is already established in useEffect
      if (!websocketService.isConnected()) {
        addConsoleMessage('WebSocket not connected, reconnecting...', 'warning');
        websocketService.connect();
      }
      
    } catch (error) {
      addConsoleMessage(`Error starting campaign: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setEmailStatus(prev => ({...prev, isSending: false}));
    }
  };

  // Get current user email for live chat identification
  const userEmail = localStorage.getItem('userEmail') || 'customer@mailchats.com';
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Add LiveChat component with user info */}
      <LiveChat 
        userEmail={userEmail} 
        userName={localStorage.getItem('userName') || undefined}
        pageData={{
          page: "dashboard",
          product: "MailChats Trly APIX2",
          version: "2.0",
          licenseStatus: "active"
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Mail className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl md:text-3xl font-bold text-primary">MailChats Trly APIX2</h1>
              <span className="ml-2 bg-primary/10 px-2 py-1 rounded text-primary text-xs font-medium">Pro Edition</span>
            </div>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <HelpCircle className="mr-1 h-4 w-4" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    // Clear all data from localStorage except theme
                    const savedTheme = localStorage.getItem('theme');
                    localStorage.clear();
                    if (savedTheme) {
                      localStorage.setItem('theme', savedTheme);
                    }
                    addConsoleMessage('All application data has been wiped', 'warning');
                  }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Wipe Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" className="flex items-center" onClick={() => {
                // Log out but preserve data in localStorage for future sessions
                localStorage.setItem('wasLoggedOut', 'true');
                window.location.href = '/login';
              }}>
                <LogOut className="mr-1 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* License Status */}
        <div className="border border-black rounded-lg p-4 mb-6 flex items-center">
          <div className="bg-black text-white text-xs px-2 py-1 rounded-full font-medium mr-2">Verified</div>
          <div>
            <h2 className="text-lg font-medium">Licensed Version</h2>
            <p className="text-sm text-gray-600">Your license is active and valid</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Section */}
          <div className="lg:col-span-2">
            <ConfigurationForm 
              config={config} 
              setConfig={setConfig}
              recipientCount={recipientCount}
              setRecipientCount={setRecipientCount}
              isSending={emailStatus.isSending}
              onPreviewHtml={setHtmlPreview}
              onOpenPreviewModal={() => setIsPreviewModalOpen(true)}
              onSendTestEmail={() => setIsTestEmailModalOpen(true)}
              onStartSending={handleStartSending}
              addConsoleMessage={addConsoleMessage}
            />
          </div>

          {/* Status Panel & Widgets Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <StatusPanel 
              htmlPreview={htmlPreview}
              emailStatus={emailStatus}
              consoleMessages={consoleMessages}
            />
            
            {/* Productivity Widgets */}
            <ProductivityWidgets />
            
            {/* Theme Panel */}
            <ThemePanel />
          </div>
        </div>

        {/* Modals */}
        {isPreviewModalOpen && (
          <PreviewModal 
            htmlPreview={htmlPreview}
            fromName={config.fromName}
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            onSendTest={() => {
              setIsPreviewModalOpen(false);
              setIsTestEmailModalOpen(true);
            }}
          />
        )}

        {isTestEmailModalOpen && (
          <TestEmailModal 
            isOpen={isTestEmailModalOpen}
            fromName={config.fromName}
            config={config}
            onClose={() => setIsTestEmailModalOpen(false)}
            addConsoleMessage={addConsoleMessage}
          />
        )}

        {isConfirmModalOpen && (
          <ConfirmModal 
            isOpen={isConfirmModalOpen}
            config={config}
            recipientCount={recipientCount}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmSend}
          />
        )}
      </div>
    </div>
  );
}