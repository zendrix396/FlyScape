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
          <div className="text-center mb-6">
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
        <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white rounded-t-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 -mt-20 relative z-10 mb-16">
        <SpotlightCard className="p-0 border-emerald-200 bg-white px-3 sm:px-5 py-6 sm:py-8" spotlightColor="rgba(16, 185, 129, 0.3)" spotlightSize={150}>
          <FlightSearch onSearch={handleSearch} />
        </SpotlightCard>
      </div>

      <div className="bg-emerald-50 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <SpotlightCard className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 mb-10" spotlightColor="rgba(16, 185, 129, 0.3)" spotlightSize={150}>
            <div className="py-4 sm:py-6">
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
              
              <div className="px-2 sm:px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
                    <div
                      key={index}
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
                        <p className="text-gray-600 text-sm mt-2">{destination.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
} 