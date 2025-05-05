import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlane, FaBars, FaTimes, FaUser, FaSignOutAlt, FaWallet, FaBug } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, userProfile } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // Close menu when route changes
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  const navLinks = [
    { path: '/', name: 'Home' },
    { path: '/flights', name: 'Flights' },
  ];
  
  // Add bookings link only for authenticated users
  if (currentUser) {
    navLinks.push({ path: '/bookings', name: 'My Bookings' });
  }
  
  // Handle wallet display to support both wallet and walletBalance fields
  const getWalletBalance = () => {
    if (!userProfile) return '0';
    return userProfile.walletBalance !== undefined 
      ? userProfile.walletBalance.toLocaleString() 
      : (userProfile.wallet?.toLocaleString() || '0');
  };
  
  const navbarClasses = `fixed top-0 left-0 right-0 z-50 duration-300 ${
    scrolled
      ? 'bg-white/90 backdrop-blur-md border-b border-gray-50'
      : 'bg-transparent'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full bg-gray-600 flex items-center justify-center">
              <FaPlane className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold bg-black text-transparent bg-clip-text">
              AeroVoyage
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 rounded-md text-sm font-medium  hover:text-gray-700 group ${
                  location.pathname === link.path
                    ? 'text-gray-700'
                    : scrolled
                    ? 'text-gray-800'
                    : 'text-gray-800'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-500"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            ))}
          </div>
          
          {/* Authenticated User Options */}
          {currentUser && userProfile ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* Wallet */}
              <div className="px-3 py-1 bg-gray-50 rounded-full flex items-center text-gray-800">
                <FaWallet className="h-4 w-4 mr-2" />
                <span className="font-medium">₹{getWalletBalance()}</span>
              </div>
              
              {/* Profile button */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-50 "
                >
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {userProfile.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="h-8 w-8 rounded-full" />
                    ) : (
                      <FaUser className="text-gray-700 text-sm" />
                    )}
                  </div>
                </button>
                
                {/* Profile dropdown */}
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md py-1 z-10 border border-gray-50"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaUser className="inline mr-2 text-gray-700" />
                      Your Profile
                    </Link>
                    <Link
                      to="/bookings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaPlane className="inline mr-2 text-gray-700" />
                      My Bookings
                    </Link>
                    <Link
                      to="/debug"
                      className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-t border-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaBug className="inline mr-2 text-gray-700" />
                      Troubleshoot
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                    >
                      <FaSignOutAlt className="inline mr-2 text-gray-700" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            /* Login and Signup buttons for non-authenticated users */
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
              >
                Sign Up
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-50 "
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-50"
          >
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-gray-50 text-gray-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {currentUser && userProfile ? (
                <>
                  <div className="border-t border-gray-100 my-2 pt-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-gray-600">Wallet Balance</span>
                      <span className="font-medium text-gray-700">₹{getWalletBalance()}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUser className="mr-3 text-gray-700" />
                      Your Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                    >
                      <FaSignOutAlt className="mr-3 text-gray-700" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-100 my-2 pt-2 flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-2 bg-gray-600 text-white text-base font-medium rounded-md hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 