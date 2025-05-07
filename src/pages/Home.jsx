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
import { useTheme } from '../contexts/ThemeContext';
import DestinationCarousel from '../components/DestinationCarousel';

// Add custom shimmer animation
const shimmerAnimation = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
.animate-shimmer {
  animation: shimmer 3s infinite;
}
`;

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { recordFlightSearch } = useBooking();
  const { isDark } = useTheme();

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
    <div className={`min-h-screen transition-colors duration-300 overflow-hidden`}>
      {/* Inject the shimmer animation styles */}
      <style dangerouslySetInnerHTML={{ __html: shimmerAnimation }} />
      
      {/* Full page background image with overlay */}
      <div className="fixed inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1529074963764-98f45c47344b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWVyb3BsYW5lfGVufDB8fDB8fHww')` 
        }}
      ></div>
      
      {/* Gradient Overlay covering the entire page */}
      <div 
        className={`fixed inset-0 ${
          isDark 
            ? 'bg-gradient-to-r from-emerald-900/90 to-gray-900/90'
            : 'bg-gradient-to-r from-emerald-700/90 to-emerald-900/80'
        } z-0`}
      ></div>
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 text-white">
          <div className="text-center">
            <RotatingText
              texts={['Discover', 'Experience', 'Explore', 'Journey']}
              mainClassName={`px-4 sm:px-6 md:px-8 ${
                isDark 
                  ? 'bg-emerald-600 text-emerald-100'
                  : 'bg-emerald-100 text-emerald-800'
              } overflow-hidden py-2 sm:py-3 md:py-4 justify-center rounded-lg mb-2 inline-block text-xl md:text-2xl font-bold`}
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
              text="Your Perfect"
              className="text-3xl md:text-5xl font-bold text-center"
              delay={50}
            />
            <SplitText
              text="Travel Experience"
              className="text-3xl md:text-5xl font-bold text-center mt-1"
              delay={100}
            />
            <p className="mt-4 text-xl md:text-2xl lg:text-2xl text-emerald-100 ">
              Find and book the best flight deals with ease.
            </p>
          </div>
        </div>
        
        {/* Flight Search Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SpotlightCard 
              className={`p-6 sm:p-8 md:p-10 shadow-xl border-t-2 border-emerald-400 backdrop-blur-md ${isDark ? 'bg-gray-900/80' : 'bg-white/80'}`}
              spotlightColor={isDark ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.3)"}
              spotlightSize={400}
            >
              <FlightSearch onSearch={handleSearch} />
            </SpotlightCard>
          </motion.div>
        </div>

        {/* Destinations Section with relative positioning */}
        <div className={`relative py-12 sm:py-16 md:py-24 transition-colors duration-300 z-10 ${
          isDark 
            ? 'bg-gray-900/80'
            : 'bg-white/80'
        } backdrop-blur-md`}>
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-emerald-800'} mb-2`}>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
                    Popular Destinations
                  </span>
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-teal-400 mx-auto rounded-full mb-4"></div>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-2xl mx-auto`}>
                  Explore our most popular destinations and find your next adventure
                </p>
              </motion.div>
            </div>
            
            {/* Container to center and constrain width of carousel */}
            <div className="w-full md:w-4/5 lg:w-3/5 xl:w-1/2 mx-auto">
              <DestinationCarousel destinations={[
                { 
                  name: 'Delhi', 
                  code: 'DEL', 
                  image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  description: 'Explore India\'s vibrant capital'
                },
                { 
                  name: 'Mumbai', 
                  code: 'BOM', 
                  image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  description: 'Gateway to India\'s financial hub'
                },
                { 
                  name: 'Bangalore', 
                  code: 'BLR', 
                  image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  description: 'India\'s Silicon Valley'
                },
                { 
                  name: 'Goa', 
                  code: 'GOI', 
                  image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  description: 'Beach paradise on the Arabian Sea'
                },
                { 
                  name: 'Dubai', 
                  code: 'DXB', 
                  image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  description: 'City of luxury and innovation'
                },
                { 
                  name: 'Singapore', 
                  code: 'SIN', 
                  image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  description: 'A garden city with iconic skyline'
                },
                { 
                  name: 'London', 
                  code: 'LHR', 
                  image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  description: 'Historic city with modern charm'
                },
                { 
                  name: 'New York', 
                  code: 'JFK', 
                  image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  description: 'The Big Apple that never sleeps'
                }
              ]} isDark={isDark} />
            </div>
            
            <div className="mt-8 sm:mt-10 md:mt-12 text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 md:px-8 md:py-4 md:text-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                View All Destinations
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 