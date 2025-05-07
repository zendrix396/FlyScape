"use client"

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatAirportForDisplay } from '../utils/airportUtil.js';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plane, 
  ArrowRight, 
  CalendarCheck2, 
  RefreshCw, 
  Eye
} from "lucide-react";
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface Booking {
  id?: string;
  flight: any;
  passengerName?: string;
  bookingId: string;
  bookingDate: any;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
  [key: string]: any;
}

interface BookingHistoryItemModernProps {
  booking: Booking;
  index?: number;
}

export default function BookingHistoryItemModern({ booking, index = 0 }: BookingHistoryItemModernProps) {
  const navigate = useNavigate();
  const { flight, passengerName, bookingId, bookingDate, status } = booking;

  type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
  const statusVariants: Record<string, { variant: BadgeVariant, className: string }> = {
    'Confirmed': { variant: "default", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
    'Cancelled': { variant: "destructive", className: "bg-red-100 text-red-800 hover:bg-red-200" },
    'Completed': { variant: "secondary", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
  };

  // Safe date formatting function to prevent "Invalid time value" errors
  const safeFormatDate = (dateInput: any): string => {
    if (!dateInput) return "N/A";
    
    try {
      // Handle Firestore timestamp objects
      if (typeof dateInput === 'object' && dateInput !== null && dateInput.seconds) {
        return new Date(dateInput.seconds * 1000).toLocaleDateString();
      }
      
      // Handle Date objects
      if (dateInput instanceof Date) {
        return dateInput.toLocaleDateString();
      }
      
      // Handle ISO strings or other string formats
      if (typeof dateInput === 'string') {
        const date = new Date(dateInput);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }
      
      // If nothing works, return the original
      return String(dateInput);
    } catch (error) {
      console.error("Error formatting date:", error, dateInput);
      return "Invalid date";
    }
  };

  // Safe time formatting function
  const safeFormatTime = (timeInput: any): string => {
    if (!timeInput) return "N/A";
    
    try {
      // Handle Firestore timestamp objects
      if (typeof timeInput === 'object' && timeInput !== null && timeInput.seconds) {
        return new Date(timeInput.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Handle Date objects
      if (timeInput instanceof Date) {
        return timeInput.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Handle ISO strings or other string formats
      if (typeof timeInput === 'string') {
        const date = new Date(timeInput);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
      
      // If nothing works, return the original
      return String(timeInput);
    } catch (error) {
      console.error("Error formatting time:", error, timeInput);
      return "Invalid time";
    }
  };

  // Format city codes safely
  const formatCity = (cityCode: string): string => {
    if (!cityCode) return "Unknown";
    try {
      return formatAirportForDisplay(cityCode);
    } catch (error) {
      return cityCode;
    }
  };
  
  // Format the flight details with error handling
  const fromCityDisplay = flight?.fromCity ? formatCity(flight.fromCity) : "Unknown";
  const toCityDisplay = flight?.toCity ? formatCity(flight.toCity) : "Unknown";
  const airlineDisplay = flight?.airline || "Unknown Airline";
  const flightNumberDisplay = flight?.flightNumber || "Unknown";
  
  // Safely format dates and times
  const bookingDateDisplay = safeFormatDate(bookingDate);
  const departureTimeDisplay = flight?.departureTime ? safeFormatTime(flight.departureTime) : "N/A";
  const departureDateDisplay = flight?.departureTime ? safeFormatDate(flight.departureTime) : "N/A";

  const handleViewTicket = () => {
    // Store the booking in session storage
    sessionStorage.setItem('selectedBooking', JSON.stringify(booking));
    navigate(`/ticket/${bookingId}`);
  };

  const handleBookAgain = () => {
    // Store the flight in session storage
    const searchResults = [flight];
    sessionStorage.setItem('searchResults', JSON.stringify(searchResults));
    
    // Create appropriate search params
    const searchParams = {
      from: flight.from,
      to: flight.to,
      date: flight.displayDepartureDate || 
            safeFormatDate(flight.departureTime),
      passengers: 1
    };
    sessionStorage.setItem('searchParams', JSON.stringify(searchParams));
    
    // Navigate to booking page
    navigate(`/booking/${flight.id}`);
  };

  // Get price to display - use the most reliable price field available
  const getPrice = () => {
    if (flight) {
      if (typeof booking.price === 'number' || typeof booking.price === 'string') {
        return booking.price;
      }
      if (typeof flight.price === 'number' || typeof flight.price === 'string') {
        return flight.price;
      }
    }
    return 'N/A';
  };

  return (
    <ScrollReveal 
      animation="slide-up" 
      delay={index * 100} 
      className="w-full"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-stretch">
            {/* Left side with status indicator */}
            <div className={`w-2 flex-shrink-0 ${
              status === 'Confirmed' ? 'bg-emerald-500' : 
              status === 'Cancelled' ? 'bg-destructive' : 'bg-blue-500'
            }`}></div>
            
            <div className="p-4 flex-grow">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex items-start space-x-3 mb-3 md:mb-0">
                  <div className="rounded-full h-10 w-10 flex items-center justify-center bg-primary/10">
                    <Plane className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-medium">{fromCityDisplay} <ArrowRight className="inline h-3 w-3 mx-0.5" /> {toCityDisplay}</h3>
                      <Badge 
                        variant={statusVariants[status]?.variant || "default"}
                        className={statusVariants[status]?.className}
                      >
                        {status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {airlineDisplay} • {flightNumberDisplay}
                    </div>
                    
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <CalendarCheck2 className="h-3 w-3 mr-1" /> 
                      <span>{departureDateDisplay} • {departureTimeDisplay}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center space-x-0 md:space-x-4 space-y-2 md:space-y-0">
                  <div>
                    <div className="text-xs text-muted-foreground">Booking ID</div>
                    <div className="text-sm font-medium">{bookingId}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Booked on {bookingDateDisplay}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleViewTicket}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> View
                    </Button>
                    
                    <Button 
                      onClick={handleBookAgain}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" /> Book Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
} 