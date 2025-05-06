import { db, auth } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import moment from 'moment';
import { extractAirportCode } from '../utils/airportUtil';
import { 
  getRandomElement, 
  getRandomInt, 
  getRandomFutureDate, 
  generateFlightNumber, 
  generateRandomPrice,
  airlines,
  cities
} from '../utils/randomGenerator';

// Admin API functions that directly interact with Firebase
export const adminApi = {
  // Get analytics for the admin dashboard
  getAnalytics: async () => {
    try {
      // Get user count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userCount = usersSnapshot.size || 0;
      
      // Get bookings count and total revenue
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const bookingCount = bookingsSnapshot.size || 0;
      
      let totalRevenue = 0;
      bookingsSnapshot.forEach(doc => {
        const bookingData = doc.data();
        
        try {
          // Check for totalPrice first (preferred field)
          if (bookingData.totalPrice) {
            // Convert to number properly handling strings
            const price = typeof bookingData.totalPrice === 'string' 
              ? parseFloat(bookingData.totalPrice.replace(/[^0-9.]/g, '')) 
              : parseFloat(bookingData.totalPrice);
              
            if (!isNaN(price)) {
              totalRevenue += price;
              console.log(`Added totalPrice ${price} to revenue from booking ${doc.id}`);
              return;
            }
          }
          
          // If there's no totalPrice, check for price field
          if (bookingData.price) {
            // Convert to number properly handling strings
            const price = typeof bookingData.price === 'string' 
              ? parseFloat(bookingData.price.replace(/[^0-9.]/g, '')) 
              : parseFloat(bookingData.price);
              
            if (!isNaN(price)) {
              totalRevenue += price;
              console.log(`Added price ${price} to revenue from booking ${doc.id}`);
              return;
            }
          }
          
          // If both approaches fail, try to get price from the flight object
          if (bookingData.flight && bookingData.flight.price) {
            // Convert to number properly handling strings
            const price = typeof bookingData.flight.price === 'string' 
              ? parseFloat(bookingData.flight.price.replace(/[^0-9.]/g, '')) 
              : parseFloat(bookingData.flight.price);
              
            if (!isNaN(price)) {
              totalRevenue += price;
              console.log(`Added flight.price ${price} to revenue from booking ${doc.id}`);
              return;
            }
          }
          
          console.log('Could not determine price for booking:', doc.id, bookingData);
        } catch (error) {
          console.error(`Error processing revenue for booking ${doc.id}:`, error);
        }
      });
      
      console.log('Total revenue calculated:', totalRevenue);
      
      // Get flights count
      const flightsSnapshot = await getDocs(collection(db, 'flights'));
      const flightCount = flightsSnapshot.size || 0;
      
      // Calculate recent bookings (last 7 days)
      const last7Days = moment().subtract(7, 'days').toDate();
      const recentBookingsQuery = query(
        collection(db, 'bookings'),
        where('createdAt', '>=', Timestamp.fromDate(last7Days))
      );
      const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
      const recentBookings = recentBookingsSnapshot.size || 0;
      
      // Calculate recent users (last 7 days)
      const recentUsersQuery = query(
        collection(db, 'users'),
        where('lastLogin', '>=', Timestamp.fromDate(last7Days))
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsers = recentUsersSnapshot.size || 0;
      
      return {
        userCount,
        bookingCount,
        totalRevenue,
        flightCount,
        recentBookings,
        recentUsers
      };
    } catch (error) {
      console.error('Analytics error:', error);
      throw new Error('Failed to fetch analytics data');
    }
  },
  
  // Get all flights with optional filters
  getFlights: async (filters = {}) => {
    try {
      const { page = 1, limit = 10, airline, fromCity, toCity, minPrice, maxPrice } = filters;
      
      // Create a base query
      let flightsQuery = collection(db, 'flights');
      let constraints = [];
      
      // Apply filters if provided
      // Note: Firebase has limitations on compound queries, so we'll do some filtering in memory
      if (airline) {
        flightsQuery = query(flightsQuery, where('airline', '==', airline));
      }
      
      // Get the results
      const snapshot = await getDocs(flightsQuery);
      
      if (snapshot.empty) {
        return { 
          flights: [], 
          currentPage: parseInt(page), 
          totalPages: 0, 
          totalFlights: 0 
        };
      }
      
      // Additional in-memory filtering
      let results = [];
      snapshot.forEach(doc => {
        const flight = { id: doc.id, ...doc.data() };
        
        // Apply additional filters in memory
        if (fromCity && flight.fromCity !== fromCity) return;
        if (toCity && flight.toCity !== toCity) return;
        if (minPrice && flight.price < minPrice) return;
        if (maxPrice && flight.price > maxPrice) return;
        
        results.push(flight);
      });
      
      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResults = results.slice(startIndex, endIndex);
      
      return {
        flights: paginatedResults,
        currentPage: parseInt(page),
        totalPages: Math.ceil(results.length / limit),
        totalFlights: results.length
      };
    } catch (error) {
      console.error('Get flights error:', error);
      throw new Error('Failed to fetch flights data');
    }
  },
  
  // Get a single flight by ID
  getFlight: async (flightId) => {
    try {
      const flightDoc = await getDoc(doc(db, 'flights', flightId));
      
      if (!flightDoc.exists()) {
        throw new Error('Flight not found');
      }
      
      return { id: flightDoc.id, ...flightDoc.data() };
    } catch (error) {
      console.error('Get flight error:', error);
      throw new Error('Failed to fetch flight data');
    }
  },
  
  // Create a new flight
  createFlight: async (flightData) => {
    try {
      // Validate required fields
      if (!flightData.flightNumber || !flightData.airline || 
          !flightData.fromCity || !flightData.toCity || 
          !flightData.departureTime || !flightData.arrivalTime ||
          !flightData.price) {
        throw new Error('Missing required flight fields');
      }
      
      // Add created timestamp
      const dataWithTimestamp = {
        ...flightData,
        createdAt: serverTimestamp()
      };
      
      // Create the flight
      const docRef = await addDoc(collection(db, 'flights'), dataWithTimestamp);
      
      return { id: docRef.id, ...flightData };
    } catch (error) {
      console.error('Create flight error:', error);
      throw new Error(`Failed to create flight: ${error.message}`);
    }
  },
  
  // Update a flight
  updateFlight: async (flightId, flightData) => {
    try {
      const flightRef = doc(db, 'flights', flightId);
      
      // Add updated timestamp
      const dataWithTimestamp = {
        ...flightData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(flightRef, dataWithTimestamp);
      
      return { id: flightId, ...flightData };
    } catch (error) {
      console.error('Update flight error:', error);
      throw new Error(`Failed to update flight: ${error.message}`);
    }
  },
  
  // Delete a flight
  deleteFlight: async (flightId) => {
    try {
      await deleteDoc(doc(db, 'flights', flightId));
      return { message: 'Flight deleted successfully' };
    } catch (error) {
      console.error('Delete flight error:', error);
      throw new Error(`Failed to delete flight: ${error.message}`);
    }
  },
  
  // Generate random flights
  generateFlights: async (generationData) => {
    try {
      const { 
        count = 10,
        dateRange,
        priceRange,
        route
      } = generationData;
      
      const flights = [];
      
      console.log("Generating flights with options:", generationData);
      
      // Generate the flights locally first - this will always work
      for (let i = 0; i < count; i++) {
        // Pass all options to generateRandomFlight
        const flight = generateRandomFlight({
          dateRange,
          priceRange,
          route
        });
        
        flights.push({ 
          id: `local-${i}-${Date.now()}`, 
          ...flight 
        });
      }
      
      try {
        // Try to save to Firebase if permissions allow
        const batch = writeBatch(db);
        
        // Add each flight to the batch
        flights.forEach((flight, index) => {
          const newFlightRef = doc(collection(db, 'flights'));
          batch.set(newFlightRef, {
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            fromCity: flight.fromCity,
            toCity: flight.toCity,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            duration: flight.duration,
            price: flight.price,
            availableSeats: flight.availableSeats,
            createdAt: serverTimestamp()
          });
          // Update the ID in our local array with the Firebase ID
          flights[index].id = newFlightRef.id;
        });
        
        // Try to commit the batch
        await batch.commit();
        console.log('Successfully saved flights to Firebase');
        
        return { 
          message: `${count} flights generated successfully and saved to database`,
          flights
        };
      } catch (firebaseError) {
        console.error('Generate flights Firebase error:', firebaseError);
        console.log('Using local flight generation fallback - flights not saved to database');
        
        // Just return the locally generated flights without Firebase IDs
        return {
          message: `${count} flights generated locally (not saved to database)`,
          flights
        };
      }
    } catch (error) {
      console.error('Generate flights error:', error);
      throw new Error(`Failed to generate flights: ${error.message}`);
    }
  }
};

// Flight API functions that interact with Firebase
export const flightApi = {
  // Search for flights based on criteria
  searchFlights: async (from, to, date, page = 1) => {
    try {
      console.log(`Searching for flights from: ${from}, to: ${to}, date: ${date ? date : 'any date'}`);
      
      // Use our consistent airport code utility
      const fromCode = extractAirportCode(from);
      const toCode = extractAirportCode(to);
      
      console.log(`Using normalized codes - from: ${fromCode}, to: ${toCode}`);
      
      const flightsRef = collection(db, 'flights');
      let flightQuery = flightsRef;
      
      // Add filters if provided
      const constraints = [];
      if (fromCode) {
        constraints.push(
          where('fromCity', '==', fromCode)
        );
      }
      
      // Create the query with the first constraint
      if (constraints.length > 0) {
        flightQuery = query(flightQuery, constraints[0]);
      }
      
      // Get the results
      console.log('Executing Firestore query...');
      const snapshot = await getDocs(flightQuery);
      
      if (snapshot.empty) {
        console.log('No flights found in Firestore query');
        return { flights: [], total: 0, page: parseInt(page), totalPages: 0 };
      }
      
      // Process the results with additional filtering
      let results = [];
      snapshot.forEach(doc => {
        const flight = { id: doc.id, ...doc.data() };
        console.log('Processing flight:', flight);
        
        // Apply additional filters in memory
        let includeInResults = true;
        
        // Check destination city
        if (toCode) {
          const flightToCity = flight.toCity;
          if (flightToCity !== toCode) {
            console.log(`Flight destination ${flightToCity} doesn't match search destination ${toCode}`);
            includeInResults = false;
          }
        }
        
        // Filter by date in memory - only if date is provided
        if (date && date.trim() !== '' && includeInResults) {
          try {
            // Get the flight date and convert to Date object if needed
            let flightDate;
            if (flight.departureTime instanceof Timestamp) {
              flightDate = flight.departureTime.toDate();
            } else if (typeof flight.departureTime === 'object' && flight.departureTime.seconds) {
              // Handle Firestore timestamp that got converted to object
              flightDate = new Date(flight.departureTime.seconds * 1000);
            } else {
              // Handle string or other format
              flightDate = new Date(flight.departureTime);
            }
            
            // Convert search date to Date object
            const searchDate = new Date(date);
            
            // Format dates for comparison using ISO strings (YYYY-MM-DD)
            const flightDateStr = flightDate.toISOString().split('T')[0];
            const searchDateStr = searchDate.toISOString().split('T')[0];
            
            console.log(`Comparing dates: flight date = ${flightDateStr}, search date = ${searchDateStr}`);
            
            // Check if dates match
            if (flightDateStr !== searchDateStr) {
              console.log('Date does not match, excluding flight');
              includeInResults = false;
            }
          } catch (error) {
            console.error('Error comparing dates:', error);
            // If there's an error in date comparison, include the flight anyway
            console.log('Including flight despite date parsing error');
          }
        } else {
          console.log('No date filter applied or date is empty');
        }
        
        if (includeInResults) {
          console.log('Flight matches all criteria, adding to results');
          
          // Add display-friendly dates
          try {
            if (flight.departureTime) {
              const depDate = flight.departureTime instanceof Timestamp 
                ? flight.departureTime.toDate() 
                : typeof flight.departureTime === 'object' && flight.departureTime.seconds
                  ? new Date(flight.departureTime.seconds * 1000)
                  : new Date(flight.departureTime);
                  
              flight.displayDepartureDate = depDate.toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
              });
              
              flight.displayDepartureTime = depDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });
            }
            
            if (flight.arrivalTime) {
              const arrDate = flight.arrivalTime instanceof Timestamp 
                ? flight.arrivalTime.toDate() 
                : typeof flight.arrivalTime === 'object' && flight.arrivalTime.seconds
                  ? new Date(flight.arrivalTime.seconds * 1000)
                  : new Date(flight.arrivalTime);
                  
              flight.displayArrivalDate = arrDate.toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
              });
              
              flight.displayArrivalTime = arrDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          } catch (error) {
            console.error('Error formatting display dates:', error);
          }
          
          results.push(flight);
        }
      });
      
      console.log(`Found ${results.length} matching flights`);
      
      // Calculate pagination
      const limit = 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResults = results.slice(startIndex, endIndex);
      
      return {
        flights: paginatedResults,
        total: results.length,
        page: parseInt(page),
        totalPages: Math.ceil(results.length / limit)
      };
    } catch (error) {
      console.error('Search flights error:', error);
      throw new Error('Failed to search flights');
    }
  },
  
  // Get flight by ID
  getFlightById: async (flightId) => {
    try {
      const flightDoc = await getDoc(doc(db, 'flights', flightId));
      
      if (!flightDoc.exists()) {
        throw new Error('Flight not found');
      }
      
      return { id: flightDoc.id, ...flightDoc.data() };
    } catch (error) {
      console.error('Get flight by ID error:', error);
      throw new Error('Failed to fetch flight details');
    }
  },
  
  // Record flight activity (search, booking)
  recordActivity: async (flightId, activityType) => {
    try {
      const user = auth.currentUser;
      const userId = user ? user.uid : 'anonymous';
      
      const activityData = {
        flightId,
        activityType,
        userId,
        timestamp: serverTimestamp()
      };
      
      await addDoc(collection(db, 'flightActivities'), activityData);
      
      return { success: true };
    } catch (error) {
      console.error('Record activity error:', error);
      // Don't throw error for activity recording as it's not critical
      return { success: false };
    }
  }
};

// Helper function to generate a random flight
function generateRandomFlight(options = {}) {
  // Extract options with defaults
  const {
    dateRange = {
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    priceRange = {
      minPrice: 3000,
      maxPrice: 15000
    },
    route = null
  } = options;
  
  // Select origin and destination cities
  let fromCity, toCity;
  
  if (route && route.fromCity && route.toCity) {
    // Use specified route
    fromCity = route.fromCity;
    toCity = route.toCity;
  } else {
    // Generate random route
    fromCity = getRandomElement(cities);
    toCity = getRandomElement(cities);
    
    // Ensure destination is different from origin
    while (toCity === fromCity) {
      toCity = getRandomElement(cities);
    }
  }
  
  // Generate departure time within date range
  const startTime = dateRange.startDate instanceof Date ? dateRange.startDate : new Date(dateRange.startDate);
  const endTime = dateRange.endDate instanceof Date ? dateRange.endDate : new Date(dateRange.endDate);
  
  // Ensure valid date range
  if (startTime > endTime) {
    console.warn("Invalid date range, start date is after end date. Using defaults.");
    startTime.setDate(new Date().getDate() + 1); // Tomorrow
    endTime.setDate(new Date().getDate() + 30); // 30 days from now
  }
  
  // Calculate time range in milliseconds
  const timeRange = endTime.getTime() - startTime.getTime();
  // Generate random time within range
  const randomTime = startTime.getTime() + Math.random() * timeRange;
  const departureTime = new Date(randomTime);
  
  // Set a reasonable hour (between 5 AM and 11 PM)
  departureTime.setHours(getRandomInt(5, 23));
  departureTime.setMinutes(getRandomInt(0, 59));
  
  // Calculate flight duration (between 1-5 hours)
  const durationHours = getRandomInt(1, 5);
  const durationMinutes = getRandomInt(0, 59);
  const duration = `${durationHours}h ${durationMinutes}m`;
  
  // Calculate arrival time
  const arrivalTime = new Date(departureTime);
  arrivalTime.setHours(arrivalTime.getHours() + durationHours);
  arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);
  
  // Generate price within range
  const minPrice = Math.max(1000, priceRange.minPrice || 3000);
  const maxPrice = Math.max(minPrice + 1000, priceRange.maxPrice || 15000);
  const price = generateRandomPrice(minPrice, maxPrice);
  
  // Generate available seats (5-50)
  const availableSeats = getRandomInt(5, 50);
  
  // Generate flight
  return {
    airline: getRandomElement(airlines),
    flightNumber: generateFlightNumber(),
    fromCity,
    toCity,
    departureTime: Timestamp.fromDate(departureTime),
    arrivalTime: Timestamp.fromDate(arrivalTime),
    duration,
    price,
    availableSeats,
    createdAt: serverTimestamp()
  };
} 