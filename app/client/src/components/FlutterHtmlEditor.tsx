import React, { useState, useEffect, useRef } from 'react';
import { Save, Copy, Code, FileText, RefreshCw, CheckCircle2, Clipboard, Zap } from 'lucide-react';
import FlutterComponentWrapper from './FlutterComponentWrapper';

interface FlutterHtmlEditorProps {
  initialHtml?: string;
  onSave?: (html: string) => void;
  readOnly?: boolean;
  height?: string;
}

export default function FlutterHtmlEditor({
  initialHtml = '',
  onSave,
  readOnly = false,
  height = '500px'
}: FlutterHtmlEditorProps) {
  const [html, setHtml] = useState(initialHtml);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset states when component remounts
    setCopied(false);
    setSaved(false);
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtml(e.target.value);
    
    // Update cursor position
    const textarea = e.target;
    const currentPosition = textarea.selectionStart;
    
    // Calculate line and column
    const textBeforeCursor = textarea.value.substring(0, currentPosition);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    setCursorPosition({ line, column });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(html);
    }
    
    setSaved(true);
    
    // Show success state briefly
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    
    // Show copied state briefly
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleFormat = () => {
    try {
      // Simple HTML formatting
      const formatted = html
        .replace(/></g, '>\n<')
        .replace(/(<\/[^>]+>)(?!\s*<)/g, '$1\n')
        .replace(/(<[^\/][^>]*[^\/]>)(?!\s*<)/g, '$1\n');
      
      setHtml(formatted);
      
      // Apply animation to editor
      if (editorRef.current) {
        editorRef.current.classList.add('flutter-animate-scale');
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.classList.remove('flutter-animate-scale');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error formatting HTML:', error);
    }
  };

  // Apply class based on content type detection
  const getEditorClass = () => {
    const baseClass = "font-mono text-sm p-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all w-full";
    if (readOnly) return `${baseClass} bg-gray-100 opacity-90 cursor-not-allowed`;
    return baseClass;
  };

  return (
    <FlutterComponentWrapper>
      <div className="flutter-editor bg-white rounded-md shadow-lg overflow-hidden">
        <div className="editor-header bg-black text-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code size={18} />
            <span className="font-medium">HTML Editor</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              Line {cursorPosition.line}, Column {cursorPosition.column}
            </span>
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? "Hide Preview" : "Show Preview"}
            >
              <FileText size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              onClick={handleFormat}
              title="Format HTML"
              disabled={readOnly}
            >
              <Zap size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors group relative"
              onClick={handleCopy}
              title="Copy Code"
            >
              {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Clipboard size={16} />}
              {copied && (
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded flutter-animate-fade">
                  Copied!
                </span>
              )}
            </button>
            {onSave && (
              <button
                type="button"
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors relative"
                onClick={handleSave}
                title="Save Changes"
                disabled={readOnly}
              >
                {saved ? <CheckCircle2 size={16} className="text-green-400" /> : <Save size={16} />}
                {saved && (
                  <span className="absolute -bottom-8 right-0 bg-black text-white text-xs py-1 px-2 rounded flutter-animate-fade">
                    Saved!
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
        
        <div className={`editor-content ${showPreview ? 'grid grid-cols-2 gap-4' : 'block'}`} style={{ minHeight: height }}>
          <div className="p-3">
            <textarea
              ref={editorRef}
              value={html}
              onChange={handleCodeChange}
              placeholder="Enter your HTML code here..."
              className={getEditorClass()}
              style={{ height, resize: 'none' }}
              readOnly={readOnly}
              spellCheck={false}
            />
          </div>
          
          {showPreview && (
            <div className="p-3 border-l border-gray-200">
              <div 
                ref={previewRef}
                className="preview-container h-full border border-gray-200 rounded-md p-4 overflow-auto flutter-animate-fade"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          )}
        </div>
        
        <div className="editor-footer p-2 text-xs text-gray-500 border-t border-gray-200 flex justify-between items-center">
          <span>
            {html.length} characters · {html.split('\n').length} lines
          </span>
          <div className="flex items-center gap-1">
            <span>Flutter-inspired Editor</span>
            <RefreshCw size={12} className="text-gray-400 animate-spin-slow" />
          </div>
        </div>
      </div>
    </FlutterComponentWrapper>
  );
}