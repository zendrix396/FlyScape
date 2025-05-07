import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaWallet, FaHistory, FaSignOutAlt, FaPlane, FaCreditCard, FaBell, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import SpotlightCard from '../components/SpotlightCard';
import GradientText from '../components/GradientText';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { currentUser, userProfile, logout, updateAdminStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if the user is an admin
  const isAdmin = userProfile?.role === 'admin' || 
                  userProfile?.isAdmin === true || 
                  userProfile?.email === 'admin@example.com' ||
                  userProfile?.email === 'adityasenpai396@gmail.com';

  // Handle manually updating admin status (for debugging)
  const handleUpdateAdminStatus = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      await updateAdminStatus(currentUser.uid, currentUser.email);
      toast.success('Admin status updated successfully');
      // Force reload the page to ensure all components update
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update admin status');
      console.error('Error updating admin status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Please log in</h1>
          <p className="mt-2 text-gray-600">You need to be logged in to view this page</p>
          <Link
            to="/login"
            className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }
  
  // Calculate the wallet balance safely
  const walletBalance = userProfile.walletBalance !== undefined 
    ? userProfile.walletBalance 
    : (userProfile.wallet || 0);
  
  // Format membership date
  const memberSince = userProfile.createdAt 
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';
    
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-8">
          <GradientText
            colors={["#10b981", "#6ee7b7", "#10b981"]}
            animationSpeed={5}
            className="text-3xl font-bold"
          >
            Your Profile
          </GradientText>
          <h2 className="mt-2 text-gray-600">Manage your account and preferences</h2>
        </div>
        
        {/* Profile Header */}
        <SpotlightCard
          className="bg-white rounded-xl shadow-md overflow-hidden border border-emerald-50 mb-6"
          spotlightColor="rgba(16, 185, 129, 0.1)"
          spotlightSize={250}
        >
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
              {userProfile.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <FaUser className="h-10 w-10 text-emerald-600" />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800">{userProfile.displayName || 'User'}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-1">
                <FaEnvelope className="h-4 w-4" />
                <span>{userProfile.email}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">Member since {memberSince}</div>
              
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  to="/bookings"
                  className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-200 transition-colors"
                >
                  <FaHistory className="mr-2" />
                  My Bookings
                </Link>
                
                <motion.button
                  onClick={handleLogout}
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-70"
                >
                  <FaSignOutAlt className="mr-2" />
                  {loading ? 'Signing out...' : 'Sign out'}
                </motion.button>
              </div>
            </div>
            
            <div className="flex-shrink-0 bg-emerald-50 rounded-lg p-6 text-center min-w-40">
              <div className="flex items-center justify-center text-emerald-600 mb-2">
                <FaWallet className="mr-2 h-5 w-5" />
                <span className="font-semibold">Wallet Balance</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                ₹{walletBalance.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                For flight bookings and upgrades
              </p>
            </div>
          </div>
        </SpotlightCard>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upcoming Flights */}
          <SpotlightCard
            className="bg-white rounded-xl shadow-md overflow-hidden border border-emerald-50 md:col-span-2"
            spotlightColor="rgba(16, 185, 129, 0.1)"
            spotlightSize={250}
          >
            <div className="p-3 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-3 sm:mb-4">
                <FaPlane className="mr-2 text-emerald-500" />
                Your Travel Status
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-700">Upcoming Flights</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Check your next adventures</p>
                    </div>
                    <Link
                      to="/bookings"
                      className="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      View all
                    </Link>
                  </div>
                  
                  <div className="mt-3 sm:mt-4 text-center py-4 sm:py-6">
                    <p className="text-gray-500 text-sm">
                      You don't have any upcoming flights.
                    </p>
                    <Link
                      to="/flights"
                      className="mt-3 sm:mt-4 inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-xs sm:text-sm"
                    >
                      Book a Flight
                    </Link>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-700 mb-2">
                      <FaWallet className="mr-2 text-emerald-500" />
                      <h3 className="font-medium">Recent Transactions</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      No recent transactions to display.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-700 mb-2">
                      <FaCreditCard className="mr-2 text-emerald-500" />
                      <h3 className="font-medium">Payment Methods</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      No payment methods saved.
                    </p>
                    <button className="mt-2 text-sm text-emerald-600 hover:text-emerald-700">
                      + Add Payment Method
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
          
          {/* Settings & Preferences */}
          <SpotlightCard
            className="bg-white rounded-xl shadow-md overflow-hidden border border-emerald-50"
            spotlightColor="rgba(16, 185, 129, 0.1)"
            spotlightSize={250}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                <FaBell className="mr-2 text-emerald-500" />
                Preferences
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="email-toggle" defaultChecked className="sr-only" />
                    <label htmlFor="email-toggle" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer">
                      <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">SMS Alerts</span>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="sms-toggle" className="sr-only" />
                    <label htmlFor="sms-toggle" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer">
                      <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">Promotional Offers</span>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="promo-toggle" defaultChecked className="sr-only" />
                    <label htmlFor="promo-toggle" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer">
                      <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"></span>
                    </label>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <FaShieldAlt className="mr-2 text-emerald-500" />
                    Security
                  </h3>
                  
                  <button className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 block">
                    Change Password
                  </button>
                  <button className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 block">
                    Two-Factor Authentication
                  </button>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
        
        {/* Footer Card */}
        <SpotlightCard
          className="bg-white rounded-xl shadow-md overflow-hidden border border-emerald-50 mt-6"
          spotlightColor="rgba(16, 185, 129, 0.1)"
          spotlightSize={250}
        >
          <div className="p-6">
            <div className="text-center">
              <h3 className="font-medium text-gray-700">Need Help?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Our customer support team is available 24/7 to assist you with any questions.
              </p>
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                Contact Support
              </button>
            </div>
          </div>
        </SpotlightCard>

        {/* Add this where appropriate in your component */}
        {isAdmin && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Settings</h2>
            <p className="text-sm text-gray-500 mb-4">
              You have administrator privileges. If you're having trouble accessing admin features, use the button below.
            </p>
            <button
              onClick={handleUpdateAdminStatus}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Refresh Admin Status'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 