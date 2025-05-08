import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import SpotlightCard from '../components/SpotlightCard';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Creating account for:', email);
      await signup(email, password, name);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Initiating Google sign-up');
      
      // With redirect, the user will leave this page and come back after auth
      await loginWithGoogle();
      
      // No need to navigate, as the redirect will bring the user back
      // and the auth state listener will handle the rest
    } catch (error) {
      console.error('Google sign-up error:', error);
      setError(error.message || 'Failed to sign up with Google');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isDark 
        ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-b from-emerald-50/50 to-white'
    }`}>
      <div className="max-w-md w-full space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className={`bg-clip-text text-transparent ${
              isDark 
                ? 'bg-gradient-to-r from-emerald-400 to-teal-300' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-500'
            }`}>
              Create your account
            </span>
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-teal-400 mx-auto rounded-full mb-3"></div>
          <h2 className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Join FlyScape for exclusive flight deals
          </h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          {/* Background gradient glow */}
          <div className={`absolute -inset-0.5 ${
            isDark 
              ? 'bg-gradient-to-r from-emerald-500/40 to-teal-400/40' 
              : 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30'
          } rounded-xl blur-md`}></div>
          
          <SpotlightCard 
            className={`relative ${
              isDark 
                ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700' 
                : 'bg-white/90 backdrop-blur-sm border-emerald-100'
            } rounded-xl shadow-xl overflow-hidden p-8 border`}
            spotlightColor={isDark ? "rgba(20, 184, 166, 0.4)" : "rgba(16, 185, 129, 0.3)"}
            spotlightSize={250}
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${
                    isDark ? 'bg-red-900/50 border-red-600' : 'bg-red-50 border-red-500'
                  } border-l-4 p-4 rounded-md`}
                >
                  <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'} flex items-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                  </p>
                </motion.div>
              )}
              
              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}>
                  Full Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-emerald-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Your full name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}>
                  Email address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-emerald-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Your email address"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}>
                  Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-emerald-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Create a password"
                  />
                </div>
                <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}>
                  Confirm Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-emerald-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded"
                />
                <label htmlFor="terms" className={`ml-2 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  I agree to the{' '}
                  <a href="#" className={`${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-500'} transition-colors`}>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className={`${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-500'} transition-colors`}>
                    Privacy Policy
                  </a>
                </label>
              </div>
              
              <div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-white font-medium ${
                    isDark
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <span>Create account</span>
                  )}
                </motion.button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${
                    isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
                  }`}>Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6">
                <motion.button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex justify-center items-center px-4 py-3 border rounded-lg shadow-sm text-sm font-medium transition-all duration-300 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
                  Sign up with Google
                </motion.button>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-6"
        >
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link to="/login" className={`font-medium underline decoration-emerald-300 underline-offset-2 transition-colors ${
              isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-500'
            }`}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
} 