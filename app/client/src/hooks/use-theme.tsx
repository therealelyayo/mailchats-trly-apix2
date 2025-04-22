import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export type ThemeVariant = 'professional' | 'vibrant' | 'tint';
export type ThemeAppearance = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  variant: ThemeVariant;
  primary: string;
  appearance: ThemeAppearance;
  radius: number;
  name: string;
}

interface ThemeContextType {
  currentTheme: ThemeConfig;
  availableThemes: ThemeConfig[];
  setTheme: (theme: ThemeConfig) => void;
}

const defaultTheme: ThemeConfig = {
  variant: 'professional',
  primary: '#000000',
  appearance: 'dark',
  radius: 0.5,
  name: 'Professional Black'
};

// Predefined theme options
const presetThemes: ThemeConfig[] = [
  {
    name: 'Professional Black',
    variant: 'professional',
    primary: '#000000',
    appearance: 'dark',
    radius: 0.5
  },
  {
    name: 'Tech Dark',
    variant: 'professional',
    primary: '#333333',
    appearance: 'dark',
    radius: 0.5
  },
  {
    name: 'Slate Gray',
    variant: 'professional',
    primary: '#708090',
    appearance: 'dark',
    radius: 0.5
  },
  {
    name: 'Navy Dark',
    variant: 'vibrant',
    primary: '#000080',
    appearance: 'dark',
    radius: 0.5
  },
  {
    name: 'Midnight Blue',
    variant: 'vibrant',
    primary: '#191970',
    appearance: 'dark',
    radius: 0.5
  },
  {
    name: 'Charcoal',
    variant: 'tint',
    primary: '#36454F',
    appearance: 'dark',
    radius: 0.5
  },
  {
    name: 'Minimal White',
    variant: 'professional',
    primary: '#FFFFFF',
    appearance: 'light',
    radius: 0.5
  },
  {
    name: 'Silver',
    variant: 'professional',
    primary: '#C0C0C0',
    appearance: 'light',
    radius: 0.5
  },
  {
    name: 'Platinum',
    variant: 'professional',
    primary: '#E5E4E2',
    appearance: 'light',
    radius: 0.5
  }
];

const ThemeContext = createContext<ThemeContextType | null>(null);

function getCurrentTheme(): ThemeConfig {
  try {
    // Try to read from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return JSON.parse(savedTheme);
    }
  } catch (e) {
    console.error('Failed to parse saved theme', e);
  }
  
  // Default to black theme if nothing is saved
  return defaultTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(getCurrentTheme);
  const { toast } = useToast();

  // Apply theme properties to the document root when the theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme variant
    root.setAttribute('data-theme-variant', currentTheme.variant);
    
    // Apply appearance mode (light/dark)
    if (currentTheme.appearance === 'system') {
      // Use system preference for light/dark mode
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    } else {
      // Use explicit user setting for light/dark mode
      root.classList.toggle('dark', currentTheme.appearance === 'dark');
    }
    
    // Apply border radius setting
    root.style.setProperty('--radius', `${currentTheme.radius}rem`);
    
    // Update theme.json via API call
    updateThemeOnServer(currentTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', JSON.stringify(currentTheme));
  }, [currentTheme]);
  
  // Listen for system color scheme changes if appearance is set to 'system'
  useEffect(() => {
    if (currentTheme.appearance !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentTheme.appearance]);

  const setTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme);
    
    // Show a toast notification
    toast({
      title: 'Theme Updated',
      description: `Theme changed to ${theme.name}`,
      duration: 2000,
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        availableThemes: presetThemes,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Helper function to update theme on the server
async function updateThemeOnServer(theme: ThemeConfig) {
  try {
    await fetch('/api/theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(theme),
    });
  } catch (error) {
    console.error('Failed to update theme on server', error);
  }
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}