import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="flex items-center justify-center">
        {isDark ? (
          <div className="flex items-center text-yellow-400">
            <FaSun className="h-5 w-5" />
            <span className="ml-2 text-sm font-medium text-gray-200">Light</span>
          </div>
        ) : (
          <div className="flex items-center text-gray-700">
            <FaMoon className="h-5 w-5" />
            <span className="ml-2 text-sm font-medium">Dark</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default ThemeToggle; 