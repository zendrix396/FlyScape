import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPlane, FaBars, FaTimes, FaChartLine, FaTable, FaWrench, FaPlusCircle, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isDark } = useTheme();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  const navLinks = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <FaChartLine /> },
    { path: '/admin/flights', name: 'Flights', icon: <FaTable /> },
    { path: '/admin/flights/generate', name: 'Generate Flights', icon: <FaWrench /> },
    { path: '/admin/flights/add', name: 'Add Flight', icon: <FaPlusCircle /> },
    { path: '/admin/data', name: 'Data Manager', icon: <FaTable /> }
  ];
  
  const isActive = (path) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin') return true;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <>
      {/* Sidebar for larger screens */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transform lg:translate-x-0 transition duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isDark ? 'bg-gray-900 border-r border-gray-800' : 'bg-emerald-900 border-r border-emerald-800'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-emerald-800">
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
              <FaPlane className="text-emerald-600 text-sm" />
            </div>
            <span className="text-white font-semibold">FlyScape Admin</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-white hover:text-emerald-300 focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  isActive(link.path)
                    ? isDark
                      ? 'bg-gray-800 text-emerald-300'
                      : 'bg-emerald-800 text-white'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-emerald-300'
                      : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                } transition-colors`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            
            <div className="pt-4 mt-4 border-t border-emerald-800">
              <ThemeToggle className="w-full px-4 py-2.5 mb-2 flex items-center justify-between rounded-lg text-white hover:bg-emerald-800 transition-colors" />
              
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg ${
                  isDark
                    ? 'text-gray-300 hover:bg-red-900/30 hover:text-red-300'
                    : 'text-emerald-100 hover:bg-red-700 hover:text-white'
                } transition-colors`}
              >
                <FaSignOutAlt className="mr-3" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Mobile navbar */}
      <div className={`fixed top-0 left-0 right-0 z-20 flex items-center h-16 px-4 ${isDark ? 'bg-gray-900 border-b border-gray-800' : 'bg-emerald-900 border-b border-emerald-800'} lg:hidden`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(true)}
              className="text-white hover:text-emerald-300 focus:outline-none"
            >
              <FaBars />
            </button>
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                <FaPlane className="text-emerald-600 text-sm" />
              </div>
              <span className="text-white font-semibold">FlyScape Admin</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle className="text-white" />
            <Link to="/" className="px-2 py-1 text-xs text-white bg-emerald-700 rounded hover:bg-emerald-600">
              Back to Site
            </Link>
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminNavbar; 