import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  getAvailableVariables, 
  parseRecipientLine,
  applyEnhancedMailMerge,
  formatEnhancedRecipientLine,
  extractVariablesFromTemplate,
  generateSampleRecipient,
  PersonalizationVariable
} from '@/lib/enhancedVariablesService';
import { useToast } from './use-toast';

interface EnhancedVariablesContextType {
  variables: PersonalizationVariable[];
  isLoading: boolean;
  error: string | null;
  sampleRecipient: string;
  setSampleRecipient: (value: string) => void;
  parseRecipient: (recipientLine: string) => Promise<Record<string, string>>;
  preview: (template: string, recipientLine: string) => Promise<string>;
  extractVariables: (template: string) => string[];
  formatRecipientLine: (email: string, customFields?: Record<string, string>) => string;
  loadSampleRecipient: () => void;
}

const EnhancedVariablesContext = createContext<EnhancedVariablesContextType | null>(null);

export const EnhancedVariablesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [variables, setVariables] = useState<PersonalizationVariable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleRecipient, setSampleRecipient] = useState<string>('john.doe@example.com|firstname=John|lastname=Doe');

  useEffect(() => {
    const fetchVariables = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getAvailableVariables();
        setVariables(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch personalization variables';
        setError(message);
        toast({
          title: 'Error fetching variables',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVariables();
  }, [toast]);

  const parseRecipient = async (recipientLine: string): Promise<Record<string, string>> => {
    try {
      return await parseRecipientLine(recipientLine);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse recipient line';
      toast({
        title: 'Error parsing recipient',
        description: message,
        variant: 'destructive',
      });
      return {};
    }
  };

  const preview = async (template: string, recipientLine: string): Promise<string> => {
    try {
      return await applyEnhancedMailMerge(template, recipientLine);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply mail merge';
      toast({
        title: 'Error applying mail merge',
        description: message,
        variant: 'destructive',
      });
      return template;
    }
  };

  const extractVariables = (template: string): string[] => {
    return extractVariablesFromTemplate(template);
  };

  const formatRecipientLine = (email: string, customFields?: Record<string, string>): string => {
    return formatEnhancedRecipientLine(email, customFields);
  };

  const loadSampleRecipient = (): void => {
    const sample = generateSampleRecipient();
    setSampleRecipient(sample);
    toast({
      title: 'Sample recipient loaded',
      description: 'A sample recipient with all available fields has been loaded.',
    });
  };

  return (
    <EnhancedVariablesContext.Provider
      value={{
        variables,
        isLoading,
        error,
        sampleRecipient,
        setSampleRecipient,
        parseRecipient,
        preview,
        extractVariables,
        formatRecipientLine,
        loadSampleRecipient,
      }}
    >
      {children}
    </EnhancedVariablesContext.Provider>
  );
};

export const useEnhancedVariables = () => {
  const context = useContext(EnhancedVariablesContext);
  
  if (!context) {
    throw new Error('useEnhancedVariables must be used within an EnhancedVariablesProvider');
  }
  
  return context;
};