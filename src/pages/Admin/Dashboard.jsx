import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/apiService';
import { FaPlane, FaUsers, FaTicketAlt, FaRupeeSign, FaSyncAlt, FaPlusCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { collection, getDocs, getFirestore, query, where, Timestamp } from 'firebase/firestore';

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
  const { isDark } = useTheme();

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
      <div className="flex flex-col mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-4 sm:mb-0`}>Admin Dashboard</h1>
        <div className="flex flex-wrap gap-3 mt-2 sm:mt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2 ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-emerald-50 text-emerald-600 rounded-md border border-emerald-200'
            }`}
            onClick={fetchAnalytics}
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </motion.button>
          <Link 
            to="/admin/flights/add" 
            className={`flex items-center gap-2 px-4 py-2 ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-emerald-500 text-white rounded-md hover:from-emerald-600 hover:to-emerald-700 transition-colors'
            }`}
          >
            <FaPlusCircle />
            <span>Add Flight</span>
          </Link>
        </div>
      </div>

      {loading && !analytics.userCount ? (
        <div className="text-center py-10">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mb-4"></div>
          <p className={`text-${isDark ? 'gray-300' : 'gray-600'}`}>Loading analytics data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users Card */}
            <div className={`bg-${isDark ? 'gray-800' : 'white'} rounded-lg shadow-md p-6 border-l-4 border-emerald-500 hover:shadow-lg transition-shadow ${
              isDark ? 'border border-gray-700' : ''
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Users</h3>
                <div className={`p-3 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                  <FaUsers className="text-emerald-500 text-xl" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{analytics.userCount}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                {analytics.recentUsers} new users in the last 7 days
              </p>
            </div>

            {/* Bookings Card */}
            <div className={`bg-${isDark ? 'gray-800' : 'white'} rounded-lg shadow-md p-6 border-l-4 border-emerald-500 hover:shadow-lg transition-shadow ${
              isDark ? 'border border-gray-700' : ''
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Bookings</h3>
                <div className={`p-3 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                  <FaTicketAlt className="text-emerald-500 text-xl" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{analytics.bookingCount}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                {analytics.recentBookings} new bookings in the last 7 days
              </p>
            </div>

            {/* Revenue Card */}
            <div className={`bg-${isDark ? 'gray-800' : 'white'} rounded-lg shadow-md p-6 border-l-4 border-emerald-500 hover:shadow-lg transition-shadow ${
              isDark ? 'border border-gray-700' : ''
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Revenue</h3>
                <div className={`p-3 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                  <FaRupeeSign className="text-emerald-500 text-xl" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{formatCurrency(analytics.totalRevenue)}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                Lifetime earnings from all bookings
              </p>
            </div>

            {/* Flights Card */}
            <div className={`bg-${isDark ? 'gray-800' : 'white'} rounded-lg shadow-md p-6 border-l-4 border-emerald-500 hover:shadow-lg transition-shadow ${
              isDark ? 'border border-gray-700' : ''
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Active Flights</h3>
                <div className={`p-3 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                  <FaPlane className="text-emerald-500 text-xl" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{analytics.flightCount}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                Across multiple airlines and routes
              </p>
            </div>
          </div>

          <div className={`bg-${isDark ? 'gray-800' : 'white'} rounded-lg shadow-md p-6 mb-8 border border-emerald-100 ${
            isDark ? 'border-gray-700' : ''
          }`}>
            <h2 className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-800'} mb-4`}>Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/admin/flights" 
                className={`block p-4 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors'
                } rounded-md`}
              >
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>Manage Flights</h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>View, edit, and delete flight schedules</p>
              </Link>
              
              <Link 
                to="/admin/flights/generate" 
                className={`block p-4 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors'
                } rounded-md`}
              >
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>Generate Flights</h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Quickly generate multiple flight options</p>
              </Link>
              
              <Link 
                to="/admin/analytics" 
                className={`block p-4 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors'
                } rounded-md`}
              >
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>Detailed Analytics</h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>View detailed reports and statistics</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 