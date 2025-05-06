import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../services/apiService';
import { FaSave, FaArrowLeft, FaPlus, FaRegClock, FaCalendarAlt } from 'react-icons/fa';
import moment from 'moment';

const FlightForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    airline: '',
    flightNumber: '',
    fromCity: '',
    toCity: '',
    departureTime: moment().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
    duration: '',
    price: '',
    availableSeats: 50,
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const airlines = [
    'IndiGo', 
    'Air India', 
    'SpiceJet', 
    'Vistara', 
    'GoAir', 
    'AirAsia India'
  ];
  
  useEffect(() => {
    if (isEditMode) {
      fetchFlightData();
    }
  }, [id]);
  
  const fetchFlightData = async () => {
    try {
      setLoading(true);
      const flightData = await adminApi.getFlight(id);
      
      // Convert Firestore timestamp to Date object if needed
      let departureTime = flightData.departureTime;
      if (departureTime && departureTime.toDate) {
        departureTime = departureTime.toDate();
      } else if (typeof departureTime === 'string') {
        departureTime = new Date(departureTime);
      }
      
      setFormData({
        ...flightData,
        departureTime: moment(departureTime).format('YYYY-MM-DDTHH:mm')
      });
    } catch (err) {
      console.error("Error fetching flight data:", err);
      setError(err.message || "Failed to load flight data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'availableSeats' ? Number(value) : value
    });
  };
  
  const calculateArrivalTime = () => {
    if (!formData.departureTime || !formData.duration) return '';
    
    // Parse duration (e.g., "2h 30m")
    const durationMatch = formData.duration.match(/(\d+)h\s*(\d+)m/);
    if (!durationMatch) return '';
    
    const hours = parseInt(durationMatch[1]) || 0;
    const minutes = parseInt(durationMatch[2]) || 0;
    
    // Calculate arrival time
    const departure = moment(formData.departureTime);
    const arrival = departure.clone().add(hours, 'hours').add(minutes, 'minutes');
    
    return arrival.toDate();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.airline || !formData.flightNumber || 
        !formData.fromCity || !formData.toCity || 
        !formData.departureTime || !formData.duration || 
        !formData.price) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Make sure origin and destination are different
    if (formData.fromCity === formData.toCity) {
      setError('Origin and destination cities cannot be the same');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Convert date strings to proper format for the API
      const departureDate = new Date(formData.departureTime);
      const arrivalTime = calculateArrivalTime();
      
      const flightData = {
        ...formData,
        departureTime: departureDate,
        arrivalTime: arrivalTime
      };
      
      if (isEditMode) {
        await adminApi.updateFlight(id, flightData);
      } else {
        await adminApi.createFlight(flightData);
      }
      
      // Navigate back to flight management after successful submission
      navigate('/admin/flights');
    } catch (err) {
      console.error("Error saving flight:", err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} flight. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Loading flight data...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditMode ? 'Edit Flight' : 'Add New Flight'}
        </h1>
        <Link 
          to="/admin/flights" 
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft /> Back to Flights
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Airline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airline *
            </label>
            <select
              name="airline"
              value={formData.airline}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Select Airline</option>
              {airlines.map(airline => (
                <option key={airline} value={airline}>{airline}</option>
              ))}
            </select>
          </div>
          
          {/* Flight Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flight Number *
            </label>
            <input
              type="text"
              name="flightNumber"
              value={formData.flightNumber}
              onChange={handleChange}
              placeholder="e.g. AI101"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          
          {/* From City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From City *
            </label>
            <input
              type="text"
              name="fromCity"
              value={formData.fromCity}
              onChange={handleChange}
              placeholder="e.g. Delhi"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          
          {/* To City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To City *
            </label>
            <input
              type="text"
              name="toCity"
              value={formData.toCity}
              onChange={handleChange}
              placeholder="e.g. Mumbai"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          
          {/* Departure Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Time *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <FaCalendarAlt />
              </span>
              <input
                type="datetime-local"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                className="w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
          
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <FaRegClock />
              </span>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 2h 30m"
                className="w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Format: "2h 30m" for 2 hours and 30 minutes</p>
          </div>
          
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="1000"
              step="100"
              placeholder="e.g. 5000"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          
          {/* Available Seats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Seats
            </label>
            <input
              type="number"
              name="availableSeats"
              value={formData.availableSeats}
              onChange={handleChange}
              min="0"
              placeholder="e.g. 50"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/flights')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors mr-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave /> Save Flight
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlightForm; 