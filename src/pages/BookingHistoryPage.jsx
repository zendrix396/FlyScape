import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import BookingHistory from '../components/BookingHistory';
import GradientText from '../components/GradientText';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    async function fetchBookings() {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(bookingsQuery);
        const bookingsList = [];
        
        querySnapshot.forEach((doc) => {
          bookingsList.push({
            bookingId: doc.id,
            ...doc.data()
          });
        });
        
        // Sort by booking date (most recent first)
        bookingsList.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
        
        setBookings(bookingsList);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load your bookings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBookings();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Please log in</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>You need to be logged in to view your bookings</p>
          <Link
            to="/login"
            className={`mt-4 inline-block px-4 py-2 ${isDark ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-md`}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-16 pb-12`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <GradientText
            colors={["#10b981", "#6ee7b7", "#10b981"]}
            animationSpeed={5}
            className="text-3xl font-bold"
          >
            Your Bookings
          </GradientText>
          <h2 className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>View and manage your flight bookings</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse flex space-x-4">
              <div className={`rounded-full ${isDark ? 'bg-emerald-800' : 'bg-emerald-200'} h-12 w-12`}></div>
              <div className="flex-1 space-y-4 py-1">
                <div className={`h-4 ${isDark ? 'bg-emerald-800' : 'bg-emerald-200'} rounded w-3/4`}></div>
                <div className="space-y-2">
                  <div className={`h-4 ${isDark ? 'bg-emerald-800' : 'bg-emerald-200'} rounded`}></div>
                  <div className={`h-4 ${isDark ? 'bg-emerald-800' : 'bg-emerald-200'} rounded w-5/6`}></div>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className={`${isDark ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-500 text-red-700'} border-l-4 p-4 mb-4`}>
            <p>{error}</p>
          </div>
        ) : (
          <BookingHistory bookings={bookings} />
        )}
      </div>
    </div>
  );
} 