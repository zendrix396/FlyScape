"use client"

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  Calendar, 
  Search, 
  ArrowUpDown, 
  Users, 
  ChevronsUpDown, 
  ChevronUp, 
  ChevronDown,
  CheckCircle2,
  Repeat,
  CalendarIcon
} from "lucide-react";
import { GradientText } from '@/components/ui/GradientText';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { extractAirportCode } from '../utils/airportUtil.js';
import { searchAirports, formatAirportForDisplay } from '../services/airportService.js';
import { Calendar as UiCalendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface FlightSearchParams {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

interface AirportOption {
  code: string;
  name: string;
}

interface CustomStyles {
  swapButtonIcon?: React.ReactNode;
  passengerDropdownClassName?: string;
  passengerItemClassName?: string;
  passengerActiveClassName?: string;
}

interface FlightSearchModernProps {
  onSearch: (params: FlightSearchParams) => void;
  customStyles?: CustomStyles;
}

export default function FlightSearchModern({ onSearch, customStyles = {} }: FlightSearchModernProps) {
  const [from, setFrom] = useState<string | AirportOption>('');
  const [to, setTo] = useState<string | AirportOption>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [passengers, setPassengers] = useState(1);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [isFromLoading, setIsFromLoading] = useState(false);
  const [isToLoading, setIsToLoading] = useState(false);
  const [searchAllDates, setSearchAllDates] = useState(false);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [isPassengersOpen, setIsPassengersOpen] = useState(false);

  // Use expanded airport list from service
  const dummySuggestions = [
    'Delhi (DEL)',
    'Mumbai (BOM)',
    'Bangalore (BLR)',
    'Chennai (MAA)',
    'Kolkata (CCU)',
    'Hyderabad (HYD)',
    'Ahmedabad (AMD)',
    'Cochin (COK)',
    'Pune (PNQ)',
    'Jaipur (JAI)',
    'Goa (GOI)',
    'Dubai (DXB)',
    'Singapore (SIN)',
    'London (LHR)',
    'New York (JFK)',
    'Bangkok (BKK)',
    'Hong Kong (HKG)',
    'Sydney (SYD)'
  ];

  const handleFromChange = async (value: string) => {
    setFrom(value);
    if (value.trim().length > 1) {
      // Mock API call for suggestions
      setIsFromLoading(true);
      try {
        // Try to use the searchAirports service, fallback to dummy suggestions
        const airports = await searchAirports(value);
        if (airports && airports.length > 0) {
          setFromSuggestions(airports.map(formatAirportForDisplay));
        } else {
          const filtered = dummySuggestions.filter(
            (s) => s.toLowerCase().includes(value.toLowerCase())
          );
          setFromSuggestions(filtered);
        }
      } catch (error) {
        const filtered = dummySuggestions.filter(
          (s) => s.toLowerCase().includes(value.toLowerCase())
        );
        setFromSuggestions(filtered);
      } finally {
        setIsFromLoading(false);
      }
    } else {
      setFromSuggestions([]);
    }
  };

  const handleToChange = async (value: string) => {
    setTo(value);
    if (value.trim().length > 1) {
      // Mock API call for suggestions
      setIsToLoading(true);
      try {
        // Try to use the searchAirports service, fallback to dummy suggestions
        const airports = await searchAirports(value);
        if (airports && airports.length > 0) {
          setToSuggestions(airports.map(formatAirportForDisplay));
        } else {
          const filtered = dummySuggestions.filter(
            (s) => s.toLowerCase().includes(value.toLowerCase())
          );
          setToSuggestions(filtered);
        }
      } catch (error) {
        const filtered = dummySuggestions.filter(
          (s) => s.toLowerCase().includes(value.toLowerCase())
        );
        setToSuggestions(filtered);
      } finally {
        setIsToLoading(false);
      }
    } else {
      setToSuggestions([]);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    
    // Format the date as YYYY-MM-DD if it exists, otherwise use empty string
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    
    // Extract airport codes
    const fromCode = typeof from === 'string' ? extractAirportCode(from) : from.code;
    const toCode = typeof to === 'string' ? extractAirportCode(to) : to.code;
    
    if (onSearch) {
      onSearch({
        from: fromCode,
        to: toCode,
        date: formattedDate,
        passengers
      });
    }
  };

  const handleSwapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <ScrollReveal animation="fade-in" className="w-full">
      <Card className="border-border shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex justify-center">
            <GradientText
              gradient="bg-gradient-to-r from-primary to-primary/60"
              className="text-2xl font-bold"
            >
              Search Flights
            </GradientText>
          </CardTitle>
          <CardDescription>Find the best deals on flights</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Field */}
              <div>
                <Label htmlFor="from" className="text-sm font-medium">
                  From
                </Label>
                <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
                  <PopoverTrigger asChild>
                    <div className="mt-1 relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Plane className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="from"
                        value={typeof from === 'string' ? from : from.name}
                        onChange={(e) => handleFromChange(e.target.value)}
                        className="pl-10"
                        placeholder="City or airport"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto" align="start">
                    <Command>
                      <CommandInput placeholder="Search airport..." />
                      <CommandList>
                        <CommandEmpty>No airports found.</CommandEmpty>
                        <CommandGroup>
                          {isFromLoading ? (
                            <div className="flex items-center justify-center py-6">
                              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                          ) : (
                            fromSuggestions.map((suggestion) => (
                              <CommandItem
                                key={suggestion}
                                onSelect={() => {
                                  setFrom(suggestion);
                                  setIsFromOpen(false);
                                }}
                              >
                                <div className="flex items-center">
                                  <Plane className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{suggestion}</span>
                                </div>
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Field with Swap Button */}
              <div className="relative">
                <Label htmlFor="to" className="text-sm font-medium">
                  To
                </Label>
                <div className="flex mt-1">
                  <div className="flex-grow relative">
                    <Popover open={isToOpen} onOpenChange={setIsToOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative rounded-md">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Plane className="h-4 w-4 text-muted-foreground rotate-90" />
                          </div>
                          <Input
                            id="to"
                            value={typeof to === 'string' ? to : to.name}
                            onChange={(e) => handleToChange(e.target.value)}
                            className="pl-10"
                            placeholder="City or airport"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-auto" align="start">
                        <Command>
                          <CommandInput placeholder="Search airport..." />
                          <CommandList>
                            <CommandEmpty>No airports found.</CommandEmpty>
                            <CommandGroup>
                              {isToLoading ? (
                                <div className="flex items-center justify-center py-6">
                                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                              ) : (
                                toSuggestions.map((suggestion) => (
                                  <CommandItem
                                    key={suggestion}
                                    onSelect={() => {
                                      setTo(suggestion);
                                      setIsToOpen(false);
                                    }}
                                  >
                                    <div className="flex items-center">
                                      <Plane className="h-4 w-4 mr-2 text-muted-foreground rotate-90" />
                                      <span>{suggestion}</span>
                                    </div>
                                  </CommandItem>
                                ))
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleSwapLocations}
                    className="ml-2"
                  >
                    {customStyles.swapButtonIcon || <ArrowUpDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Date Field */}
              <div className="relative col-span-full sm:col-span-1">
                <Label htmlFor="date" className="text-sm font-medium">
                  Departure Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !date ? "text-muted-foreground" : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <UiCalendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <div className="mt-1 h-5">
                  {searchAllDates && (
                    <div className="text-xs text-muted-foreground">
                      Showing flights for all available dates
                    </div>
                  )}
                </div>
              </div>
              
              {/* Passengers Field */}
              <div>
                <Label htmlFor="passengers" className="text-sm font-medium">
                  Passengers
                </Label>
                <Popover open={isPassengersOpen} onOpenChange={setIsPassengersOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isPassengersOpen}
                      className="w-full justify-between mt-1 bg-background"
                    >
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {passengers} {passengers === 1 ? 'Passenger' : 'Passengers'}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={`p-0 w-full max-h-[300px] overflow-auto ${customStyles.passengerDropdownClassName || ''}`}>
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <CommandItem
                              key={num}
                              onSelect={() => {
                                setPassengers(num);
                                setIsPassengersOpen(false);
                              }}
                              className={customStyles.passengerItemClassName}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>
                                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                                  </span>
                                </div>
                                {passengers === num && (
                                  <CheckCircle2 className={`h-4 w-4 ${customStyles.passengerActiveClassName || "text-primary"}`} />
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={!from || !to || (!date && !searchAllDates)}
              >
                <Search className="h-4 w-4 mr-2" />
                Search Flights
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
} 