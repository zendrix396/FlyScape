import React, { useState, useRef, useEffect } from 'react';
import { FaPlane, FaCalendarAlt, FaSearch, FaExchangeAlt } from 'react-icons/fa';
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
    'Delhi (DEL)', 'Mumbai (BOM)', 'Bangalore (BLR)', 'Chennai (MAA)',
    'Kolkata (CCU)', 'Hyderabad (HYD)', 'Ahmedabad (AMD)', 'Cochin (COK)',
    'Pune (PNQ)', 'Jaipur (JAI)',
  ];

  const handleInputChange = (value, isFromField) => {
    isFromField ? setFrom(value) : setTo(value);
    
    if (value.trim().length > 1) {
      setIsLoading(true);
      setTimeout(() => {
        const filtered = dummySuggestions.filter(s => 
          s.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setIsLoading(false);
        setShowFromSuggestions(isFromField);
        setShowToSuggestions(!isFromField);
      }, 300);
    } else {
      setSuggestions([]);
      setShowFromSuggestions(isFromField ? false : showFromSuggestions);
      setShowToSuggestions(!isFromField ? false : showToSuggestions);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    if (showFromSuggestions) {
      setFrom(suggestion);
      setShowFromSuggestions(false);
      toRef.current.focus();
    } else {
      setTo(suggestion);
      setShowToSuggestions(false);
    }
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold">Search Flights</h2>
        <p className="text-gray-500 mt-2">Find the best deals on flights</p>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        onSearch({ from, to, date, passengers });
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative" ref={fromRef}>
            <label className="block text-sm font-medium mb-1">From</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FaPlane className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 py-2 border border-gray-300 rounded"
                placeholder="City or airport"
                value={from}
                onChange={(e) => handleInputChange(e.target.value, true)}
              />
            </div>
            {showFromSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full">
                <AnimatedList
                  items={suggestions}
                  onItemSelect={handleSuggestionSelect}
                />
              </div>
            )}
          </div>

          <div className="relative flex" ref={toRef}>
            <div className="flex-grow">
              <label className="block text-sm font-medium mb-1">To</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaPlane className="text-gray-400 transform rotate-90" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 py-2 border border-gray-300 rounded"
                  placeholder="City or airport"
                  value={to}
                  onChange={(e) => handleInputChange(e.target.value, false)}
                />
              </div>
              {showToSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full">
                  <AnimatedList
                    items={suggestions}
                    onItemSelect={handleSuggestionSelect}
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => { const temp = from; setFrom(to); setTo(temp); }}
              className="p-2 ml-2 self-end bg-gray-100 rounded text-gray-700"
            >
              <FaExchangeAlt />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="date"
                className="block w-full pl-10 py-2 border border-gray-300 rounded"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Passengers</label>
            <select
              className="block w-full py-2 border border-gray-300 rounded"
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

        <button
          type="submit"
          className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center"
          disabled={!from || !to || !date}
        >
          <FaSearch className="mr-2" />
          Search Flights
        </button>
      </form>
    </div>
  );
} 