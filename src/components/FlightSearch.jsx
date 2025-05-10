import React, { useState, useRef, useEffect } from 'react';
import { FaPlane, FaCalendarAlt, FaSearch, FaExchangeAlt, FaUser, FaAngleDown, FaAngleUp, FaCalendarCheck, FaGlobe } from 'react-icons/fa';
import GradientText from './GradientText';
import AnimatedList from './AnimatedList';
import { motion, AnimatePresence } from 'framer-motion';
import { searchAirports, formatAirportForDisplay } from '../services/airportService';
import { extractAirportCode } from '../utils/airportUtil';
import { useTheme } from '../contexts/ThemeContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { setUseAmadeusApi } from '../services/flightService';

export default function FlightSearch({ onSearch, className = '', initialValues = {} }) {
  const { isDark } = useTheme();
  const [from, setFrom] = useState(initialValues.from || '');
  const [to, setTo] = useState(initialValues.to || '');
  const [date, setDate] = useState(
    initialValues.date ? new Date(initialValues.date) : new Date()
  );
  const [passengers, setPassengers] = useState(initialValues.passengers || 1);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchAllDates, setSearchAllDates] = useState(initialValues.allDates || false);
  const [useAmadeusAPI, setUseAmadeusAPI] = useState(true);

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const passengerRef = useRef(null);

  // Effect to update API choice when toggle changes
  useEffect(() => {
    setUseAmadeusApi(useAmadeusAPI);
  }, [useAmadeusAPI]);

  // Use expanded airport list from service
  const dummySuggestions = [
    'Delhi (DEL)',
    'Mumbai (BOM)',
    'Bangalore (BLR)',
    'Chennai (MAA)',
    'Kolkata (CCU)',
    'Hyderabad (HYD)',
    'Ahmedabad (AMD)',
    'Cochin (COK)',
    'Pune (PNQ)',
    'Jaipur (JAI)',
    'Goa (GOI)',
    'Dubai (DXB)',
    'Singapore (SIN)',
    'London (LHR)',
    'New York (JFK)',
    'Bangkok (BKK)',
    'Hong Kong (HKG)',
    'Sydney (SYD)'
  ];

  const handleFromChange = async (e) => {
    const value = e.target.value;
    setFrom(value);
    if (value.trim().length > 0) {
      // Mock API call for suggestions
      setIsLoading(true);
      try {
        // Try to use the searchAirports service, fallback to dummy suggestions
        const airports = await searchAirports(value);
        if (airports && airports.length > 0) {
          setSuggestions(airports.map(airport => `${airport.name} (${airport.code})`));
        } else {
          const filtered = dummySuggestions.filter(
            (s) => s.toLowerCase().includes(value.toLowerCase())
          );
          setSuggestions(filtered);
        }
      } catch (error) {
        const filtered = dummySuggestions.filter(
          (s) => s.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
      } finally {
        setIsLoading(false);
        setShowFromSuggestions(true);
        setShowToSuggestions(false);
      }
    } else {
      // Show popular suggestions when input is empty
      try {
        const airports = await searchAirports('');
        if (airports && airports.length > 0) {
          setSuggestions(airports.map(airport => `${airport.name} (${airport.code})`));
          setShowFromSuggestions(true);
        }
      } catch (error) {
        setSuggestions(dummySuggestions.slice(0, 5));
        setShowFromSuggestions(true);
      }
    }
  };

  const handleToChange = async (e) => {
    const value = e.target.value;
    setTo(value);
    if (value.trim().length > 0) {
      // Mock API call for suggestions
      setIsLoading(true);
      try {
        // Try to use the searchAirports service, fallback to dummy suggestions
        const airports = await searchAirports(value);
        if (airports && airports.length > 0) {
          setSuggestions(airports.map(airport => `${airport.name} (${airport.code})`));
        } else {
          const filtered = dummySuggestions.filter(
            (s) => s.toLowerCase().includes(value.toLowerCase())
          );
          setSuggestions(filtered);
        }
      } catch (error) {
        const filtered = dummySuggestions.filter(
          (s) => s.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
      } finally {
        setIsLoading(false);
        setShowToSuggestions(true);
        setShowFromSuggestions(false);
      }
    } else {
      // Show popular suggestions when input is empty
      try {
        const airports = await searchAirports('');
        if (airports && airports.length > 0) {
          setSuggestions(airports.map(airport => `${airport.name} (${airport.code})`));
          setShowToSuggestions(true);
        }
      } catch (error) {
        setSuggestions(dummySuggestions.slice(0, 5));
        setShowToSuggestions(true);
      }
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    if (showFromSuggestions) {
      setFrom(suggestion);
      setShowFromSuggestions(false);
      toRef.current.focus();
    } else if (showToSuggestions) {
      setTo(suggestion);
      setShowToSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    // Use our consistent airport code extraction utility
    const fromCode = extractAirportCode(from);
    const toCode = extractAirportCode(to);

    if (!fromCode || !toCode) {
      alert('Please select both departure and arrival cities');
      return;
    }

    // Only include date if not searching all dates
    const searchDate = searchAllDates ? null : date;

    onSearch({
      from: fromCode,
      to: toCode,
      date: searchDate,
      passengers,
      allDates: searchAllDates
    });
  };

  const handleSwapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
      if (passengerRef.current && !passengerRef.current.contains(event.target)) {
        setShowPassengerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load initial popular suggestions
  useEffect(() => {
    const loadInitialSuggestions = async () => {
      try {
        const airports = await searchAirports('');
        if (airports && airports.length > 0) {
          setSuggestions(airports.map(airport => `${airport.name} (${airport.code})`));
        } else {
          setSuggestions(dummySuggestions.slice(0, 5));
        }
      } catch (error) {
        setSuggestions(dummySuggestions.slice(0, 5));
      }
    };
    
    loadInitialSuggestions();
  }, []);

  // Toggle Amadeus API usage
  const handleAPIToggle = () => {
    setUseAmadeusAPI(prev => !prev);
  };

  return (
    <div className={`${className} sm:mb-20 md:mb-10`}>
      <div className="mb-4 sm:mb-6">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} text-center`}>Search Flights</h2>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2 text-base sm:text-lg text-center`}>Find the best deals on flights</p>
      </div>

      <form onSubmit={handleSearchSubmit}>
        {/* Add API toggle switch */}
        <div className="flex items-center justify-end mb-4">
          <span className={`text-xs mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <FaGlobe className="inline mr-1" />
            Use Real-time Flight API
          </span>
          <div 
            className={`relative inline-block w-10 h-5 rounded-full transition-colors cursor-pointer ${useAmadeusAPI ? 'bg-emerald-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
            onClick={handleAPIToggle}
          >
            <span 
              className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${useAmadeusAPI ? 'transform translate-x-5' : ''}`} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          <div className="relative" ref={fromRef}>
            <label className={`block text-sm sm:text-base font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1 sm:mb-2`}>From</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPlane className={`h-4 w-4 sm:h-5 sm:w-5 ${isDark ? 'text-emerald-400' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                className={`block w-full pl-9 sm:pl-12 pr-3 py-3 sm:py-4 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500 focus:border-emerald-500' 
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                } rounded-md text-sm sm:text-base`}
                placeholder="City or airport"
                value={from}
                onChange={handleFromChange}
                onClick={() => setShowFromSuggestions(true)}
              />
            </div>
            {showFromSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full">
                <AnimatedList
                  items={suggestions}
                  onItemSelect={handleSuggestionSelect}
                  className={`w-full ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg rounded-md overflow-hidden text-sm sm:text-base`}
                  isDark={isDark}
                />
              </div>
            )}
          </div>

          <div className="relative flex" ref={toRef}>
            <div className="flex-grow">
              <label className={`block text-sm sm:text-base font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1 sm:mb-2`}>To</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPlane className={`h-4 w-4 sm:h-5 sm:w-5 ${isDark ? 'text-emerald-400' : 'text-gray-400'} transform rotate-90`} />
                </div>
                <input
                  type="text"
                  className={`block w-full pl-9 sm:pl-12 pr-3 py-3 sm:py-4 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500 focus:border-emerald-500' 
                      : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                  } rounded-md text-sm sm:text-base`}
                  placeholder="City or airport"
                  value={to}
                  onChange={handleToChange}
                  onClick={() => setShowToSuggestions(true)}
                />
              </div>
              {showToSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full">
                  <AnimatedList
                    items={suggestions}
                    onItemSelect={handleSuggestionSelect}
                    className={`w-full ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg rounded-md overflow-hidden text-sm sm:text-base`}
                    isDark={isDark}
                  />
                </div>
              )}
            </div>
            <div className="flex items-end ml-2 md:ml-3 mb-[2px]">
              <button
                type="button"
                onClick={handleSwapLocations}
                className={`p-3 sm:p-4 ${
                  isDark 
                    ? 'bg-gray-700 text-emerald-400 hover:bg-gray-600' 
                    : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                } rounded-md transition-colors`}
              >
                <FaExchangeAlt className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className={`block text-sm sm:text-base font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1 sm:mb-2`}>Date</label>
              <div className={`flex items-center text-xs sm:text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <input
                  type="checkbox"
                  id="allDates"
                  checked={searchAllDates}
                  onChange={() => setSearchAllDates(!searchAllDates)}
                  className={`mr-2 h-4 w-4 ${isDark ? 'bg-gray-700 border-gray-600' : ''} text-emerald-500 focus:ring-emerald-500 rounded-sm`}
                />
                <label htmlFor="allDates" className="flex items-center cursor-pointer">
                  <FaCalendarCheck className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> All dates
                </label>
              </div>
            </div>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className={`h-4 w-4 sm:h-5 sm:w-5 text-emerald-400`} />
              </div>
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                minDate={new Date()}
                placeholderText="Select departure date"
                className={`block w-full pl-9 sm:pl-12 py-3 sm:py-4 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500 focus:border-emerald-500' 
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                } ${searchAllDates ? (isDark ? 'bg-gray-800' : 'bg-gray-100') : ''} rounded-md text-sm sm:text-base`}
                disabled={searchAllDates}
                calendarClassName={isDark ? 'dark-calendar' : ''}
              />
            </div>
          </div>

          <div className="relative" ref={passengerRef}>
            <label className={`block text-sm sm:text-base font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1 sm:mb-2`}>Passengers</label>
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                className={`relative w-full ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-700'
                } border rounded-md shadow-sm pl-9 sm:pl-12 pr-3 py-3 sm:py-4 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base`}
              >
                <span className="block truncate">{passengers} Passenger{passengers > 1 ? 's' : ''}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                  {showPassengerDropdown ? (
                    <FaAngleUp className={`h-4 w-4 sm:h-5 sm:w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  ) : (
                    <FaAngleDown className={`h-4 w-4 sm:h-5 sm:w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  )}
                </span>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaUser className={`h-4 w-4 sm:h-5 sm:w-5 ${isDark ? 'text-emerald-400' : 'text-gray-400'}`} />
                </span>
              </button>

              <AnimatePresence>
                {showPassengerDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute z-10 mt-1 w-full ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-md py-2`}
                  >
                    <div className="px-4 py-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Select passengers</span>
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <button
                            type="button"
                            onClick={() => passengers > 1 && setPassengers(passengers - 1)}
                            className={`p-2 sm:p-2.5 rounded-md ${
                              passengers > 1 
                                ? (isDark ? 'bg-emerald-800 text-emerald-300' : 'bg-emerald-100 text-emerald-600') 
                                : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400')
                            }`}
                            disabled={passengers <= 1}
                          >
                            <span className="text-base sm:text-lg font-medium">-</span>
                          </button>
                          <span className={`text-base sm:text-lg font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>{passengers}</span>
                          <button
                            type="button"
                            onClick={() => passengers < 9 && setPassengers(passengers + 1)}
                            className={`p-2 sm:p-2.5 rounded-md ${
                              passengers < 9 
                                ? (isDark ? 'bg-emerald-800 text-emerald-300' : 'bg-emerald-100 text-emerald-600') 
                                : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400')
                            }`}
                            disabled={passengers >= 9}
                          >
                            <span className="text-base sm:text-lg font-medium">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <button
            type="submit"
            className={`w-full flex justify-center items-center py-3 sm:py-4 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-lg font-medium text-white ${
              isDark ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
          >
            <FaSearch className="mr-2 h-5 w-5" />
            Search Flights
          </button>
        </div>
      </form>
    </div>
  );
} 