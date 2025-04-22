import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { isAuthenticated } from '@/lib/authService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [location, navigate] = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate, location]);
  
  // If not authenticated, show a loading indicator briefly
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }
  
  // If authenticated, render the children components
  return <>{children}</>;
}