import React from 'react';
import { motion } from 'framer-motion';
import { FaPlane, FaClock, FaRupeeSign } from 'react-icons/fa';
import CountUp from './CountUp';

export default function FlightCard({
  flight,
  onClick,
  selected = false,
  showDetails = false,
  priceIncreased = false
}) {
  const {
    airline,
    flightNumber,
    departureTime,
    arrivalTime,
    from,
    to,
    price,
    duration,
  } = flight;

  // Format the time
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format the duration
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-colors ${
        selected ? 'border-2 border-emerald-500' : 'border border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="flex-shrink-0 mr-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <FaPlane className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">{airline}</div>
              <div className="text-sm text-gray-500">{flightNumber}</div>
            </div>
          </div>

          <div className="flex-grow md:mx-10 mb-3 md:mb-0">
            <div className="flex items-center justify-between relative">
              <div className="text-center">
                <div className="text-lg font-semibold">{formatTime(departureTime)}</div>
                <div className="text-sm text-gray-500">{from}</div>
              </div>

              <div className="flex-grow mx-2 sm:mx-4 px-4">
                <div className="relative h-[2px] bg-gray-300 mt-6">
                  <div className="absolute left-0 -top-[9px] h-5 w-5 rounded-full bg-emerald-500"></div>
                  <div className="absolute right-0 -top-[9px] h-5 w-5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-xs text-center text-gray-500 mt-2 flex items-center justify-center">
                  <FaClock className="mr-1" /> {formatDuration(duration)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold">{formatTime(arrivalTime)}</div>
                <div className="text-sm text-gray-500">{to}</div>
              </div>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-6 w-full md:w-auto">
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between">
              <div className="text-sm text-gray-500">Price</div>
              <div className="flex items-center">
                <FaRupeeSign className="text-emerald-600" />
                <div className="text-xl font-bold ml-1 text-gray-800">
                  <CountUp 
                    from={price - 100} 
                    to={price} 
                    duration={0.5} 
                    separator="," 
                  />
                </div>
              </div>
              {priceIncreased && (
                <div className="text-xs text-red-500 mt-1">Price increased</div>
              )}
            </div>
            <button
              className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md text-sm transition-colors"
              onClick={onClick}
            >
              Select
            </button>
          </div>
        </div>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Baggage</div>
                <div className="text-sm font-medium">Check-in: 15kg</div>
                <div className="text-sm font-medium">Cabin: 7kg</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Amenities</div>
                <div className="text-sm font-medium">Wi-Fi available</div>
                <div className="text-sm font-medium">In-flight meals</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 