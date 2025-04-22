import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import TerminalOutput from "./TerminalOutput";
import { Clock, Mail, Check, AlertTriangle, RefreshCw } from "lucide-react";

interface EmailStatus {
  isSending: boolean;
  total: number;
  sent: number;
  success: number;
  failed: number;
  startTime: number | null;
}

interface StatusPanelProps {
  htmlPreview: { html: string; subject: string } | null;
  emailStatus: EmailStatus;
  consoleMessages: Array<{ message: string; type: string }>;
}

export default function StatusPanel({ htmlPreview, emailStatus, consoleMessages }: StatusPanelProps) {
  // State for animated counters
  const [displayedSent, setDisplayedSent] = useState(0);
  const [displayedSuccess, setDisplayedSuccess] = useState(0);
  const [displayedFailed, setDisplayedFailed] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Update the timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Animate counters when values change
  useEffect(() => {
    // Immediately update if values decrease
    if (emailStatus.sent < displayedSent) {
      setDisplayedSent(emailStatus.sent);
    }
    if (emailStatus.success < displayedSuccess) {
      setDisplayedSuccess(emailStatus.success);
    }
    if (emailStatus.failed < displayedFailed) {
      setDisplayedFailed(emailStatus.failed);
    }
    
    // Smoothly animate increasing values
    const animationDuration = 200; // ms
    const animationSteps = 5;
    const sentDiff = emailStatus.sent - displayedSent;
    const successDiff = emailStatus.success - displayedSuccess;
    const failedDiff = emailStatus.failed - displayedFailed;
    
    if (sentDiff > 0 || successDiff > 0 || failedDiff > 0) {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        
        if (sentDiff > 0) {
          setDisplayedSent(prev => 
            prev + Math.ceil(sentDiff / animationSteps) > emailStatus.sent 
              ? emailStatus.sent 
              : prev + Math.ceil(sentDiff / animationSteps)
          );
        }
        
        if (successDiff > 0) {
          setDisplayedSuccess(prev => 
            prev + Math.ceil(successDiff / animationSteps) > emailStatus.success 
              ? emailStatus.success 
              : prev + Math.ceil(successDiff / animationSteps)
          );
        }
        
        if (failedDiff > 0) {
          setDisplayedFailed(prev => 
            prev + Math.ceil(failedDiff / animationSteps) > emailStatus.failed 
              ? emailStatus.failed 
              : prev + Math.ceil(failedDiff / animationSteps)
          );
        }
        
        if (step >= animationSteps) {
          clearInterval(interval);
          
          // Ensure final values match exactly
          setDisplayedSent(emailStatus.sent);
          setDisplayedSuccess(emailStatus.success);
          setDisplayedFailed(emailStatus.failed);
        }
      }, animationDuration / animationSteps);
      
      return () => clearInterval(interval);
    }
  }, [emailStatus.sent, emailStatus.success, emailStatus.failed, 
      displayedSent, displayedSuccess, displayedFailed]);
  
  // Update progress percentage when sent or total change
  useEffect(() => {
    const targetProgress = emailStatus.total > 0 
      ? Math.round((emailStatus.sent / emailStatus.total) * 100) 
      : 0;
    
    // Animate progress bar
    if (targetProgress !== displayedProgress) {
      const step = targetProgress > displayedProgress ? 1 : -1;
      const timeout = setTimeout(() => {
        setDisplayedProgress(prev => {
          const next = prev + step;
          return step > 0 
            ? Math.min(next, targetProgress) 
            : Math.max(next, targetProgress);
        });
      }, 20);
      
      return () => clearTimeout(timeout);
    }
  }, [emailStatus.sent, emailStatus.total, displayedProgress]);
  
  // Calculate progress percentage
  const progress = emailStatus.total > 0 
    ? Math.round((emailStatus.sent / emailStatus.total) * 100) 
    : 0;
  
  // Calculate elapsed time
  const elapsedTime = emailStatus.startTime 
    ? Math.floor((currentTime - emailStatus.startTime) / 1000)
    : 0;
  
  // Format elapsed time
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate estimated time remaining
  const estimatedTimeRemaining = () => {
    if (!emailStatus.startTime || emailStatus.sent === 0 || !emailStatus.isSending) {
      return '--:--:--';
    }
    
    const timePerEmail = elapsedTime / emailStatus.sent;
    const remainingEmails = emailStatus.total - emailStatus.sent;
    const remainingSeconds = Math.floor(timePerEmail * remainingEmails);
    
    return formatTime(remainingSeconds);
  };
  
  return (
    <>
      {/* Campaign Progress Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Campaign Progress</CardTitle>
          <CardDescription>
            {emailStatus.isSending 
              ? 'Currently sending emails...' 
              : emailStatus.sent > 0 
                ? 'Campaign completed' 
                : 'No active campaign'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className={emailStatus.isSending ? "transition-all duration-200" : ""}>
                {displayedProgress}%
              </span>
            </div>
            <Progress 
              value={displayedProgress} 
              className="h-2 transition-all duration-200"
            />
          </div>
          
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col space-y-1 bg-gray-100 p-2 rounded-md relative overflow-hidden">
              <div className="flex items-center text-xs text-muted-foreground">
                <Mail className="h-3 w-3 mr-1" />
                <span>Sent</span>
                {emailStatus.isSending && displayedSent > 0 && (
                  <RefreshCw className="h-3 w-3 ml-auto animate-spin text-black" />
                )}
              </div>
              <span className="font-semibold transition-all duration-200">
                <span className={emailStatus.isSending && displayedSent > 0 ? "text-black" : ""}>
                  {displayedSent}
                </span> / {emailStatus.total}
              </span>
              {/* Animation flash effect on update */}
              {emailStatus.isSending && (
                <div 
                  className="absolute inset-0 bg-gray-200 opacity-0"
                  style={{
                    animation: emailStatus.sent > 0 ? 'pulse 2s infinite' : 'none',
                    animationPlayState: emailStatus.isSending ? 'running' : 'paused'
                  }}
                />
              )}
            </div>
            
            <div className="flex flex-col space-y-1 bg-gray-200 p-2 rounded-md relative overflow-hidden">
              <div className="flex items-center text-xs text-muted-foreground">
                <Check className="h-3 w-3 mr-1" />
                <span>Success</span>
                {emailStatus.isSending && displayedSuccess > 0 && (
                  <RefreshCw className="h-3 w-3 ml-auto animate-spin text-black" />
                )}
              </div>
              <span className={`font-semibold text-black transition-all duration-200 ${
                emailStatus.isSending && displayedSuccess > 0 ? "scale-105" : ""
              }`}>
                {displayedSuccess}
              </span>
              {/* Animation flash effect on update */}
              {emailStatus.isSending && (
                <div 
                  className="absolute inset-0 bg-gray-300 opacity-0"
                  style={{
                    animation: displayedSuccess > 0 ? 'pulse 2s infinite' : 'none',
                    animationPlayState: emailStatus.isSending ? 'running' : 'paused'
                  }}
                />
              )}
            </div>
            
            <div className="flex flex-col space-y-1 bg-gray-300 p-2 rounded-md relative overflow-hidden">
              <div className="flex items-center text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>Failed</span>
                {emailStatus.isSending && displayedFailed > 0 && (
                  <RefreshCw className="h-3 w-3 ml-auto animate-spin text-black" />
                )}
              </div>
              <span className={`font-semibold text-black transition-all duration-200 ${
                emailStatus.isSending && displayedFailed > 0 ? "scale-105" : ""
              }`}>
                {displayedFailed}
              </span>
              {/* Animation flash effect on update */}
              {emailStatus.isSending && (
                <div 
                  className="absolute inset-0 bg-gray-400 opacity-0"
                  style={{
                    animation: displayedFailed > 0 ? 'pulse 2s infinite' : 'none',
                    animationPlayState: emailStatus.isSending ? 'running' : 'paused'
                  }}
                />
              )}
            </div>
            
            <div className="flex flex-col space-y-1 bg-gray-100 p-2 rounded-md">
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>Time</span>
                {emailStatus.isSending && (
                  <RefreshCw className="h-3 w-3 ml-auto animate-spin text-black" />
                )}
              </div>
              <span className="font-mono text-sm">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
          
          {/* Note: The pulse animation is defined in global CSS */}
          
          {/* Estimated time remaining */}
          {emailStatus.isSending && (
            <div className="mt-4 text-xs text-center text-muted-foreground">
              Estimated time remaining: <span className="font-mono">{estimatedTimeRemaining()}</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Console Output Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Console Output</CardTitle>
          <CardDescription>
            System messages and logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TerminalOutput messages={consoleMessages} />
        </CardContent>
      </Card>
    </>
  );
}