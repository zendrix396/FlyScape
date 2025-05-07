import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';

export default function CookieStatus() {
  const [visible, setVisible] = useState(true);
  const [cookieData, setCookieData] = useState({});

  useEffect(() => {
    // Get all cookies
    const cookies = Cookies.get();
    setCookieData(cookies);
    
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm border border-emerald-100 dark:border-gray-700">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Login Status (Cookie)</h3>
              <button 
                onClick={() => setVisible(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {cookieData.flyscape_user ? (
              <div className="text-xs text-gray-700 dark:text-gray-300">
                <p><span className="font-medium">User:</span></p>
                <p><span className="font-medium">Email:</span> {JSON.parse(cookieData.flyscape_user || '{}').email}</p>
                <p><span className="font-medium">Name:</span> {JSON.parse(cookieData.flyscape_user || '{}').displayName}</p>
                
                {cookieData.flyscape_profile && (
                  <div className="mt-1">
                    <p><span className="font-medium">Profile:</span></p>
                    <p><span className="font-medium">Balance:</span> ₹{JSON.parse(cookieData.flyscape_profile || '{}').walletBalance}</p>
                    <p><span className="font-medium">Admin:</span> {JSON.parse(cookieData.flyscape_profile || '{}').isAdmin ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-700 dark:text-gray-300">Not logged in</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 