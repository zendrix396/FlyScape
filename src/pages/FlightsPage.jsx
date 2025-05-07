import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FlightListModern from '../components/FlightListModern';
import FlightSearchModern from '../components/FlightSearchModern';
import { searchFlights } from '../services/flightService';
import { useBooking } from '../contexts/BookingContext';
import { adjustFlightPrice } from '../services/flightService';

export default function FlightsPage() {
  const [flights, setFlights] = useState([]);
  const [searchParams, setSearchParams] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { recordFlightSearch, shouldIncreasePriceBySearchHistory } = useBooking();

  // Process timestamps in flight data to make them display-friendly
  const processFlightData = (flight) => {
    if (!flight) return flight;
    
    // Create a clean copy of the flight object
    const processedFlight = { ...flight };
    
    try {
      // Process departureTime
      if (processedFlight.departureTime) {
        // Handle Firestore timestamp objects
        if (typeof processedFlight.departureTime === 'object' && processedFlight.departureTime.seconds) {
          const depDate = new Date(processedFlight.departureTime.seconds * 1000);
          
          // Add display-friendly formats if not already present
          if (!processedFlight.displayDepartureDate) {
            processedFlight.displayDepartureDate = depDate.toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            });
          }
          
          if (!processedFlight.displayDepartureTime) {
            processedFlight.displayDepartureTime = depDate.toLocaleTimeString('en-US', {
              hour: '2-digit', minute: '2-digit'
            });
          }
        }
      }
      
      // Process arrivalTime
      if (processedFlight.arrivalTime) {
        // Handle Firestore timestamp objects
        if (typeof processedFlight.arrivalTime === 'object' && processedFlight.arrivalTime.seconds) {
          const arrDate = new Date(processedFlight.arrivalTime.seconds * 1000);
          
          // Add display-friendly formats if not already present
          if (!processedFlight.displayArrivalDate) {
            processedFlight.displayArrivalDate = arrDate.toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            });
          }
          
          if (!processedFlight.displayArrivalTime) {
            processedFlight.displayArrivalTime = arrDate.toLocaleTimeString('en-US', {
              hour: '2-digit', minute: '2-digit'
            });
          }
        }
      }
    } catch (error) {
      console.error("Error processing flight times:", error);
    }
    
    return processedFlight;
  };
  
  // Pre-process flights to ensure they're display-ready
  const prepareFlightsForDisplay = (rawFlights) => {
    if (!Array.isArray(rawFlights)) {
      console.error("Expected flights array, got:", typeof rawFlights);
      return [];
    }
    
    console.log("Processing flights for display:", rawFlights.length);
    return rawFlights.map(flight => {
      const processed = processFlightData(flight);
      // Log a sample of processed flight for debugging
      if (processed === rawFlights[0]) {
        console.log("Sample processed flight:", {
          id: processed.id,
          airline: processed.airline,
          displayDepartureDate: processed.displayDepartureDate,
          displayDepartureTime: processed.displayDepartureTime,
          displayArrivalDate: processed.displayArrivalDate,
          displayArrivalTime: processed.displayArrivalTime
        });
      }
      return processed;
    });
  };

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
        // Parse stored data
        const parsedFlights = JSON.parse(storedFlights);
        const parsedParams = JSON.parse(storedParams);
        
        // Process and add display-friendly dates
        const processedFlights = prepareFlightsForDisplay(parsedFlights);
        
        // Apply price adjustments based on search history
        const adjustedFlights = await Promise.all(processedFlights.map(async (flight) => {
          try {
            const shouldIncrease = await shouldIncreasePriceBySearchHistory(flight.id);
            return adjustFlightPrice(flight, shouldIncrease);
          } catch (error) {
            console.error(`Error checking price increase for flight ${flight.id}:`, error);
            return flight; // Return the original flight if there's an error
          }
        }));
        
        // Set state with processed data
        setFlights(adjustedFlights);
        setSearchParams(parsedParams);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        setError('Failed to load flight data. Please try searching again.');
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
    setError(null);
    
    try {
      // Execute search query
      const results = await searchFlights(
        newSearchParams.from,
        newSearchParams.to,
        newSearchParams.date
      );
      
      // Process flight data for display
      const processedResults = prepareFlightsForDisplay(results);
      
      // Record search for each flight for price tracking
      processedResults.forEach(flight => {
        if (flight && flight.id) {
          recordFlightSearch(flight.id);
        }
      });
      
      // Store processed results in session storage
      sessionStorage.setItem('searchResults', JSON.stringify(processedResults));
      sessionStorage.setItem('searchParams', JSON.stringify(newSearchParams));
      
      // Apply price adjustments based on search history
      const adjustedFlights = await Promise.all(processedResults.map(async (flight) => {
        try {
          const shouldIncrease = await shouldIncreasePriceBySearchHistory(flight.id);
          return adjustFlightPrice(flight, shouldIncrease);
        } catch (error) {
          console.error(`Error checking price increase for flight ${flight.id}:`, error);
          return flight; // Return the original flight if there's an error
        }
      }));
      
      // Update state with processed data
      setFlights(adjustedFlights);
      setSearchParams(newSearchParams);
    } catch (error) {
      console.error('Error searching flights:', error);
      setError('Failed to search flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a flight
  const handleFlightSelect = async (flight) => {
    if (!flight || !flight.id) {
      console.error("Invalid flight selected:", flight);
      setError("Invalid flight selected. Please try again.");
      return;
    }
    
    // Process the flight data before storing
    const processedFlight = processFlightData(flight);
    
    // Preserve originalPrice and priceIncreased properties if they exist
    if (flight.originalPrice) {
      processedFlight.originalPrice = flight.originalPrice;
    }
    
    if (flight.priceIncreased) {
      processedFlight.priceIncreased = flight.priceIncreased;
    }
    
    setSelectedFlight(processedFlight);
    
    // Record this click/selection for pricing purposes
    recordFlightSearch(processedFlight.id);
    
    // Check if price should increase for this specific flight
    try {
      const shouldIncrease = await shouldIncreasePriceBySearchHistory(processedFlight.id);
      const adjustedFlight = adjustFlightPrice(processedFlight, shouldIncrease);
      
      // Store the selected flight in session storage
      sessionStorage.setItem('selectedFlight', JSON.stringify(adjustedFlight));
      
      // Navigate to booking page with flight ID
      navigate(`/booking/${processedFlight.id}`);
    } catch (error) {
      console.error('Error processing flight selection:', error);
      
      // Navigate anyway, even if there's an error
      sessionStorage.setItem('selectedFlight', JSON.stringify(processedFlight));
      navigate(`/booking/${processedFlight.id}`);
    }
  };

  // Full page loading indicator
  if (loading && !searchParams) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-opacity-20 rounded-full border-t-primary animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading flights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <FlightSearchModern onSearch={handleSearch} />
        </div>

        <div className="bg-card rounded-xl shadow-md p-6">
          <FlightListModern 
            flights={flights} 
            loading={loading}
            error={error}
            onFlightSelect={handleFlightSelect} 
            searchParams={searchParams} 
          />
        </div>
      </div>
    </div>
  );
} 