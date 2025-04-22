import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Braces } from "lucide-react";
import EnhancedVariableAnalysis from './EnhancedVariableAnalysis';

interface EnhancedVariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnhancedVariablesModal({ isOpen, onClose }: EnhancedVariablesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Braces className="h-5 w-5 text-primary" />
            Enhanced Personalization Variables
          </DialogTitle>
          <DialogDescription>
            Personalize your emails with advanced variables to increase engagement
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <EnhancedVariableAnalysis onClose={onClose} />
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}