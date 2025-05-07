import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaPlane, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaRupeeSign, FaChair } from 'react-icons/fa';
import { adminApi } from '../../services/apiService';
import { useTheme } from '../../contexts/ThemeContext';

const FlightForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { isDark } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flightData, setFlightData] = useState({
    airline: '',
    flightNumber: '',
    fromCity: '',
    from: '',
    toCity: '',
    to: '',
    departureDate: '',
    departureTime: '',
    duration: '',
    price: '',
    availableSeats: '',
    aircraft: '',
    hasStopover: false,
    stopoverLocation: '',
    stopoverDuration: '',
    mealOptions: [],
  });

  useEffect(() => {
    if (isEditMode) {
      fetchFlightData();
    }
  }, [id]);

  const fetchFlightData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getFlight(id);
      
      // Format date and time for form inputs
      const departureDateTime = data.departureTime.toDate ? data.departureTime.toDate() : new Date(data.departureTime);
      
      setFlightData({
        ...data,
        departureDate: departureDateTime.toISOString().split('T')[0],
        departureTime: departureDateTime.toTimeString().slice(0, 5),
      });
    } catch (err) {
      console.error("Error fetching flight:", err);
      setError("Failed to fetch flight data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFlightData({
      ...flightData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleMealOptionChange = (option) => {
    const updatedMealOptions = [...flightData.mealOptions];
    
    if (updatedMealOptions.includes(option)) {
      const index = updatedMealOptions.indexOf(option);
      updatedMealOptions.splice(index, 1);
    } else {
      updatedMealOptions.push(option);
    }
    
    setFlightData({
      ...flightData,
      mealOptions: updatedMealOptions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Combine date and time for the departure timestamp
      const departureDateTime = new Date(`${flightData.departureDate}T${flightData.departureTime}`);
      
      const flightDataToSave = {
        ...flightData,
        departureTime: departureDateTime,
        price: parseFloat(flightData.price),
        availableSeats: parseInt(flightData.availableSeats, 10)
      };
      
      if (isEditMode) {
        await adminApi.updateFlight(id, flightDataToSave);
      } else {
        await adminApi.addFlight(flightDataToSave);
      }
      
      navigate('/admin/flights');
    } catch (err) {
      console.error("Error saving flight:", err);
      setError("Failed to save flight. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  const mealOptions = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Kosher', 'Halal', 'Diabetic', 'Gluten-Free'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {isEditMode ? 'Edit Flight' : 'Add New Flight'}
        </h1>
        <Link 
          to="/admin/flights" 
          className={`flex items-center px-4 py-2 rounded-lg shadow-sm transition-colors ${
            isDark 
              ? 'bg-gray-800 hover:bg-gray-700 text-white' 
              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          <FaArrowLeft className={`mr-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          Back to Flights
        </Link>
      </div>

      {error && (
        <div className={`p-4 mb-6 rounded-lg ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`rounded-lg shadow-md p-6 ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Airline Information */}
          <div>
            <h2 className={`text-lg font-medium mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-700'}`}>
              <FaPlane className={`mr-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              Airline Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Airline Name*
                </label>
                <input
                  type="text"
                  name="airline"
                  value={flightData.airline}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                      : 'border-gray-300 focus:border-emerald-500'
                  }`}
                  placeholder="e.g., Air India, IndiGo"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Flight Number*
                </label>
                <input
                  type="text"
                  name="flightNumber"
                  value={flightData.flightNumber}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                      : 'border-gray-300 focus:border-emerald-500'
                  }`}
                  placeholder="e.g., AI101, 6E301"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Aircraft Type
                </label>
                <input
                  type="text"
                  name="aircraft"
                  value={flightData.aircraft}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                      : 'border-gray-300 focus:border-emerald-500'
                  }`}
                  placeholder="e.g., Boeing 777, Airbus A320"
                />
              </div>
            </div>
          </div>
          
          {/* Route Information */}
          <div>
            <h2 className={`text-lg font-medium mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-700'}`}>
              <FaMapMarkerAlt className={`mr-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              Route Information
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    From City*
                  </label>
                  <input
                    type="text"
                    name="fromCity"
                    value={flightData.fromCity}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                        : 'border-gray-300 focus:border-emerald-500'
                    }`}
                    placeholder="e.g., Mumbai"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Airport Code*
                  </label>
                  <input
                    type="text"
                    name="from"
                    value={flightData.from}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                        : 'border-gray-300 focus:border-emerald-500'
                    }`}
                    placeholder="e.g., BOM"
                    maxLength="3"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    To City*
                  </label>
                  <input
                    type="text"
                    name="toCity"
                    value={flightData.toCity}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                        : 'border-gray-300 focus:border-emerald-500'
                    }`}
                    placeholder="e.g., Delhi"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Airport Code*
                  </label>
                  <input
                    type="text"
                    name="to"
                    value={flightData.to}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                        : 'border-gray-300 focus:border-emerald-500'
                    }`}
                    placeholder="e.g., DEL"
                    maxLength="3"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="hasStopover"
                    name="hasStopover"
                    checked={flightData.hasStopover}
                    onChange={handleChange}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasStopover" className={`ml-2 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    This flight has a stopover
                  </label>
                </div>
                
                {flightData.hasStopover && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Stopover Location
                      </label>
                      <input
                        type="text"
                        name="stopoverLocation"
                        value={flightData.stopoverLocation}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                            : 'border-gray-300 focus:border-emerald-500'
                        }`}
                        placeholder="e.g., Hyderabad (HYD)"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Stopover Duration
                      </label>
                      <input
                        type="text"
                        name="stopoverDuration"
                        value={flightData.stopoverDuration}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                            : 'border-gray-300 focus:border-emerald-500'
                        }`}
                        placeholder="e.g., 1h 30m"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Schedule Information */}
          <div>
            <h2 className={`text-lg font-medium mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-700'}`}>
              <FaCalendarAlt className={`mr-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              Schedule Information
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Departure Date*
                  </label>
                  <input
                    type="date"
                    name="departureDate"
                    value={flightData.departureDate}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                        : 'border-gray-300 focus:border-emerald-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Departure Time*
                  </label>
                  <input
                    type="time"
                    name="departureTime"
                    value={flightData.departureTime}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                        : 'border-gray-300 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Flight Duration*
                </label>
                <input
                  type="text"
                  name="duration"
                  value={flightData.duration}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                      : 'border-gray-300 focus:border-emerald-500'
                  }`}
                  placeholder="e.g., 2h 15m"
                />
              </div>
            </div>
          </div>
          
          {/* Pricing and Capacity */}
          <div>
            <h2 className={`text-lg font-medium mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-700'}`}>
              <FaRupeeSign className={`mr-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              Pricing and Capacity
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ticket Price (₹)*
                </label>
                <input
                  type="number"
                  name="price"
                  value={flightData.price}
                  onChange={handleChange}
                  required
                  min="1"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                      : 'border-gray-300 focus:border-emerald-500'
                  }`}
                  placeholder="e.g., 5999"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Available Seats*
                </label>
                <input
                  type="number"
                  name="availableSeats"
                  value={flightData.availableSeats}
                  onChange={handleChange}
                  required
                  min="1"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                      : 'border-gray-300 focus:border-emerald-500'
                  }`}
                  placeholder="e.g., 180"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Meal Options */}
        <div className="mt-8">
          <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>Meal Options</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mealOptions.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={option}
                  checked={flightData.mealOptions.includes(option)}
                  onChange={() => handleMealOptionChange(option)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor={option} className={`ml-2 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center px-6 py-3 rounded-lg ${
              isDark 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white shadow-md hover:shadow-lg transition-all`}
          >
            <FaSave className="mr-2" />
            {loading ? 'Saving...' : isEditMode ? 'Update Flight' : 'Add Flight'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlightForm; 