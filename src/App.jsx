import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FlightsPage from './pages/FlightsPage';
import BookingPage from './pages/BookingPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import TicketPage from './pages/TicketPage';
import AdminRoutes from './pages/Admin/AdminRoutes';
import { BookingProvider } from './contexts/BookingContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import CookieStatus from './components/CookieStatus';
import './App.css';

function App() {
  // Add a state to check if we're in the browser
  const [isBrowser, setIsBrowser] = useState(false);
  // Add state to check if we're in development mode
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // Set isBrowser to true once the component mounts
    // This ensures we're in a browser environment
    setIsBrowser(true);
    
    // Check if we're in development mode
    setIsDevelopment(process.env.NODE_ENV === 'development');
  }, []);

  // Don't render anything until we confirm we're in a browser environment
  // This prevents Framer Motion from trying to access window/document during SSR
  if (!isBrowser) {
    return null;
  }

  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <BookingProvider>
            <div className="min-h-screen flex flex-col bg-white">
              <Routes>
                <Route path="/admin/*" element={null} />
                <Route path="*" element={<Navbar />} />
              </Routes>
              
              <main className="flex-1">
                <Routes>
                  <Route path="/admin/*" element={<AdminRoutes />} />
                  
                  <Route path="/" element={<div className="pt-16"><Home /></div>} />
                  <Route path="/flights" element={<div className="pt-16"><FlightsPage /></div>} />
                  <Route path="/booking/:flightId" element={<div className="pt-16"><BookingPage /></div>} />
                  <Route path="/bookings" element={<div className="pt-16"><BookingHistoryPage /></div>} />
                  <Route path="/ticket/:ticketId" element={<div className="pt-16"><TicketPage /></div>} />
                  <Route path="/login" element={<div className="pt-16"><LoginPage /></div>} />
                  <Route path="/signup" element={<div className="pt-16"><SignupPage /></div>} />
                  <Route path="/forgot-password" element={<div className="pt-16"><ForgotPasswordPage /></div>} />
                  <Route path="/profile" element={<div className="pt-16"><ProfilePage /></div>} />
                </Routes>
              </main>
              
              <Routes>
                <Route path="/admin/*" element={null} />
                <Route path="*" element={
                  <footer className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white py-6 sm:py-8">
                    <div className="container mx-auto px-4">
                      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                        <div className="text-center md:text-left max-w-xs">
                          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-emerald-600">
                                <path d="M10.5 18.375a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
                                <path fillRule="evenodd" d="M8.625 5.25v.75H5.25a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25h-3.375v-.75a2.25 2.25 0 00-2.25-2.25h-4.5a2.25 2.25 0 00-2.25 2.25zm3.375-1.5a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v.75h-6v-.75zM5.25 9.75a.75.75 0 01.75-.75h12a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zm1.5 3.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5H7.5a.75.75 0 01-.75-.75zm3 3a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">AeroVoyage</h3>
                          </div>
                          <p className="text-xs text-emerald-100">
                            Find and book the best flight deals with ease.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-center md:text-left">
                          <a href="/" className="text-sm text-emerald-100 hover:text-white">Home</a>
                          <a href="/flights" className="text-sm text-emerald-100 hover:text-white">Flights</a>
                          <a href="/bookings" className="text-sm text-emerald-100 hover:text-white">My Bookings</a>
                          <a href="/profile" className="text-sm text-emerald-100 hover:text-white">My Account</a>
                        </div>
                        
                        <div className="text-center md:text-right">
                          <p className="text-xs text-emerald-200">
                            &copy; {new Date().getFullYear()} AeroVoyage
                          </p>
                          <div className="flex space-x-4 mt-2 justify-center md:justify-end">
                            <a href="#" className="text-xs text-emerald-200 hover:text-white">Privacy</a>
                            <a href="#" className="text-xs text-emerald-200 hover:text-white">Terms</a>
                            <a href="#" className="text-xs text-emerald-200 hover:text-white">Support</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </footer>
                } />
              </Routes>
              
              {/* Display cookie status in development mode */}
              {isDevelopment && <CookieStatus />}
            </div>
          </BookingProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
