"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Clock, CalendarIcon, BadgeIndianRupee, ArrowRight } from "lucide-react";
import { formatAirportForDisplay } from '../utils/airportUtil';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CountUpAnimation } from '@/components/ui/CountUpAnimation';
import { Separator } from "@/components/ui/separator";
import { TiltedCardModern } from '@/components/ui/TiltedCardModern';

interface Flight {
  id?: string;
  airline: string;
  flightNumber: string;
  departureTime: any; // Could be string, Date or Firestore timestamp
  arrivalTime: any; // Could be string, Date or Firestore timestamp
  fromCity: string;
  toCity: string;
  price: number;
  originalPrice?: number;
  duration: string | number;
  displayDepartureDate?: string;
  displayArrivalDate?: string;
  displayDepartureTime?: string;
  displayArrivalTime?: string;
  priceIncreased?: boolean;
  [key: string]: any;
}

interface FlightCardModernProps {
  flight: Flight;
  onClick?: () => void;
  selected?: boolean;
  showDetails?: boolean;
}

export default function FlightCardModern({
  flight,
  onClick,
  selected = false,
  showDetails = false
}: FlightCardModernProps) {
  const {
    airline,
    flightNumber,
    departureTime,
    arrivalTime,
    fromCity,
    toCity,
    price,
    duration,
    displayDepartureDate,
    displayArrivalDate,
    displayDepartureTime,
    displayArrivalTime,
    priceIncreased,
    originalPrice
  } = flight;

  // Format airport code to display properly
  const formatCity = (cityCode: string) => {
    if (!cityCode) return "Unknown";
    
    // Check if the city is already a formatted string (like "Mumbai (BOM)")
    if (typeof cityCode === 'string' && cityCode.includes('(') && cityCode.includes(')')) {
      return cityCode;
    }
    
    // Otherwise, use the utility to format it
    try {
      return formatAirportForDisplay(cityCode);
    } catch (error) {
      console.error("Error formatting city:", error);
      return cityCode; // Return the raw code if we can't format it
    }
  };

  // Format the date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return null;
    
    try {
      // If it's a Firestore timestamp object
      if (typeof timestamp === 'object' && timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      // If it's a JavaScript Date object or timestamp string
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  };

  // Format the time
  const formatTime = (timeString: any) => {
    if (!timeString) return '';
    
    // First check if we already have display time from the server
    if (displayDepartureTime || displayArrivalTime) {
      if (timeString === departureTime && displayDepartureTime) {
        return displayDepartureTime;
      }
      if (timeString === arrivalTime && displayArrivalTime) {
        return displayArrivalTime;
      }
    }
    
    try {
      // Handle Firestore Timestamp objects
      if (typeof timeString === 'object' && timeString !== null) {
        if (timeString.seconds) {
          // It's a Firestore Timestamp
          const date = new Date(timeString.seconds * 1000);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (timeString instanceof Date) {
          return timeString.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } else if (typeof timeString === 'string') {
        // It's a string date
        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Fallback
      return String(timeString);
    } catch (error) {
      console.error('Error formatting time:', error, timeString);
      return String(timeString); // Return original if can't format
    }
  };

  // Format the duration - either use the duration string or calculate it
  const formatDuration = (durationInput: string | number) => {
    // If durationInput is already a string like "2h 30m", return it
    if (typeof durationInput === 'string' && durationInput.includes('h')) {
      return durationInput;
    }
    
    // Otherwise calculate from minutes
    const minutes = parseInt(durationInput as string);
    if (isNaN(minutes)) return '---';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Derived values with fallbacks
  const fromCityDisplay = formatCity(fromCity);
  const toCityDisplay = formatCity(toCity);
  const departureTimeDisplay = displayDepartureTime || formatTime(departureTime);
  const arrivalTimeDisplay = displayArrivalTime || formatTime(arrivalTime);
  const departureDateDisplay = displayDepartureDate || formatDate(departureTime);
  const arrivalDateDisplay = displayArrivalDate || formatDate(arrivalTime);
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={`overflow-hidden ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            {/* Airline Info */}
            <div className="flex items-center mb-3 md:mb-0">
              <div className="flex-shrink-0 mr-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plane className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{airline || 'Unknown Airline'}</div>
                <div className="text-sm text-muted-foreground">{flightNumber || 'No Flight Number'}</div>
              </div>
            </div>

            {/* Route Information */}
            <div className="flex-grow md:mx-6 mb-3 md:mb-0">
              <div className="flex items-center justify-between relative">
                {/* Departure */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">{departureTimeDisplay || '00:00'}</div>
                  <div className="text-sm text-muted-foreground">{fromCityDisplay}</div>
                  {departureDateDisplay && (
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <CalendarIcon className="mr-1" size={10} />
                      {departureDateDisplay}
                    </div>
                  )}
                </div>
                
                {/* Flight Path */}
                <div className="flex-grow mx-2 sm:mx-4 px-4">
                  <div className="relative h-[2px] bg-border mt-6">
                    <div className="absolute left-0 -top-[9px] h-5 w-5 rounded-full bg-primary"></div>
                    <ArrowRight className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <div className="absolute right-0 -top-[9px] h-5 w-5 rounded-full bg-primary"></div>
                  </div>
                  <div className="text-xs text-center text-muted-foreground mt-2 flex items-center justify-center">
                    <Clock className="mr-1 h-3 w-3" /> {formatDuration(duration) || '0h 0m'}
                  </div>
                </div>
                
                {/* Arrival */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">{arrivalTimeDisplay || '00:00'}</div>
                  <div className="text-sm text-muted-foreground">{toCityDisplay}</div>
                  {arrivalDateDisplay && (
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <CalendarIcon className="mr-1" size={10} />
                      {arrivalDateDisplay}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="md:border-l border-border pt-3 md:pt-0 md:pl-6 w-full md:w-auto">
              <Separator className="mb-3 md:hidden" />
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="flex flex-col items-end">
                  {priceIncreased && originalPrice && (
                    <div className="flex items-center mb-1">
                      <span className="text-xs line-through text-muted-foreground mr-1">₹{originalPrice.toLocaleString()}</span>
                      <Badge variant="destructive" className="text-[10px] py-0 px-1.5 h-4">Price Increased</Badge>
                    </div>
                  )}
                  <div className="flex items-center font-bold text-xl text-foreground">
                    <BadgeIndianRupee className="h-4 w-4 mr-1" />
                    <CountUpAnimation 
                      end={price || 0} 
                      prefix=""
                      duration={1000}
                      startOnView={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Details */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Baggage</div>
                  <div className="text-sm">15 kg (Check-in) + 7 kg (Cabin)</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Meals</div>
                  <div className="text-sm">Meals Available</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">In-flight Entertainment</div>
                  <div className="text-sm">Available</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 