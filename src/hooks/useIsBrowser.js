import { useState, useEffect } from 'react';

// Hook to check if we're in a browser environment
export default function useIsBrowser() {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    // This will only run in the browser, not during SSR
    setIsBrowser(true);
  }, []);

  return isBrowser;
} 