import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaExclamationTriangle, FaDatabase, FaUserAltSlash, FaPlaneSlash, FaCalendarTimes } from 'react-icons/fa';
import { adminApi } from '../../services/apiService';
import { collection, getDocs, query, where, deleteDoc, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Data Management</h1>
        <Link 
          to="/admin" 
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft /> Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Database Statistics</h2>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            {loading ? "Loading..." : "Refresh Stats"}
          </button>
        </div>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-lg font-semibold text-gray-700">Total Users</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.userCount}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-lg font-semibold text-gray-700">Total Flights</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.flightCount}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-lg font-semibold text-gray-700">Total Bookings</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.bookingCount}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-lg font-semibold text-gray-700">Revenue</div>
              <div className="text-2xl font-bold text-emerald-600">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}
        
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Date Range for Deletion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mb-6">
            <p>Data deletion will permanently remove the specified records. This action cannot be undone.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-md p-4">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 bg-red-100 p-2 rounded-full mr-3">
                <FaPlaneSlash className="text-red-500 h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Flights</h3>
                <p className="text-sm text-gray-600">Remove flights within the specified date range</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => confirmDeletion('flights-by-date')}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Delete Flights in Date Range
              </button>
              <button
                onClick={() => confirmDeletion('all-flights')}
                className="w-full px-4 py-2 border border-red-200 text-red-700 rounded-md hover:bg-red-50 transition-colors"
              >
                Delete ALL Flights
              </button>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 bg-red-100 p-2 rounded-full mr-3">
                <FaCalendarTimes className="text-red-500 h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Bookings</h3>
                <p className="text-sm text-gray-600">Remove bookings created within the specified date range</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => confirmDeletion('bookings-by-date')}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Delete Bookings in Date Range
              </button>
              <button
                onClick={() => confirmDeletion('all-bookings')}
                className="w-full px-4 py-2 border border-red-200 text-red-700 rounded-md hover:bg-red-50 transition-colors"
              >
                Delete ALL Bookings
              </button>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 bg-red-100 p-2 rounded-full mr-3">
                <FaDatabase className="text-red-500 h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Activity Data</h3>
                <p className="text-sm text-gray-600">Manage search and activity records</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => confirmDeletion('all-activities')}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Delete ALL Activity Records
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6">
          {success}
        </div>
      )}
      
      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-yellow-500 h-6 w-6 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
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
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
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
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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