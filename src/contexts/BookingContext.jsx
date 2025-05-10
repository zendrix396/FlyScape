import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { collection, query, where, getDocs, orderBy, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [wallet, setWallet] = useState(50000); // Starting with 50,000 as specified in requirements
  const [searchHistory, setSearchHistory] = useState({});
  const [bookingHistory, setBookingHistory] = useState({});
  const [priceIncreaseTimes, setPriceIncreaseTimes] = useState({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedBookings = localStorage.getItem('bookings');
    const storedWallet = localStorage.getItem('wallet');
    const storedSearchHistory = localStorage.getItem('searchHistory');
    const storedBookingHistory = localStorage.getItem('bookingHistory');
    const storedPriceIncreaseTimes = localStorage.getItem('priceIncreaseTimes');

    if (storedBookings) setBookings(JSON.parse(storedBookings));
    if (storedWallet) setWallet(parseInt(storedWallet));
    if (storedSearchHistory) setSearchHistory(JSON.parse(storedSearchHistory));
    if (storedBookingHistory) setBookingHistory(JSON.parse(storedBookingHistory));
    if (storedPriceIncreaseTimes) {
      try {
        setPriceIncreaseTimes(JSON.parse(storedPriceIncreaseTimes));
      } catch (error) {
        console.error('Error parsing stored price increase times:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('wallet', wallet.toString());
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('bookingHistory', JSON.stringify(bookingHistory));
  }, [bookingHistory]);

  useEffect(() => {
    localStorage.setItem('priceIncreaseTimes', JSON.stringify(priceIncreaseTimes));
  }, [priceIncreaseTimes]);

  // Check if a flight price should be increased based on search and booking history
  const shouldIncreasePriceBySearchHistory = async (flightId) => {
    if (!flightId) {
      console.error('No flightId provided to shouldIncreasePriceBySearchHistory');
      return false;
    }
    
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      
      // First check if we already have an active price increase for this flight
      if (priceIncreaseTimes[flightId]) {
        const increaseTime = new Date(priceIncreaseTimes[flightId]);
        // If the price increase was set less than 10 minutes ago, maintain it
        if (now.getTime() - increaseTime.getTime() < 10 * 60 * 1000) {
          console.log(`Flight ${flightId} has an active price increase set ${Math.round((now.getTime() - increaseTime.getTime()) / 1000 / 60)} minutes ago. Maintaining price increase.`);
          return true;
        } else {
          // Price increase has expired, remove it from state
          console.log(`Flight ${flightId} price increase has expired. Resetting.`);
          setPriceIncreaseTimes(prev => {
            const newState = { ...prev };
            delete newState[flightId];
            return newState;
          });
        }
      }
      
      // Get search history for this specific flight
      const flightSearchHistory = searchHistory[flightId] || [];
      
      // Filter searches within the last 5 minutes
      const recentSearches = flightSearchHistory.filter(
        timestamp => new Date(timestamp) > fiveMinutesAgo
      );
      
      // Count unique searches in the last 5 minutes
      // Convert timestamps to minutes to count as a single search per minute
      const uniqueRecentSearchMinutes = new Set(
        recentSearches.map(timestamp => {
          const date = new Date(timestamp);
          return `${date.getHours()}:${date.getMinutes()}`;
        })
      ).size;

      // Check for recent bookings in Firestore - using simplified query
      let recentBookingsCount = 0;
      try {
        // Use a simpler query that doesn't require the compound index
        const flightBookingsRef = collection(db, 'bookings');
        const q = query(
          flightBookingsRef,
          where('flight.id', '==', flightId)
        );
        
        const querySnapshot = await getDocs(q);
        
        // Filter the results in JavaScript instead of in the query
        recentBookingsCount = querySnapshot.docs.filter(doc => {
          const bookingDate = doc.data().bookingDate;
          if (!bookingDate) return false;
          
          // Convert bookingDate to a Date object if it's a string or Timestamp
          let bookingDateObj;
          if (typeof bookingDate === 'string') {
            bookingDateObj = new Date(bookingDate);
          } else if (bookingDate instanceof Timestamp) {
            bookingDateObj = bookingDate.toDate();
          } else if (bookingDate.toDate && typeof bookingDate.toDate === 'function') {
            bookingDateObj = bookingDate.toDate();
          } else {
            return false;
          }
          
          return bookingDateObj >= fiveMinutesAgo;
        }).length;
      } catch (error) {
        console.error(`Error fetching recent bookings for flight ${flightId}:`, error);
      }
      
      // Also check local booking history
      const flightBookingHistory = bookingHistory[flightId] || [];
      const recentLocalBookings = flightBookingHistory.filter(
        timestamp => new Date(timestamp) > fiveMinutesAgo
      );
      
      // Combined count from searches and bookings (local + Firestore)
      const totalRecentActivity = uniqueRecentSearchMinutes + recentBookingsCount + recentLocalBookings.length;
      
      // Should increase price if there are 3 or more activities in the last 5 minutes
      const shouldIncrease = totalRecentActivity >= 3;
      
      // If we should increase the price, store the current time
      if (shouldIncrease) {
        setPriceIncreaseTimes(prev => ({
          ...prev,
          [flightId]: now.toISOString()
        }));
      }
      
      // For debugging
      console.log(`Flight ${flightId} activity: ${uniqueRecentSearchMinutes} unique searches, ${recentBookingsCount} Firestore bookings, ${recentLocalBookings.length} local bookings. Total: ${totalRecentActivity}. Increase price: ${shouldIncrease}`);
      
      return shouldIncrease;
    } catch (error) {
      console.error(`Error checking price increase for flight ${flightId}:`, error);
      return false;
    }
  };

  // Record a flight search
  const recordFlightSearch = (flightId) => {
    if (!flightId) {
      console.error('No flightId provided to recordFlightSearch');
      return;
    }
    
    const now = new Date();
    
    setSearchHistory(prev => {
      const flightSearches = prev[flightId] || [];
      
      // Add the current timestamp to the search history
      return {
        ...prev,
        [flightId]: [...flightSearches, now.toISOString()]
      };
    });
  };

  // Record a flight booking
  const recordFlightBooking = (flightId) => {
    if (!flightId) {
      console.error('No flightId provided to recordFlightBooking');
      return;
    }
    
    const now = new Date();
    
    setBookingHistory(prev => {
      const flightBookings = prev[flightId] || [];
      
      // Add the current timestamp to the booking history
      return {
        ...prev,
        [flightId]: [...flightBookings, now.toISOString()]
      };
    });
  };

  // Create a new booking
  const createBooking = (bookingData) => {
    const { flight, passengerName, email, phone, paymentMethod } = bookingData;
    
    // Calculate total price (including taxes)
    const totalPrice = flight.price;
    
    // Check if user has enough balance
    if (paymentMethod === 'wallet' && wallet < totalPrice) {
      throw new Error('Insufficient wallet balance');
    }
    
    // Generate a unique booking ID
    const bookingId = uuidv4().substring(0, 8).toUpperCase();
    
    // Create the booking object
    const newBooking = {
      bookingId,
      flight,
      passengerName,
      email,
      phone,
      totalPrice,
      paymentMethod,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };
    
    // Update bookings state
    setBookings(prev => [...prev, newBooking]);
    
    // If paid with wallet, deduct from balance
    if (paymentMethod === 'wallet') {
      setWallet(prev => prev - totalPrice);
    }

    // Record this booking for price tracking
    recordFlightBooking(flight.id);
    
    return newBooking;
  };

  // Get a booking by ID
  const getBookingById = (bookingId) => {
    return bookings.find(booking => booking.bookingId === bookingId);
  };

  // Cancel a booking
  const cancelBooking = (bookingId) => {
    const booking = getBookingById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Update booking status
    setBookings(prev => 
      prev.map(b => 
        b.bookingId === bookingId 
          ? { ...b, status: 'cancelled' } 
          : b
      )
    );
    
    // Refund to wallet if paid with wallet
    if (booking.paymentMethod === 'wallet') {
      setWallet(prev => prev + booking.totalPrice);
    }
    
    return true;
  };

  const value = {
    bookings,
    wallet,
    createBooking,
    getBookingById,
    cancelBooking,
    recordFlightSearch,
    recordFlightBooking,
    shouldIncreasePriceBySearchHistory
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
} 