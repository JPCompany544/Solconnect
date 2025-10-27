"use client";

import { useEffect } from 'react';

export default function TawkToChat() {
  useEffect(() => {
    // Check if Tawk.to script is already loaded
    if (typeof window !== 'undefined' && !(window as any).Tawk_API) {
      // Initialize Tawk_API
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_LoadStart = new Date();

      // Create and inject the script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/68ffea71b10633194f90fb0c/1j8jqnjhq';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');

      // Find the first script tag and insert before it
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        // Fallback: append to body
        document.body.appendChild(script);
      }

      // Cleanup function
      return () => {
        // Remove Tawk.to widget on unmount if needed
        const tawkScript = document.querySelector('script[src*="tawk.to"]');
        if (tawkScript) {
          tawkScript.remove();
        }
        // Remove Tawk.to iframe
        const tawkIframe = document.getElementById('tawkchat-container');
        if (tawkIframe) {
          tawkIframe.remove();
        }
      };
    }
  }, []);

  return null; // This component doesn't render anything visible
}
