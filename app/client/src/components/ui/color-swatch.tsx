import * as React from "react";
import { cn } from "@/lib/utils";

interface ColorSwatchProps extends React.HTMLAttributes<HTMLDivElement> {
  color: string;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ColorSwatch({
  color,
  selected = false,
  size = 'md',
  showLabel = false,
  className,
  ...props
}: ColorSwatchProps) {
  // Size maps
  const sizeMap = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)} {...props}>
      <div 
        className={cn(
          "rounded-full border transition-all", 
          sizeMap[size], 
          selected && "ring-2 ring-primary ring-offset-2"
        )}
        style={{ backgroundColor: color }}
      />
      {showLabel && (
        <span className="text-xs font-medium">{color}</span>
      )}
    </div>
  );
}