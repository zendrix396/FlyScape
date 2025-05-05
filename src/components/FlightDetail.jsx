import React from 'react';
import { motion } from 'framer-motion';
import { FaPlane, FaClock, FaCalendarAlt, FaSuitcase, FaUtensils, FaWifi } from 'react-icons/fa';
import SpotlightCard from './SpotlightCard';
import GradientText from './GradientText';

export default function FlightDetail({ flight }) {
  const {
    airline,
    flightNumber,
    from,
    to,
    departureTime,
    arrivalTime,
    duration,
    stops,
    price,
    amenities = ['wifi', 'meals', 'entertainment'],
    baggageAllowance = '20kg'
  } = flight;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'wifi':
        return <FaWifi className="text-gray-700" />;
      case 'meals':
        return <FaUtensils className="text-gray-700" />;
      case 'entertainment':
        return <span className="text-xl text-gray-700">📺</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <GradientText
          colors={["#10b981", "#6ee7b7", "#10b981"]}
          animationSpeed={5}
          className="text-3xl font-bold"
        >
          Flight Details
        </GradientText>
        <h2 className="text-xl text-gray-600 mt-2">{from} to {to}</h2>
      </div>
      
      <SpotlightCard
        className="bg-white rounded-xl overflow-hidden border border-gray-50 mb-8"
        spotlightColor="rgba(16, 185, 129, 0.15)"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="text-lg font-semibold">{airline}</div>
              <div className="text-gray-500">{flightNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-700">₹{price.toLocaleString()}</div>
              <div className="text-sm text-gray-500">per person</div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-6">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">
                <FaCalendarAlt className="inline mr-1" /> Departure
              </div>
              <div className="text-xl font-semibold">{formatTime(departureTime)}</div>
              <div className="text-gray-600">{formatDate(departureTime)}</div>
              <div className="mt-1 text-lg font-medium">{from}</div>
            </div>
            
            <div className="flex items-center my-6 md:my-0">
              <div className="h-0.5 w-12 bg-gray-300 hidden md:block"></div>
              <div className="mx-4 flex flex-col items-center">
                <FaPlane className="h-6 w-6 text-gray-700 transform rotate-90" />
                <div className="text-sm text-gray-500 mt-1">{duration}</div>
                <div className="text-xs text-gray-400">
                  {stops === 0 ? 'Non-stop' : `${stops} ${stops === 1 ? 'stop' : 'stops'}`}
                </div>
              </div>
              <div className="h-0.5 w-12 bg-gray-300 hidden md:block"></div>
            </div>
            
            <div className="flex-1 text-right">
              <div className="text-sm text-gray-500 mb-1">
                <FaCalendarAlt className="inline mr-1" /> Arrival
              </div>
              <div className="text-xl font-semibold">{formatTime(arrivalTime)}</div>
              <div className="text-gray-600">{formatDate(arrivalTime)}</div>
              <div className="mt-1 text-lg font-medium">{to}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-2">Baggage Allowance</div>
              <div className="flex items-center">
                <FaSuitcase className="text-gray-700 mr-2" />
                <span className="font-medium">{baggageAllowance}</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 mb-2">Amenities</div>
              <div className="flex space-x-4">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    {getAmenityIcon(amenity)}
                    <span className="ml-1 first-letter:uppercase text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 mb-2">Flight Duration</div>
              <div className="flex items-center">
                <FaClock className="text-gray-700 mr-2" />
                <span className="font-medium">{duration}</span>
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SpotlightCard 
          className="bg-white rounded-xl overflow-hidden border border-gray-50"
          spotlightColor="rgba(16, 185, 129, 0.1)"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Fare Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare</span>
                <span className="font-medium">₹{(price * 0.8).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="font-medium">₹{(price * 0.2).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-gray-700">₹{price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </SpotlightCard>
        
        <SpotlightCard 
          className="bg-white rounded-xl overflow-hidden border border-gray-50"
          spotlightColor="rgba(16, 185, 129, 0.1)"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cancellation Policy</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Before 48 hours</span>
                <span className="font-medium text-gray-700">₹{(price * 0.1).toFixed(2)} fee</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Within 24-48 hours</span>
                <span className="font-medium text-amber-600">₹{(price * 0.3).toFixed(2)} fee</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Within 24 hours</span>
                <span className="font-medium text-gray-700">Non-refundable</span>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </div>
      
      <div className="mt-8 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 "
        >
          Book This Flight
        </motion.button>
      </div>
    </div>
  );
} 