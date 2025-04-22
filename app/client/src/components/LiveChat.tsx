import { useEffect } from 'react';

// Extend the Window interface to include Tawk_API
declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      toggle?: () => void;
      popup?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      setAttributes?: (attributes: Record<string, string>) => void;
      visitor?: Record<string, string>;
      isVisitorEngaged?: () => boolean;
      onStatusChange?: (status: string) => void;
      addEvent?: (event: string, metadata: any) => void;
      addTags?: (tags: string[]) => void;
      removeTags?: (tags: string[]) => void;
    };
  }
}

interface LiveChatProps {
  userEmail?: string;
  userName?: string;
  pageData?: Record<string, string>;
}

/**
 * LiveChat component which integrates with Tawk.to
 * For a full list of available methods, see: https://developer.tawk.to/jsapi/
 */
export default function LiveChat({ userEmail, userName, pageData }: LiveChatProps) {
  // Set up custom visitor identification
  useEffect(() => {
    if (!window.Tawk_API) return;

    window.Tawk_API.onLoad = function() {
      // Set visitor attributes
      if (userEmail || userName) {
        const visitor: Record<string, string> = {};
        if (userEmail) visitor.email = userEmail;
        if (userName) visitor.name = userName;
        window.Tawk_API!.visitor = visitor;
      }

      // Set page data
      if (pageData && Object.keys(pageData).length > 0) {
        window.Tawk_API!.setAttributes?.(pageData);
      }

      // Custom event for when chat status changes (online/offline)
      window.Tawk_API!.onStatusChange = function(status) {
        console.log(`Tawk.to status changed: ${status}`);
      };
    };
  }, [userEmail, userName, pageData]);

  // This is a non-visual component
  return null;
}