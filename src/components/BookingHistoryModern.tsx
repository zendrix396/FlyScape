"use client"

import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from "lucide-react";
import { GradientText } from '@/components/ui/GradientText';
import BookingHistoryItemModern from './BookingHistoryItemModern';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Booking {
  id?: string;
  flight: any;
  passengerName?: string;
  bookingId: string;
  bookingDate: any;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
  [key: string]: any;
}

interface BookingHistoryModernProps {
  bookings?: Booking[];
  loading?: boolean;
}

export default function BookingHistoryModern({ bookings = [], loading = false }: BookingHistoryModernProps) {
  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-secondary animate-pulse">
            <Ticket className="h-8 w-8 text-secondary-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-medium mt-4 mb-2">Loading your bookings...</h3>
          <div className="w-48 h-2 bg-secondary rounded animate-pulse"></div>
        </div>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent className="pt-6 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full flex items-center justify-center bg-secondary/20">
            <Ticket className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium text-foreground mt-4 mb-2">No Bookings Found</h3>
          <p className="text-muted-foreground mb-6">You haven't made any flight bookings yet.</p>
          <Button asChild>
            <Link to="/">Book a Flight</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 text-center">
        <GradientText
          as="h1"
          gradient="from-primary via-primary/60 to-primary"
          className="text-3xl font-bold"
        >
          Your Travel History
        </GradientText>
        <p className="text-muted-foreground mt-2">
          View and manage your past and upcoming bookings
        </p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking, index) => (
          <BookingHistoryItemModern 
            key={booking.bookingId} 
            booking={booking} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
} 