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
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-16 transition-colors duration-300`}>
      <div className="relative w-full text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1529074963764-98f45c47344b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWVyb3BsYW5lfGVufDB8fDB8fHww')` 
          }}
        ></div>
        
        {/* Gradient Overlay to ensure text visibility */}
        <div 
          className={`absolute inset-0 ${
            isDark 
              ? 'bg-gradient-to-r from-emerald-900/90 to-gray-900/90'
              : 'bg-gradient-to-r from-emerald-700/90 to-emerald-900/80'
          } z-1`}
        ></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="text-center mb-6">
            <RotatingText
              texts={['Discover', 'Experience', 'Explore', 'Journey']}
              mainClassName={`px-4 sm:px-6 md:px-8 ${
                isDark 
                  ? 'bg-emerald-900 text-emerald-200'
                  : 'bg-emerald-200 text-emerald-800'
              } overflow-hidden py-2 sm:py-3 md:py-4 justify-center rounded-lg mb-6 inline-block text-xl md:text-2xl font-bold`}
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
            <p className="mt-4 text-xl text-emerald-100">
              Find and book the best flight deals with ease.
            </p>
          </div>
        </div>
        <div className={`absolute -bottom-6 left-0 right-0 h-12 ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl`}></div>
      </div>

      {/* Enhanced Flight Search Section */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 -mt-24 relative z-10 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Background gradient for the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-md opacity-70"></div>
          
          {/* Card with increased padding and shadow */}
          <div className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden`}>
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="p-8 sm:p-10">
              <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.3)" spotlightSize={150}>
                <FlightSearch onSearch={handleSearch} />
              </SpotlightCard>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Revamped Popular Destinations Section */}
      <div className={`${
        isDark 
          ? 'bg-gradient-to-b from-gray-900 to-gray-900'
          : 'bg-gradient-to-b from-emerald-50 to-white'
      } py-16 sm:py-24 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
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
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
                Explore our most popular destinations and find your next adventure
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
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
            ].map((destination, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.1 
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/30 to-transparent opacity-60 group-hover:opacity-70 transition-opacity z-10"></div>
                
                <div 
                  className="h-64 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                  style={{ 
                    backgroundImage: `url(${destination.image})` 
                  }}
                ></div>
                
                <div className="absolute inset-0 flex flex-col justify-end p-5 z-20">
                  <div className={`${isDark ? 'bg-black/20' : 'bg-white/10'} backdrop-blur-sm rounded-lg p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {destination.name}
                        </h3>
                        <p className="text-emerald-200 text-sm font-medium">
                          {destination.code}
                        </p>
                      </div>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 group-hover:bg-emerald-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                      </span>
                    </div>
                    <p className="text-white/80 text-sm mt-2 transform opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      {destination.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              View All Destinations
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
} 