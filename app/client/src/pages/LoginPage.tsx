import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyPassword, isAuthenticated } from '@/lib/authService';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is already authenticated
  if (isAuthenticated()) {
    setLocation('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await verifyPassword(password);
      
      if (result.success) {
        setSuccess(true);
        toast({
          title: "Authentication successful",
          description: "Redirecting to the application...",
          variant: "default",
        });
        
        // Short delay before redirect
        setTimeout(() => {
          setLocation('/');
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background p-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Email Campaign Manager</CardTitle>
            <CardDescription className="text-center">
              Please enter your license key to access the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
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
                
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    License Key
                    <span className="text-xs ml-2 text-muted-foreground">(Hint: "code to my email")</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your license key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || success}
                    autoComplete="current-password"
                    className="bg-muted/40"
                  />
                </div>
                
                <Button type="submit" disabled={loading || success || !password.trim()}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {success && <CheckCircle className="mr-2 h-4 w-4" />}
                  {loading ? 'Verifying...' : success ? 'Authenticated' : 'Sign In'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-xs text-muted-foreground text-center">
              <p>Use the default key "code to my email" to access the application</p>
              <p>Or enter your license key from https://iowagroups.center/Licensed.txt</p>
              <p>For support, contact support@emailcampaignmanager.com</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}