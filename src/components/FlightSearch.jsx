import React, { useState, useRef, useEffect } from 'react';
import { FaPlane, FaCalendarAlt, FaSearch, FaExchangeAlt } from 'react-icons/fa';
import GradientText from './GradientText';
import AnimatedList from './AnimatedList';

export default function FlightSearch({ onSearch }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fromRef = useRef(null);
  const toRef = useRef(null);

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
  ];

  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    if (value.trim().length > 1) {
      // Mock API call for suggestions
      setIsLoading(true);
      setTimeout(() => {
        const filtered = dummySuggestions.filter(
          (s) => s.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setIsLoading(false);
        setShowFromSuggestions(true);
        setShowToSuggestions(false);
      }, 300);
    } else {
      setSuggestions([]);
      setShowFromSuggestions(false);
    }
  };

  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);
    if (value.trim().length > 1) {
      // Mock API call for suggestions
      setIsLoading(true);
      setTimeout(() => {
        const filtered = dummySuggestions.filter(
          (s) => s.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setIsLoading(false);
        setShowToSuggestions(true);
        setShowFromSuggestions(false);
      }, 300);
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
    onSearch({
      from,
      to,
      date,
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <select
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full py-3 sm:text-sm border-gray-300 rounded-md"
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md flex items-center justify-center hover:bg-emerald-700"
            disabled={!from || !to || !date}
          >
            <FaSearch className="mr-2" />
            Search Flights
          </button>
        </div>
      </form>
    </div>
  );
} 