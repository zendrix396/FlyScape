import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaExclamationTriangle, FaDatabase, FaUserAltSlash, FaPlaneSlash, FaCalendarTimes, FaCalendarAlt, FaTicketAlt, FaUsers } from 'react-icons/fa';
import { adminApi } from '../../services/apiService';
import { collection, getDocs, query, where, deleteDoc, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../contexts/ThemeContext';

const DataManager = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [stats, setStats] = useState(null);
  const { isDark } = useTheme();

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const analytics = await adminApi.getAnalytics();
      setStats(analytics);
    } catch (err) {
      setError(err.message || "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  const deleteFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setConfirmAction(null);
      
      // Define date range for deletion
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end day
      
      // Convert to Firestore timestamps
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      let q;
      if (confirmAction === 'all-flights') {
        q = collection(db, 'flights');
      } else {
        q = query(
          collection(db, 'flights'),
          where('departureTime', '>=', startTimestamp),
          where('departureTime', '<=', endTimestamp)
        );
      }
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setSuccess("No flights found to delete for the specified criteria.");
        return;
      }
      
      // Use batch to delete multiple documents
      const batch = writeBatch(db);
      let count = 0;
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });
      
      await batch.commit();
      setSuccess(`Successfully deleted ${count} flights.`);
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error("Error deleting flights:", err);
      setError(err.message || "Failed to delete flights");
    } finally {
      setLoading(false);
    }
  };

  const deleteBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setConfirmAction(null);
      
      // Define date range for deletion
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end day
      
      // Convert to Firestore timestamps
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      let q;
      if (confirmAction === 'all-bookings') {
        q = collection(db, 'bookings');
      } else {
        q = query(
          collection(db, 'bookings'),
          where('createdAt', '>=', startTimestamp),
          where('createdAt', '<=', endTimestamp)
        );
      }
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setSuccess("No bookings found to delete for the specified criteria.");
        return;
      }
      
      // Use batch to delete multiple documents
      const batch = writeBatch(db);
      let count = 0;
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });
      
      await batch.commit();
      setSuccess(`Successfully deleted ${count} bookings.`);
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error("Error deleting bookings:", err);
      setError(err.message || "Failed to delete bookings");
    } finally {
      setLoading(false);
    }
  };

  const deleteActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setConfirmAction(null);
      
      // Get all activities
      const snapshot = await getDocs(collection(db, 'flightActivities'));
      
      if (snapshot.empty) {
        setSuccess("No activities found to delete.");
        return;
      }
      
      // Use batch to delete multiple documents
      const batch = writeBatch(db);
      let count = 0;
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });
      
      await batch.commit();
      setSuccess(`Successfully deleted ${count} activity records.`);
    } catch (err) {
      console.error("Error deleting activities:", err);
      setError(err.message || "Failed to delete activity records");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletion = (action) => {
    setConfirmAction(action);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Data Management</h1>
        <Link 
          to="/admin" 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-colors ${
            isDark 
              ? 'bg-gray-800 hover:bg-gray-700 text-white' 
              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          <FaArrowLeft className={`mr-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} /> Back to Dashboard
        </Link>
      </div>
      
      <div className={`rounded-lg shadow-md p-6 mb-8 ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>Database Statistics</h2>
          <button
            onClick={fetchStats}
            disabled={loading}
            className={`px-4 py-2 rounded-lg shadow-sm transition-colors ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
            }`}
          >
            {loading ? "Loading..." : "Refresh Stats"}
          </button>
        </div>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${
              isDark 
                ? 'bg-gray-700' 
                : 'bg-gray-50'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</p>
                  <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.userCount}</p>
                </div>
                <div className={`p-2 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                  <FaUsers className={`${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${
              isDark 
                ? 'bg-gray-700' 
                : 'bg-gray-50'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Flights</p>
                  <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.flightCount}</p>
                </div>
                <div className={`p-2 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                  <FaPlaneSlash className={`${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${
              isDark 
                ? 'bg-gray-700' 
                : 'bg-gray-50'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Bookings</p>
                  <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.bookingCount}</p>
                </div>
                <div className={`p-2 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                  <FaTicketAlt className={`${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${
              isDark 
                ? 'bg-gray-700' 
                : 'bg-gray-50'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Revenue</p>
                  <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                  <FaDatabase className={`${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>Date Range for Deletion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Start Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className={`pl-10 p-2 block w-full rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500 focus:border-emerald-500' 
                      : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>End Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className={`pl-10 p-2 block w-full rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500 focus:border-emerald-500' 
                      : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>
          </div>
          
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
            <p>Data deletion will permanently remove the specified records. This action cannot be undone.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-4 rounded-lg ${
            isDark 
              ? 'bg-gray-700 border border-gray-600' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center mb-3">
              <FaPlaneSlash className={`mr-2 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Delete Flights</h3>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Remove flights within the specified date range
            </p>
            <div className="space-y-2">
              <button
                onClick={() => confirmDeletion('flights-by-date')}
                disabled={loading}
                className={`w-full py-2 px-4 ${
                  isDark 
                    ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                } rounded-md`}
              >
                Delete Flights in Date Range
              </button>
              <button
                onClick={() => confirmDeletion('all-flights')}
                disabled={loading}
                className={`w-full py-2 px-4 ${
                  isDark 
                    ? 'bg-red-900/60 text-red-300 hover:bg-red-800' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                } rounded-md`}
              >
                Delete ALL Flights
              </button>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${
            isDark 
              ? 'bg-gray-700 border border-gray-600' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center mb-3">
              <FaCalendarTimes className={`mr-2 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Delete Bookings</h3>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Remove bookings created within the specified date range
            </p>
            <div className="space-y-2">
              <button
                onClick={() => confirmDeletion('bookings-by-date')}
                disabled={loading}
                className={`w-full py-2 px-4 ${
                  isDark 
                    ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                } rounded-md`}
              >
                Delete Bookings in Date Range
              </button>
              <button
                onClick={() => confirmDeletion('all-bookings')}
                disabled={loading}
                className={`w-full py-2 px-4 ${
                  isDark 
                    ? 'bg-red-900/60 text-red-300 hover:bg-red-800' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                } rounded-md`}
              >
                Delete ALL Bookings
              </button>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${
            isDark 
              ? 'bg-gray-700 border border-gray-600' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center mb-3">
              <FaDatabase className={`mr-2 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Activity Data</h3>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage search and activity records
            </p>
            <div className="space-y-2">
              <button
                onClick={() => confirmDeletion('all-activities')}
                disabled={loading}
                className={`w-full py-2 px-4 ${
                  isDark 
                    ? 'bg-red-900/60 text-red-300 hover:bg-red-800' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                } rounded-md`}
              >
                Delete ALL Activity Records
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className={`p-4 rounded-md mb-6 ${
          isDark ? 'bg-red-900/30 border border-red-800 text-red-300' : 'bg-red-100 text-red-700'
        }`}>
          {error}
        </div>
      )}
      
      {success && (
        <div className={`p-4 rounded-md mb-6 ${
          isDark ? 'bg-green-900/30 border border-green-800 text-green-300' : 'bg-green-100 text-green-700'
        }`}>
          {success}
        </div>
      )}
      
      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-lg max-w-md w-full p-6 ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-yellow-500 h-6 w-6 mr-3" />
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Deletion</h3>
            </div>
            
            <div className="mb-6">
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {confirmAction === 'flights-by-date' && `Are you sure you want to delete flights in the selected date range? This cannot be undone.`}
                {confirmAction === 'all-flights' && `WARNING: You are about to delete ALL flights from the database. This action cannot be undone.`}
                {confirmAction === 'bookings-by-date' && `Are you sure you want to delete bookings in the selected date range? This cannot be undone.`}
                {confirmAction === 'all-bookings' && `WARNING: You are about to delete ALL bookings from the database. This action cannot be undone.`}
                {confirmAction === 'all-activities' && `Are you sure you want to delete ALL activity records? This cannot be undone.`}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmAction(null)}
                className={`px-4 py-2 rounded-md ${
                  isDark 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                } transition-colors`}
              >
                Cancel
              </button>
              
              <button
                onClick={() => {
                  if (confirmAction === 'flights-by-date' || confirmAction === 'all-flights') {
                    deleteFlights();
                  } else if (confirmAction === 'bookings-by-date' || confirmAction === 'all-bookings') {
                    deleteBookings();
                  } else if (confirmAction === 'all-activities') {
                    deleteActivities();
                  }
                }}
                className={`px-4 py-2 rounded-md ${
                  isDark 
                    ? 'bg-red-800 text-white hover:bg-red-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                } transition-colors`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManager; 