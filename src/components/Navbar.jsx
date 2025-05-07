import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPlane, FaBars, FaTimes, FaUser, FaSignOutAlt, FaWallet, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, userProfile } = useAuth();
  const { isDark } = useTheme();
  
  // Check if the user is an admin
  const isAdmin = userProfile?.role === 'admin' || 
                  userProfile?.isAdmin === true || 
                  userProfile?.email === 'admin@example.com' ||
                  userProfile?.email === 'adityasenpai396@gmail.com';
  
  console.log("User email:", userProfile?.email);
  console.log("Is admin:", isAdmin);
  
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
  
  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isDark
      ? scrolled
        ? 'bg-gray-900/90 backdrop-blur-lg border-b border-gray-700'
        : 'bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm'
      : scrolled
        ? 'bg-white/75 backdrop-blur-lg shadow-md border-b border-emerald-100'
        : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm'
  }`;

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-gray-900/85 backdrop-blur-lg shadow-lg'
            : 'bg-white/85 backdrop-blur-lg shadow-lg'
          : isDark
            ? 'bg-gray-900'
            : 'bg-white'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-emerald-500/20 transition-all duration-300">
              <FaPlane className="text-white text-xl transform group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-transparent bg-clip-text">
              FlyScape
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors group overflow-hidden ${
                  location.pathname === link.path
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isDark
                      ? 'text-gray-300 hover:text-emerald-400'
                      : scrolled
                        ? 'text-gray-700 hover:text-emerald-600'
                        : 'text-gray-700 hover:text-emerald-600'
                }`}
              >
                <span className="relative z-10">{link.name}</span>
                {location.pathname === link.path ? (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-emerald-500 to-teal-400"></span>
                ) : (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-emerald-500 to-teal-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                )}
              </Link>
            ))}
            
            {/* Theme toggle */}
            <ThemeToggle className={isDark ? 'text-gray-300' : 'text-gray-700'} />
          </div>
          
          {/* Authenticated User Options */}
          {currentUser && userProfile ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* Wallet */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1.5 ${
                  isDark 
                    ? 'bg-gradient-to-r from-emerald-900/30 to-teal-900/30 backdrop-blur-sm border-emerald-800/50 text-emerald-400' 
                    : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border-emerald-200/30 text-emerald-700'
                } rounded-full flex items-center border shadow-sm`}
              >
                <FaWallet className={`h-4 w-4 mr-2 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                <span className="font-medium">₹{getWalletBalance()}</span>
              </motion.div>
              
              {/* Profile button */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center space-x-2 p-2 rounded-full ${
                    isDark
                      ? 'bg-gradient-to-r from-emerald-900/30 to-teal-900/30 hover:from-emerald-900/40 hover:to-teal-900/40 border-emerald-800/50'
                      : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-200/30'
                  } backdrop-blur-sm transition-all duration-300 shadow-sm border`}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                    {userProfile.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <FaUser className="text-white text-sm" />
                    )}
                  </div>
                </motion.button>
                
                {/* Profile dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 mt-2 w-56 ${
                        isDark
                          ? 'bg-gray-800/90 backdrop-blur-lg border-gray-700'
                          : 'bg-white/90 backdrop-blur-lg border-emerald-100'
                      } rounded-xl shadow-xl py-2 z-10 border`}
                    >
                      <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700' : 'border-emerald-50'}`}>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Signed in as</p>
                        <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'} truncate`}>{userProfile.email || currentUser.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className={`flex items-center px-4 py-2.5 text-sm ${
                          isDark
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-emerald-400'
                            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                        } transition-colors`}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaUser className={`mr-3 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        Your Profile
                      </Link>
                      <Link
                        to="/bookings"
                        className={`flex items-center px-4 py-2.5 text-sm ${
                          isDark
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-emerald-400'
                            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                        } transition-colors`}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaPlane className={`mr-3 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        My Bookings
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className={`flex items-center px-4 py-2.5 text-sm ${
                            isDark
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-emerald-400'
                              : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                          } transition-colors`}
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FaTachometerAlt className={`mr-3 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                          Admin Dashboard
                        </Link>
                      )}
                      <div className={`border-t my-1 ${isDark ? 'border-gray-700' : 'border-emerald-50'}`}></div>
                      <button
                        onClick={handleLogout}
                        className={`flex w-full items-center px-4 py-2.5 text-sm ${
                          isDark
                            ? 'text-gray-300 hover:bg-red-900/40 hover:text-red-400'
                            : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                        } transition-colors`}
                      >
                        <FaSignOutAlt className="mr-3 text-red-500" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* Login and Signup buttons for non-authenticated users */
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle className={isDark ? 'text-gray-300 mr-2' : 'text-gray-700 mr-2'} />
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium ${
                    isDark
                      ? 'text-emerald-400 hover:text-emerald-300 border-emerald-700 hover:bg-gray-800'
                      : 'text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                  } border rounded-lg transition-colors duration-300`}
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Sign Up
                </Link>
              </motion.div>
            </div>
          )}
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle className={isDark ? 'text-gray-300 mr-2' : 'text-gray-700 mr-2'} />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${
                isDark
                  ? 'text-emerald-400 hover:bg-gray-800'
                  : 'text-emerald-600 hover:bg-emerald-100'
              } transition-colors`}
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </motion.button>
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
            className={`md:hidden ${
              isDark
                ? 'bg-gray-900/95 backdrop-blur-lg border-gray-800'
                : 'bg-white/95 backdrop-blur-lg border-emerald-100'
            } border-t overflow-hidden shadow-md`}
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    location.pathname === link.path
                      ? isDark
                        ? 'bg-gradient-to-r from-emerald-900/20 to-teal-900/20 text-emerald-400'
                        : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-emerald-400'
                        : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {currentUser && userProfile ? (
                <>
                  <div className={`border-t my-2 pt-3 ${isDark ? 'border-gray-800' : 'border-emerald-100'}`}>
                    <div className={`flex items-center justify-between px-4 py-2 ${
                      isDark
                        ? 'bg-gradient-to-r from-emerald-900/20 to-teal-900/20'
                        : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10'
                    } rounded-lg mb-2`}>
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Wallet Balance</span>
                      <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>₹{getWalletBalance()}</span>
                    </div>
                    <Link
                      to="/profile"
                      className={`flex items-center px-4 py-2.5 rounded-lg text-base font-medium ${
                        isDark
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-emerald-400'
                          : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUser className={`mr-3 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      Your Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className={`flex items-center px-4 py-2.5 rounded-lg text-base font-medium ${
                          isDark
                            ? 'text-gray-300 hover:bg-gray-800 hover:text-emerald-400'
                            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaTachometerAlt className={`mr-3 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-2.5 rounded-lg text-base font-medium ${
                        isDark
                          ? 'text-gray-300 hover:bg-red-900/30 hover:text-red-400'
                          : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                      } mt-2`}
                    >
                      <FaSignOutAlt className="mr-3 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className={`border-t my-3 pt-3 flex flex-col space-y-2 ${isDark ? 'border-gray-800' : 'border-emerald-100'}`}>
                  <Link
                    to="/login"
                    className={`px-4 py-2.5 rounded-lg text-base font-medium ${
                      isDark
                        ? 'text-emerald-400 border border-emerald-800 hover:bg-gray-800'
                        : 'text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                    } text-center`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-base font-medium rounded-lg hover:shadow-md text-center"
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
    </header>
  );
} 