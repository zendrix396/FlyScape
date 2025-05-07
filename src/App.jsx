import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import CookieStatus from './components/CookieStatus';
import './App.css';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <BookingProvider>
              <AppContent />
            </BookingProvider>
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

// Main content component using theme
function AppContent() {
  // Add a state to check if we're in the browser
  const [isBrowser, setIsBrowser] = useState(false);
  // Add state to check if we're in development mode
  const [isDevelopment, setIsDevelopment] = useState(false);
  // Access theme context
  const { isDark } = useTheme();

  useEffect(() => {
    // Set isBrowser to true once the component mounts
    // This ensures we're in a browser environment
    setIsBrowser(true);
    
    // Check if we're in development mode
    setIsDevelopment(process.env.NODE_ENV === 'development');
  }, []);

  // Don't render anything until we confirm we're in a browser environment
  if (!isBrowser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*" element={<Navbar />} />
      </Routes>
      
      <main className="flex-1 mb-16">
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
      
      {/* Use the separate Footer component */}
      <Footer />
      
      {/* Display cookie status in development mode */}
      {isDevelopment && <CookieStatus />}
    </div>
  );
}

export default App;
