import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import SpotlightCard from '../components/SpotlightCard';
import GradientText from '../components/GradientText';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  
  const handleChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      setIsLoading(true);
      await resetPassword(email);
      setMessage('Check your email for password reset instructions');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <GradientText
            colors={["#10b981", "#6ee7b7", "#10b981"]}
            animationSpeed={5}
            className="text-3xl font-bold"
          >
            Reset your password
          </GradientText>
          <h2 className="mt-2 text-gray-600">
            Enter your email to receive a password reset link
          </h2>
        </div>
        
        <SpotlightCard 
          className="bg-white rounded-xl shadow-md overflow-hidden p-8 border border-emerald-50"
          spotlightColor="rgba(16, 185, 129, 0.1)"
          spotlightSize={250}
        >
          {message ? (
            <div className="text-center">
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6">
                <p className="text-sm text-emerald-700">{message}</p>
              </div>
              <p className="text-gray-600 mb-6">
                Didn't receive an email? Check your spam folder or try again.
              </p>
              <motion.button
                onClick={() => setMessage('')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Try again
              </motion.button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Your email address"
                  />
                </div>
              </div>
              
              <div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Sending...' : 'Reset Password'}
                </motion.button>
              </div>
            </form>
          )}
        </SpotlightCard>
        
        <div className="text-center mt-4">
          <Link to="/login" className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-500">
            <FaArrowLeft className="mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
} 