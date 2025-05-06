import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaPlane, FaSignOutAlt, FaBars, FaTimes, FaPlus, FaRandom, FaChartLine, FaDatabase } from 'react-icons/fa';

const AdminNavbar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const navItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/admin/flights', name: 'Manage Flights', icon: <FaPlane /> },
    { path: '/admin/flights/add', name: 'Add Flight', icon: <FaPlus /> },
    { path: '/admin/flights/generate', name: 'Generate Flights', icon: <FaRandom /> },
    { path: '/admin/data', name: 'Data Manager', icon: <FaDatabase /> },
    { path: '/admin/analytics', name: 'Analytics', icon: <FaChartLine /> },
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <>
      {/* Mobile Navbar */}
      <div className="bg-emerald-800 text-white p-4 flex justify-between items-center lg:hidden">
        <Link to="/admin" className="text-xl font-bold">
          AeroVoyage Admin
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md focus:outline-none"
        >
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar - only position:fixed on large screens and not covering content */}
      <aside className={`lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-emerald-800 text-white h-screen overflow-y-auto shadow-lg">
          {/* Logo */}
          <div className="p-5 border-b border-emerald-700">
            <Link to="/admin" className="text-xl font-bold">
              AeroVoyage Admin
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-grow py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-5 py-3 transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'bg-emerald-700 text-white'
                        : 'text-emerald-100 hover:bg-emerald-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* User Area */}
          <div className="p-4 border-t border-emerald-700">
            <Link
              to="/"
              className="flex items-center text-emerald-100 hover:text-white transition-colors duration-200"
            >
              <FaSignOutAlt className="mr-3" />
              Back to User Site
            </Link>
          </div>
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default AdminNavbar; 