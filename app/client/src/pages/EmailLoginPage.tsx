import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendVerificationCode, verifyCode, verifyPassword, isAuthenticated } from '@/lib/authService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EmailLoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [authTab, setAuthTab] = useState<'email' | 'license'>('email');
  const [licenseKey, setLicenseKey] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      setLocation('/app');
    }
  }, [setLocation]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await sendVerificationCode(email);
      
      if (result.success) {
        setCodeSent(true);
        
        toast({
          title: "Verification code sent",
          description: "Please check your email for the verification code",
          variant: "default",
        });
      } else {
        setError(result.message);
        toast({
          title: "Failed to send code",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to send verification code',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await verifyCode(email, code);
      
      if (result.success) {
        setSuccess(true);
        toast({
          title: "Authentication successful",
          description: "Redirecting to the application...",
          variant: "default",
        });
        
        // Short delay before redirect
        setTimeout(() => {
          setLocation('/app');
        }, 1000);
      } else {
        setError(result.message);
        toast({
          title: "Verification failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Verification failed',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <Card className="w-full border-accent shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-extra-bold high-contrast">Email Campaign Manager</CardTitle>
            <CardDescription className="text-center text-bold">
              Sign in with your email
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="email" value={authTab} onValueChange={(v) => setAuthTab(v as 'email' | 'license')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email Verification</TabsTrigger>
                <TabsTrigger value="license">License Key</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
                {codeSent ? (
                  <form onSubmit={handleVerifyCode}>
                    <div className="grid gap-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      {success && (
                        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertTitle>Success</AlertTitle>
                          <AlertDescription>Authentication successful! Redirecting...</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="grid gap-1">
                        <Label htmlFor="verification-code">Verification Code</Label>
                        <Input
                          id="verification-code"
                          type="text"
                          placeholder="Enter the 6-digit code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          disabled={loading || success}
                          className="bg-muted/40"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          A verification code has been sent to {email}
                        </p>
                      </div>
                      
                      <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                        <div className="flex flex-col">
                          <p className="text-xs">
                            Please check your email inbox for the verification code.
                          </p>
                        </div>
                      </Alert>
                      
                      <div className="flex justify-between">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setCodeSent(false)}
                          disabled={loading || success}
                        >
                          Back
                        </Button>
                        
                        <Button 
                          type="submit" 
                          disabled={loading || success || !code.trim()}
                          className="button-gradient text-bold"
                        >
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {success && <CheckCircle className="mr-2 h-4 w-4" />}
                          {loading ? 'Verifying...' : success ? 'Verified' : 'Verify Code'}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSendCode}>
                    <div className="grid gap-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          className="bg-muted/40"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={loading || !email.includes('@')}
                        className="flex items-center justify-center button-gradient text-bold"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Verification Code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
              
              <TabsContent value="license">
                <div className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>Authentication successful! Redirecting...</AlertDescription>
                    </Alert>
                  )}
                
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Alternative Sign-in</AlertTitle>
                    <AlertDescription>
                      You can also sign in with a license key if you have one.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="license-key">
                      License Key
                      <span className="text-xs ml-2 text-muted-foreground">(Hint: "code to my email")</span>
                    </Label>
                    <Input
                      id="license-key"
                      type="password"
                      placeholder="Enter your license key"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      className="bg-muted/40"
                    />
                  </div>
                  
                  <Button 
                    onClick={async () => {
                      if (!licenseKey.trim()) return;
                      
                      setLoading(true);
                      setError(null);
                      
                      try {
                        // Use directly imported verifyPassword function
                        const result = await verifyPassword(licenseKey);
                        
                        if (result.success) {
                          setSuccess(true);
                          toast({
                            title: "Authentication successful",
                            description: "Redirecting to the application...",
                            variant: "default",
                          });
                          
                          // Short delay before redirect
                          setTimeout(() => {
                            setLocation('/app');
                          }, 1000);
                        } else {
                          setError(result.message);
                          toast({
                            title: "Authentication failed",
                            description: result.message,
                            variant: "destructive",
                          });
                        }
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Authentication failed');
                        toast({
                          title: "Error",
                          description: err instanceof Error ? err.message : 'Authentication failed',
                          variant: "destructive",
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading || success || !licenseKey.trim()}
                    className="w-full button-gradient text-bold"
                  >
                    {loading ? 'Verifying...' : 'Verify License Key'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-xs text-muted-foreground text-center">
              <p>Enter your email to receive a one-time verification code</p>
              <p>Or use license key "code to my email" to access the application</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}