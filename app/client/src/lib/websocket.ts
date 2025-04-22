/**
 * WebSocket connection manager for email campaign status updates
 */

type MessageHandler = (data: any) => void;

interface WebSocketMessage {
  type: string;
  message?: string;
  logType?: string;
  campaignId?: number;
  total?: number;
  sent?: number;
  success?: number;
  failed?: number;
  completed?: boolean;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private reconnectTimeout: number = 2000; // 2 seconds
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private url: string = '';

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    // Determine WebSocket URL (use wss for https, ws for http)
    // We specifically create a direct WebSocket connection to the root path
    this.url = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
    
    try {
      console.log(`Connecting to WebSocket at ${this.url}`);
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          
          // Dispatch message to appropriate handlers based on type
          if (data.type && this.messageHandlers.has(data.type)) {
            const handlers = this.messageHandlers.get(data.type) || [];
            handlers.forEach(handler => handler(data));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        console.log(`WebSocket disconnected with code: ${event.code}`);
        this.socket = null;
        
        // Attempt to reconnect if not closed deliberately
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), this.reconnectTimeout);
        } else {
          console.error('Max reconnect attempts reached. Please reload the page.');
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Register a handler for a specific message type
   */
  registerHandler(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  /**
   * Remove a handler for a specific message type
   */
  unregisterHandler(type: string, handler: MessageHandler): void {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type) || [];
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();