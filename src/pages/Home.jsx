import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FlightSearchModern from '../components/FlightSearchModern';
import GradientText from '../components/GradientText';
import { searchFlights } from '../services/flightService';
import { useBooking } from '../contexts/BookingContext';
import SpotlightCard from '../components/SpotlightCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import RotatingText from '../components/RotatingText';
import { ArrowLeft, ArrowRight, Luggage, Shield, Clock, MapPin, ArrowLeftRight } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  const destinations = [
    { 
      name: 'Delhi', 
      code: 'DEL', 
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Explore India\'s vibrant capital',
      popular: true
    },
    { 
      name: 'Mumbai', 
      code: 'BOM', 
      image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'Gateway to India\'s financial hub',
      popular: true
    },
    { 
      name: 'Bangalore', 
      code: 'BLR', 
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: 'India\'s Silicon Valley',
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Violet Gradient Background */}
      <div className="relative w-full bg-gradient-to-r from-violet-700 to-violet-500 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center mb-6">
            <RotatingText
              texts={['Discover', 'Experience', 'Explore', 'Journey']}
              mainClassName="px-4 sm:px-6 md:px-8 bg-white/10 text-white overflow-hidden py-2 sm:py-3 md:py-4 justify-center rounded-lg mb-6 inline-block text-xl md:text-2xl font-bold border border-white/20"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.015}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={3000}
            />
            
            <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
              <GradientText
                colors={["#f5f5f5", "#ffffff", "#f0f0f0"]}
                animationSpeed={5}
                className="tracking-tight"
              >
                Travel Beyond Boundaries
              </GradientText>
            </h1>
            
            <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
              Discover extraordinary destinations with our exclusive flight deals and seamless booking experience.
            </p>
          </div>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 bg-background rounded-t-3xl"></div>
      </div>

      {/* Search Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 mb-16">
        <SpotlightCard className="p-0 border-violet-200/20 bg-card" spotlightColor="rgba(124, 58, 237, 0.2)">
          <FlightSearchModern 
            onSearch={handleSearch} 
            customStyles={{
              swapButtonIcon: <ArrowLeftRight className="h-4 w-4" />,
              passengerDropdownClassName: "bg-violet-900 border-violet-700 text-white scrollbar-thin scrollbar-thumb-violet-700 scrollbar-track-violet-950",
              passengerItemClassName: "hover:bg-violet-800 text-white",
              passengerActiveClassName: "bg-violet-800"
            }}
          />
        </SpotlightCard>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SpotlightCard className="bg-gradient-to-br from-violet-100 to-card border-violet-200/20" spotlightColor="rgba(124, 58, 237, 0.15)">
          <div className="py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-violet-700 mb-4">Why Choose AeroVoyage</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Experience the difference with our premium flight booking service.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
              {[
                {
                  title: 'Best Prices',
                  description: 'Find the most competitive flight prices with no hidden fees.',
                  icon: <Luggage className="w-10 h-10 text-violet-600" />
                },
                {
                  title: 'Easy Booking',
                  description: 'Simple and user-friendly booking process from search to payment.',
                  icon: <Clock className="w-10 h-10 text-violet-600" />
                },
                {
                  title: 'Customer Support',
                  description: '24/7 support for any questions or issues with your booking.',
                  icon: <Shield className="w-10 h-10 text-violet-600" />
                },
                {
                  title: 'Wide Selection',
                  description: 'Access to thousands of routes across hundreds of airlines worldwide.',
                  icon: <MapPin className="w-10 h-10 text-violet-600" />
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-border group"
                >
                  <div className="mb-4 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-violet-700 mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Popular Destinations with Carousel */}
      <div className="bg-violet-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-violet-700 mb-2">Popular Destinations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Explore our most sought-after destinations and plan your next getaway.</p>
          </div>
          
          <Carousel 
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {destinations.map((destination, index) => (
                <CarouselItem key={index} className="md:basis-1/3 pl-4">
                  <Card className="overflow-hidden border-violet-200/30 hover:shadow-lg transition-all cursor-pointer">
                    <div className="relative">
                      <img 
                        src={destination.image} 
                        alt={destination.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 text-white">
                        <Badge className="bg-violet-600 hover:bg-violet-700 mb-2">{destination.code}</Badge>
                        <h3 className="text-2xl font-bold mb-1">{destination.name}</h3>
                        <p className="text-white/90 text-sm">{destination.description}</p>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>Flights from ₹3,999</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 p-0">
                          Explore <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8 gap-4">
              <CarouselPrevious className="relative static border-violet-200 hover:bg-violet-50 hover:border-violet-300" />
              <CarouselNext className="relative static border-violet-200 hover:bg-violet-50 hover:border-violet-300" />
            </div>
          </Carousel>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-violet-700 mb-2">What Our Customers Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Thousands of satisfied travelers have experienced the AeroVoyage difference.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The booking process was incredibly smooth, and I found a flight at half the price I'd seen elsewhere!",
                author: "Priya Sharma",
                location: "Mumbai"
              },
              {
                quote: "I've been using AeroVoyage for all my business trips. Their customer service is unmatched in the industry.",
                author: "Rajiv Mehta",
                location: "Delhi"
              },
              {
                quote: "The app made it so easy to change my flight when my plans suddenly changed. Saved me so much stress!",
                author: "Anjali Patel",
                location: "Bangalore"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-violet-200/30 p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 flex-grow italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-auto">
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* App Download Section */}
      <div className="bg-gradient-to-r from-violet-800 to-violet-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Download Our Mobile App</h2>
              <p className="mb-6 text-white/90">Get exclusive mobile-only deals and manage your bookings on the go with our top-rated app.</p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-black hover:bg-gray-900 text-white">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5539 12.0051C17.5466 10.1294 18.3796 8.56952 20.0548 7.40846C19.0729 5.97414 17.5368 5.19391 15.5087 5.05829C13.5785 4.92613 11.5154 6.19062 10.8518 6.19062C10.1534 6.19062 8.30587 5.10543 6.76603 5.10543C3.96702 5.14889 1 7.39319 1 11.9945C1 13.4015 1.24196 14.8513 1.72588 16.3367C2.36256 18.286 4.81179 22.9512 7.38865 22.8728C8.7731 22.8352 9.7624 21.8163 11.5452 21.8163C13.2799 21.8163 14.2021 22.8728 15.7271 22.8728C18.3284 22.8352 20.5536 18.6217 21.1539 16.6684C17.9082 15.134 17.5539 12.0975 17.5539 12.0051V12.0051ZM14.557 3.84015C15.9045 2.2433 15.7344 0.776719 15.704 0.333374C14.4885 0.396541 13.0755 1.08969 12.2574 1.98822C11.3639 2.9399 10.8429 4.13901 10.9618 5.04828C12.28 5.14889 13.5637 5.04828 14.557 3.84015V3.84015Z"/>
                  </svg>
                  App Store
                </Button>
                <Button className="bg-black hover:bg-gray-900 text-white">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.6 1H7.4C6.08 1 5 2.08 5 3.4V20.6C5 21.92 6.08 23 7.4 23H16.6C17.92 23 19 21.92 19 20.6V3.4C19 2.08 17.92 1 16.6 1ZM12 22C11.17 22 10.5 21.33 10.5 20.5C10.5 19.67 11.17 19 12 19C12.83 19 13.5 19.67 13.5 20.5C13.5 21.33 12.83 22 12 22ZM17 18H7V4H17V18Z"/>
                  </svg>
                  Google Play
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                alt="Mobile App"
                className="max-w-xs rounded-3xl shadow-2xl border-4 border-white/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}