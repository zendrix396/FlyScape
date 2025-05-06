import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/apiService';
import { FaPlane, FaUsers, FaTicketAlt, FaRupeeSign, FaSyncAlt, FaPlusCircle } from 'react-icons/fa';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    userCount: 0,
    bookingCount: 0,
    totalRevenue: 0,
    flightCount: 0,
    recentBookings: 0,
    recentUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex gap-4">
          <button 
            onClick={fetchAnalytics} 
            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-600 rounded-md hover:bg-emerald-200 transition-colors"
          >
            <FaSyncAlt /> Refresh
          </button>
          <Link 
            to="/admin/flights/add" 
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            <FaPlusCircle /> Add Flight
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Total Users</h3>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <FaUsers className="text-emerald-500 text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{analytics.userCount}</p>
              <p className="text-sm text-gray-500 mt-2">
                {analytics.recentUsers} new users in the last 7 days
              </p>
            </div>

            {/* Bookings Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Total Bookings</h3>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <FaTicketAlt className="text-emerald-500 text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{analytics.bookingCount}</p>
              <p className="text-sm text-gray-500 mt-2">
                {analytics.recentBookings} new bookings in the last 7 days
              </p>
            </div>

            {/* Revenue Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Total Revenue</h3>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <FaRupeeSign className="text-emerald-500 text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{formatCurrency(analytics.totalRevenue)}</p>
              <p className="text-sm text-gray-500 mt-2">
                Lifetime earnings from all bookings
              </p>
            </div>

            {/* Flights Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Active Flights</h3>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <FaPlane className="text-emerald-500 text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{analytics.flightCount}</p>
              <p className="text-sm text-gray-500 mt-2">
                Across multiple airlines and routes
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/admin/flights" 
                className="block p-4 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
              >
                <h3 className="font-medium text-gray-800 mb-2">Manage Flights</h3>
                <p className="text-sm text-gray-600">View, edit, and delete flight schedules</p>
              </Link>
              
              <Link 
                to="/admin/flights/generate" 
                className="block p-4 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
              >
                <h3 className="font-medium text-gray-800 mb-2">Generate Flights</h3>
                <p className="text-sm text-gray-600">Quickly generate multiple flight options</p>
              </Link>
              
              <Link 
                to="/admin/analytics" 
                className="block p-4 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
              >
                <h3 className="font-medium text-gray-800 mb-2">Detailed Analytics</h3>
                <p className="text-sm text-gray-600">View detailed reports and statistics</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 