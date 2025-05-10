import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { flightApi } from './apiService';
import { extractAirportCode } from '../utils/airportUtil';
import amadeusService from './amadeusApiService';

// In-memory cache to avoid redundant API calls for the same search parameters
const flightCache = {};

// Use Amadeus API flag - set to true to use Amadeus, false to use existing API
let useAmadeusApi = true;

// Set which API to use
const setUseAmadeusApi = (value) => {
  useAmadeusApi = !!value;
};

// Get flights based on search parameters using the backend API
const searchFlights = async (from, to, date = '', page = 1) => {
  try {
    // Format the date if provided
    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';
    
    // Extract and normalize airport codes using the utility
    const fromCode = extractAirportCode(from);
    const toCode = extractAirportCode(to);
    
    // Create a cache key from the search parameters
    const cacheKey = `${fromCode}-${toCode}-${formattedDate || 'any-date'}-${page}-${useAmadeusApi ? 'amadeus' : 'firebase'}`;
    
    console.log(`Searching for flights with params: from=${fromCode}, to=${toCode}, date=${formattedDate || 'any date'}, page=${page}, using Amadeus: ${useAmadeusApi}`);
    
    // Check if results are already in cache
    if (flightCache[cacheKey]) {
      console.log(`Using cached flight results for ${cacheKey}. Found ${flightCache[cacheKey].length} flights.`);
      return flightCache[cacheKey];
    }
    
    let results = [];
    
    // Choose API to use based on flag
    if (useAmadeusApi) {
      // Use Amadeus API for flight search
      try {
        results = await amadeusService.searchFlights(fromCode, toCode, formattedDate);
        console.log(`Found ${results.length} flights from Amadeus API`);
      } catch (amadeusError) {
        console.error("Error with Amadeus API, falling back to Firebase:", amadeusError);
        // If Amadeus API fails, fall back to Firebase API
        const response = await flightApi.searchFlights(fromCode, toCode, formattedDate, page);
        results = response.flights || [];
      }
    } else {
      // Use existing Firebase API
      console.log("Using Firebase API for flight search");
      const response = await flightApi.searchFlights(fromCode, toCode, formattedDate, page);
      results = response.flights || [];
    }
    
    // Cache the results
    if (results.length > 0) {
      console.log(`Caching ${results.length} flights for key ${cacheKey}`);
      flightCache[cacheKey] = results;
    } else {
      console.log("No flights found in response");
    }
    
    return results;
  } catch (error) {
    console.error("Error searching flights:", error);
    // Return an empty array on error
    return [];
  }
};

// Get flight by ID using the backend API
const getFlightById = async (flightId) => {
  try {
    // Call the backend API to get the flight
    const response = await flightApi.getFlightById(flightId);
    return response.flight;
  } catch (error) {
    console.error("Error getting flight by ID:", error);
    return null;
  }
};

// Record flight search activity
const recordFlightSearch = async (flightId) => {
  try {
    await flightApi.recordActivity(flightId, 'search');
  } catch (error) {
    console.error("Error recording flight search:", error);
  }
};

// Record flight booking
const recordFlightBooking = async (flightId, bookingType = 'firestoreBooking') => {
  try {
    await flightApi.recordActivity(flightId, bookingType);
  } catch (error) {
    console.error("Error recording flight booking:", error);
  }
};

// Save selected flight to Firestore
const saveSelectedFlight = async (flight) => {
  try {
    // If this is an Amadeus flight, save it
    if (useAmadeusApi && flight) {
      return await amadeusService.saveSelectedFlight(flight);
    }
    
    // For non-Amadeus flights, record as activity
    if (flight && flight.id) {
      await recordFlightBooking(flight.id, 'selection');
      return { success: true };
    }
    
    return { success: false, error: 'Invalid flight data' };
  } catch (error) {
    console.error("Error saving selected flight:", error);
    return { success: false, error: error.message };
  }
};

// Legacy function to get price trends - you can keep this or modify to use the API
const getFlightPriceTrends = async (from, to) => {
  const trendData = [
    { date: '2023-05-01', price: 2500 },
    { date: '2023-05-02', price: 2450 },
    { date: '2023-05-03', price: 2600 },
    { date: '2023-05-04', price: 2550 },
    { date: '2023-05-05', price: 2700 },
    { date: '2023-05-06', price: 2800 },
    { date: '2023-05-07', price: 2900 },
    { date: '2023-05-08', price: 2750 },
    { date: '2023-05-09', price: 2650 },
    { date: '2023-05-10', price: 2500 },
  ];
  
  return Promise.resolve(trendData);
};

// Legacy function to adjust flight price - updated to store original price
const adjustFlightPrice = (flight, shouldIncrease) => {
  if (!flight) return null;
  
  // Make a copy of the flight
  const updatedFlight = { ...flight };
  
  // Adjust price if needed
  if (shouldIncrease) {
    // Store the original price for displaying in UI
    // Only set originalPrice if it doesn't already exist
    if (!updatedFlight.originalPrice) {
      updatedFlight.originalPrice = updatedFlight.price;
    }
    
    // Increase price by 10%
    updatedFlight.price = Math.round(updatedFlight.price * 1.1);
    
    // Flag that the price was increased
    updatedFlight.priceIncreased = true;
  }
  
  return updatedFlight;
};

export {
  searchFlights,
  getFlightById,
  recordFlightSearch,
  recordFlightBooking,
  saveSelectedFlight,
  getFlightPriceTrends,
  adjustFlightPrice,
  setUseAmadeusApi,
  useAmadeusApi
}; 