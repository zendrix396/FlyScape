import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FlightSearch from '../components/FlightSearch';
import SpotlightCard from '../components/SpotlightCard';
import RotatingText from '../components/RotatingText';
import SplitText from '../components/SplitText';
import { searchFlights } from '../services/flightService';
import { useBooking } from '../contexts/BookingContext';

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { recordFlightSearch } = useBooking();

  const handleSearch = async (searchParams) => {
    setIsSearching(true);
    try {
      const flights = await searchFlights(
        searchParams.from,
        searchParams.to,
        searchParams.date
      );
      
      sessionStorage.setItem('searchResults', JSON.stringify(flights));
      sessionStorage.setItem('searchParams', JSON.stringify(searchParams));
      flights.forEach(flight => recordFlightSearch(flight.id));
      navigate('/flights');
    } catch (error) {
      console.error('Error searching flights:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="w-full bg-gray-100 text-white">
        <div className="max-w-7xl mx-auto p-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-6"
          >
            <RotatingText
              texts={['Discover', 'Experience', 'Explore', 'Journey']}
              mainClassName="bg-gray-200 text-gray-900 p-2 rounded mb-6 inline-block text-xl font-bold"
              rotationInterval={3000}
            />
            
            <SplitText
              text="Your Perfect Travel Experience"
            className="text-4xl font-bold text-center text-black"
            />
            <p className="mt-4 text-gray-700">
              Find and book the best flight deals with ease.
            </p>
          </motion.div>
        </div>
        <div className="h-12 bg-white rounded-t-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto p-4 -mt-20 z-10 mb-16">
        <SpotlightCard className="border-gray-200 bg-white">
          <FlightSearch onSearch={handleSearch} />
        </SpotlightCard>
      </div>
    </div>
  );
} 