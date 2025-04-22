import React, { useState } from 'react';
import FlutterHtmlEditor from '@/components/FlutterHtmlEditor';
import FlutterComponentWrapper from '@/components/FlutterComponentWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Code, Copy, Eye, Save, Check } from 'lucide-react';
import { Link } from 'wouter';

// Sample HTML templates
const htmlTemplates = {
  basic: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Basic Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #000;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <p>This is a basic HTML template.</p>
  </div>
</body>
</html>`,

  email: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
    }
    .email-header {
      background-color: #000000;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .email-body {
      padding: 20px;
    }
    .email-footer {
      background-color: #f5f5f5;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .button {
      display: inline-block;
      background-color: #000000;
      color: #ffffff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>MailChats Newsletter</h1>
    </div>
    <div class="email-body">
      <h2>Hello {{name}},</h2>
      <p>Thank you for subscribing to our newsletter. We're excited to share our latest updates with you.</p>
      <p>Here are some highlights:</p>
      <ul>
        <li>New feature: Advanced email personalization</li>
        <li>Improved deliverability rates</li>
        <li>Updated UI with Flutter-inspired design</li>
      </ul>
      <a href="#" class="button">Learn More</a>
      <p>Best regards,<br>The MailChats Team</p>
    </div>
    <div class="email-footer">
      <p>&copy; 2025 MailChats. All rights reserved.</p>
      <p>You're receiving this email because you signed up for updates from MailChats.</p>
      <p><a href="#">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,

  responsive: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Template</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background-color: #000;
      color: #fff;
      padding: 1rem;
    }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
    }
    .menu {
      display: flex;
      list-style: none;
    }
    .menu li {
      margin-left: 1rem;
    }
    .menu a {
      color: #fff;
      text-decoration: none;
    }
    .hero {
      padding: 4rem 2rem;
      text-align: center;
      background-color: #f5f5f5;
    }
    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 2rem 0;
    }
    .card {
      background: #fff;
      border: 1px solid #ddd;
      padding: 1.5rem;
      border-radius: 5px;
    }
    footer {
      background-color: #333;
      color: #fff;
      padding: 2rem;
      text-align: center;
    }
    @media (max-width: 768px) {
      .menu {
        flex-direction: column;
        background: #000;
        position: absolute;
        top: 60px;
        left: 0;
        width: 100%;
        padding: 1rem 0;
        display: none;
      }
      .menu li {
        margin: 0.5rem 0;
      }
      .hero h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <header>
    <nav class="container">
      <div class="logo">MailChats</div>
      <ul class="menu">
        <li><a href="#">Home</a></li>
        <li><a href="#">Features</a></li>
        <li><a href="#">Pricing</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>

  <section class="hero">
    <div class="container">
      <h1>Responsive Web Design</h1>
      <p>This template adjusts to any screen size.</p>
    </div>
  </section>

  <main class="container">
    <div class="grid">
      <div class="card">
        <h2>Feature 1</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
      <div class="card">
        <h2>Feature 2</h2>
        <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </div>
      <div class="card">
        <h2>Feature 3</h2>
        <p>Ut enim ad minim veniam, quis nostrud exercitation.</p>
      </div>
    </div>
  </main>

  <footer>
    <div class="container">
      <p>&copy; 2025 MailChats. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`
};

export default function HtmlEditorPage() {
  const [activeTemplate, setActiveTemplate] = useState<'basic' | 'email' | 'responsive'>('basic');
  const [html, setHtml] = useState(htmlTemplates.basic);
  const [savedHtml, setSavedHtml] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  const handleTemplateChange = (template: typeof activeTemplate) => {
    setActiveTemplate(template);
    setHtml(htmlTemplates[template]);
  };
  
  const handleSaveHtml = (newHtml: string) => {
    setSavedHtml(newHtml);
    setSaveMessage('HTML saved successfully!');
    
    // Clear message after a delay
    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-black hover:text-gray-700 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-3xl font-light">HTML Editor</h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(html);
              setSaveMessage('HTML copied to clipboard!');
              setTimeout(() => setSaveMessage(null), 3000);
            }}
            className="flex items-center gap-1"
          >
            <Copy size={16} />
            <span className="hidden md:inline">Copy</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSaveHtml(html)}
            className="flex items-center gap-1 bg-black text-white hover:bg-gray-900"
          >
            <Save size={16} />
            <span className="hidden md:inline">Save</span>
          </Button>
        </div>
      </div>
      
      {saveMessage && (
        <div className="bg-black text-white p-3 rounded-md mb-4 flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <Check size={18} />
          {saveMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <FlutterComponentWrapper>
            <div className="bg-white rounded-md shadow-md overflow-hidden">
              <div className="bg-black text-white p-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Code size={16} />
                  Templates
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <button
                    className={`w-full text-left p-2 rounded transition-colors ${
                      activeTemplate === 'basic' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleTemplateChange('basic')}
                  >
                    Basic
                  </button>
                  <button
                    className={`w-full text-left p-2 rounded transition-colors ${
                      activeTemplate === 'email' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleTemplateChange('email')}
                  >
                    Email
                  </button>
                  <button
                    className={`w-full text-left p-2 rounded transition-colors ${
                      activeTemplate === 'responsive' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleTemplateChange('responsive')}
                  >
                    Responsive
                  </button>
                </div>
              </div>
            </div>
          </FlutterComponentWrapper>
          
          {savedHtml && (
            <FlutterComponentWrapper>
              <div className="bg-white rounded-md shadow-md overflow-hidden">
                <div className="bg-black text-white p-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Eye size={16} />
                    Last Saved
                  </h3>
                </div>
                <div className="p-4">
                  <div className="max-h-60 overflow-auto bg-gray-50 p-3 rounded text-xs font-mono">
                    {savedHtml.substring(0, 500)}
                    {savedHtml.length > 500 && '...'}
                  </div>
                  <button 
                    className="w-full mt-2 p-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                    onClick={() => setHtml(savedHtml)}
                  >
                    Restore Saved
                  </button>
                </div>
              </div>
            </FlutterComponentWrapper>
          )}
        </div>
        
        <div className="lg:col-span-4">
          {/* Editor with microinteractions */}
          <FlutterHtmlEditor 
            initialHtml={html} 
            onSave={handleSaveHtml} 
            height="calc(100vh - 200px)"
          />
        </div>
      </div>
    </div>
  );
}