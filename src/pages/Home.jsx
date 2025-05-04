import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FlightSearch from '../components/FlightSearch';
import GradientText from '../components/GradientText';
import SplitText from '../components/SplitText';
import { searchFlights } from '../services/flightService';
import { useBooking } from '../contexts/BookingContext';
import TiltedCard from '../components/TiltedCard';
import SpotlightCard from '../components/SpotlightCard';
import RotatingText from '../components/RotatingText';
import ScrollReveal from '../components/ScrollReveal';

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { recordFlightSearch } = useBooking();

  const handleSearch = async (searchParams) => {
    setIsSearching(true);
    
    try {
      // Get flights based on search criteria
      const flights = await searchFlights(
        searchParams.from,
        searchParams.to,
        searchParams.date
      );
      
      // Store the flights and search params in session storage for the flights page
      sessionStorage.setItem('searchResults', JSON.stringify(flights));
      sessionStorage.setItem('searchParams', JSON.stringify(searchParams));
      
      // Record search for each flight for price tracking
      flights.forEach(flight => {
        recordFlightSearch(flight.id);
      });
      
      // Navigate to the flights page
      navigate('/flights');
    } catch (error) {
      console.error('Error searching flights:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="relative w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <RotatingText
              texts={['Discover', 'Experience', 'Explore', 'Journey']}
              mainClassName="px-4 sm:px-6 md:px-8 bg-emerald-200 text-emerald-800 overflow-hidden py-2 sm:py-3 md:py-4 justify-center rounded-lg mb-6 inline-block text-xl md:text-2xl font-bold"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.015}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={3000}
            />
            
            <SplitText
              text="Your Perfect Travel Experience"
              className="text-4xl md:text-5xl font-bold text-center"
              delay={50}
            />
            <p className="mt-4 text-xl text-emerald-100">
              Find and book the best flight deals with ease.
            </p>
          </motion.div>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white rounded-t-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 mb-16">
        <SpotlightCard className="p-0 border-emerald-200 bg-white" spotlightColor="rgba(16, 185, 129, 0.2)">
          <FlightSearch onSearch={handleSearch} />
        </SpotlightCard>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SpotlightCard className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100" spotlightColor="rgba(16, 185, 129, 0.15)">
          <div className="py-8">
            <ScrollReveal
              baseOpacity={0.3}
              enableBlur={true}
              baseRotation={2}
              blurStrength={3}
              containerClassName="mb-12 text-center"
              textClassName="text-emerald-800"
            >
              Why Choose AeroVoyage
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              {[
                {
                  title: 'Best Prices',
                  description: 'Find the most competitive flight prices with no hidden fees.',
                  icon: '💰'
                },
                {
                  title: 'Easy Booking',
                  description: 'Simple and user-friendly booking process from search to payment.',
                  icon: '🚀'
                },
                {
                  title: 'Customer Support',
                  description: '24/7 support for any questions or issues with your booking.',
                  icon: '🎯'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center border border-emerald-100"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </SpotlightCard>
      </div>

      <div className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SpotlightCard className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 mb-10" spotlightColor="rgba(16, 185, 129, 0.15)">
            <div className="py-6">
              <ScrollReveal
                baseOpacity={0.3}
                enableBlur={true}
                baseRotation={2}
                blurStrength={3}
                containerClassName="mb-8 text-center"
                textClassName="text-emerald-800"
              >
                Popular Destinations
              </ScrollReveal>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {[
                  { name: 'Delhi', code: 'DEL', image: 'https://picsum.photos/seed/delhi/800/600' },
                  { name: 'Mumbai', code: 'BOM', image: 'https://picsum.photos/seed/mumbai/800/600' },
                  { name: 'Bangalore', code: 'BLR', image: 'https://picsum.photos/seed/bangalore/800/600' },
                  { name: 'Goa', code: 'GOI', image: 'https://picsum.photos/seed/goa/800/600' },
                ].map((destination, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer border border-emerald-100"
                  >
                    <div 
                      className="h-48 bg-cover bg-center" 
                      style={{ 
                        backgroundImage: `url(${destination.image})` 
                      }}
                    ></div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-emerald-800">{destination.name}</h3>
                      <p className="text-emerald-600 text-sm">{destination.code}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
} 