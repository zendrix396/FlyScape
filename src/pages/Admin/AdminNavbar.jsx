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
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-4 flex justify-between items-center lg:hidden z-30 relative">
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

      {/* Mobile Overlay - placing it before the sidebar so it doesn't cover the sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-[1px] lg:hidden z-30"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
      
      {/* Sidebar - mobile version as overlay, desktop version as fixed sidebar */}
      <aside 
        className={`lg:block fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 lg:z-0 w-3/4 sm:w-64 md:w-64`}
      >
        <div className="h-full bg-gradient-to-b from-emerald-600 to-emerald-800 text-white overflow-y-auto shadow-lg">
          {/* Logo - only show on desktop, as mobile has its own header */}
          <div className="p-5 border-b border-emerald-700 hidden lg:block">
            <Link to="/admin" className="text-xl font-bold">
              AeroVoyage Admin
            </Link>
          </div>
          
          {/* Close button for mobile */}
          <div className="p-4 flex justify-end lg:hidden">
            <button 
              onClick={toggleSidebar}
              className="text-white focus:outline-none"
            >
              <FaTimes size={20} />
            </button>
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
                        ? 'bg-emerald-700 bg-opacity-70 text-white'
                        : 'text-emerald-100 hover:bg-emerald-700 hover:bg-opacity-50'
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
    </>
  );
};

export default AdminNavbar; 