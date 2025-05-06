import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExclamationCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

export default function MessageModal({ 
  isOpen, 
  onClose, 
  message, 
  title = 'Notice', 
  type = 'info',
  actionButton = null
}) {
  // Early return if modal is not open
  if (!isOpen) return null;
  
  // Determine icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      case 'warning':
        return <FaExclamationCircle className="text-yellow-500 text-3xl" />;
      case 'info':
      default:
        return <FaInfoCircle className="text-blue-500 text-3xl" />;
    }
  };
  
  // Determine color scheme based on type
  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          header: 'bg-green-100 text-green-800',
          button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        };
      case 'error':
        return {
          header: 'bg-red-100 text-red-800',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'warning':
        return {
          header: 'bg-yellow-100 text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
      case 'info':
      default:
        return {
          header: 'bg-blue-100 text-blue-800',
          button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
        };
    }
  };
  
  const colors = getColors();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 transition-opacity"
              onClick={onClose}
            >
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
            </motion.div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className={`${colors.header} px-4 py-3 sm:px-6 flex justify-between items-center`}>
                <div className="flex items-center">
                  {getIcon()}
                  <h3 className="ml-2 text-lg font-medium">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-600 focus:outline-none"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="mt-2">
                      <p className="text-gray-700 whitespace-pre-line">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {actionButton ? (
                  actionButton
                ) : (
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${colors.button} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
                    onClick={onClose}
                  >
                    OK
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 