import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaPlane, FaCalendarAlt, FaClock, FaTicketAlt, FaUser, FaMoneyBillAlt, FaCheck, FaTimes, FaArrowRight, FaRedo } from 'react-icons/fa';

export default function BookingHistoryItem({ booking }) {
  const navigate = useNavigate();
  const { flight, passengerName, bookingId, bookingDate, status } = booking;

  const statusColors = {
    'Confirmed': 'text-gray-700 bg-gray-100',
    'Cancelled': 'text-gray-700 bg-red-100',
    'Completed': 'text-gray-700 bg-blue-100',
  };

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
      date: new Date(flight.departureTime).toISOString().split('T')[0],
      passengers: 1
    };
    sessionStorage.setItem('searchParams', JSON.stringify(searchParams));
    
    // Navigate to booking page
    navigate(`/booking/${flight.id}`);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden mb-4 border border-gray-100 hover:border-gray-200 ">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{flight.from} <FaArrowRight className="inline text-gray-700 mx-1" /> {flight.to}</h3>
            <p className="text-gray-500 text-sm">{flight.airline} · {flight.flightNumber}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'text-gray-600 bg-gray-100'}`}>
            {status}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="flex items-center">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <span className="text-sm">{format(new Date(flight.departureTime), 'dd MMM yyyy')}</span>
          </div>
          <div className="flex items-center">
            <FaClock className="text-gray-400 mr-2" />
            <span className="text-sm">
              {format(new Date(flight.departureTime), 'hh:mm a')} - {format(new Date(flight.arrivalTime), 'hh:mm a')}
            </span>
          </div>
          <div className="flex items-center">
            <FaTicketAlt className="text-gray-400 mr-2" />
            <span className="text-sm">{bookingId}</span>
          </div>
          <div className="flex items-center">
            <FaUser className="text-gray-400 mr-2" />
            <span className="text-sm">{passengerName}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <FaMoneyBillAlt className="text-gray-700 mr-2" />
            <span className="font-medium text-gray-900">₹{flight.price}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleViewTicket}
              className="px-3 py-1 bg-gray-50 text-gray-700 rounded-md text-sm hover:bg-gray-100  focus:outline-none"
            >
              View Ticket
            </button>
            <button
              onClick={handleBookAgain}
              className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700  focus:outline-none flex items-center"
            >
              <FaRedo className="mr-1" /> Book Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 