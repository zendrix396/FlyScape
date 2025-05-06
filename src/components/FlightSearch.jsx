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
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <div className="mb-6 text-center">
        <GradientText
          colors={["#10b981", "#6ee7b7", "#10b981"]}
          animationSpeed={5}
          className="text-3xl font-bold"
        >
          Search Flights
        </GradientText>
        <p className="text-gray-500 mt-2">Find the best deals on flights</p>
      </div>

      <form onSubmit={handleSearchSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative" ref={fromRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPlane className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPlane className="h-5 w-5 text-gray-400 transform rotate-90" />
                </div>
                <input
                  type="text"
                  className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
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
                className="p-3 bg-emerald-100 rounded-md text-emerald-600 hover:bg-emerald-200 transition-colors"
              >
                <FaExchangeAlt className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <label className="flex items-center text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 focus:ring-emerald-400 mr-1"
                  checked={searchAllDates}
                  onChange={(e) => setSearchAllDates(e.target.checked)}
                />
                Search all dates
              </label>
            </div>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                className={`focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md ${searchAllDates ? 'opacity-50' : ''}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                disabled={searchAllDates}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
            <div className="mt-1 relative rounded-md shadow-sm" ref={passengerRef}>
              <div 
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full py-3 pl-3 pr-10 sm:text-sm border-gray-300 rounded-md cursor-pointer bg-white flex justify-between items-center"
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
              >
                <div className="flex items-center">
                  <FaUser className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>{passengers} {passengers === 1 ? 'Passenger' : 'Passengers'}</span>
                </div>
                <div className="text-gray-400">
                  {showPassengerDropdown ? <FaAngleUp /> : <FaAngleDown />}
                </div>
              </div>
              
              <AnimatePresence>
                {showPassengerDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <div
                        key={num}
                        className={`px-4 py-2 hover:bg-emerald-50 cursor-pointer transition-colors flex items-center justify-between ${
                          passengers === num ? 'bg-emerald-50 text-emerald-700' : ''
                        }`}
                        onClick={() => {
                          setPassengers(num);
                          setShowPassengerDropdown(false);
                        }}
                      >
                        <span>{num} {num === 1 ? 'Passenger' : 'Passengers'}</span>
                        {passengers === num && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-2 w-2 rounded-full bg-emerald-500"
                          />
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md flex items-center justify-center hover:bg-emerald-700"
            disabled={!from || !to || (!date && !searchAllDates)}
          >
            <FaSearch className="mr-2" />
            Search Flights
          </button>
        </div>
      </form>
    </div>
  );
} 