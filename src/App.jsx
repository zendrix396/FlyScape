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
import './App.css';

function App() {
  // Add a state to check if we're in the browser
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    // Set isBrowser to true once the component mounts
    // This ensures we're in a browser environment
    setIsBrowser(true);
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
                  <footer className="bg-gradient-to-tr from-emerald-900 to-emerald-800 text-white py-12">
                    <div className="container mx-auto px-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-emerald-600">
                                <path d="M10.5 18.375a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
                                <path fillRule="evenodd" d="M8.625 5.25v.75H5.25a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25h-3.375v-.75a2.25 2.25 0 00-2.25-2.25h-4.5a2.25 2.25 0 00-2.25 2.25zm3.375-1.5a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v.75h-6v-.75zM5.25 9.75a.75.75 0 01.75-.75h12a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zm1.5 3.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5H7.5a.75.75 0 01-.75-.75zm3 3a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">AeroVoyage</h3>
                          </div>
                          <p className="text-emerald-100 mb-6">
                            Your journey begins with us. We help you discover the world with seamless flight booking experiences and unbeatable prices.
                          </p>
                          <div className="flex space-x-4">
                            <a href="#" className="h-10 w-10 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center transition-colors duration-300">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-white" viewBox="0 0 16 16">
                                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                              </svg>
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center transition-colors duration-300">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-white" viewBox="0 0 16 16">
                                <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                              </svg>
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center transition-colors duration-300">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-white" viewBox="0 0 16 16">
                                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                              </svg>
                            </a>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-4 border-b border-emerald-700 pb-2">Quick Links</h3>
                          <ul className="space-y-3">
                            <li>
                              <a href="/" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Home
                              </a>
                            </li>
                            <li>
                              <a href="/flights" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Search Flights
                              </a>
                            </li>
                            <li>
                              <a href="/bookings" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                My Bookings
                              </a>
                            </li>
                            <li>
                              <a href="/profile" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                My Account
                              </a>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-4 border-b border-emerald-700 pb-2">Contact Us</h3>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-emerald-300 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="text-emerald-100">support@aerovoyage.com</span>
                            </div>
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-emerald-300 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="text-emerald-100">+91 123 456 7890</span>
                            </div>
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-emerald-300 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-emerald-100">
                                123 Travel Street, Skyline Tower<br />
                                Mumbai, India 400001
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-emerald-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-emerald-200 text-sm mb-4 md:mb-0">
                          &copy; {new Date().getFullYear()} AeroVoyage. All rights reserved.
                        </p>
                        <div className="flex space-x-6 text-sm">
                          <a href="#" className="text-emerald-200 hover:text-white transition-colors">Privacy Policy</a>
                          <a href="#" className="text-emerald-200 hover:text-white transition-colors">Terms of Service</a>
                          <a href="#" className="text-emerald-200 hover:text-white transition-colors">Support</a>
                        </div>
                      </div>
                    </div>
                  </footer>
                } />
              </Routes>
            </div>
          </BookingProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
