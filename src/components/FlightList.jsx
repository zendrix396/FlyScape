import React, { useState, useEffect } from 'react';
import FlightCard from './FlightCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaSortAmountDown, FaSortAmountUp, FaBug } from 'react-icons/fa';
import { formatAirportForDisplay } from '../utils/airportUtil';
import AnimatedList from './AnimatedList';

export default function FlightList({ flights = [], loading = false, error = null, searchParams, onFlightSelect, onSelect }) {
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('price');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    airlines: [],
    priceRange: { min: 0, max: 15000 },
    departureTime: { min: 0, max: 24 }
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  // Get unique airlines
  const airlines = [...new Set(flights.map(f => f.airline || 'Unknown'))];

  // Apply filters
  useEffect(() => {
    // If there are no flights to filter, set filtered flights to empty array
    if (!flights || flights.length === 0) {
      setFilteredFlights([]);
      return;
    }
    
    let filtered = [...flights];

    // Apply airline filter
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(f => filters.airlines.includes(f.airline));
    }

    // Apply price filter
    filtered = filtered.filter(f => {
      // Ensure price is a number
      const price = typeof f.price === 'string' ? parseFloat(f.price) : Number(f.price);
      return !isNaN(price) && price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply departure time filter - handle different timestamp formats
    filtered = filtered.filter(f => {
      try {
        let departureDate;
        
        // Handle different timestamp formats from Firestore
        if (f.departureTime && typeof f.departureTime === 'object' && f.departureTime.seconds) {
          // Firestore Timestamp object
          departureDate = new Date(f.departureTime.seconds * 1000);
        } else if (f.departureTime && typeof f.departureTime === 'string') {
          // String format
          departureDate = new Date(f.departureTime);
        } else if (f.departureTime instanceof Date) {
          // Already a Date object
          departureDate = f.departureTime;
        } else {
          return true; // Include it anyway
        }
        
        if (isNaN(departureDate.getTime())) {
          return true; // Include flights with invalid dates rather than filtering them out
        }
        
        const hour = departureDate.getHours();
        return hour >= filters.departureTime.min && hour <= filters.departureTime.max;
      } catch (error) {
        return true; // If error, include the flight
      }
    });

    // Sort flights
    filtered.sort((a, b) => {
      let comparison = 0;
      try {
        if (sortCriteria === 'price') {
          const aPrice = typeof a.price === 'string' ? parseFloat(a.price) : Number(a.price);
          const bPrice = typeof b.price === 'string' ? parseFloat(b.price) : Number(b.price);
          comparison = aPrice - bPrice;
        } else if (sortCriteria === 'duration') {
          // Duration might be stored in different formats
          let aDuration, bDuration;
          
          // Check if duration is a string like "2h 30m"
          if (typeof a.duration === 'string' && a.duration.includes('h')) {
            const matches = a.duration.match(/(\d+)h\s*(\d*)/);
            const hours = matches ? parseInt(matches[1]) : 0;
            const minutes = matches && matches[2] ? parseInt(matches[2]) : 0;
            aDuration = hours * 60 + minutes;
          } else {
            aDuration = Number(a.duration);
          }
          
          if (typeof b.duration === 'string' && b.duration.includes('h')) {
            const matches = b.duration.match(/(\d+)h\s*(\d*)/);
            const hours = matches ? parseInt(matches[1]) : 0;
            const minutes = matches && matches[2] ? parseInt(matches[2]) : 0;
            bDuration = hours * 60 + minutes;
          } else {
            bDuration = Number(b.duration);
          }
          
          comparison = aDuration - bDuration;
        } else if (sortCriteria === 'departureTime') {
          // Handle different timestamp formats
          let aDepartureTime, bDepartureTime;
          
          if (a.departureTime && typeof a.departureTime === 'object' && a.departureTime.seconds) {
            aDepartureTime = a.departureTime.seconds * 1000;
          } else {
            aDepartureTime = new Date(a.departureTime).getTime();
          }
          
          if (b.departureTime && typeof b.departureTime === 'object' && b.departureTime.seconds) {
            bDepartureTime = b.departureTime.seconds * 1000;
          } else {
            bDepartureTime = new Date(b.departureTime).getTime();
          }
          
          comparison = aDepartureTime - bDepartureTime;
        }
      } catch (error) {
        return 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredFlights(filtered);
  }, [flights, filters, sortCriteria, sortDirection]);

  // Handle flight selection
  const handleFlightSelect = (flight) => {
    setSelectedFlightId(flight.id);
    if (onSelect) {
      onSelect(flight);
    } else if (onFlightSelect) {
      onFlightSelect(flight);
    }
  };

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleAirlineFilterChange = (airline) => {
    setFilters(prev => {
      const newAirlines = prev.airlines.includes(airline)
        ? prev.airlines.filter(a => a !== airline)
        : [...prev.airlines, airline];
      
      return {
        ...prev,
        airlines: newAirlines
      };
    });
  };

  const handlePriceRangeChange = (value, type) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: Number(value)
      }
    }));
  };

  const handleDepartureTimeChange = (value, type) => {
    setFilters(prev => ({
      ...prev,
      departureTime: {
        ...prev.departureTime,
        [type]: Number(value)
      }
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      airlines: [],
      priceRange: { min: 0, max: 15000 },
      departureTime: { min: 0, max: 24 }
    });
    setSortCriteria('price');
    setSortDirection('asc');
  };

  // Render loading UI if no search params yet
  if (!searchParams) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Enter your search criteria to find flights.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Flight Results</h2>
        <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
          <div className="mr-3 sm:mr-4 mb-1 sm:mb-2">
            <span className="font-medium">From:</span> {formatAirportForDisplay(searchParams.from)}
          </div>
          <div className="mr-3 sm:mr-4 mb-1 sm:mb-2">
            <span className="font-medium">To:</span> {formatAirportForDisplay(searchParams.to)}
          </div>
          {searchParams.date ? (
            <div className="mr-3 sm:mr-4 mb-1 sm:mb-2">
              <span className="font-medium">Date:</span> {new Date(searchParams.date).toLocaleDateString()}
            </div>
          ) : (
            <div className="mr-3 sm:mr-4 mb-1 sm:mb-2">
              <span className="font-medium">Date:</span> <span className="text-emerald-600">All dates</span>
            </div>
          )}
          <div className="mb-1 sm:mb-2">
            <span className="font-medium">Passengers:</span> {searchParams.passengers}
          </div>
        </div>
      </div>

      <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center mb-2 sm:mb-0">
          <button
            onClick={toggleFilterMenu}
            className="flex items-center mr-3 py-1.5 px-2.5 sm:px-3 bg-gray-100 hover:bg-gray-200 rounded-md text-xs sm:text-sm"
          >
            <FaFilter className="mr-1.5 text-gray-500" />
            Filters
          </button>
          
          <div className="flex items-center">
            <select
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
              className="mr-2 py-1.5 px-2.5 sm:px-3 bg-gray-100 rounded-l-md focus:outline-none text-xs sm:text-sm"
            >
              <option value="price">Price</option>
              <option value="duration">Duration</option>
              <option value="departureTime">Departure Time</option>
            </select>
            
            <button
              onClick={toggleSortDirection}
              className="py-1.5 px-2 sm:px-3 bg-gray-100 hover:bg-gray-200 rounded-r-md text-xs sm:text-sm"
            >
              {sortDirection === 'asc' ? (
                <FaSortAmountUp className="text-gray-500" />
              ) : (
                <FaSortAmountDown className="text-gray-500" />
              )}
            </button>
          </div>
        </div>
        
        {filteredFlights.length > 0 && (
          <div className="text-xs sm:text-sm text-gray-500">
            {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>
      
      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-4 bg-gray-50 rounded-md p-3 sm:p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Airlines</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {airlines.map(airline => (
                    <label key={airline} className="flex items-center text-xs sm:text-sm">
                      <input
                        type="checkbox"
                        checked={filters.airlines.includes(airline)}
                        onChange={() => handleAirlineFilterChange(airline)}
                        className="mr-2 rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      {airline}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span>₹{filters.priceRange.min}</span>
                    <span>₹{filters.priceRange.max}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    step="500"
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceRangeChange(e.target.value, 'min')}
                    className="w-full slider-thumb accent-emerald-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    step="500"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceRangeChange(e.target.value, 'max')}
                    className="w-full slider-thumb accent-emerald-500"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Departure Time</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span>{filters.departureTime.min}:00</span>
                    <span>{filters.departureTime.max}:00</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={filters.departureTime.min}
                    onChange={(e) => handleDepartureTimeChange(e.target.value, 'min')}
                    className="w-full slider-thumb accent-emerald-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={filters.departureTime.max}
                    onChange={(e) => handleDepartureTimeChange(e.target.value, 'max')}
                    className="w-full slider-thumb accent-emerald-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 flex justify-end">
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-800"
              >
                Clear All
              </button>
              <button
                onClick={toggleFilterMenu}
                className="ml-2 px-3 py-1.5 bg-emerald-500 text-white rounded-md text-xs sm:text-sm hover:bg-emerald-600"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-opacity-20 rounded-full border-t-emerald-600 animate-spin"></div>
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <div className="text-sm text-gray-600">Please try modifying your search criteria</div>
        </div>
      ) : flights.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-lg text-gray-700 mb-2">No flights found</div>
          <div className="text-sm text-gray-600">Please try different dates or routes</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onClick={() => handleFlightSelect(flight)}
              selected={selectedFlightId === flight.id}
              showDetails={selectedFlightId === flight.id}
            />
          ))}
        </div>
      )}
    </div>
  );
} 