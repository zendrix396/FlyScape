import React from 'react';
import { motion } from 'framer-motion';
import { FaPlane, FaClock, FaCalendar, FaRupeeSign } from 'react-icons/fa';
import CountUp from './CountUp';
import { formatAirportForDisplay } from '../utils/airportUtil';
import { useTheme } from '../contexts/ThemeContext';

export default function FlightCard({
  flight,
  onClick,
  selected = false,
  showDetails = false,
  priceIncreased = false
}) {
  const { isDark } = useTheme();
  
  const {
    airline,
    flightNumber,
    departureTime,
    arrivalTime,
    fromCity,
    toCity,
    price,
    duration,
    displayDepartureDate,
    displayArrivalDate,
    displayDepartureTime,
    displayArrivalTime
  } = flight;

  // Format airport code to display properly
  const formatCity = (cityCode) => {
    if (!cityCode) return "Unknown";
    
    // Check if the city is already a formatted string (like "Mumbai (BOM)")
    if (typeof cityCode === 'string' && cityCode.includes('(') && cityCode.includes(')')) {
      return cityCode;
    }
    
    // Otherwise, use the utility to format it
    try {
      return formatAirportForDisplay(cityCode);
    } catch (error) {
      console.error("Error formatting city:", error);
      return cityCode; // Return the raw code if we can't format it
    }
  };

  // Format the date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    
    try {
      // If it's a Firestore timestamp object
      if (typeof timestamp === 'object' && timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      // If it's a JavaScript Date object or timestamp string
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  };

  // Format the time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // First check if we already have display time from the server
    if (displayDepartureTime || displayArrivalTime) {
      if (timeString === departureTime && displayDepartureTime) {
        return displayDepartureTime;
      }
      if (timeString === arrivalTime && displayArrivalTime) {
        return displayArrivalTime;
      }
    }
    
    try {
      // Handle Firestore Timestamp objects
      if (typeof timeString === 'object' && timeString !== null) {
        if (timeString.seconds) {
          // It's a Firestore Timestamp
          const date = new Date(timeString.seconds * 1000);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (timeString instanceof Date) {
          return timeString.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } else if (typeof timeString === 'string') {
        // It's a string date
        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Fallback
      return String(timeString);
    } catch (error) {
      console.error('Error formatting time:', error, timeString);
      return String(timeString); // Return original if can't format
    }
  };

  // Format the duration - either use the duration string or calculate it
  const formatDuration = (durationInput) => {
    // If durationInput is already a string like "2h 30m", return it
    if (typeof durationInput === 'string' && durationInput.includes('h')) {
      return durationInput;
    }
    
    // Otherwise calculate from minutes
    const minutes = parseInt(durationInput);
    if (isNaN(minutes)) return '---';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Derived values with fallbacks
  const fromCityDisplay = formatCity(fromCity);
  const toCityDisplay = formatCity(toCity);
  const departureTimeDisplay = displayDepartureTime || formatTime(departureTime);
  const arrivalTimeDisplay = displayArrivalTime || formatTime(arrivalTime);
  const departureDateDisplay = displayDepartureDate || formatDate(departureTime);
  const arrivalDateDisplay = displayArrivalDate || formatDate(arrivalTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md overflow-hidden cursor-pointer transition-colors ${
        selected ? 'border-2 border-emerald-500' : isDark ? 'border border-gray-700' : 'border border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="p-3 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="flex-shrink-0 mr-2 sm:mr-3">
              <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'} flex items-center justify-center`}>
                <FaPlane className={`h-4 w-4 sm:h-5 sm:w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
            </div>
            <div>
              <div className={`text-base sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{airline || 'Unknown Airline'}</div>
              <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{flightNumber || 'No Flight Number'}</div>
            </div>
          </div>

          <div className="flex-grow md:mx-4 lg:mx-10 mb-3 md:mb-0 w-full md:w-auto">
            {/* Desktop view - horizontal layout */}
            <div className="hidden md:flex items-center justify-between relative">
              <div className="text-center">
                <div className={`text-base sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{departureTimeDisplay || '00:00'}</div>
                <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{fromCityDisplay}</div>
                {departureDateDisplay && (
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center mt-1`}>
                    <FaCalendar className="mr-1" size={10} />
                    {departureDateDisplay}
                  </div>
                )}
              </div>
              
              <div className="flex-grow mx-1 sm:mx-4 px-2 sm:px-4">
                <div className={`relative h-[2px] ${isDark ? 'bg-gray-600' : 'bg-gray-300'} mt-4 sm:mt-6`}>
                  <div className="absolute left-0 -top-[9px] h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-emerald-500"></div>
                  <div className="absolute right-0 -top-[9px] h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-emerald-500"></div>
                </div>
                <div className={`text-[10px] sm:text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1 sm:mt-2 flex items-center justify-center`}>
                  <FaClock className="mr-1" /> {formatDuration(duration) || '0h 0m'}
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-base sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{arrivalTimeDisplay || '00:00'}</div>
                <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{toCityDisplay}</div>
                {arrivalDateDisplay && (
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center mt-1`}>
                    <FaCalendar className="mr-1" size={10} />
                    {arrivalDateDisplay}
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile view - vertical layout */}
            <div className="md:hidden flex flex-col w-full">
              <div className="flex justify-between items-center mb-2">
                <div className="flex flex-col items-start">
                  <div className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{departureTimeDisplay || '00:00'}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{fromCityDisplay}</div>
                </div>
                
                <div className={`h-10 w-10 ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'} rounded-full flex items-center justify-center mx-2`}>
                  <div className="h-5 w-5 rounded-full bg-emerald-500"></div>
                </div>
              </div>
              
              <div className="w-full flex items-center px-4 my-1">
                <div className={`w-[2px] h-16 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} mx-auto relative`}>
                  <div className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-white'} px-1 whitespace-nowrap`}>
                    <FaClock className="inline mr-1" size={10} /> {formatDuration(duration) || '0h 0m'}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-start">
                  <div className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{arrivalTimeDisplay || '00:00'}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{toCityDisplay}</div>
                </div>
                
                <div className={`h-10 w-10 ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'} rounded-full flex items-center justify-center mx-2`}>
                  <div className="h-5 w-5 rounded-full bg-emerald-500"></div>
                </div>
              </div>
            </div>
          </div>

          <div className={`border-t md:border-t-0 md:border-l ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-3 md:pt-0 md:pl-4 lg:pl-6 w-full md:w-auto`}>
            <div className="flex flex-col items-center md:items-end">
              <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Price</div>
              <div className="flex flex-col items-center md:items-end">
                {flight.priceIncreased && flight.originalPrice && (
                  <div className={`text-xs sm:text-sm line-through ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-1 font-medium`}>
                    <FaRupeeSign className="inline text-gray-500 text-xs mr-0.5" />
                    {flight.originalPrice}
                  </div>
                )}
                <div className="flex items-center">
                  <FaRupeeSign className={flight.priceIncreased ? "text-red-500 text-sm" : isDark ? "text-emerald-400 text-sm" : "text-emerald-600 text-sm"} />
                  <div className={`text-lg sm:text-xl font-bold ml-1 ${flight.priceIncreased ? "text-red-500" : isDark ? "text-white" : "text-gray-800"}`}>
                    <CountUp
                      from={price - 100} 
                      to={price || 0} 
                      duration={0.5} 
                      separator=","
                    />
                  </div>
                </div>
                {flight.priceIncreased && (
                  <div className="text-[10px] sm:text-xs text-red-500 mt-1 font-medium">Price increased due to high demand</div>
                )}
              </div>
              <button
                className={`mt-2 sm:mt-3 px-3 sm:px-4 py-1 sm:py-2 ${
                  isDark ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'
                } text-white rounded-md text-xs sm:text-sm transition-colors`}
                onClick={onClick}
              >
                Select
              </button>
            </div>
          </div>
        </div>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Baggage</div>
                <div className="text-sm font-medium">Check-in: 15kg</div>
                <div className="text-sm font-medium">Cabin: 7kg</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Amenities</div>
                <div className="text-sm font-medium">Wi-Fi available</div>
                <div className="text-sm font-medium">In-flight meals</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 