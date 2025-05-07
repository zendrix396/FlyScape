import React, { useState, useRef, useEffect } from 'react';
import { FaPlane, FaCalendarAlt, FaSearch, FaExchangeAlt, FaUser, FaAngleDown, FaAngleUp, FaCalendarCheck } from 'react-icons/fa';
import GradientText from './GradientText';
import AnimatedList from './AnimatedList';
import { motion, AnimatePresence } from 'framer-motion';
import { searchAirports, formatAirportForDisplay } from '../services/airportService';
import { extractAirportCode } from '../utils/airportUtil';

export default function FlightSearch({ onSearch }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(1);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchAllDates, setSearchAllDates] = useState(false);

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const passengerRef = useRef(null);

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
    if (value.trim().length > 1) {
      // Mock API call for suggestions
      setIsLoading(true);
      try {
        // Try to use the searchAirports service, fallback to dummy suggestions
        const airports = await searchAirports(value);
        if (airports && airports.length > 0) {
          setSuggestions(airports.map(formatAirportForDisplay));
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
      setSuggestions([]);
      setShowFromSuggestions(false);
    }
  };

  const handleToChange = async (e) => {
    const value = e.target.value;
    setTo(value);
    if (value.trim().length > 1) {
      // Mock API call for suggestions
      setIsLoading(true);
      try {
        // Try to use the searchAirports service, fallback to dummy suggestions
        const airports = await searchAirports(value);
        if (airports && airports.length > 0) {
          setSuggestions(airports.map(formatAirportForDisplay));
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
      setSuggestions([]);
      setShowToSuggestions(false);
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
    
    // Only include date if not searching all dates
    const searchDate = searchAllDates ? '' : date;
    
    console.log(`Search submitted with params - from: ${fromCode}, to: ${toCode}, date: ${searchDate || 'any date'}`);
    
    onSearch({
      from: fromCode,
      to: toCode,
      date: searchDate,
      passengers,
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
      <div className="mb-4 sm:mb-6 text-center">
        <GradientText
          colors={["#10b981", "#6ee7b7", "#10b981"]}
          animationSpeed={5}
          className="text-2xl sm:text-3xl font-bold"
        >
          Search Flights
        </GradientText>
        <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Find the best deals on flights</p>
      </div>

      <form onSubmit={handleSearchSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="relative" ref={fromRef}>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">From</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPlane className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-8 sm:pl-10 pr-8 sm:pr-12 py-2 sm:py-3 text-xs sm:text-sm border-gray-300 rounded-md"
                placeholder="City or airport"
                value={from}
                onChange={handleFromChange}
                onClick={() => showFromSuggestions && suggestions.length > 0 && setShowFromSuggestions(true)}
                required
              />
            </div>
            {showFromSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full">
                <AnimatedList
                  items={suggestions}
                  onItemSelect={handleSuggestionSelect}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="relative flex" ref={toRef}>
            <div className="flex-grow">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">To</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPlane className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transform rotate-90" />
                </div>
                <input
                  type="text"
                  className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-8 sm:pl-10 pr-8 sm:pr-12 py-2 sm:py-3 text-xs sm:text-sm border-gray-300 rounded-md"
                  placeholder="City or airport"
                  value={to}
                  onChange={handleToChange}
                  onClick={() => showToSuggestions && suggestions.length > 0 && setShowToSuggestions(true)}
                  required
                />
              </div>
              {showToSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full">
                  <AnimatedList
                    items={suggestions}
                    onItemSelect={handleSuggestionSelect}
                    className="w-full"
                  />
                </div>
              )}
            </div>
            <div className="flex items-end ml-2 mb-[2px]">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="p-2 sm:p-3 bg-emerald-100 rounded-md text-emerald-600 hover:bg-emerald-200 transition-colors"
              >
                <FaExchangeAlt className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Date</label>
              <div className="flex items-center text-xs sm:text-sm text-emerald-600">
                <input
                  type="checkbox"
                  id="allDates"
                  checked={searchAllDates}
                  onChange={() => setSearchAllDates(!searchAllDates)}
                  className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 focus:ring-emerald-500 rounded-sm"
                />
                <label htmlFor="allDates" className="flex items-center cursor-pointer">
                  <FaCalendarCheck className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> All dates
                </label>
              </div>
            </div>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="date"
                className={`focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-8 sm:pl-10 py-2 sm:py-3 text-xs sm:text-sm border-gray-300 rounded-md ${
                  searchAllDates ? 'bg-gray-100 text-gray-500' : ''
                }`}
                placeholder="Select date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                disabled={searchAllDates}
              />
            </div>
          </div>

          <div className="relative" ref={passengerRef}>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Passengers</label>
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-8 sm:pl-10 pr-3 py-2 sm:py-3 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
              >
                <span className="block truncate">{passengers} Passenger{passengers > 1 ? 's' : ''}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {showPassengerDropdown ? (
                    <FaAngleUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  ) : (
                    <FaAngleDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  )}
                </span>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </span>
              </button>

              <AnimatePresence>
                {showPassengerDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1"
                  >
                    <div className="px-3 py-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-700">Select passengers</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => passengers > 1 && setPassengers(passengers - 1)}
                            className={`p-1 rounded-md ${
                              passengers > 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                            }`}
                            disabled={passengers <= 1}
                          >
                            <span className="text-sm sm:text-base">-</span>
                          </button>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{passengers}</span>
                          <button
                            type="button"
                            onClick={() => passengers < 9 && setPassengers(passengers + 1)}
                            className={`p-1 rounded-md ${
                              passengers < 9 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                            }`}
                            disabled={passengers >= 9}
                          >
                            <span className="text-sm sm:text-base">+</span>
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

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full mt-4 flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <FaSearch className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Search Flights
          </button>
        </div>
      </form>
    </div>
  );
} 