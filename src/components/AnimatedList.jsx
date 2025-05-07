import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export default function AnimatedList({
  items = [],
  onItemSelect = () => {},
  renderItem = null,
  className = '',
}) {
  const { isDark } = useTheme();
  
  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg ${className}`}>
      <div className="overflow-y-auto">
        {renderItem 
          ? items.map((item, index) => renderItem(item, index))
          : items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onClick={() => onItemSelect(item, index)}
              className={`p-3 cursor-pointer border-b ${
                isDark 
                  ? 'border-gray-700 hover:bg-gray-700 text-gray-200' 
                  : 'border-gray-100 hover:bg-emerald-50'
              }`}
            >
              {typeof item === 'string' ? item : item.label || JSON.stringify(item)}
            </motion.div>
          ))
        }
      </div>
    </div>
  );
} 