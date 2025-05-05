import React from 'react';
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
import DebugPage from './pages/DebugPage';
import { BookingProvider } from './contexts/BookingContext';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-1 pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/flights" element={<FlightsPage />} />
                <Route path="/booking/:flightId" element={<BookingPage />} />
                <Route path="/bookings" element={<BookingHistoryPage />} />
                <Route path="/ticket/:ticketId" element={<TicketPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/debug" element={<DebugPage />} />
              </Routes>
            </main>
            <footer className="bg-gray-800 text-white py-4">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">AeroVoyage</h3>
                    <p className="mb-2">
                      Your journey begins with us. We help you discover the world with seamless flight booking.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Quick Links</h3>
                    <ul>
                      <li><a href="/" className="text-gray-300">Home</a></li>
                      <li><a href="/flights" className="text-gray-300">Search Flights</a></li>
                      <li><a href="/bookings" className="text-gray-300">My Bookings</a></li>
                      <li><a href="/profile" className="text-gray-300">My Account</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Contact Us</h3>
                    <div>
                      <div><span className="text-gray-300">support@aerovoyage.com</span></div>
                      <div><span className="text-gray-300">+91 123 456 7890</span></div>
                      <div>
                        <span className="text-gray-300">
                          123 Travel Street, Mumbai, India 400001
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 mt-4 pt-4 text-center">
                  <p className="text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} AeroVoyage. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
