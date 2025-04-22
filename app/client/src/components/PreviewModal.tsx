import { useState } from "react";
import TemplatePreviewWizard from "./TemplatePreviewWizard";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTest: (updatedContent?: string) => void;
  fromName: string;
  htmlPreview: { html: string; subject: string } | null;
}

export default function PreviewModal({ isOpen, onClose, onSendTest, fromName, htmlPreview }: PreviewModalProps) {
  // Use our new TemplatePreviewWizard instead of the previous implementation
  return (
    <TemplatePreviewWizard
      isOpen={isOpen}
      onClose={onClose}
      onSendTest={onSendTest}
      fromName={fromName}
      htmlPreview={htmlPreview}
    />
  );
}