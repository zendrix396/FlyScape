import React from 'react';
import BookingHistory from '../components/BookingHistory';
import { useBooking } from '../contexts/BookingContext';

export default function BookingsPage() {
  const { bookings } = useBooking();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BookingHistory bookings={bookings} />
      </div>
    </div>
  );
} 