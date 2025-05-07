import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import FlightManagement from './FlightManagement';
import FlightForm from './FlightForm';
import FlightGenerator from './FlightGenerator';
import DataManager from './DataManager';
import AdminNavbar from './AdminNavbar';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaHome } from 'react-icons/fa';

export default function AdminRoutes() {
  const { currentUser } = useAuth();
  const { isAdmin, isLoading } = useAdmin();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && (!currentUser || !isAdmin)) {
      navigate('/login');
    }
  }, [currentUser, isAdmin, isLoading, navigate]);
  
  // Show loading state while checking admin status
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="ml-3">Loading admin panel...</p>
      </div>
    );
  }
  
  // If not admin, don't render anything (useEffect will redirect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
      {/* AdminNavbar component */}
      <div className="relative z-10">
        <AdminNavbar />
      </div>
      
      {/* Main content container positioned to the right of sidebar */}
      <div className="lg:pl-64 relative">
        <div className="fixed top-4 right-4 z-50">
          <Link 
            to="/"
            className={`flex items-center px-3 py-2 rounded-lg shadow-md transition-all ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
            }`}
          >
            <FaHome className="mr-2 text-emerald-500" />
            <span>Back to Site</span>
          </Link>
        </div>
        
        <main className={`p-4 md:p-6 ${
          isDark 
            ? 'bg-gray-900 text-gray-100'
            : 'bg-white text-gray-800'
        } min-h-screen`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/flights" element={<FlightManagement />} />
            <Route path="/flights/add" element={<FlightForm />} />
            <Route path="/flights/edit/:id" element={<FlightForm />} />
            <Route path="/flights/generate" element={<FlightGenerator />} />
            <Route path="/data" element={<DataManager />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
} 