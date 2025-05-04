import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Store generated flights by search parameters to ensure consistency
const flightCache = {};

// Generate a random number within a range
const getRandomInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a flight number based on airline and seed
const generateFlightNumber = (airline, seed) => {
  let prefix = '';
  
  switch (airline) {
    case 'IndiGo':
      prefix = '6E-';
      break;
    case 'Air India':
      prefix = 'AI-';
      break;
    case 'SpiceJet':
      prefix = 'SG-';
      break;
    case 'Vistara':
      prefix = 'UK-';
      break;
    case 'GoAir':
      prefix = 'G8-';
      break;
    default:
      prefix = 'FL-';
  }
  
  // Generate a consistent flight number if seed is provided
  if (seed !== undefined) {
    const number = 1000 + Math.abs((seed * 4567) % 9000);
    return `${prefix}${number}`;
  }
  
  // Otherwise use random generator (for legacy support)
  return `${prefix}${getRandomInRange(1000, 9999)}`;
};

// Get the duration between two dates in minutes
const getDurationInMinutes = (departureTime, arrivalTime) => {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  return Math.round((arrival - departure) / (1000 * 60));
};

// Generate a random flight
const generateRandomFlight = (from, to, date, seed) => {
  const airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'GoAir'];
  // Use a different algorithm to select airline that ensures variety
  // We use the flight index (part of the seed) to distribute airlines more evenly
  const flightIndex = Math.floor(seed / 12345) % 10; // Get flight index (0-9)
  const airlineIndex = (flightIndex + Math.abs(seed % 5)) % 5; // Distribute across 5 airlines
  const airline = airlines[airlineIndex];
  
  // Parse the selected date
  const selectedDate = new Date(date);
  
  // Use the seed to generate consistent values
  const departureHour = Math.abs((seed * 345) % 19); // 0-18
  const departureMinute = Math.abs((seed * 567) % 60); // 0-59
  
  // Set the departure time to the selected date with the random hour
  const departureTime = new Date(selectedDate);
  departureTime.setHours(departureHour, departureMinute, 0, 0);
  
  // Generate flight duration (60-300 minutes)
  const duration = 60 + Math.abs((seed * 789) % 241);
  
  // Calculate arrival time based on departure time and duration
  const arrivalTime = new Date(departureTime.getTime() + duration * 60000);
  
  // Generate price (₹2,000 to ₹3,000)
  const price = 2000 + Math.abs((seed * 901) % 1001);
  
  // Generate a unique ID that will be consistent for the same parameters
  // The ID includes a static number instead of a random one to ensure consistency
  const flightNumber = Math.abs((seed * 1234) % 9000 + 1000);
  const id = `${from}-${to}-${departureTime.toISOString()}-${flightNumber}`;
  
  return {
    id,
    airline,
    flightNumber: generateFlightNumber(airline, seed),
    from,
    to,
    departureTime: departureTime.toISOString(),
    arrivalTime: arrivalTime.toISOString(),
    duration,
    price,
    availableSeats: 30 + Math.abs((seed * 111) % 151) // 30-180
  };
};

// Generate a deterministic "seed" based on search parameters
const generateSearchSeed = (from, to, date) => {
  const dateStr = new Date(date).toISOString().split('T')[0]; // Just use the date part
  const seedString = `${from}-${to}-${dateStr}`;
  
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Return a consistent hash without any session-specific randomization
  // This ensures all users see the same flights for the same search parameters
  return Math.abs(hash);
};

// Add hashCode method to String prototype if it doesn't exist
if (!String.prototype.hashCode) {
  String.prototype.hashCode = function() {
    let hash = 0;
    if (this.length === 0) return hash;
    for (let i = 0; i < this.length; i++) {
      const char = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };
}

// Search for flights
const searchFlights = (from, to, date) => {
  // Create a global cache key from the search parameters (same for all users)
  const cacheKey = `${from}-${to}-${new Date(date).toISOString().split('T')[0]}`;
  
  // Check global cache in localStorage
  try {
    const globalCache = localStorage.getItem('globalFlightCache');
    if (globalCache) {
      const globalCacheObj = JSON.parse(globalCache);
      if (globalCacheObj[cacheKey]) {
        console.log("Using globally cached flight results for", cacheKey);
        return Promise.resolve(globalCacheObj[cacheKey]);
      }
    }
  } catch (error) {
    console.error("Error accessing global flight cache:", error);
  }
  
  // Then check session cache
  if (flightCache[cacheKey]) {
    console.log("Using session cached flight results for", cacheKey);
    return Promise.resolve(flightCache[cacheKey]);
  }
  
  // Generate a seed based on the search parameters
  const baseSeed = generateSearchSeed(from, to, date);
  
  // For the mock implementation, we'll generate 10 flights
  // But they'll be consistent for the same parameters for all users
  const flights = [];
  const count = 10;
  
  // Generate flights with a better distribution of airlines
  // Use a different set of seeds for each flight to ensure variety
  for (let i = 0; i < count; i++) {
    // Each flight gets a unique seed, ensuring variety while maintaining consistency
    const flightSeed = baseSeed + (i * 12345);
    const flight = generateRandomFlight(from, to, date, flightSeed);
    
    // Ensure we get a good mix of airlines in the results
    flights.push(flight);
  }
  
  // Ensure we have at least 2 different airlines in the results
  let airlines = [...new Set(flights.map(f => f.airline))];
  if (airlines.length < 2) {
    console.log("Detected lack of variety in airlines, adjusting...");
    // Replace some flights with different airlines
    const allAirlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'GoAir'];
    for (let i = 0; i < 5; i++) {
      const airline = allAirlines[i];
      if (!airlines.includes(airline)) {
        // Replace a flight with this airline
        const flightToReplace = flights[i];
        const newFlight = {
          ...flightToReplace,
          airline,
          flightNumber: generateFlightNumber(airline, baseSeed)
        };
        flights[i] = newFlight;
        airlines.push(airline);
        if (airlines.length >= 3) break; // Ensure at least 3 different airlines
      }
    }
  }
  
  // Cache the results for future searches
  flightCache[cacheKey] = flights;
  
  // Store in sessionStorage for session persistence
  try {
    const storedFlights = sessionStorage.getItem('flightCache');
    let flightCacheObj = storedFlights ? JSON.parse(storedFlights) : {};
    flightCacheObj[cacheKey] = flights;
    sessionStorage.setItem('flightCache', JSON.stringify(flightCacheObj));
  } catch (error) {
    console.error("Error storing flight cache in session storage:", error);
  }
  
  // Also store in localStorage for global persistence across all users
  try {
    const globalCache = localStorage.getItem('globalFlightCache');
    let globalCacheObj = globalCache ? JSON.parse(globalCache) : {};
    globalCacheObj[cacheKey] = flights;
    localStorage.setItem('globalFlightCache', JSON.stringify(globalCacheObj));
  } catch (error) {
    console.error("Error storing flight cache in local storage:", error);
  }
  
  return Promise.resolve(flights);
};

// Get a flight by ID
const getFlightById = (flightId) => {
  // First check global cache in localStorage
  try {
    const globalCache = localStorage.getItem('globalFlightCache');
    if (globalCache) {
      const globalCacheObj = JSON.parse(globalCache);
      
      // Search through all globally cached flights
      for (const cacheKey in globalCacheObj) {
        const flights = globalCacheObj[cacheKey];
        const foundFlight = flights.find(f => f.id === flightId);
        if (foundFlight) {
          return Promise.resolve(foundFlight);
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving flight from global cache:", error);
  }
  
  // Then check session cache
  try {
    const storedFlights = sessionStorage.getItem('flightCache');
    if (storedFlights) {
      const flightCacheObj = JSON.parse(storedFlights);
      
      // Search through all cached flights
      for (const cacheKey in flightCacheObj) {
        const flights = flightCacheObj[cacheKey];
        const foundFlight = flights.find(f => f.id === flightId);
        if (foundFlight) {
          return Promise.resolve(foundFlight);
        }
      }
    }
    
    // Check if flight is in searchResults in session storage
    const searchResults = sessionStorage.getItem('searchResults');
    if (searchResults) {
      const flights = JSON.parse(searchResults);
      const foundFlight = flights.find(f => f.id === flightId);
      if (foundFlight) {
        return Promise.resolve(foundFlight);
      }
    }
  } catch (error) {
    console.error("Error retrieving flight from session cache:", error);
  }
  
  // If we get here, we couldn't find the flight in any cache
  // In a real app, we'd query Firestore here
  console.warn("Flight not found in cache:", flightId);
  return Promise.resolve(null);
};

// Adjust the flight price based on search history
const adjustFlightPrice = (flight, shouldIncrease) => {
  if (shouldIncrease) {
    // Increase price by 10%
    const increasedPrice = Math.round(flight.price * 1.1);
    return {
      ...flight,
      price: increasedPrice,
      priceIncreased: true
    };
  }
  
  return flight;
};

// Initialize flight cache from session storage and global cache when module loads
try {
  // Load from session storage first
  const storedFlights = sessionStorage.getItem('flightCache');
  if (storedFlights) {
    Object.assign(flightCache, JSON.parse(storedFlights));
    console.log("Loaded flight cache from session storage");
  }
  
  // Then check global cache in localStorage
  const globalCache = localStorage.getItem('globalFlightCache');
  if (globalCache) {
    const globalCacheObj = JSON.parse(globalCache);
    // Merge global cache into flight cache
    Object.assign(flightCache, globalCacheObj);
    console.log("Loaded flight cache from global localStorage");
  }
} catch (error) {
  console.error("Error loading flight cache:", error);
}

export { searchFlights, getFlightById, adjustFlightPrice }; 