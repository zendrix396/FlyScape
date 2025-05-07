/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format a date or timestamp object to a human-readable string
 * @param {Date|Object} dateInput - Date object or Firestore timestamp
 * @param {Object} options - Optional formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, options = {}) => {
  if (!dateInput) return "N/A";
  
  try {
    // Handle Firestore timestamp objects
    if (typeof dateInput === 'object' && dateInput !== null && dateInput.seconds) {
      dateInput = new Date(dateInput.seconds * 1000);
    }
    
    // If it's a string, convert to Date
    if (typeof dateInput === 'string') {
      dateInput = new Date(dateInput);
    }
    
    // Default formatting options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return new Intl.DateTimeFormat('en-IN', defaultOptions).format(dateInput);
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(dateInput) || "Invalid date";
  }
};

/**
 * Get a date string in YYYY-MM-DD format
 * @param {Date} date - Date object
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getDateString = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check if a date is in the past
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Get the difference in days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Difference in days
 */
export const getDaysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}; 