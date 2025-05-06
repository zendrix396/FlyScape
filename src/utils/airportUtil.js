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
  'LON': 'London'
};

// Convert airport code to city name
export const getAirportName = (code) => {
  if (!code) return 'Unknown';
  
  // Handle the case where code might not be a string
  const codeStr = String(code).toUpperCase();
  return airportCodeMap[codeStr] || codeStr;
};

// Format airport code for display
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

// Convert full airport display format to code
export const extractAirportCode = (displayFormat) => {
  if (!displayFormat) return '';
  
  // If the format is like "Delhi (DEL)", extract "DEL"
  const match = String(displayFormat).match(/\(([A-Z]{3})\)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // If the input is already a code like "DEL"
  const formattedCode = String(displayFormat).toUpperCase();
  if (formattedCode.length === 3 && formattedCode === formattedCode.toUpperCase()) {
    return formattedCode;
  }
  
  // Check if it's a city name we know
  for (const [code, city] of Object.entries(airportCodeMap)) {
    if (city.toLowerCase() === String(displayFormat).toLowerCase()) {
      return code;
    }
  }
  
  // Otherwise return the original string
  return String(displayFormat);
};

export default {
  getAirportName,
  formatAirportForDisplay,
  extractAirportCode
}; 