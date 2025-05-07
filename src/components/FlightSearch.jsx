import React, { useState, useRef, useEffect } from 'react';
import { FaPlane, FaCalendarAlt, FaSearch, FaExchangeAlt, FaUser, FaAngleDown, FaAngleUp, FaCalendarCheck, FaCheck } from 'react-icons/fa';
import GradientText from './GradientText';
import AnimatedList from './AnimatedList';
import { motion, AnimatePresence } from 'framer-motion';
import { searchAirports, formatAirportForDisplay } from '../services/airportService';
import { extractAirportCode } from '../utils/airportUtil';
import { useTheme } from '../contexts/ThemeContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SpotlightCard from './SpotlightCard';

export default function FlightSearch({ onSearch, className = '', initialValues = {} }) {
  const { isDark } = useTheme();
  const [fromCity, setFromCity] = useState(initialValues.from || '');
  const [toCity, setToCity] = useState(initialValues.to || '');
  const [departureDate, setDepartureDate] = useState(
    initialValues.date ? new Date(initialValues.date) : null
  );
  const [passengers, setPassengers] = useState(initialValues.passengers || 1);
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [airports, setAirports] = useState([]);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [allDates, setAllDates] = useState(initialValues.allDates || false);

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

  // Fetch airports
  useEffect(() => {
    const loadAirports = async () => {
      const airportList = await searchAirports('');
      setAirports(airportList);
    };
    
    loadAirports();
  }, []);

  // Filter airports based on search
  const filteredAirports = (search) => {
    if (!search || search.length < 2) return [];
    
    const searchLower = search.toLowerCase();
    return airports.filter(airport => {
      const airportCode = airport.code.toLowerCase();
      const airportName = airport.name.toLowerCase();
      const cityName = airport.city.toLowerCase();
      
      return airportCode.includes(searchLower) || 
             airportName.includes(searchLower) || 
             cityName.includes(searchLower);
    }).slice(0, 5);
  };

  // Handle from city change
  const handleFromCityChange = (e) => {
    setFromSearch(e.target.value);
    setShowFromList(true);
  };

  // Handle to city change
  const handleToCityChange = (e) => {
    setToSearch(e.target.value);
    setShowToList(true);
  };

  // Handle airport selection for from field
  const handleFromSelect = (airport) => {
    setFromCity(airport.code);
    setFromSearch('');
    setShowFromList(false);
  };

  // Handle airport selection for to field
  const handleToSelect = (airport) => {
    setToCity(airport.code);
    setToSearch('');
    setShowToList(false);
  };

  // Handle swap cities
  const handleSwapCities = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!fromCity || !toCity) {
      alert('Please select both departure and arrival cities');
      return;
    }
    
    onSearch({
      from: fromCity,
      to: toCity,
      date: allDates ? null : departureDate,
      passengers,
      allDates
    });
  };

  // Format airport display
  const getDisplayAirport = (code) => {
    return formatAirportForDisplay(code);
  };

  // Render airport item in dropdown
  const renderAirportItem = (airport, index) => (
    <motion.div
      key={airport.code}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`p-2 cursor-pointer ${
        isDark ? 'hover:bg-gray-700' : 'hover:bg-emerald-50'
      }`}
      onClick={() => showFromList ? handleFromSelect(airport) : handleToSelect(airport)}
    >
      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
        {airport.city} ({airport.code})
      </div>
      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{airport.name}</div>
    </motion.div>
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromList(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToList(false);
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
    <SpotlightCard
      className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl p-4 sm:p-5 shadow-lg ${className}`}
      spotlightColor="rgba(16, 185, 129, 0.1)"
      spotlightSize={350}
    >
      <div className="mb-3 sm:mb-4">
        <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} text-center`}>Search Flights</h2>
      </div>
      
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              From
            </label>
            <div className={`relative flex items-center w-full ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            } border rounded-md focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500`}>
              <span className={`pl-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <FaPlane size={16} />
              </span>
              <input
                type="text"
                value={fromSearch || (fromCity ? getDisplayAirport(fromCity) : '')}
                onChange={handleFromCityChange}
                onFocus={() => setShowFromList(true)}
                className={`w-full py-2 pl-2 pr-3 focus:outline-none ${
                  isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-800 placeholder-gray-400'
                } rounded-md text-sm`}
                placeholder="Enter city or airport"
              />
            </div>
            <AnimatePresence>
              {showFromList && filteredAirports(fromSearch).length > 0 && (
                <div className="absolute z-10 mt-1 w-full">
                  <AnimatedList
                    items={filteredAirports(fromSearch)}
                    renderItem={renderAirportItem}
                    className={`${isDark ? 'border border-gray-700' : 'border border-gray-200'} shadow-lg`}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              To
            </label>
            <div className={`relative flex items-center w-full ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            } border rounded-md focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500`}>
              <span className={`pl-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <FaPlane size={16} style={{ transform: 'rotate(90deg)' }} />
              </span>
              <input
                type="text"
                value={toSearch || (toCity ? getDisplayAirport(toCity) : '')}
                onChange={handleToCityChange}
                onFocus={() => setShowToList(true)}
                className={`w-full py-2 pl-2 pr-3 focus:outline-none ${
                  isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-800 placeholder-gray-400'
                } rounded-md text-sm`}
                placeholder="Enter city or airport"
              />
            </div>
            <AnimatePresence>
              {showToList && filteredAirports(toSearch).length > 0 && (
                <div className="absolute z-10 mt-1 w-full">
                  <AnimatedList
                    items={filteredAirports(toSearch)}
                    renderItem={renderAirportItem}
                    className={`${isDark ? 'border border-gray-700' : 'border border-gray-200'} shadow-lg`}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={handleSwapCities}
            className={`p-2 rounded-full ${
              isDark ? 'bg-gray-700 text-emerald-400 hover:bg-gray-600' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
            } transition-colors`}
          >
            <FaExchangeAlt />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Date
            </label>
            <div className={`relative flex items-center w-full ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            } border rounded-md focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500`}>
              <span className={`pl-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <FaCalendarAlt size={16} />
              </span>
              <DatePicker
                selected={departureDate}
                onChange={date => setDepartureDate(date)}
                minDate={new Date()}
                placeholderText="Select departure date"
                className={`w-full py-2 pl-2 pr-3 ${
                  isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-800 placeholder-gray-400'
                } focus:outline-none rounded-md text-sm`}
                disabled={allDates}
                calendarClassName={isDark ? 'dark-calendar' : ''}
              />
            </div>
            <div className="mt-2 flex items-center">
              <input
                id="allDates"
                type="checkbox"
                checked={allDates}
                onChange={() => setAllDates(!allDates)}
                className={`rounded ${isDark ? 'bg-gray-700 border-gray-600' : ''} text-emerald-500 mr-2`}
              />
              <label htmlFor="allDates" className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Show flights for all dates
              </label>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Passengers
            </label>
            <div className={`relative flex items-center w-full ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            } border rounded-md focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500`}>
              <span className={`pl-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <FaUser size={16} />
              </span>
              <select
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value))}
                className={`w-full py-2 pl-2 pr-3 ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                } focus:outline-none rounded-md text-sm appearance-none`}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Passenger{num !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className={`w-full sm:w-auto py-2 px-4 sm:px-6 flex items-center justify-center ${
              isDark ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
          >
            <FaSearch className="mr-2" />
            <span>Search Flights</span>
          </button>
        </div>
      </form>
    </SpotlightCard>
  );
} 