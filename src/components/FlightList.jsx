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
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Flight Results</h2>
        <div className="flex flex-wrap items-center text-sm text-gray-600 mt-2">
          <div className="mr-4 mb-2">
            <span className="font-medium">From:</span> {formatAirportForDisplay(searchParams.from)}
          </div>
          <div className="mr-4 mb-2">
            <span className="font-medium">To:</span> {formatAirportForDisplay(searchParams.to)}
          </div>
          {searchParams.date ? (
            <div className="mr-4 mb-2">
              <span className="font-medium">Date:</span> {new Date(searchParams.date).toLocaleDateString()}
            </div>
          ) : (
            <div className="mr-4 mb-2">
              <span className="font-medium">Date:</span> <span className="text-emerald-600">All dates</span>
            </div>
          )}
          <div className="mb-2">
            <span className="font-medium">Passengers:</span> {searchParams.passengers}
          </div>
        </div>
      </div>

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