import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPlane, FaBars, FaTimes, FaUser, FaSignOutAlt, FaWallet, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, userProfile } = useAuth();
  
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
    scrolled
      ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-emerald-50'
      : 'bg-transparent'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center">
              <FaPlane className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 text-transparent bg-clip-text">
              AeroVoyage
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-emerald-600 group ${
                  location.pathname === link.path
                    ? 'text-emerald-600'
                    : scrolled
                    ? 'text-gray-800'
                    : 'text-gray-800'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            ))}
          </div>
          
          {/* Authenticated User Options */}
          {currentUser && userProfile ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* Wallet */}
              <div className="px-3 py-1 bg-emerald-50 rounded-full flex items-center text-emerald-700">
                <FaWallet className="h-4 w-4 mr-2" />
                <span className="font-medium">₹{getWalletBalance()}</span>
              </div>
              
              {/* Profile button */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-emerald-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    {userProfile.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="h-8 w-8 rounded-full" />
                    ) : (
                      <FaUser className="text-emerald-600 text-sm" />
                    )}
                  </div>
                </button>
                
                {/* Profile dropdown */}
                {isProfileOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-emerald-50 opacity-100 transform-none"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaUser className="inline mr-2 text-emerald-500" />
                      Your Profile
                    </Link>
                    <Link
                      to="/bookings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaPlane className="inline mr-2 text-emerald-500" />
                      My Bookings
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaTachometerAlt className="inline mr-2 text-emerald-500" />
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <FaSignOutAlt className="inline mr-2 text-emerald-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Login and Signup buttons for non-authenticated users */
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700"
              >
                Sign Up
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-emerald-50 transition-colors"
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
      {isMenuOpen && (
        <div 
          className="md:hidden bg-white border-t border-emerald-50"
          style={{
            opacity: 1,
            height: 'auto',
            transition: 'opacity 0.3s, height 0.3s'
          }}
        >
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
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
                    <span className="font-medium text-emerald-600">₹{getWalletBalance()}</span>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="mr-3 text-emerald-500" />
                    Your Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaTachometerAlt className="mr-3 text-emerald-500" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                  >
                    <FaSignOutAlt className="mr-3 text-emerald-500" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-100 my-2 pt-2 flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 bg-emerald-600 text-white text-base font-medium rounded-md hover:bg-emerald-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 