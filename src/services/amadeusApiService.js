// Amadeus API service for flight search
import axios from 'axios';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

// Create an axios instance for Amadeus API
const amadeusApi = axios.create({
  baseURL: 'https://api.amadeus.com/v2',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Store the token and its expiration
let accessToken = null;
let tokenExpiration = null;

// EUR to INR conversion rate (approx) - can be updated or fetched from a currency API
const EUR_TO_INR_RATE = 96;

// Log for development only - remove in production
console.log('Amadeus API environment check (key length):', import.meta.env.VITE_AMADEUS_API_KEY?.length);

/**
 * Get an authentication token from Amadeus API
 */
const getAmadeusToken = async () => {
  try {
    // Check if we have a valid token
    if (accessToken && tokenExpiration && new Date() < tokenExpiration) {
      return accessToken;
    }

    // Request a new token
    const response = await axios.post(
      'https://api.amadeus.com/v1/security/oauth2/token',
      `grant_type=client_credentials&client_id=${import.meta.env.VITE_AMADEUS_API_KEY}&client_secret=${import.meta.env.VITE_AMADEUS_API_SECRET}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Save the token and set expiration time (token typically lasts 30 minutes)
    accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 1800; // Default to 30 minutes
    tokenExpiration = new Date(new Date().getTime() + expiresIn * 1000);

    return accessToken;
  } catch (error) {
    console.error('Error getting Amadeus token:', error);
    throw new Error('Authentication with flight search service failed');
  }
};

/**
 * Convert price from EUR to INR and round to nearest whole number
 * @param {number|string} euroPrice - Price in euros
 * @returns {number} - Price in INR (rounded)
 */
const convertEurToInr = (euroPrice) => {
  // Parse to float if string
  const priceInEuro = typeof euroPrice === 'string' ? parseFloat(euroPrice) : euroPrice;
  
  // Convert to INR
  const priceInInr = priceInEuro * EUR_TO_INR_RATE;
  
  // Round to nearest whole number
  return Math.round(priceInInr);
};

/**
 * Format a price for display with currency symbol
 * @param {number} price - The price to format
 * @param {string} currency - Currency code (INR, EUR, etc)
 * @returns {string} - Formatted price string
 */
const formatPriceForDisplay = (price, currency = 'INR') => {
  if (currency === 'INR') {
    return `₹${Math.round(price).toLocaleString('en-IN')}`;
  } else if (currency === 'EUR') {
    return `€${price.toLocaleString('en-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${price.toLocaleString()} ${currency}`;
};

/**
 * Check if an airport code is valid for Amadeus API
 */
const validateAirportCode = (code) => {
  if (!code) return false;
  
  // Basic validation - airport codes should be 3 uppercase characters
  return /^[A-Z]{3}$/.test(code);
};

/**
 * Convert Amadeus API response to the app's flight format
 */
const formatAmadeusFlights = (amadeusResponse) => {
  const { data, dictionaries } = amadeusResponse;
  
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map((offer, index) => {
    try {
      // Get the first segment of the first itinerary
      const firstItinerary = offer.itineraries[0];
      const firstSegment = firstItinerary.segments[0];
      const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];
      
      // Extract carrier code and get airline name from dictionaries
      const carrierCode = firstSegment.carrierCode;
      const airlineName = dictionaries?.carriers?.[carrierCode] || carrierCode;
      
      // Calculate duration in minutes from itinerary duration (PT8H30M format)
      const durationString = firstItinerary.duration;
      const hours = parseInt(durationString.match(/(\d+)H/)?.[1] || 0);
      const minutes = parseInt(durationString.match(/(\d+)M/)?.[1] || 0);
      const totalMinutes = hours * 60 + minutes;
      
      // Get original price and currency
      const originalPrice = parseFloat(offer.price.total);
      const originalCurrency = offer.price.currency || 'EUR';
      
      // Convert price to INR if it's in EUR or another currency
      const priceInInr = originalCurrency === 'INR' 
        ? originalPrice 
        : convertEurToInr(originalPrice);
      
      // Store original price for reference if needed
      const originalPriceData = {
        amount: originalPrice,
        currency: originalCurrency
      };
      
      return {
        id: offer.id || `flight-${index}-${Date.now()}`,
        flightNumber: `${carrierCode}${firstSegment.number}`,
        airline: airlineName,
        fromCity: firstSegment.departure.iataCode,
        toCity: lastSegment.arrival.iataCode,
        departureTime: new Date(firstSegment.departure.at).toISOString(),
        arrivalTime: new Date(lastSegment.arrival.at).toISOString(),
        duration: totalMinutes,
        price: priceInInr,
        currency: 'INR',
        originalPrice: originalPriceData,
        // Add formatted price strings for display
        priceFormatted: formatPriceForDisplay(priceInInr, 'INR'),
        originalPriceFormatted: formatPriceForDisplay(originalPrice, originalCurrency),
        // Add display-friendly formats
        displayDepartureDate: new Date(firstSegment.departure.at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        displayArrivalDate: new Date(lastSegment.arrival.at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        displayDepartureTime: new Date(firstSegment.departure.at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        displayArrivalTime: new Date(lastSegment.arrival.at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        // Add raw Amadeus data for reference
        amadeusOffer: offer
      };
    } catch (error) {
      console.error('Error formatting flight offer:', error, offer);
      return null;
    }
  }).filter(Boolean); // Remove any null values
};

/**
 * Search for flights using Amadeus API
 */
const searchAmadeusFlights = async (originCode, destinationCode, departureDate) => {
  try {
    // Validate airport codes first
    if (!validateAirportCode(originCode)) {
      console.error(`Invalid origin airport code: ${originCode}`);
      throw new Error(`Invalid origin airport code: ${originCode}. Please use a valid IATA code (e.g., JFK, LAX, LHR)`);
    }
    
    if (!validateAirportCode(destinationCode)) {
      console.error(`Invalid destination airport code: ${destinationCode}`);
      throw new Error(`Invalid destination airport code: ${destinationCode}. Please use a valid IATA code (e.g., JFK, LAX, LHR)`);
    }
    
    // Get authentication token
    const token = await getAmadeusToken();
    
    // Make the API request
    const response = await amadeusApi.get('/shopping/flight-offers', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate,
        adults: 1,
        nonStop: false,
        max: 250 // Get maximum results
      }
    });
    
    // Format the response for our app
    const formattedFlights = formatAmadeusFlights(response.data);
    console.log(`Found ${formattedFlights.length} flights from Amadeus API`);
    
    return formattedFlights;
  } catch (error) {
    console.error('Error searching Amadeus flights:', error);
    
    // Check for specific error responses from Amadeus API
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle specific error codes
      if (status === 400) {
        if (data?.errors?.[0]?.detail?.includes('airport')) {
          throw new Error('Invalid airport code. Please use a valid 3-letter IATA code (e.g., JFK, LAX, LHR)');
        }
        
        if (data?.errors?.[0]?.detail?.includes('date')) {
          throw new Error('Invalid date format. Please use YYYY-MM-DD format');
        }
        
        if (data?.errors?.[0]?.title === 'INVALID FORMAT') {
          throw new Error('Invalid search parameters. Please check your inputs and try again');
        }
      }
      
      if (status === 401) {
        // Clear token so we get a new one next time
        accessToken = null;
        tokenExpiration = null;
        throw new Error('Authentication failed. Please try again');
      }
      
      console.error('Error response from Amadeus API:', data);
    }
    
    // Generic error message as fallback
    throw new Error('Failed to search flights. Please try again later');
  }
};

/**
 * Save a selected flight to Firestore
 */
const saveSelectedFlight = async (flight) => {
  try {
    const user = auth.currentUser;
    
    // Create flight activity data
    const flightData = {
      ...flight,
      selectedAt: serverTimestamp(),
      userId: user?.uid || 'anonymous',
      source: 'amadeus'
    };
    
    // Save to Firestore
    const docRef = await addDoc(collection(db, 'selectedFlights'), flightData);
    
    // Also save to flights collection if it doesn't exist yet
    const flightRef = await addDoc(collection(db, 'flights'), {
      ...flight,
      createdAt: serverTimestamp(),
      source: 'amadeus'
    });
    
    console.log('Flight saved to selectedFlights collection:', docRef.id);
    console.log('Flight saved to flights collection:', flightRef.id);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving selected flight:', error);
    return { success: false, error: error.message };
  }
};

export const amadeusService = {
  searchFlights: searchAmadeusFlights,
  saveSelectedFlight
};

export default amadeusService; 