// Utility functions for handling airports and city codes

// Map airport codes to full city names
const airportCodeMap = {
  'DEL': 'Delhi',
  'BOM': 'Mumbai',
  'BLR': 'Bangalore',
  'MAA': 'Chennai',
  'CCU': 'Kolkata',
  'HYD': 'Hyderabad',
  'PNQ': 'Pune',
  'AMD': 'Ahmedabad',
  'GOI': 'Goa',
  'JAI': 'Jaipur',
  'COK': 'Kochi',
  'LKO': 'Lucknow',
  'DXB': 'Dubai',
  'SIN': 'Singapore',
  'LHR': 'London',
  'JFK': 'New York',
  'BKK': 'Bangkok',
  'HKG': 'Hong Kong',
  'SYD': 'Sydney',
  'GAU': 'Guwahati',
  'MEL': 'Melbourne',
  'CCJ': 'Kozhikode',
  'ATQ': 'Amritsar',
  'LAX': 'Los Angeles',
  'PAT': 'Patna',
  'DMK': 'Bangkok',
  'NYC': 'New York',
  'LON': 'London',
  'PAR': 'Paris',
  'MAD': 'Madrid',
  'FCO': 'Rome',
  'SFO': 'San Francisco',
  'ORD': 'Chicago'
};

/**
 * Convert airport code to city name
 * @param {string} code - Airport IATA code
 * @returns {string} City name or the original code if not found
 */
export const getAirportName = (code) => {
  if (!code) return 'Unknown';
  
  // Handle the case where code might not be a string
  const codeStr = String(code).toUpperCase();
  return airportCodeMap[codeStr] || codeStr;
};

/**
 * Format airport code for display as "City (CODE)"
 * @param {string} code - Airport IATA code
 * @returns {string} Formatted string in the format "City (CODE)"
 */
export const formatAirportForDisplay = (code) => {
  if (!code) return 'Unknown (???)';
  
  // If already formatted, return as is
  if (typeof code === 'string' && code.includes('(') && code.includes(')')) {
    return code;
  }
  
  // Handle the case where code might not be a string
  const codeStr = String(code).toUpperCase();
  const cityName = getAirportName(codeStr);
  return `${cityName} (${codeStr})`;
};

/**
 * Validates if a string is a valid IATA airport code (3 uppercase letters)
 * @param {string} code - Airport code to validate
 * @returns {boolean} True if valid IATA code, false otherwise
 */
export const isValidAirportCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Z]{3}$/.test(code);
};

/**
 * Extract airport IATA code from various formats
 * @param {string} displayFormat - Input which could be "City (CODE)", just "CODE", or city name
 * @returns {string} Extracted 3-letter IATA airport code in uppercase
 */
export const extractAirportCode = (displayFormat) => {
  if (!displayFormat) return '';
  
  // Convert to string in case we receive a different type
  const input = String(displayFormat).trim();
  
  // Format 1: "City (CODE)" - Extract from parentheses
  const match = input.match(/\(([A-Z]{3})\)/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }
  
  // Format 2: Already a code like "DEL" or "del"
  if (input.length === 3) {
    const upperCode = input.toUpperCase();
    // Return if it's a valid 3-letter code (all letters)
    if (/^[A-Z]{3}$/.test(upperCode)) {
      return upperCode;
    }
  }
  
  // Format 3: Check if it's a city name we know
  for (const [code, city] of Object.entries(airportCodeMap)) {
    if (city.toLowerCase() === input.toLowerCase()) {
      return code; // Already uppercase in our map
    }
  }
  
  // If it's not a valid format, return uppercase of original input
  // The API validation will catch invalid codes
  return input.toUpperCase();
};

export default {
  getAirportName,
  formatAirportForDisplay,
  extractAirportCode,
  isValidAirportCode
}; 