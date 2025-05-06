// Utility functions to generate random data for flights

// Get a random element from an array
export const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Get a random integer between min and max (inclusive)
export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Get a random date in the future (within days)
export const getRandomFutureDate = (days = 30) => {
  const date = new Date();
  date.setDate(date.getDate() + getRandomInt(1, days));
  
  // Set a random time
  date.setHours(getRandomInt(5, 23));
  date.setMinutes(getRandomInt(0, 59));
  
  return date;
};

// Generate a random flight number (2 letters followed by 3-4 digits)
export const generateFlightNumber = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter1 = letters.charAt(Math.floor(Math.random() * letters.length));
  const letter2 = letters.charAt(Math.floor(Math.random() * letters.length));
  const number = getRandomInt(100, 9999);
  
  return `${letter1}${letter2}${number}`;
};

// Generate a random price between min and max
export const generateRandomPrice = (min = 3000, max = 15000) => {
  // Round to nearest 100
  return Math.round(getRandomInt(min, max) / 100) * 100;
};

// Airlines and cities data
export const airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'GoAir', 'AirAsia India'];
export const cities = ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD', 'PNQ', 'AMD', 'GOI', 'JAI', 'COK', 'LKO']; 