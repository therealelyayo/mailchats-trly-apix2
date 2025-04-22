import { useState } from "react";
import { useTheme, type ThemeConfig } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Paintbrush, Sun, Moon, Monitor } from "lucide-react";

export default function ThemeSwitcher() {
  const { currentTheme, availableThemes, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-background/80 backdrop-blur-sm border-border h-9 w-9 rounded-full"
        >
          <Paintbrush className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <div className="p-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Theme Color
          </p>
          <div className="grid grid-cols-3 gap-2">
            {availableThemes
              .filter((theme, i, arr) => 
                arr.findIndex(t => t.primary === theme.primary) === i
              )
              .slice(0, 9)
              .map((theme) => (
                <ThemeButton
                  key={theme.primary}
                  theme={theme}
                  isActive={currentTheme.primary === theme.primary}
                  onClick={() => {
                    const newTheme = {
                      ...currentTheme,
                      primary: theme.primary,
                      name: theme.name,
                    };
                    setTheme(newTheme);
                  }}
                />
              ))}
          </div>
        </div>
        <div className="p-2 pt-0">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Appearance
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={currentTheme.appearance === "light" ? "default" : "outline"}
              size="sm"
              className="justify-start"
              onClick={() => {
                setTheme({
                  ...currentTheme,
                  appearance: "light",
                });
              }}
            >
              <Sun className="h-3.5 w-3.5 mr-1" />
              Light
            </Button>
            <Button
              variant={currentTheme.appearance === "dark" ? "default" : "outline"}
              size="sm"
              className="justify-start"
              onClick={() => {
                setTheme({
                  ...currentTheme,
                  appearance: "dark",
                });
              }}
            >
              <Moon className="h-3.5 w-3.5 mr-1" />
              Dark
            </Button>
            <Button
              variant={currentTheme.appearance === "system" ? "default" : "outline"}
              size="sm"
              className="justify-start"
              onClick={() => {
                setTheme({
                  ...currentTheme,
                  appearance: "system",
                });
              }}
            >
              <Monitor className="h-3.5 w-3.5 mr-1" />
              Auto
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ThemeButtonProps {
  theme: ThemeConfig;
  isActive: boolean;
  onClick: () => void;
}

function ThemeButton({ theme, isActive, onClick }: ThemeButtonProps) {
  return (
    <button
      className={`h-6 w-6 rounded-full flex items-center justify-center ${
        isActive ? "ring-2 ring-ring ring-offset-1" : ""
      }`}
      style={{ backgroundColor: theme.primary }}
      onClick={onClick}
      title={theme.name}
    >
      {isActive && (
        <span className="text-white text-xs">✓</span>
      )}
    </button>
  );
}

export function ThemeDropdown() {
  const { currentTheme, availableThemes, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Paintbrush className="h-3.5 w-3.5 mr-2" />
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {availableThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => setTheme(theme)}
            className="flex items-center gap-2"
          >
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: theme.primary }}
            />
            <span>{theme.name}</span>
            {currentTheme.name === theme.name && (
              <span className="ml-auto">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}