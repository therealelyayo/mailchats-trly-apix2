import React, { ReactNode } from 'react';

interface FlutterComponentWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * This component prevents click events from bubbling up to parent components
 * Specifically designed to prevent theme changes when interacting with Flutter components
 */
export default function FlutterComponentWrapper({ 
  children, 
  className = "" 
}: FlutterComponentWrapperProps) {
  // Stop propagation of click events
  const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`flutter-component-wrapper ${className}`} 
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onPointerDown={stopPropagation}
    >
      {children}
    </div>
  );
}