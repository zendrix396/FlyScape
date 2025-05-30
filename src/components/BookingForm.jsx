import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaCreditCard, FaCalendarAlt, FaLock, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import SplitText from './SplitText';
import SpotlightCard from './SpotlightCard';
import CountUp from './CountUp';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function BookingForm({ flight, onSubmit }) {
  const { userProfile, updateUserWallet } = useAuth();
  const { isDark } = useTheme();
  const [passengersCount, setPassengersCount] = useState(1);
  const [formData, setFormData] = useState({
    passengers: [
      {
        name: '',
        email: '',
        phone: ''
      }
    ],
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'wallet'
  });

  const [formStage, setFormStage] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        passengers: [
          {
            name: userProfile.displayName || '',
            email: userProfile.email || '',
            phone: ''
          },
          ...prev.passengers.slice(1)
        ]
      }));
    }
  }, [userProfile]);

  // Handle passenger count changes
  useEffect(() => {
    // Add or remove passenger entries when count changes
    const currentPassengers = [...formData.passengers];
    
    if (passengersCount > currentPassengers.length) {
      // Add new passengers
      const newPassengers = [...currentPassengers];
      for (let i = currentPassengers.length; i < passengersCount; i++) {
        newPassengers.push({ name: '', email: '', phone: '' });
      }
      setFormData(prev => ({ ...prev, passengers: newPassengers }));
    } else if (passengersCount < currentPassengers.length) {
      // Remove passengers
      setFormData(prev => ({ 
        ...prev, 
        passengers: currentPassengers.slice(0, passengersCount) 
      }));
    }
  }, [passengersCount]);

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...formData.passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      passengers: updatedPassengers
    }));
    
    // Clear error for this field
    if (formErrors[`passenger${index}_${field}`]) {
      setFormErrors(prev => ({
        ...prev,
        [`passenger${index}_${field}`]: null
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateStage1 = () => {
    const errors = {};
    
    // Validate each passenger's information
    formData.passengers.forEach((passenger, index) => {
      if (!passenger.name.trim()) {
        errors[`passenger${index}_name`] = 'Passenger name is required';
      }
      
      if (!passenger.email.trim()) {
        errors[`passenger${index}_email`] = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(passenger.email)) {
        errors[`passenger${index}_email`] = 'Email is invalid';
      }
      
      if (!passenger.phone.trim()) {
        errors[`passenger${index}_phone`] = 'Phone number is required';
      } else if (!/^\d{10}$/.test(passenger.phone)) {
        errors[`passenger${index}_phone`] = 'Phone number must be 10 digits';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStage2 = () => {
    const errors = {};
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) {
        errors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber)) {
        errors.cardNumber = 'Card number must be 16 digits';
      }
      
      if (!formData.expiryDate.trim()) {
        errors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        errors.expiryDate = 'Format must be MM/YY';
      }
      
      if (!formData.cvv.trim()) {
        errors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        errors.cvv = 'CVV must be 3 or 4 digits';
      }
    } else if (formData.paymentMethod === 'wallet') {
      // Calculate total price for all passengers
      const pricePerPassenger = flight && flight.price ? flight.price : 0;
      const totalPrice = pricePerPassenger * passengersCount;
      
      const walletBalance = userProfile ? (userProfile.walletBalance || userProfile.wallet || 0) : 0;
      if (!userProfile || walletBalance < totalPrice) {
        errors.wallet = `Insufficient wallet balance for ${passengersCount} passengers`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const proceedToPayment = (e) => {
    e.preventDefault();
    if (validateStage1()) {
      setFormStage(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStage2()) return;
    
    try {
      setIsProcessing(true);
      
      // Calculate total price for all passengers
      const pricePerPassenger = flight && flight.price ? flight.price : 0;
      const totalPrice = pricePerPassenger * passengersCount;
      
      // If wallet payment, update wallet balance
      if (formData.paymentMethod === 'wallet') {
        await updateUserWallet(totalPrice);
      }
      
      // Submit booking data with all passengers
      onSubmit({
        ...formData,
        passengersCount,
        flight,
        bookingDate: new Date().toISOString(),
        status: 'Confirmed',
        paymentAmount: totalPrice
      });
    } catch (error) {
      setFormErrors({
        submission: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate ticket price
  const ticketPrice = flight && flight.price ? flight.price : 0;
  const totalPrice = ticketPrice * passengersCount;

  return (
    <div className="w-full max-w-md mx-auto">
      <SpotlightCard 
        className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-emerald-100'} rounded-xl shadow-md overflow-hidden border`}
        spotlightColor={isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.1)"}
        spotlightSize={250}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <SplitText
              text={formStage === 1 ? "Passenger Details" : "Payment Information"}
              className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}
              delay={50}
            />
            <div className="mt-4 flex justify-center">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStage >= 1 ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  1
                </div>
                <div className={`h-1 w-16 ${formStage >= 2 ? 'bg-emerald-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStage >= 2 ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  2
                </div>
              </div>
            </div>
          </div>

          {formErrors.submission && (
            <div className={`mb-4 p-3 ${isDark ? 'bg-red-900/30 text-red-300 border-red-900/50' : 'bg-red-50 text-red-700 border-red-200'} rounded-md border`}>
              {formErrors.submission}
            </div>
          )}

          {formStage === 1 ? (
            <form onSubmit={proceedToPayment}>
              <div className="mb-4 flex justify-between items-center">
                <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>
                  Number of Passengers
                </label>
                <div className="flex items-center">
                  <button 
                    type="button"
                    className={`p-2 rounded-md ${
                      passengersCount > 1 
                      ? isDark 
                        ? 'bg-emerald-900/30 text-emerald-400' 
                        : 'bg-emerald-100 text-emerald-700' 
                      : isDark 
                        ? 'bg-gray-700 text-gray-400' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (passengersCount > 1) {
                        setPassengersCount(prev => prev - 1);
                      }
                    }}
                    disabled={passengersCount <= 1}
                  >
                    <FaUserMinus />
                  </button>
                  <span className={`px-4 text-lg font-medium ${isDark ? 'text-white' : ''}`}>{passengersCount}</span>
                  <button 
                    type="button"
                    className={`p-2 rounded-md ${
                      isDark 
                      ? 'bg-emerald-900/30 text-emerald-400' 
                      : 'bg-emerald-100 text-emerald-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setPassengersCount(prev => prev + 1);
                    }}
                  >
                    <FaUserPlus />
                  </button>
                </div>
              </div>

              {formData.passengers.map((passenger, index) => (
                <div key={index} className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-700'} mb-3`}>Passenger {index + 1}</h3>
                  
                  <div className="mb-4">
                    <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`} htmlFor={`passenger-${index}-name`}>
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        className={`appearance-none border rounded-md w-full py-3 pl-10 pr-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-emerald-500 ${
                          isDark 
                          ? 'bg-gray-600 border-gray-600 text-white placeholder-gray-400' 
                          : 'text-gray-700 border-gray-300'
                        } ${
                          formErrors[`passenger${index}_name`] ? 'border-red-500' : ''
                        }`}
                        id={`passenger-${index}-name`}
                        type="text"
                        placeholder="Full Name"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      />
                    </div>
                    {formErrors[`passenger${index}_name`] && (
                      <p className="text-red-500 text-xs mt-1">{formErrors[`passenger${index}_name`]}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`} htmlFor={`passenger-${index}-email`}>
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        className={`appearance-none border rounded-md w-full py-3 pl-10 pr-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-emerald-500 ${
                          isDark 
                          ? 'bg-gray-600 border-gray-600 text-white placeholder-gray-400' 
                          : 'text-gray-700 border-gray-300'
                        } ${
                          formErrors[`passenger${index}_email`] ? 'border-red-500' : ''
                        }`}
                        id={`passenger-${index}-email`}
                        type="email"
                        placeholder="Email Address"
                        value={passenger.email}
                        onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                      />
                    </div>
                    {formErrors[`passenger${index}_email`] && (
                      <p className="text-red-500 text-xs mt-1">{formErrors[`passenger${index}_email`]}</p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`} htmlFor={`passenger-${index}-phone`}>
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="text-gray-400" />
                      </div>
                      <input
                        className={`appearance-none border rounded-md w-full py-3 pl-10 pr-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-emerald-500 ${
                          isDark 
                          ? 'bg-gray-600 border-gray-600 text-white placeholder-gray-400' 
                          : 'text-gray-700 border-gray-300'
                        } ${
                          formErrors[`passenger${index}_phone`] ? 'border-red-500' : ''
                        }`}
                        id={`passenger-${index}-phone`}
                        type="tel"
                        placeholder="10-digit Phone Number"
                        value={passenger.phone}
                        onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                      />
                    </div>
                    {formErrors[`passenger${index}_phone`] && (
                      <p className="text-red-500 text-xs mt-1">{formErrors[`passenger${index}_phone`]}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Price per passenger:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : ''}`}>
                    <CountUp
                      from={ticketPrice} 
                      to={ticketPrice} 
                      duration={0.5} 
                      separator=","
                      prefix="₹"
                    />
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Number of passengers:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : ''}`}>{passengersCount}</span>
                </div>
                <div className={`border-t my-2 pt-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}></div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total:</span>
                  <span className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    <CountUp
                      from={totalPrice} 
                      to={totalPrice} 
                      duration={0.5} 
                      separator=","
                      prefix="₹"
                    />
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`${isDark ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:shadow-outline`}
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          ) : (
            // Payment form (Stage 2)
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`}>
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center space-x-3 p-4 border rounded-md cursor-pointer transition-colors ${
                    formData.paymentMethod === 'card' 
                    ? isDark 
                      ? 'border-emerald-500 bg-emerald-900/20' 
                      : 'border-emerald-500 bg-emerald-50' 
                    : isDark 
                      ? 'border-gray-600' 
                      : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="form-radio text-emerald-600 h-4 w-4"
                    />
                    <span className={isDark ? 'text-white' : ''}>Credit Card</span>
                  </label>
                  
                  <label className={`flex items-center space-x-3 p-4 border rounded-md cursor-pointer transition-colors ${
                    formData.paymentMethod === 'wallet' 
                    ? isDark 
                      ? 'border-emerald-500 bg-emerald-900/20' 
                      : 'border-emerald-500 bg-emerald-50' 
                    : isDark 
                      ? 'border-gray-600' 
                      : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={formData.paymentMethod === 'wallet'}
                      onChange={handleChange}
                      className="form-radio text-emerald-600 h-4 w-4"
                    />
                    <span className={isDark ? 'text-white' : ''}>Wallet</span>
                  </label>
                </div>
              </div>

              {formData.paymentMethod === 'wallet' ? (
                <div className={`mb-6 p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-700'} mb-2`}>Wallet Payment</h3>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Available Balance:</span>
                    <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      <CountUp
                        from={userProfile ? (userProfile.walletBalance || userProfile.wallet || 0) : 0} 
                        to={userProfile ? (userProfile.walletBalance || userProfile.wallet || 0) : 0} 
                        duration={0.5} 
                        separator=","
                        prefix="₹"
                      />
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Amount:</span>
                    <span className={`font-bold ${isDark ? 'text-white' : ''}`}>
                      <CountUp
                        from={totalPrice} 
                        to={totalPrice} 
                        duration={0.5} 
                        separator=","
                        prefix="₹"
                      />
                    </span>
                  </div>
                  
                  {formErrors.wallet && (
                    <p className="text-red-500 text-sm mt-3">{formErrors.wallet}</p>
                  )}
                </div>
              ) : (
                // Credit card form
                <div className="mb-6">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="cardNumber">
                      Card Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCreditCard className="text-gray-400" />
                      </div>
                      <input
                        className={`appearance-none border rounded-md w-full py-3 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-emerald-500 ${
                          formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleChange}
                      />
                    </div>
                    {formErrors.cardNumber && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="expiryDate">
                        Expiry Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaCalendarAlt className="text-gray-400" />
                        </div>
                        <input
                          className={`appearance-none border rounded-md w-full py-3 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-emerald-500 ${
                            formErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                          id="expiryDate"
                          name="expiryDate"
                          type="text"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={handleChange}
                        />
                      </div>
                      {formErrors.expiryDate && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.expiryDate}</p>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="cvv">
                        CVV
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          className={`appearance-none border rounded-md w-full py-3 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-emerald-500 ${
                            formErrors.cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                          id="cvv"
                          name="cvv"
                          type="password"
                          placeholder="•••"
                          value={formData.cvv}
                          onChange={handleChange}
                        />
                      </div>
                      {formErrors.cvv && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Payment Summary</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Passengers:</span>
                  <span className="font-medium">{passengersCount}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Price per Ticket:</span>
                  <span className="font-medium">₹{ticketPrice.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 my-2 pt-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total Amount:</span>
                  <span className="text-lg font-bold text-emerald-600">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setFormStage(1)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-md focus:outline-none focus:shadow-outline"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:shadow-outline"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Complete Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </SpotlightCard>
    </div>
  );
} 