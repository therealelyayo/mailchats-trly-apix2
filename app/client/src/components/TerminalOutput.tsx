import { useEffect, useRef } from "react";

interface TerminalOutputProps {
  messages: Array<{
    message: string;
    type: string;
  }>;
}

export default function TerminalOutput({ messages }: TerminalOutputProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Get CSS class based on message type
  const getTypeClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      case 'command':
        return 'text-purple-500 font-bold';
      default:
        return 'text-slate-300';
    }
  };
  
  return (
    <div 
      ref={terminalRef}
      className="h-[300px] overflow-auto bg-slate-900 rounded-md p-3 font-mono text-xs"
    >
      {messages.map((msg, index) => (
        <div key={index} className={`${getTypeClass(msg.type)} mb-1 whitespace-pre-wrap`}>
          {msg.message}
        </div>
      ))}
      
      {messages.length === 0 && (
        <div className="text-slate-500 italic">No messages to display</div>
      )}
    </div>
  );
}