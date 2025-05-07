import React from 'react';
import { Link } from 'react-router-dom';
import { FaTicketAlt } from 'react-icons/fa';
import GradientText from './GradientText';
import BookingHistoryItem from './BookingHistoryItem';
import { useTheme } from '../contexts/ThemeContext';

export default function BookingHistory({ bookings = [] }) {
  const { isDark } = useTheme();
  
  if (bookings.length === 0) {
    return (
      <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-md p-8 text-center`}>
        <div className={`h-20 w-20 mx-auto mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
          <FaTicketAlt className={`h-10 w-10 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
        </div>
        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>No Bookings Found</h3>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-500'} mb-6`}>You haven't made any flight bookings yet.</p>
        <Link
          to="/"
          className={`inline-block ${isDark ? 'bg-emerald-800' : 'bg-emerald-600'} text-white px-6 py-3 rounded-md font-medium hover:bg-emerald-700 transition-colors`}
        >
          Book a Flight
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 text-center">
        <GradientText
          colors={["#10b981", "#6ee7b7", "#10b981"]}
          animationSpeed={5}
          className="text-3xl font-bold"
        >
          Your Travel History
        </GradientText>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-500'} mt-2`}>
          View and manage your past and upcoming bookings
        </p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <BookingHistoryItem key={booking.bookingId} booking={booking} />
        ))}
      </div>
    </div>
  );
} 