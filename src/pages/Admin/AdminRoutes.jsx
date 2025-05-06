import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import FlightManagement from './FlightManagement';
import FlightForm from './FlightForm';
import FlightGenerator from './FlightGenerator';
import DataManager from './DataManager';
import AdminNavbar from './AdminNavbar';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminRoutes() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  // Check if the user is an admin
  const isAdmin = userProfile?.role === 'admin' || 
                  userProfile?.isAdmin === true || 
                  userProfile?.email === 'admin@example.com' ||
                  userProfile?.email === 'adityasenpai396@gmail.com';
  
  console.log("Admin routes - User email:", userProfile?.email);
  console.log("Admin routes - Is admin:", isAdmin);

  // Redirect non-admin users to home
  useEffect(() => {
    if (currentUser && userProfile && !isAdmin) {
      navigate('/');
    } else if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, userProfile, isAdmin, navigate]);

  // If still loading user data or not authenticated, show loading
  if (!currentUser || !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  // If not an admin, don't render any admin content
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="relative min-h-screen">
      {/* AdminNavbar component */}
      <div className="relative z-10">
        <AdminNavbar />
      </div>
      
      {/* Main content container positioned to the right of sidebar */}
      <div className="lg:pl-64 z-5 relative">
        <main className="p-4 md:p-6 bg-gray-50 min-h-screen">
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