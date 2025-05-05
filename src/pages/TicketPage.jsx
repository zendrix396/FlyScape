import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Voucher from '../components/Voucher';
import { FaArrowLeft, FaArrowRight, FaHome } from 'react-icons/fa';

export default function TicketPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [relatedBookings, setRelatedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className=" rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl max-w-lg w-full text-center">
          <div className="text-gray-600 text-6xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto h-16 w-16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Ticket Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 ">
            <FaHome className="mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl max-w-lg w-full text-center">
          <div className="text-gray-600 text-6xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto h-16 w-16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">The requested ticket could not be found. Please check your booking ID.</p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center">
            <Link to="/" className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 ">
              <FaHome className="mr-2" />
              Return to Home
            </Link>
            <Link to="/bookings" className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 ">
              View My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center text-gray-700 hover:text-gray-800 ">
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          <Link to="/bookings" className="flex items-center text-gray-700 hover:text-gray-800 ">
            View All Bookings
          </Link>
        </div>
        
        {relatedBookings.length > 1 && (
          <div className="flex justify-center mb-4 items-center">
            <button
              onClick={handlePreviousTicket}
              disabled={currentIndex <= 0}
              className={`p-2 rounded-full ${currentIndex <= 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <span className="mx-4 text-gray-600 font-medium">
              Passenger {currentIndex + 1} of {relatedBookings.length}
            </span>
            <button
              onClick={handleNextTicket}
              disabled={currentIndex >= relatedBookings.length - 1}
              className={`p-2 rounded-full ${currentIndex >= relatedBookings.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FaArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {booking && <Voucher booking={booking} />}
      </div>
    </div>
  );
} 