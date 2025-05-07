import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/apiService';
import { FaArrowLeft, FaRandom, FaPlane, FaBug, FaTrash } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';
import { cities } from '../../utils/randomGenerator';
import { formatAirportForDisplay } from '../../utils/airportUtil';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { isDark } = useTheme();
  
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
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-4 sm:mb-0`}>Generate Random Flights</h1>
        <div className="flex flex-wrap gap-3 mt-2 sm:mt-4">
          <Link 
            to="/admin/flights" 
            className={`flex items-center gap-2 px-4 py-2 ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300'
            } rounded-md transition-colors`}
          >
            <FaArrowLeft /> Back to Flights
          </Link>
        </div>
      </div>
      
      <div className={`rounded-lg shadow-md p-6 mb-8 ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-emerald-100'
      }`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Number of Flights to Generate (1-50)
              </label>
              <input
                type="number"
                value={count}
                onChange={handleCountChange}
                min="1"
                max="50"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border-emerald-200'
                }`}
                required
              />
            </div>
            
            <div className="flex items-center">
              <label className={`flex items-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}>
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
          
          <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-emerald-100'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>Date Range Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-emerald-200'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-emerald-200'
                  }`}
                />
              </div>
            </div>
          </div>
          
          <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-emerald-100'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>Price Range Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Minimum Price (₹)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={priceRange.minPrice}
                  onChange={handlePriceRangeChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-emerald-200'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Maximum Price (₹)
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={priceRange.maxPrice}
                  onChange={handlePriceRangeChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-emerald-200'
                  }`}
                />
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="enableRouteOptions"
                checked={routeOptions.enabled}
                onChange={toggleRouteOptions}
                className="mr-2 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label 
                htmlFor="enableRouteOptions" 
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}
              >
                Specify Route (From/To Cities)
              </label>
            </div>
            
            {routeOptions.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    From City
                  </label>
                  <select
                    name="fromCity"
                    value={routeOptions.fromCity}
                    onChange={handleRouteOptionsChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-emerald-200'
                    }`}
                  >
                    <option value="">Select a city</option>
                    {cities.map(city => (
                      <option key={city.code} value={city.code}>
                        {formatAirportForDisplay(city)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    To City
                  </label>
                  <select
                    name="toCity"
                    value={routeOptions.toCity}
                    onChange={handleRouteOptionsChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-emerald-200'
                    }`}
                  >
                    <option value="">Select a city</option>
                    {cities.map(city => (
                      <option key={city.code} value={city.code}>
                        {formatAirportForDisplay(city)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCreateTestFlight}
              className={`px-4 py-2 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } rounded-md transition-colors`}
            >
              <FaBug className="inline mr-2" />
              Create Test Flight
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md transition-colors ${
                isDark 
                  ? 'bg-emerald-800 hover:bg-emerald-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <FaRandom className="inline mr-2" />
              {loading ? 'Generating...' : 'Generate Flights'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className={`p-4 mb-6 rounded-lg ${
          isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
        }`}>
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      {success && (
        <div className={`p-4 mb-6 rounded-lg ${
          isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
        }`}>
          <p className="font-medium">{success}</p>
        </div>
      )}
      
      {generatedFlights.length > 0 && (
        <div className={`rounded-lg shadow-md overflow-hidden mb-6 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}>
          <div className={`px-6 py-4 ${isDark ? 'bg-gray-700' : 'bg-emerald-50'} border-b ${isDark ? 'border-gray-600' : 'border-emerald-100'}`}>
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-emerald-800'}`}>Generated Flights</h2>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {generatedFlights.length} flights have been added to the database
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Flight Details
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Route
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Departure
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {generatedFlights.map((flight, index) => (
                  <tr key={index} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {flight.airline}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {flight.flightNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {flight.fromCity} → {flight.toCity}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {flight.from} → {flight.to}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(flight.departureTime)}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {flight.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatPrice(flight.price)}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {flight.availableSeats} seats
                      </div>
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