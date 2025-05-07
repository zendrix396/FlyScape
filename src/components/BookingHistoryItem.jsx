import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import { FaPlane, FaCalendarAlt, FaClock, FaTicketAlt, FaUser, FaMoneyBillAlt, FaCheck, FaTimes, FaArrowRight, FaRedo, FaPlaneDeparture, FaRegCalendarCheck, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { formatAirportForDisplay } from '../utils/airportUtil';
import { useTheme } from '../contexts/ThemeContext';

export default function BookingHistoryItem({ booking }) {
  const navigate = useNavigate();
  const { flight, passengerName, bookingId, bookingDate, status } = booking;
  const { isDark } = useTheme();

  const statusColors = {
    'Confirmed': 'text-emerald-600 bg-emerald-100',
    'Cancelled': 'text-red-600 bg-red-100',
    'Completed': 'text-blue-600 bg-blue-100',
  };

  // Safe date formatting function to prevent "Invalid time value" errors
  const safeFormatDate = (dateInput) => {
    if (!dateInput) return "N/A";
    
    try {
      // Handle Firestore timestamp objects
      if (typeof dateInput === 'object' && dateInput !== null && dateInput.seconds) {
        return new Date(dateInput.seconds * 1000).toLocaleDateString();
      }
      
      // Handle Date objects
      if (dateInput instanceof Date) {
        return dateInput.toLocaleDateString();
      }
      
      // Handle ISO strings or other string formats
      if (typeof dateInput === 'string') {
        const date = new Date(dateInput);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }
      
      // If nothing works, return the original
      return String(dateInput);
    } catch (error) {
      console.error("Error formatting date:", error, dateInput);
      return "Invalid date";
    }
  };

  // Safe time formatting function
  const safeFormatTime = (timeInput) => {
    if (!timeInput) return "N/A";
    
    try {
      // Handle Firestore timestamp objects
      if (typeof timeInput === 'object' && timeInput !== null && timeInput.seconds) {
        return new Date(timeInput.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Handle Date objects
      if (timeInput instanceof Date) {
        return timeInput.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Handle ISO strings or other string formats
      if (typeof timeInput === 'string') {
        const date = new Date(timeInput);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
      
      // If nothing works, return the original
      return String(timeInput);
    } catch (error) {
      console.error("Error formatting time:", error, timeInput);
      return "Invalid time";
    }
  };

  // Format city codes safely
  const formatCity = (cityCode) => {
    if (!cityCode) return "Unknown";
    try {
      return formatAirportForDisplay(cityCode);
    } catch (error) {
      return cityCode;
    }
  };
  
  // Format the flight details with error handling
  const fromCityDisplay = flight?.fromCity ? formatCity(flight.fromCity) : "Unknown";
  const toCityDisplay = flight?.toCity ? formatCity(flight.toCity) : "Unknown";
  const airlineDisplay = flight?.airline || "Unknown Airline";
  const flightNumberDisplay = flight?.flightNumber || "Unknown";
  
  // Safely format dates and times
  const bookingDateDisplay = safeFormatDate(bookingDate);
  const departureTimeDisplay = flight?.departureTime ? safeFormatTime(flight.departureTime) : "N/A";
  const departureDateDisplay = flight?.departureTime ? safeFormatDate(flight.departureTime) : "N/A";

  const handleViewTicket = () => {
    // Store the booking in session storage
    sessionStorage.setItem('selectedBooking', JSON.stringify(booking));
    navigate(`/ticket/${bookingId}`);
  };

  const handleBookAgain = () => {
    // Store the flight in session storage
    const searchResults = [flight];
    sessionStorage.setItem('searchResults', JSON.stringify(searchResults));
    
    // Create appropriate search params
    const searchParams = {
      from: flight.from,
      to: flight.to,
      date: flight.displayDepartureDate || 
            safeFormatDate(flight.departureTime),
      passengers: 1
    };
    sessionStorage.setItem('searchParams', JSON.stringify(searchParams));
    
    // Navigate to booking page
    navigate(`/booking/${flight.id}`);
  };

  // Get price to display - use the most reliable price field available
  const getPrice = () => {
    if (flight) {
      if (typeof booking.price === 'number' || typeof booking.price === 'string') {
        return booking.price;
      }
      if (typeof flight.price === 'number' || typeof flight.price === 'string') {
        return flight.price;
      }
    }
    return 'N/A';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 mb-4`}
    >
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex items-start mb-3 md:mb-0">
          <div className={`${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'} p-2 rounded-full mr-3`}>
            <FaPlaneDeparture className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <div>
            <div className="flex items-center">
              <span className={`text-lg font-semibold ${isDark ? 'text-white' : ''}`}>{fromCityDisplay} → {toCityDisplay}</span>
              <span className={`ml-3 text-xs font-medium px-2 py-1 rounded ${
                status === 'Confirmed' ? `${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}` : 
                status === 'Cancelled' ? `${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}` : 
                `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`
              }`}>
                {status}
              </span>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{airlineDisplay} • {flightNumberDisplay}</div>
            <div className={`flex items-center mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <FaRegCalendarCheck className="mr-1" /> {departureDateDisplay} • {departureTimeDisplay}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="mr-0 md:mr-4 mb-2 md:mb-0">
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Booking ID</div>
            <div className={`text-sm font-medium ${isDark ? 'text-white' : ''}`}>{bookingId}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Booked on {bookingDateDisplay}</div>
          </div>
          
          <div className="flex">
            <button 
              onClick={handleViewTicket}
              className={`flex items-center justify-center text-xs ${
                isDark 
                  ? 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30' 
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              } px-3 py-2 rounded-md mr-2 transition-colors`}
            >
              <FaEye className="mr-1" /> View Ticket
            </button>
            <button 
              onClick={handleBookAgain}
              className={`flex items-center justify-center text-xs ${
                isDark 
                  ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              } px-3 py-2 rounded-md transition-colors`}
            >
              <FaRedo className="mr-1" /> Book Again
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 