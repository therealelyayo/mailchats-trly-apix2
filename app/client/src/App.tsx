import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EmailLoginPage from "@/pages/EmailLoginPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "@/pages/website/LandingPage";
import PricingPage from "@/pages/website/PricingPage";
import FeaturesPage from "@/pages/website/FeaturesPage";
import MicrointeractionsDemo from "@/pages/website/MicrointeractionsDemo";
import HtmlEditorPage from "@/pages/HtmlEditorPage";
import { ThemeProvider } from "@/hooks/use-theme";
import { EnhancedVariablesProvider } from "@/hooks/use-enhanced-variables";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ThemeObserver from "@/components/ThemeObserver";
import LiveChat from "@/components/LiveChat";

function Router() {
  return (
    <Switch>
      {/* Public website pages */}
      <Route path="/website" component={LandingPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/microinteractions" component={MicrointeractionsDemo} />
      <Route path="/html-editor" component={HtmlEditorPage} />
      
      {/* Auth pages */}
      <Route path="/login" component={EmailLoginPage} />
      <Route path="/auth" component={EmailLoginPage} />
      
      {/* App pages - protected */}
      <Route path="/app">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      
      {/* Default route - redirect to website for guests, app for logged in users */}
      <Route path="/">
        <LandingPage />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <EnhancedVariablesProvider>
          <TooltipProvider>
            <div className="relative min-h-screen">
              {/* Theme Switcher - Fixed position in the bottom right */}
              <div className="fixed bottom-4 right-4 z-50">
                <ThemeSwitcher />
              </div>
              
              {/* Theme observer for real-time theme changes */}
              <ThemeObserver />
              
              {/* Live chat integration */}
              <LiveChat 
                pageData={{
                  product: "MailChats Trly APIX2",
                  version: "2.0"
                }} 
              />
              
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </EnhancedVariablesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
