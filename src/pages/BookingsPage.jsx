import React from 'react';
import BookingHistory from '../components/BookingHistory';
import { useBooking } from '../contexts/BookingContext';
import { useTheme } from '../contexts/ThemeContext';

export default function BookingsPage() {
  const { bookings } = useBooking();
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BookingHistory bookings={bookings} />
      </div>
    </div>
  );
} 