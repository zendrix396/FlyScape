import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, addDoc, collection, getDocs, query, where, orderBy, limit, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import BookingForm from '../components/BookingForm';
import Voucher from '../components/Voucher';
import GradientText from '../components/GradientText';
import { FaArrowLeft } from 'react-icons/fa';

export default function BookingPage() {
  const { flightId } = useParams();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { recordFlightSearch, shouldIncreasePriceBySearchHistory } = useBooking();

  useEffect(() => {
    // Load the selected flight from session storage
    const loadFlightData = async () => {
      try {
        const searchResults = JSON.parse(sessionStorage.getItem('searchResults'));
        if (!searchResults) {
          setError('Flight data not found. Please go back to search page.');
          setLoading(false);
          return;
        }

        const selectedFlight = searchResults.find(f => f.id === flightId);
        if (!selectedFlight) {
          setError('Selected flight not found. Please go back to search page.');
          setLoading(false);
          return;
        }

        // Check booking frequency for this flight to adjust price
        await checkBookingFrequency(selectedFlight);
      } catch (error) {
        console.error('Error loading flight data:', error);
        setError('Error loading flight data. Please try again.');
        setLoading(false);
      }
    };

    loadFlightData();
  }, [flightId]);

  // Check how many times this flight has been booked recently and adjust price if necessary
  const checkBookingFrequency = async (selectedFlight) => {
    try {
      // Get bookings for this flight in the last 5 minutes
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const flightBookingsRef = collection(db, 'bookings');
      const q = query(
        flightBookingsRef,
        where('flight.id', '==', selectedFlight.id),
        where('bookingDate', '>=', fiveMinutesAgo.toISOString()),
        orderBy('bookingDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const recentBookingsCount = querySnapshot.size;
      
      console.log(`Recent bookings for flight ${selectedFlight.id}: ${recentBookingsCount}`);
      
      // Should increase price if booked 3 or more times in the last 5 minutes
      const shouldIncrease = recentBookingsCount >= 3;
      
      // Apply price adjustment if needed
      if (shouldIncrease) {
        console.log(`Increasing price for flight ${selectedFlight.id} by 10%`);
        const increasedPrice = Math.round(selectedFlight.price * 1.1);
        setFlight({
          ...selectedFlight,
          price: increasedPrice,
          originalPrice: selectedFlight.price,
          priceIncreased: true
        });
      } else {
        setFlight(selectedFlight);
      }
      
      // Record this search/view
      recordFlightSearch(selectedFlight.id);
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking booking frequency:', error);
      setFlight(selectedFlight);
      setLoading(false);
    }
  };

  // Check if user is authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Please log in</h1>
          <p className="mt-2 text-gray-600">You need to be logged in to book flights</p>
          <Link
            to="/login"
            className="mt-4 inline-block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleBookingSubmit = async (formData) => {
    try {
      const { passengers, passengersCount } = formData;
      const bookingId = generateBookingId();
      const createdBookings = [];
      
      // Create a booking for each passenger
      for (let i = 0; i < passengers.length; i++) {
        const passenger = passengers[i];
        
        // Add booking to Firestore
        const bookingData = {
          passengerName: passenger.name,
          email: passenger.email,
          phone: passenger.phone,
          userId: currentUser.uid,
          bookingId: `${bookingId}-${i + 1}`,
          parentBookingId: bookingId,
          flight,
          status: 'Confirmed',
          paymentMethod: formData.paymentMethod,
          bookingDate: new Date().toISOString(),
          passengerNumber: i + 1,
          totalPassengers: passengersCount
        };
        
        const docRef = await addDoc(collection(db, 'bookings'), bookingData);
        
        // Update booking ID with Firestore document ID
        const updatedBooking = {
          ...bookingData,
          id: docRef.id
        };
        
        createdBookings.push(updatedBooking);
      }
      
      setBookings(createdBookings);
      setCurrentTicketIndex(0);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to complete your booking. Please try again.');
    }
  };

  // Generate a random booking ID
  const generateBookingId = () => {
    const prefix = 'BK';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const handleNextTicket = () => {
    if (currentTicketIndex < bookings.length - 1) {
      setCurrentTicketIndex(currentTicketIndex + 1);
    }
  };

  const handlePrevTicket = () => {
    if (currentTicketIndex > 0) {
      setCurrentTicketIndex(currentTicketIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-6 max-w-lg w-full">
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={() => navigate('/flights')}
          className="flex items-center text-gray-700 hover:text-gray-800"
        >
          <FaArrowLeft className="mr-2" />
          Back to flight search
        </button>
      </div>
    );
  }

  if (bookings.length > 0) {
    const currentBooking = bookings[currentTicketIndex];
    return (
      <div className="min-h-screen bg-gray-50 pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {bookings.length > 1 && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold text-center mb-2">Passenger Tickets</h2>
              <div className="flex justify-between items-center">
                <button 
                  onClick={handlePrevTicket} 
                  disabled={currentTicketIndex === 0}
                  className={`px-4 py-2 rounded-md ${currentTicketIndex === 0 ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Previous Ticket
                </button>
                <span className="text-gray-600">
                  Ticket {currentTicketIndex + 1} of {bookings.length}
                </span>
                <button 
                  onClick={handleNextTicket} 
                  disabled={currentTicketIndex === bookings.length - 1}
                  className={`px-4 py-2 rounded-md ${currentTicketIndex === bookings.length - 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Next Ticket
                </button>
              </div>
            </div>
          )}
          <Voucher booking={currentBooking} />
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/flights')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 inline-flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Flights
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/flights')}
            className="flex items-center text-gray-700 hover:text-gray-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to flight list
          </button>

          <div className="text-center py-4">
            <GradientText
              colors={["#10b981", "#6ee7b7", "#10b981"]}
              animationSpeed={5}
              className="text-3xl font-bold"
            >
              Book Your Flight
            </GradientText>
            <h2 className="mt-2 text-gray-600">
              {flight?.from} to {flight?.to} • {new Date(flight?.departureTime).toLocaleDateString()}
            </h2>
          </div>

          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{flight?.airline}</h3>
                <p className="text-gray-500">{flight?.flightNumber}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                {flight?.priceIncreased && (
                  <p className="text-sm line-through text-gray-500">₹{flight?.originalPrice}</p>
                )}
                <p className="text-2xl font-bold text-gray-700">₹{flight?.price}</p>
                <p className="text-sm text-gray-500">per passenger</p>
                {flight?.priceIncreased && (
                  <p className="text-xs text-gray-600">Price increased due to high demand</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-t border-b border-gray-100">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-500">Departure</p>
                <p className="text-xl font-semibold">
                  {new Date(flight?.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-gray-600">{flight?.from}</p>
              </div>

              <div className="mb-4 md:mb-0 md:mx-4 text-center">
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg">{flight?.duration}</p>
                <p className="text-xs text-gray-400">
                  {flight?.stops === 0 ? 'Non-stop' : `${flight?.stops} ${flight?.stops === 1 ? 'stop' : 'stops'}`}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Arrival</p>
                <p className="text-xl font-semibold">
                  {new Date(flight?.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-gray-600">{flight?.to}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">Baggage Allowance</p>
              <p className="font-medium">20kg Check-in + 7kg Cabin</p>
            </div>
          </div>
        </div>

        {flight ? (
          <BookingForm flight={flight} onSubmit={handleBookingSubmit} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Flight data is not available. Please go back to search page.</p>
            <button
              onClick={() => navigate('/flights')}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
            >
              Back to Flights
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 