import { useState } from "react";
import { useTheme, type ThemeConfig } from "@/hooks/use-theme";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { Paintbrush, Sun, Moon, Moon as MoonIcon } from "lucide-react";

export default function ThemePanel() {
  const { currentTheme, availableThemes, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("presets");

  const handleThemeChange = (theme: ThemeConfig) => {
    setTheme(theme);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5" />
          Theme Settings
        </CardTitle>
        <CardDescription>
          Customize the application's appearance with preset themes or custom colors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="presets"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Preset Themes</TabsTrigger>
            <TabsTrigger value="info">Current Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {availableThemes.map((theme) => (
                <ThemeCard
                  key={theme.name}
                  theme={theme}
                  isActive={currentTheme.name === theme.name}
                  onClick={() => handleThemeChange(theme)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="current-theme">
                <AccordionTrigger>Current Theme Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Name:</div>
                      <div>{currentTheme.name}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Primary Color:</div>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded-full border"
                          style={{ backgroundColor: currentTheme.primary }}
                        ></span>
                        {currentTheme.primary}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Variant:</div>
                      <div>{currentTheme.variant}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Appearance:</div>
                      <div className="flex items-center gap-2">
                        {currentTheme.appearance === "dark" ? (
                          <Moon className="h-4 w-4" />
                        ) : (
                          <Sun className="h-4 w-4" />
                        )}
                        {currentTheme.appearance}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Border Radius:</div>
                      <div>{currentTheme.radius}</div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="theme-explanation">
                <AccordionTrigger>How Themes Work</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Primary Color:</strong> Sets the main accent color used 
                      throughout the interface.
                    </p>
                    <p>
                      <strong>Variant:</strong> Controls how colors are applied:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Professional:</strong> Subtle and balanced color application</li>
                      <li><strong>Vibrant:</strong> More saturated, energetic color usage</li>
                      <li><strong>Tint:</strong> Softer, more pastel-like application</li>
                    </ul>
                    <p>
                      <strong>Appearance:</strong> Toggles between light and dark color schemes
                    </p>
                    <p>
                      <strong>Border Radius:</strong> Controls the roundness of UI elements
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface ThemeCardProps {
  theme: ThemeConfig;
  isActive: boolean;
  onClick: () => void;
}

function ThemeCard({ theme, isActive, onClick }: ThemeCardProps) {
  return (
    <div
      className={`cursor-pointer rounded-md border p-2 transition-all hover:shadow-md ${
        isActive ? "border-primary bg-primary/5" : "border-border"
      }`}
      onClick={onClick}
    >
      <div className="mb-2 flex justify-between items-center">
        <div
          className="h-6 w-6 rounded-full border"
          style={{ backgroundColor: theme.primary }}
        ></div>
        {theme.appearance === "dark" ? (
          <MoonIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Sun className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="text-xs font-medium">{theme.name}</div>
      <div className="text-xs text-muted-foreground">{theme.variant}</div>
    </div>
  );
}