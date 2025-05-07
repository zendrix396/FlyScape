import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/apiService';
import { FaArrowLeft, FaRandom, FaPlane, FaBug, FaTrash } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';
import { cities } from '../../utils/randomGenerator';
import { formatAirportForDisplay } from '../../utils/airportUtil';

// Add a function to create a specific test flight
const createTestFlight = async () => {
  try {
    // Create a specific test flight with known values for testing
    const departureDate = new Date('2025-05-20T06:33:00');
    const arrivalDate = new Date('2025-05-20T08:45:00');
    
    const testFlight = {
      airline: 'SpiceJet',
      flightNumber: 'SG1450',
      fromCity: 'CCU', // Kolkata
      toCity: 'LKO', // Lucknow
      departureTime: Timestamp.fromDate(departureDate),
      arrivalTime: Timestamp.fromDate(arrivalDate),
      duration: '2h 12m',
      price: 2600,
      availableSeats: 10
    };
    
    const response = await adminApi.createFlight(testFlight);
    return response;
  } catch (error) {
    console.error("Error creating test flight:", error);
    throw error;
  }
};

const FlightGenerator = () => {
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generatedFlights, setGeneratedFlights] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  
  // New state for enhanced options
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]   // 90 days from now
  });
  
  const [priceRange, setPriceRange] = useState({
    minPrice: 3000,
    maxPrice: 15000
  });
  
  const [routeOptions, setRouteOptions] = useState({
    enabled: false,
    fromCity: '',
    toCity: ''
  });

  const handleCountChange = (e) => {
    const value = parseInt(e.target.value);
    setCount(value > 50 ? 50 : value < 1 ? 1 : value);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const handleRouteOptionsChange = (e) => {
    const { name, value } = e.target;
    setRouteOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleRouteOptions = () => {
    setRouteOptions(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setGeneratedFlights([]);
      
      const generationOptions = {
        count,
        dateRange: {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate)
        },
        priceRange: {
          minPrice: priceRange.minPrice,
          maxPrice: priceRange.maxPrice
        }
      };
      
      // Add route options if enabled
      if (routeOptions.enabled && routeOptions.fromCity && routeOptions.toCity) {
        generationOptions.route = {
          fromCity: routeOptions.fromCity,
          toCity: routeOptions.toCity
        };
      }
      
      if (debugMode) {
        console.log("Generating flights with options:", generationOptions);
      }
      
      const response = await adminApi.generateFlights(generationOptions);
      
      setSuccess(`Successfully generated ${response.flights.length} flights`);
      setGeneratedFlights(response.flights);
    } catch (err) {
      console.error("Error generating flights:", err);
      setError(err.message || "Failed to generate flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestFlight = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setGeneratedFlights([]);
      
      const response = await createTestFlight();
      
      setSuccess(`Successfully created test flight: Kolkata (CCU) → Lucknow (LKO) for May 20, 2025`);
      setGeneratedFlights([response]);
    } catch (err) {
      console.error("Error creating test flight:", err);
      setError(err.message || "Failed to create test flight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Generate Random Flights</h1>
        <div className="flex flex-wrap gap-3 mt-2 sm:mt-4">
          <Link 
            to="/admin/flights" 
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-md hover:from-gray-200 hover:to-gray-300 transition-colors border border-gray-300"
          >
            <FaArrowLeft /> Back to Flights
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-emerald-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Flights to Generate (1-50)
              </label>
              <input
                type="number"
                value={count}
                onChange={handleCountChange}
                min="1"
                max="50"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 border-emerald-200"
                required
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={debugMode}
                  onChange={() => setDebugMode(!debugMode)}
                  className="mr-2 rounded text-emerald-600 focus:ring-emerald-500"
                />
                Debug Mode (Show detailed logs)
              </label>
            </div>
          </div>
          
          <div className="border-t border-emerald-100 pt-4">
            <h2 className="text-lg font-semibold mb-4 text-emerald-800">Date Range Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 border-emerald-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 border-emerald-200"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-emerald-100 pt-4">
            <h2 className="text-lg font-semibold mb-4 text-emerald-800">Price Range Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Price (₹)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={priceRange.minPrice}
                  onChange={handlePriceRangeChange}
                  min="1000"
                  max="10000"
                  step="100"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 border-emerald-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Price (₹)
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={priceRange.maxPrice}
                  onChange={handlePriceRangeChange}
                  min="3000"
                  max="50000"
                  step="100"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 border-emerald-200"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-emerald-100 pt-4">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-emerald-800">Specific Route Options</h2>
              <label className="inline-flex items-center mt-2 sm:mt-0">
                <input
                  type="checkbox"
                  checked={routeOptions.enabled}
                  onChange={toggleRouteOptions}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable specific route</span>
              </label>
            </div>
            
            {routeOptions.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From City
                  </label>
                  <select
                    name="fromCity"
                    value={routeOptions.fromCity}
                    onChange={handleRouteOptionsChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 border-emerald-200"
                    required={routeOptions.enabled}
                  >
                    <option value="">Select departure city</option>
                    {cities.map(city => (
                      <option key={`from-${city}`} value={city}>
                        {formatAirportForDisplay(city)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To City
                  </label>
                  <select
                    name="toCity"
                    value={routeOptions.toCity}
                    onChange={handleRouteOptionsChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 border-emerald-200"
                    required={routeOptions.enabled}
                  >
                    <option value="">Select arrival city</option>
                    {cities.map(city => (
                      <option key={`to-${city}`} value={city}>
                        {formatAirportForDisplay(city)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-md hover:from-emerald-600 hover:to-emerald-700 transition-colors"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FaRandom /> Generate Random Flights
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleCreateTestFlight}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 transition-colors"
            >
              <FaBug /> Create Test Flight
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>
              Test flight creates a specific flight from Kolkata to Lucknow on May 20, 2025 for testing search functionality.
            </p>
          </div>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6 border border-green-200">
          {success}
        </div>
      )}
      
      {/* If flights were generated, show them */}
      {generatedFlights.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100 mb-6">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 border-b border-emerald-200">
            <h2 className="text-xl font-semibold text-emerald-800">Generated Flights</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generatedFlights.map((flight, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <FaPlane className="text-emerald-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{flight.airline}</div>
                          <div className="text-sm text-gray-500">{flight.flightNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{flight.fromCity} → {flight.toCity}</div>
                      <div className="text-xs text-gray-500">
                        {flight.availableSeats} seats available
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(flight.departureTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPrice(flight.price)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightGenerator; 