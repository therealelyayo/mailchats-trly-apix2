import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import SubjectGeneratorModal from './SubjectGeneratorModal';
import { useToast } from "@/hooks/use-toast";

interface SubjectGeneratorButtonProps {
  emailContent: string | (() => Promise<string>);
  onSelectSubject: (subject: string) => void;
  disabled?: boolean;
}

export default function SubjectGeneratorButton({
  emailContent,
  onSelectSubject,
  disabled = false
}: SubjectGeneratorButtonProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedContent, setLoadedContent] = useState<string>("");

  const loadContent = async () => {
    if (typeof emailContent === 'function') {
      setIsLoading(true);
      try {
        const content = await emailContent();
        setLoadedContent(content);
      } catch (error) {
        console.error("Error loading email content:", error);
        toast({
          title: "Error Loading Content",
          description: "Could not load the email content. Please try again.",
          variant: "destructive"
        });
        setLoadedContent("Error loading email content");
      } finally {
        setIsLoading(false);
      }
    } else {
      setLoadedContent(emailContent);
    }
  };

  const handleOpenModal = async () => {
    await loadContent();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleOpenModal}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4" />
            AI Subject Lines
          </>
        )}
      </Button>

      <SubjectGeneratorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        emailContent={loadedContent}
        onSelectSubject={onSelectSubject}
      />
    </>
  );
}