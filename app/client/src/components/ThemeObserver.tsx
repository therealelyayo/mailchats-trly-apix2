import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';

/**
 * Component that listens for WebSocket theme change messages
 * and responds by updating the theme context
 */
export default function ThemeObserver() {
  const { availableThemes, setTheme } = useTheme();
  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    
    // Function to create and set up WebSocket connection
    const setupWebSocket = () => {
      if (!mounted) return;
      
      try {
        // Create WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        // Close existing socket if it exists
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.close();
        }
        
        // Create new socket
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;
        
        // Connection opened
        socket.addEventListener('open', () => {
          console.log("WebSocket connected");
        });
        
        // Listen for messages
        socket.addEventListener('message', (event) => {
          if (!mounted) return;
          
          try {
            const data = JSON.parse(event.data);
            
            // Handle theme change messages
            if (data.type === 'theme-changed') {
              const newTheme = data.theme;
              
              // Find matching theme from our predefined themes or use the theme directly
              const matchingTheme = availableThemes.find(
                (theme) => theme.primary === newTheme.primary
              ) || newTheme;
              
              if (matchingTheme) {
                // Update the theme
                setTheme(matchingTheme);
                
                // Notify user
                toast({
                  title: 'Theme Updated',
                  description: `The theme has been changed to ${matchingTheme.name}`,
                  duration: 3000,
                });
              }
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        });
        
        // Handle errors
        socket.addEventListener('error', (error) => {
          console.error("WebSocket error:", error);
        });
        
        // Handle socket closure and reconnect
        socket.addEventListener('close', (event) => {
          console.log(`WebSocket disconnected with code: ${event.code}`);
          
          // Attempt to reconnect after delay, unless we're unmounting
          if (mounted && !event.wasClean) {
            if (reconnectTimeoutRef.current) {
              window.clearTimeout(reconnectTimeoutRef.current);
            }
            
            reconnectTimeoutRef.current = window.setTimeout(() => {
              console.log("Reconnecting to WebSocket");
              setupWebSocket();
            }, 2000);
          }
        });
      } catch (error) {
        console.error("Error setting up WebSocket:", error);
        
        // Attempt to reconnect after delay
        if (mounted) {
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            setupWebSocket();
          }, 5000);
        }
      }
    };
    
    // Initial WebSocket setup
    setupWebSocket();
    
    // Clean up on unmount
    return () => {
      mounted = false;
      
      // Clear any pending reconnect timeouts
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Close WebSocket connection
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [availableThemes, setTheme, toast]);

  // This is a non-visual component
  return null;
}