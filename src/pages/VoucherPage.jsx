import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Voucher from '../components/Voucher';
import { useBooking } from '../contexts/BookingContext';

export default function VoucherPage() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { getBookingById } = useBooking();

  useEffect(() => {
    const loadBooking = () => {
      setLoading(true);
      setError(null);
      
      try {
        // First check if the bookingId is in the URL
        if (bookingId) {
          const foundBooking = getBookingById(bookingId);
          
          if (foundBooking) {
            setBooking(foundBooking);
            return;
          }
        }
        
        // If no bookingId in URL or not found, try to get from session storage
        const lastBooking = sessionStorage.getItem('lastBooking');
        
        if (lastBooking) {
          setBooking(JSON.parse(lastBooking));
          return;
        }
        
        // If no booking found, set error
        setError('Booking not found');
      } catch (err) {
        console.error('Error loading booking:', err);
        setError('Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    
    loadBooking();
  }, [bookingId, getBookingById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket voucher...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The booking you are looking for could not be found.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Voucher booking={booking} />
      </div>
    </div>
  );
} 