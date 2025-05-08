import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Voucher from '../components/Voucher';
import { FaArrowLeft, FaArrowRight, FaHome } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';

export default function TicketPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [relatedBookings, setRelatedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    // First try to load from localStorage (where the app stores bookings)
    const loadFromLocalStorage = () => {
      try {
        // Try to get bookings from localStorage first
        const localBookingsStr = localStorage.getItem('bookings');
        if (localBookingsStr) {
          const localBookings = JSON.parse(localBookingsStr);
          
          // Get base booking ID (without passenger number)
          const baseBookingId = ticketId.split('-')[0];
          const passengerIndex = ticketId.includes('-') ? parseInt(ticketId.split('-')[1]) - 1 : 0;
          
          // Find all bookings with this ID (for multi-passenger bookings)
          let matchingBookings = localBookings.filter(b => 
            b.bookingId === baseBookingId || 
            (b.groupBookingId && b.groupBookingId === baseBookingId)
          );
          
          if (matchingBookings.length > 0) {
            // If we have matching bookings, set them up
            matchingBookings.forEach((b, index) => {
              // Ensure each booking has passengerNumber and totalPassengers
              if (!b.passengerNumber) {
                b.passengerNumber = index + 1;
              }
              if (!b.totalPassengers) {
                b.totalPassengers = matchingBookings.length;
              }
            });
            
            // Sort by passenger number
            matchingBookings.sort((a, b) => 
              (a.passengerNumber || 1) - (b.passengerNumber || 1)
            );
            
            // Set the current booking and related bookings
            const bookingToShow = passengerIndex < matchingBookings.length ? 
              matchingBookings[passengerIndex] : matchingBookings[0];
              
            setBooking(bookingToShow);
            setRelatedBookings(matchingBookings);
            setCurrentIndex(passengerIndex < matchingBookings.length ? passengerIndex : 0);
            setLoading(false);
            
            // Update session storage for future use
            sessionStorage.setItem('viewedBooking', JSON.stringify(bookingToShow));
            sessionStorage.setItem('relatedBookings', JSON.stringify(matchingBookings));
            
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        return false;
      }
    };
    
    // Main function to load ticket data
    const loadTicketData = async () => {
      // First check session storage for cached data
      const sessionBooking = sessionStorage.getItem('viewedBooking');
      
      if (sessionBooking) {
        try {
          const parsedBooking = JSON.parse(sessionBooking);
          const baseBookingId = ticketId.split('-')[0];
          
          if (parsedBooking.bookingId === baseBookingId) {
            setBooking(parsedBooking);
            
            // If we have related bookings in session storage, use those
            const sessionRelated = sessionStorage.getItem('relatedBookings');
            if (sessionRelated) {
              const parsedRelated = JSON.parse(sessionRelated);
              setRelatedBookings(parsedRelated);
              
              // Find current index based on the ticketId
              const passengerIndex = ticketId.includes('-') ? 
                parseInt(ticketId.split('-')[1]) - 1 : 0;
                
              if (passengerIndex < parsedRelated.length) {
                setCurrentIndex(passengerIndex);
              }
            }
            
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing session booking:', error);
        }
      }
      
      // Try to load from localStorage if not in sessionStorage
      const loadedFromLocal = loadFromLocalStorage();
      if (loadedFromLocal) return;
      
      // If all else fails, try to load from Firestore
      try {
        setLoading(true);
        
        // Extract the base bookingId (remove passenger number if present)
        const baseBookingId = ticketId.split('-')[0];
        const passengerNumber = ticketId.includes('-') ? 
          parseInt(ticketId.split('-')[1]) : 1;
        
        // First, try to get the specific booking document
        const bookingRef = doc(db, 'bookings', baseBookingId);
        const bookingDoc = await getDoc(bookingRef);
        
        if (bookingDoc.exists()) {
          // It's a single booking document
          const bookingData = { 
            id: bookingDoc.id, 
            ...bookingDoc.data(),
            bookingId: bookingDoc.id,
            passengerNumber: 1,
            totalPassengers: 1
          };
          
          setBooking(bookingData);
          setRelatedBookings([bookingData]);
          setCurrentIndex(0);
          
          // Store in session for future quick access
          sessionStorage.setItem('viewedBooking', JSON.stringify(bookingData));
          sessionStorage.setItem('relatedBookings', JSON.stringify([bookingData]));
        } else {
          // Check localStorage one more time
          const localLoadResult = loadFromLocalStorage();
          if (localLoadResult) return;
          
          throw new Error(`No booking found with ID: ${ticketId}`);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError(`Failed to load ticket: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadTicketData();
  }, [ticketId]);

  const handleNextTicket = () => {
    if (relatedBookings.length <= 1 || currentIndex >= relatedBookings.length - 1) {
      return;
    }
    
    const nextIndex = currentIndex + 1;
    const nextBooking = relatedBookings[nextIndex];
    let ticketPath;
    
    if (nextBooking.passengerNumber && nextBooking.passengerNumber > 1) {
      ticketPath = `/ticket/${nextBooking.bookingId}-${nextBooking.passengerNumber}`;
    } else {
      ticketPath = `/ticket/${nextBooking.bookingId}`;
    }
    
    navigate(ticketPath);
  };

  const handlePreviousTicket = () => {
    if (relatedBookings.length <= 1 || currentIndex <= 0) {
      return;
    }
    
    const prevIndex = currentIndex - 1;
    const prevBooking = relatedBookings[prevIndex];
    let ticketPath;
    
    if (prevBooking.passengerNumber && prevBooking.passengerNumber > 1) {
      ticketPath = `/ticket/${prevBooking.bookingId}-${prevBooking.passengerNumber}`;
    } else {
      ticketPath = `/ticket/${prevBooking.bookingId}`;
    }
    
    navigate(ticketPath);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className={`max-w-md w-full p-8 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className={`max-w-md w-full p-8 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h1 className="text-2xl font-bold text-emerald-600 mb-4">Booking Not Found</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>The requested booking information could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          <Link to="/bookings" className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors">
            View All Bookings
          </Link>
        </div>
        
        {relatedBookings.length > 1 && (
          <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center">
            <button
              onClick={() => handlePreviousTicket()}
              disabled={currentIndex <= 0}
              className={`flex items-center ${
                currentIndex <= 0 
                  ? `opacity-50 cursor-not-allowed ${isDark ? 'text-gray-500' : 'text-gray-400'}` 
                  : `${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`
              } transition-colors`}
            >
              <FaArrowLeft className="mr-2" />
              Previous Booking
            </button>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Passenger {currentIndex + 1} of {relatedBookings.length}
            </div>
            <button
              onClick={() => handleNextTicket()}
              disabled={currentIndex >= relatedBookings.length - 1}
              className={`flex items-center ${
                currentIndex >= relatedBookings.length - 1 
                  ? `opacity-50 cursor-not-allowed ${isDark ? 'text-gray-500' : 'text-gray-400'}` 
                  : `${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`
              } transition-colors`}
            >
              Next Booking
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        )}
        
        {booking && <Voucher booking={booking} />}
      </div>
    </div>
  );
} 