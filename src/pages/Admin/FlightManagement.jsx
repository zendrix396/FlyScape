import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/apiService';
import { FaPlus, FaFilter, FaSync, FaEdit, FaTrash, FaCalendarAlt, FaClock, FaRupeeSign, FaPlane } from 'react-icons/fa';

const FlightManagement = () => {
  const [flights, setFlights] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalFlights: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    airline: '',
    fromCity: '',
    toCity: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchFlights();
  }, [filters.page]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApi.getFlights(filters);
      
      setFlights(response.flights || []);
      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        totalFlights: response.totalFlights || 0
      });
    } catch (err) {
      console.error("Error fetching flights:", err);
      setError(err.message || "Failed to load flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFlights();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when changing filters
    }));
  };

  const clearFilters = () => {
    setFilters({
      airline: '',
      fromCity: '',
      toCity: '',
      minPrice: '',
      maxPrice: '',
      page: 1,
      limit: 10
    });
    fetchFlights();
  };

  const handleChangePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleDeleteFlight = async (flightId) => {
    if (!window.confirm('Are you sure you want to delete this flight?')) return;
    
    try {
      await adminApi.deleteFlight(flightId);
      setFlights(prev => prev.filter(flight => flight.id !== flightId));
      setPagination(prev => ({
        ...prev,
        totalFlights: prev.totalFlights - 1
      }));
    } catch (err) {
      console.error("Error deleting flight:", err);
      alert(err.message || "Failed to delete flight. Please try again.");
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
  
  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return `${duration} mins`;
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Flight Management</h1>
        <div className="flex flex-wrap gap-3 mt-2 sm:mt-4">
          <Link 
            to="/admin/flights/add" 
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-md hover:from-emerald-600 hover:to-emerald-700 transition-colors"
          >
            <FaPlus /> Add Flight
          </Link>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              showFilters 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaFilter /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-emerald-100">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
              <input
                type="text"
                name="airline"
                value={filters.airline}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Any airline"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From City</label>
              <input
                type="text"
                name="fromCity"
                value={filters.fromCity}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Departure city"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To City</label>
              <input
                type="text"
                name="toCity"
                value={filters.toCity}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Arrival city"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="50000"
                min="0"
              />
            </div>
            
            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-md hover:from-emerald-600 hover:to-emerald-700 transition-colors"
              >
                Search
              </button>
              
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
          <h2 className="text-xl font-semibold text-emerald-800">
            {pagination.totalFlights} {pagination.totalFlights === 1 ? 'Flight' : 'Flights'}
          </h2>
          <button
            onClick={fetchFlights}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white text-emerald-700 rounded-md border border-emerald-300 hover:bg-emerald-50 transition-colors"
          >
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          </div>
        ) : flights.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaPlane className="mx-auto text-4xl mb-3 text-gray-300" />
            <p>No flights found</p>
            <p className="text-sm mt-2">Try adjusting your filters or add a new flight</p>
          </div>
        ) : (
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
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1" /> Departure
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaClock className="mr-1" /> Duration
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaRupeeSign className="mr-1" /> Price
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flights.map((flight) => (
                  <tr key={flight.id} className="hover:bg-gray-50">
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
                      <div className="text-sm text-gray-900">{formatDuration(flight.duration)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPrice(flight.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/flights/edit/${flight.id}`}
                          className="text-emerald-600 hover:text-emerald-900"
                          title="Edit flight"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDeleteFlight(flight.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete flight"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleChangePage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  pagination.currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handleChangePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-4 py-2 rounded-md ${
                  pagination.currentPage === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightManagement; 