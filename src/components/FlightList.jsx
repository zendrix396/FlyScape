import React, { useState, useEffect } from 'react';
import FlightCard from './FlightCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

export default function FlightList({ flights, onFlightSelect, searchParams }) {
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('price');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    airlines: [],
    priceRange: { min: 0, max: 5000 },
    departureTime: { min: 0, max: 24 }
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Get unique airlines
  const airlines = [...new Set(flights.map(f => f.airline))];

  // Apply filters
  useEffect(() => {
    let filtered = [...flights];

    // Apply airline filter
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(f => filters.airlines.includes(f.airline));
    }

    // Apply price filter
    filtered = filtered.filter(
      f => f.price >= filters.priceRange.min && f.price <= filters.priceRange.max
    );

    // Apply departure time filter
    filtered = filtered.filter(f => {
      const hour = new Date(f.departureTime).getHours();
      return hour >= filters.departureTime.min && hour <= filters.departureTime.max;
    });

    // Sort flights
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortCriteria === 'price') {
        comparison = a.price - b.price;
      } else if (sortCriteria === 'duration') {
        comparison = a.duration - b.duration;
      } else if (sortCriteria === 'departureTime') {
        comparison = new Date(a.departureTime) - new Date(b.departureTime);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredFlights(filtered);
  }, [flights, filters, sortCriteria, sortDirection]);

  const handleFlightSelect = (flight) => {
    setSelectedFlightId(flight.id);
    onFlightSelect(flight);
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

  return (
    <div className="w-full">
      <div className="mb-6 sticky top-0 z-10 bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-gray-800">
              {searchParams.from} to {searchParams.to}
            </h2>
            <p className="text-gray-500 text-sm">
              {searchParams.date} · {searchParams.passengers} {searchParams.passengers === 1 ? 'Passenger' : 'Passengers'}
            </p>
          </div>

          <div className="flex space-x-3">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 px-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={sortCriteria}
                onChange={(e) => setSortCriteria(e.target.value)}
              >
                <option value="price">Price</option>
                <option value="duration">Duration</option>
                <option value="departureTime">Departure Time</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            
            <button
              onClick={toggleSortDirection}
              className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
            >
              {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
            
            <button
              onClick={toggleFilterMenu}
              className={`p-2 border rounded-md text-white ${isFilterMenuOpen ? 'bg-emerald-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              <FaFilter />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-t pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Airlines</h3>
                  <div className="space-y-2">
                    {airlines.map((airline) => (
                      <label key={airline} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                          checked={filters.airlines.includes(airline)}
                          onChange={() => handleAirlineFilterChange(airline)}
                        />
                        <span className="ml-2 text-sm text-gray-700">{airline}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Price Range</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">₹{filters.priceRange.min}</span>
                      <span className="text-sm text-gray-500">₹{filters.priceRange.max}</span>
                    </div>
                    <div className="flex space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={filters.priceRange.min}
                        onChange={(e) => handlePriceRangeChange(e.target.value, 'min')}
                        className="w-full accent-emerald-500"
                      />
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={filters.priceRange.max}
                        onChange={(e) => handlePriceRangeChange(e.target.value, 'max')}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Departure Time</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        {filters.departureTime.min}:00
                      </span>
                      <span className="text-sm text-gray-500">
                        {filters.departureTime.max}:00
                      </span>
                    </div>
                    <div className="flex space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={filters.departureTime.min}
                        onChange={(e) => handleDepartureTimeChange(e.target.value, 'min')}
                        className="w-full accent-emerald-500"
                      />
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={filters.departureTime.max}
                        onChange={(e) => handleDepartureTimeChange(e.target.value, 'max')}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {filteredFlights.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No flights found matching your criteria.</p>
          <button
            onClick={() => setFilters({
              airlines: [],
              priceRange: { min: 0, max: 5000 },
              departureTime: { min: 0, max: 24 }
            })}
            className="mt-4 text-emerald-500 hover:text-emerald-600"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onClick={() => onFlightSelect(flight)}
              selected={selectedFlightId === flight.id}
              showDetails={selectedFlightId === flight.id}
              priceIncreased={flight.priceIncreased}
            />
          ))}
        </div>
      )}
    </div>
  );
} 