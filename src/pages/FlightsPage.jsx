import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FlightList from '../components/FlightList';
import FlightSearch from '../components/FlightSearch';
import { searchFlights } from '../services/flightService';
import { useBooking } from '../contexts/BookingContext';
import { adjustFlightPrice } from '../services/flightService';

export default function FlightsPage() {
  const [flights, setFlights] = useState([]);
  const [searchParams, setSearchParams] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const { recordFlightSearch, shouldIncreasePriceBySearchHistory } = useBooking();

  // Load flights from session storage or redirect to home
  useEffect(() => {
    const loadFlights = async () => {
      const storedFlights = sessionStorage.getItem('searchResults');
      const storedParams = sessionStorage.getItem('searchParams');
      
      if (!storedFlights || !storedParams) {
        navigate('/');
        return;
      }
      
      try {
        const parsedFlights = JSON.parse(storedFlights);
        const parsedParams = JSON.parse(storedParams);
        
        // Apply price adjustments based on search history
        // Process each flight individually
        const adjustedFlights = await Promise.all(parsedFlights.map(async (flight) => {
          try {
            const shouldIncrease = await shouldIncreasePriceBySearchHistory(flight.id);
            return adjustFlightPrice(flight, shouldIncrease);
          } catch (error) {
            console.error(`Error checking price increase for flight ${flight.id}:`, error);
            return flight; // Return the original flight if there's an error
          }
        }));
        
        setFlights(adjustedFlights);
        setSearchParams(parsedParams);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    loadFlights();
  }, [navigate, shouldIncreasePriceBySearchHistory]);

  // Handle new search
  const handleSearch = async (newSearchParams) => {
    setLoading(true);
    setSelectedFlight(null);
    
    try {
      const results = await searchFlights(
        newSearchParams.from,
        newSearchParams.to,
        newSearchParams.date
      );
      
      // Record search for each flight for price tracking
      results.forEach(flight => {
        recordFlightSearch(flight.id);
      });
      
      // Store the original results first
      sessionStorage.setItem('searchResults', JSON.stringify(results));
      sessionStorage.setItem('searchParams', JSON.stringify(newSearchParams));
      
      // Apply price adjustments based on search history
      const adjustedFlights = await Promise.all(results.map(async (flight) => {
        try {
          const shouldIncrease = await shouldIncreasePriceBySearchHistory(flight.id);
          return adjustFlightPrice(flight, shouldIncrease);
        } catch (error) {
          console.error(`Error checking price increase for flight ${flight.id}:`, error);
          return flight; // Return the original flight if there's an error
        }
      }));
      
      setFlights(adjustedFlights);
      setSearchParams(newSearchParams);
    } catch (error) {
      console.error('Error searching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a flight
  const handleFlightSelect = async (flight) => {
    setSelectedFlight(flight);
    
    // Record this click/selection for pricing purposes
    recordFlightSearch(flight.id);
    
    // Check if price should increase for this specific flight
    try {
      const shouldIncrease = await shouldIncreasePriceBySearchHistory(flight.id);
      const adjustedFlight = adjustFlightPrice(flight, shouldIncrease);
      
      // Store the selected flight in session storage
      sessionStorage.setItem('selectedFlight', JSON.stringify(adjustedFlight));
      
      // Navigate to booking page with flight ID
      navigate(`/booking/${flight.id}`);
    } catch (error) {
      console.error('Error processing flight selection:', error);
      
      // Navigate anyway, even if there's an error
      sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
      navigate(`/booking/${flight.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <FlightSearch onSearch={handleSearch} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <FlightList 
            flights={flights} 
            onFlightSelect={handleFlightSelect} 
            searchParams={searchParams} 
          />
        </div>
      </div>
    </div>
  );
} 