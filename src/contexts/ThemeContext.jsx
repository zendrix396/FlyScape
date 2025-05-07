import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  // Check if user previously had a theme preference in localStorage
  const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('color-theme');
      if (storedPrefs) {
        return storedPrefs;
      }

      // If user has set a preference in browser
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }

    // Default to light theme
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('color-theme', newTheme);
  };

  // Apply theme class to document element
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }
    
    const root = window.document.documentElement;
    
    // Remove the previous theme class and add the new one
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    
    // Update local storage
    localStorage.setItem('color-theme', theme);
  }, [theme, mounted]);

  // Set mounted state when component loads
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR issues by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
} 