"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  ArrowUpDown, 
  ArrowDown, 
  ArrowUp, 
  Clock, 
  BadgeIndianRupee, 
  Plane, 
  Bug,
  X
} from "lucide-react";
import FlightCardModern from './FlightCardModern';
import { formatAirportForDisplay } from '../utils/airportUtil.js';
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface Flight {
  id?: string;
  airline: string;
  flightNumber: string;
  departureTime: any; // Could be string, Date or Firestore timestamp
  arrivalTime: any; // Could be string, Date or Firestore timestamp
  fromCity: string;
  toCity: string;
  price: number;
  duration: string | number;
  [key: string]: any;
}

interface SearchParams {
  fromCity?: string;
  toCity?: string;
  date?: string;
  passengers?: number;
  [key: string]: any;
}

interface FlightListModernProps {
  flights?: Flight[];
  loading?: boolean;
  error?: any;
  searchParams?: SearchParams;
  onFlightSelect?: (flight: Flight) => void;
  onSelect?: (flight: Flight) => void;
}

export default function FlightListModern({ 
  flights = [], 
  loading = false, 
  error = null, 
  searchParams, 
  onFlightSelect, 
  onSelect 
}: FlightListModernProps) {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [sortCriteria, setSortCriteria] = useState<'price' | 'duration' | 'departureTime'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    airlines: [] as string[],
    priceRange: { min: 0, max: 15000 },
    departureTime: { min: 0, max: 24 }
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  // Get unique airlines
  const airlines = [...new Set(flights.map(f => f.airline || 'Unknown'))];

  // Apply filters
  useEffect(() => {
    // If there are no flights to filter, set filtered flights to empty array
    if (!flights || flights.length === 0) {
      setFilteredFlights([]);
      return;
    }
    
    let filtered = [...flights];

    // Apply airline filter
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(f => filters.airlines.includes(f.airline));
    }

    // Apply price filter
    filtered = filtered.filter(f => {
      // Ensure price is a number
      const price = typeof f.price === 'string' ? parseFloat(f.price) : Number(f.price);
      return !isNaN(price) && price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Apply departure time filter - handle different timestamp formats
    filtered = filtered.filter(f => {
      try {
        let departureDate;
        
        // Handle different timestamp formats from Firestore
        if (f.departureTime && typeof f.departureTime === 'object' && f.departureTime.seconds) {
          // Firestore Timestamp object
          departureDate = new Date(f.departureTime.seconds * 1000);
        } else if (f.departureTime && typeof f.departureTime === 'string') {
          // String format
          departureDate = new Date(f.departureTime);
        } else if (f.departureTime instanceof Date) {
          // Already a Date object
          departureDate = f.departureTime;
        } else {
          return true; // Include it anyway
        }
        
        if (isNaN(departureDate.getTime())) {
          return true; // Include flights with invalid dates rather than filtering them out
        }
        
        const hour = departureDate.getHours();
        return hour >= filters.departureTime.min && hour <= filters.departureTime.max;
      } catch (error) {
        return true; // If error, include the flight
      }
    });

    // Sort flights
    filtered.sort((a, b) => {
      let comparison = 0;
      try {
        if (sortCriteria === 'price') {
          const aPrice = typeof a.price === 'string' ? parseFloat(a.price) : Number(a.price);
          const bPrice = typeof b.price === 'string' ? parseFloat(b.price) : Number(b.price);
          comparison = aPrice - bPrice;
        } else if (sortCriteria === 'duration') {
          // Duration might be stored in different formats
          let aDuration, bDuration;
          
          // Check if duration is a string like "2h 30m"
          if (typeof a.duration === 'string' && a.duration.includes('h')) {
            const matches = a.duration.match(/(\d+)h\s*(\d*)/);
            const hours = matches ? parseInt(matches[1]) : 0;
            const minutes = matches && matches[2] ? parseInt(matches[2]) : 0;
            aDuration = hours * 60 + minutes;
          } else {
            aDuration = Number(a.duration);
          }
          
          if (typeof b.duration === 'string' && b.duration.includes('h')) {
            const matches = b.duration.match(/(\d+)h\s*(\d*)/);
            const hours = matches ? parseInt(matches[1]) : 0;
            const minutes = matches && matches[2] ? parseInt(matches[2]) : 0;
            bDuration = hours * 60 + minutes;
          } else {
            bDuration = Number(b.duration);
          }
          
          comparison = aDuration - bDuration;
        } else if (sortCriteria === 'departureTime') {
          // Handle different timestamp formats
          let aDepartureTime, bDepartureTime;
          
          if (a.departureTime && typeof a.departureTime === 'object' && a.departureTime.seconds) {
            aDepartureTime = a.departureTime.seconds * 1000;
          } else {
            aDepartureTime = new Date(a.departureTime).getTime();
          }
          
          if (b.departureTime && typeof b.departureTime === 'object' && b.departureTime.seconds) {
            bDepartureTime = b.departureTime.seconds * 1000;
          } else {
            bDepartureTime = new Date(b.departureTime).getTime();
          }
          
          comparison = aDepartureTime - bDepartureTime;
        }
      } catch (error) {
        return 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredFlights(filtered);
  }, [flights, filters, sortCriteria, sortDirection]);

  // Handle flight selection
  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlightId(flight.id || null);
    if (onSelect) {
      onSelect(flight);
    } else if (onFlightSelect) {
      onFlightSelect(flight);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleAirlineFilterChange = (airline: string) => {
    setFilters(prev => {
      const newAirlines = prev.airlines.includes(airline)
        ? prev.airlines.filter(a => a !== airline)
        : [...prev.airlines, airline];
      
      return {
        ...prev,
        airlines: newAirlines
      };
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        min: values[0],
        max: values[1]
      }
    }));
  };

  const handleDepartureTimeChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      departureTime: {
        min: values[0],
        max: values[1]
      }
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      airlines: [],
      priceRange: { min: 0, max: 15000 },
      departureTime: { min: 0, max: 24 }
    });
    setSortCriteria('price');
    setSortDirection('asc');
  };

  // Format for display
  const formatFromTo = () => {
    if (!searchParams) return 'Search Results';
    
    const from = searchParams.fromCity ? formatAirportForDisplay(searchParams.fromCity) : '?';
    const to = searchParams.toCity ? formatAirportForDisplay(searchParams.toCity) : '?';
    
    return `${from} → ${to}`;
  };

  // Render loading UI if no search params yet
  if (!searchParams) {
    return (
      <div className="text-center py-10">
        <div className="flex items-center justify-center mb-4">
          <Plane className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Ready to find flights</h3>
        <p className="text-muted-foreground">Please use the search form to find flights</p>
      </div>
    );
  }

  // Loading state UI
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{formatFromTo()}</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </div>
        </div>
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border">
            <div className="p-4">
              <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                
                <div className="flex-grow md:mx-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <Skeleton className="h-5 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                    
                    <div className="flex-grow mx-8">
                      <Skeleton className="h-2 w-full" />
                    </div>
                    
                    <div className="text-center">
                      <Skeleton className="h-5 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  </div>
                </div>
                
                <div className="md:pl-6">
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <Bug className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Error loading flights</h3>
        <p className="text-muted-foreground mb-4">{error.message || 'Something went wrong'}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // No flights found UI
  if (filteredFlights.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
          <Plane className="h-8 w-8 text-secondary-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No flights found</h3>
        <p className="text-muted-foreground mb-4">
          {filters.airlines.length > 0 || filters.priceRange.min > 0 || filters.priceRange.max < 15000 ? 
            'Try adjusting your filters' : 
            'No flights available for your search criteria'}
        </p>
        {(filters.airlines.length > 0 || filters.priceRange.min > 0 || filters.priceRange.max < 15000) && (
          <Button onClick={clearAllFilters} variant="outline">
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  // Main UI with results
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{formatFromTo()}</h2>
          <p className="text-sm text-muted-foreground">
            {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {(filters.airlines.length > 0 || 
                  filters.priceRange.min > 0 || 
                  filters.priceRange.max < 15000 || 
                  filters.departureTime.min > 0 || 
                  filters.departureTime.max < 24) && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0">
                    {filters.airlines.length + 
                     (filters.priceRange.min > 0 || filters.priceRange.max < 15000 ? 1 : 0) + 
                     (filters.departureTime.min > 0 || filters.departureTime.max < 24 ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filter Flights</SheetTitle>
                <SheetDescription>
                  Customize your search results
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4">
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Airlines</h3>
                  <div className="space-y-2">
                    {airlines.map(airline => (
                      <div key={airline} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`airline-${airline}`}
                          checked={filters.airlines.includes(airline)}
                          onChange={() => handleAirlineFilterChange(airline)}
                          className="rounded text-primary mr-2"
                        />
                        <label htmlFor={`airline-${airline}`} className="text-sm">
                          {airline}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[filters.priceRange.min, filters.priceRange.max]}
                      min={0}
                      max={15000}
                      step={500}
                      minStepsBetweenThumbs={1}
                      onValueChange={handlePriceRangeChange}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₹{filters.priceRange.min.toLocaleString()}</span>
                      <span>₹{filters.priceRange.max.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Departure Time</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[filters.departureTime.min, filters.departureTime.max]}
                      min={0}
                      max={24}
                      step={1}
                      minStepsBetweenThumbs={1}
                      onValueChange={handleDepartureTimeChange}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{filters.departureTime.min}:00</span>
                      <span>{filters.departureTime.max}:00</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <SheetFooter>
                <Button variant="outline" onClick={clearAllFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          
          <div className="flex">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSortCriteria('price')}
              className={sortCriteria === 'price' ? 'rounded-r-none border-r-0' : 'rounded-r-none border-r-0'}
            >
              <BadgeIndianRupee className={`h-4 w-4 mr-1 ${sortCriteria === 'price' ? 'text-primary' : ''}`} />
              Price
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSortCriteria('duration')}
              className={sortCriteria === 'duration' ? 'rounded-none border-x-0' : 'rounded-none border-x-0'}
            >
              <Clock className={`h-4 w-4 mr-1 ${sortCriteria === 'duration' ? 'text-primary' : ''}`} />
              Duration
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSortCriteria('departureTime')}
              className={sortCriteria === 'departureTime' ? 'rounded-l-none border-l-0' : 'rounded-l-none border-l-0'}
            >
              <Plane className={`h-4 w-4 mr-1 ${sortCriteria === 'departureTime' ? 'text-primary' : ''}`} />
              Departure
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSortDirection}
              className="ml-1"
            >
              {sortDirection === 'asc' ? 
                <ArrowUp className="h-4 w-4" /> : 
                <ArrowDown className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        <div className="space-y-4">
          {filteredFlights.map((flight, index) => (
            <ScrollReveal 
              key={flight.id || index} 
              animation="slide-up" 
              delay={index * 100}
              className="w-full"
            >
              <FlightCardModern
                flight={flight}
                selected={flight.id === selectedFlightId}
                onClick={() => handleFlightSelect(flight)}
              />
            </ScrollReveal>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
} 