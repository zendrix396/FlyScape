import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, addDoc, collection, getDocs, query, where, orderBy, limit, Timestamp, serverTimestamp, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import BookingFormModern from '../components/BookingFormModern';
import Voucher from '../components/Voucher';
import GradientText from '../components/GradientText';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from '../components/LoadingSpinner';
import MessageModal from '../components/MessageModal';
import { formatAirportForDisplay } from '../utils/airportUtil';

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
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [passengerDetails, setPassengerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    age: '',
    meal: 'standard'
  });
  const [bookingId, setBookingId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [showVoucher, setShowVoucher] = useState(false);

  // Format dates properly to avoid "Invalid Date" display
  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    try {
      let date;
      
      // Check if it's a Firestore timestamp
      if (typeof dateInput === 'object' && dateInput !== null) {
        if (dateInput.seconds) {
          // Firestore timestamp
          date = new Date(dateInput.seconds * 1000);
        } else if (dateInput instanceof Date) {
          // Regular Date object
          date = dateInput;
        } else if (dateInput.displayDepartureDate || dateInput.displayArrivalDate) {
          // Already formatted object, return the display value
          return dateInput.displayDepartureDate || dateInput.displayArrivalDate;
        } else {
          // Try to use it as a Date constructor
          date = new Date(dateInput);
        }
      } else if (typeof dateInput === 'string') {
        // String date
        date = new Date(dateInput);
      } else if (typeof dateInput === 'number') {
        // Timestamp in milliseconds
        date = new Date(dateInput);
      }
      
      // Check if date is valid
      if (date instanceof Date && !isNaN(date)) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      // If we get here, the date is invalid
      return 'N/A';
    } catch (error) {
      console.error("Error formatting date:", error, dateInput);
      return 'N/A';
    }
  };
  
  // Format time properly
  const formatTime = (timeInput) => {
    if (!timeInput) return 'N/A';
    
    try {
      let time;
      
      // Check if we already have formatted time from the server
      if (typeof timeInput === 'object' && timeInput !== null) {
        if (timeInput.displayDepartureTime || timeInput.displayArrivalTime) {
          return timeInput.displayDepartureTime || timeInput.displayArrivalTime;
        }
        
        if (timeInput.seconds) {
          // Firestore timestamp
          time = new Date(timeInput.seconds * 1000);
        } else if (timeInput instanceof Date) {
          // Regular Date object
          time = timeInput;
        } else {
          // Try to create date from object
          time = new Date(timeInput);
        }
      } else if (typeof timeInput === 'string') {
        // Check if it's already a formatted time (like "10:30 AM")
        if (/^\d{1,2}:\d{2}(?: [AP]M)?$/.test(timeInput)) {
          return timeInput;
        }
        // String date
        time = new Date(timeInput);
      } else if (typeof timeInput === 'number') {
        // Timestamp in milliseconds
        time = new Date(timeInput);
      }
      
      // Check if date is valid
      if (time instanceof Date && !isNaN(time)) {
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      return 'N/A';
    } catch (error) {
      console.error("Error formatting time:", error, timeInput);
      return 'N/A';
    }
  };

  // Process flight data to ensure valid date formats
  const processFlightData = (flightData) => {
    if (!flightData) return null;
    
    const processed = {...flightData};
    
    // Add formatted dates for display
    if (processed.departureTime) {
      processed.displayDepartureDate = formatDate(processed.departureTime);
      processed.displayDepartureTime = formatTime(processed.departureTime);
    }
    
    if (processed.arrivalTime) {
      processed.displayArrivalDate = formatDate(processed.arrivalTime);
      processed.displayArrivalTime = formatTime(processed.arrivalTime);
    }
    
    // Format city names
    if (processed.from && !processed.fromFormatted) {
      try {
        processed.fromFormatted = formatAirportForDisplay(processed.from);
      } catch (e) {
        processed.fromFormatted = processed.from;
      }
    }
    
    if (processed.to && !processed.toFormatted) {
      try {
        processed.toFormatted = formatAirportForDisplay(processed.to);
      } catch (e) {
        processed.toFormatted = processed.to;
      }
    }
    
    return processed;
  };

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

        // Process flight data to ensure valid dates
        const processedFlight = processFlightData(selectedFlight);
        
        // Check booking frequency for this flight to adjust price
        await checkBookingFrequency(processedFlight);
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

  // Prefill user details if logged in
  useEffect(() => {
    if (currentUser) {
      setPassengerDetails(prev => ({
        ...prev,
        name: currentUser.displayName || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  // Check if user is authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Please log in</h1>
          <p className="mt-2 text-gray-600">You need to be logged in to book flights</p>
          <Link
            to="/login"
            className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
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
      
      // Calculate total price (price per passenger * number of passengers)
      const pricePerPassenger = flight?.price || 0;
      const totalBookingPrice = pricePerPassenger * passengersCount;
      
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
          totalPassengers: passengersCount,
          price: pricePerPassenger, // Add individual passenger price
          totalPrice: totalBookingPrice, // Add total booking price
          currency: 'INR' // Specify currency
        };
        
        const docRef = await addDoc(collection(db, 'bookings'), bookingData);
        
        // Update booking ID with Firestore document ID
        const updatedBooking = {
          ...bookingData,
          id: docRef.id
        };
        
        createdBookings.push(updatedBooking);
      }
      
      console.log(`Created ${createdBookings.length} bookings with total price: ${createdBookings[0].totalPrice}`);
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
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-opacity-20 rounded-full border-t-primary animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="bg-destructive/10 border-l-4 border-destructive p-4 mb-6 max-w-lg w-full">
          <p className="text-destructive">{error}</p>
        </div>
        <button
          onClick={() => navigate('/flights')}
          className="flex items-center text-primary hover:text-primary/80"
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
      <div className="min-h-screen bg-background pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {bookings.length > 1 && (
            <div className="bg-card rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-semibold text-center mb-2">Passenger Tickets</h2>
              <div className="flex justify-between items-center">
                <button 
                  onClick={handlePrevTicket} 
                  disabled={currentTicketIndex === 0}
                  className={`px-4 py-2 rounded-md ${currentTicketIndex === 0 ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
                >
                  Previous Ticket
                </button>
                <span className="text-muted-foreground">
                  Ticket {currentTicketIndex + 1} of {bookings.length}
                </span>
                <button 
                  onClick={handleNextTicket} 
                  disabled={currentTicketIndex === bookings.length - 1}
                  className={`px-4 py-2 rounded-md ${currentTicketIndex === bookings.length - 1 ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-flex items-center"
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
    <div className="min-h-screen bg-background pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/flights')}
            className="flex items-center text-primary hover:text-primary/80 mb-4"
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
            <h2 className="mt-2 text-muted-foreground">
              {flight?.fromFormatted || flight?.from} to {flight?.toFormatted || flight?.to} • {flight?.displayDepartureDate || 'N/A'}
            </h2>
          </div>

          <div className="bg-card shadow-md rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{flight?.airline}</h3>
                <p className="text-muted-foreground">{flight?.flightNumber}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                {flight?.priceIncreased && (
                  <p className="text-sm line-through text-muted-foreground">₹{flight?.originalPrice}</p>
                )}
                <p className="text-2xl font-bold text-primary">₹{flight?.price}</p>
                <p className="text-sm text-muted-foreground">per passenger</p>
                {flight?.priceIncreased && (
                  <p className="text-xs text-destructive">Price increased due to high demand</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-t border-b border-border">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-muted-foreground">Departure</p>
                <p className="text-xl font-semibold">
                  {flight?.displayDepartureTime || formatTime(flight?.departureTime) || 'N/A'}
                </p>
                <p className="text-foreground/80">{flight?.fromFormatted || flight?.from}</p>
              </div>

              <div className="mb-4 md:mb-0 md:mx-4 text-center">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg">{flight?.duration}</p>
                <p className="text-xs text-muted-foreground">
                  {flight?.stops === 0 ? 'Non-stop' : `${flight?.stops} ${flight?.stops === 1 ? 'stop' : 'stops'}`}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Arrival</p>
                <p className="text-xl font-semibold">
                  {flight?.displayArrivalTime || formatTime(flight?.arrivalTime) || 'N/A'}
                </p>
                <p className="text-foreground/80">{flight?.toFormatted || flight?.to}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-1">Baggage Allowance</p>
              <p className="font-medium">20kg Check-in + 7kg Cabin</p>
            </div>
          </div>
        </div>

        {flight ? (
          <BookingFormModern flight={flight} onSubmit={handleBookingSubmit} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Flight data is not available. Please go back to search page.</p>
            <button
              onClick={() => navigate('/flights')}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md"
            >
              Back to Flights
            </button>
          </div>
        )}
      </div>
      
      {/* Message Modal for errors or notices */}
      <MessageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Notice"
        message={modalMessage}
        type="info"
      />
    </div>
  );
} 