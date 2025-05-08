import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlane, FaUser, FaBarcode, FaDownload, FaShareAlt, FaEnvelope, FaCheck } from 'react-icons/fa';
import GradientText from './GradientText';
import SpotlightCard from './SpotlightCard';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { sendTicketByEmail, generateTicketPDF } from '../services/emailService';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Voucher({ booking }) {
  const voucherRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const { flight, passengerName, bookingId, bookingDate, email, passengerNumber, totalPassengers } = booking;
  
  // Send ticket by email on initial load
  useEffect(() => {
    if (email && !emailSent) {
      handleSendEmail(true);
    }
  }, []);
  
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
        return date.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      } else {
        console.error("Invalid date format:", dateInput);
        // Check if the flight has pre-formatted dates
        if (flight && flight.displayDepartureDate) return flight.displayDepartureDate;
        if (flight && flight.displayArrivalDate) return flight.displayArrivalDate;
        return 'Invalid Date';
      }
    } catch (error) {
      console.error("Error formatting date:", error, dateInput);
      return 'Date Error';
    }
  };
  
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
      } else {
        console.error("Invalid time format:", timeInput);
        // Check if the flight has pre-formatted times
        if (flight && flight.displayDepartureTime) return flight.displayDepartureTime;
        if (flight && flight.displayArrivalTime) return flight.displayArrivalTime;
        return '--:--';
      }
    } catch (error) {
      console.error("Error formatting time:", error, timeInput);
      return '--:--';
    }
  };
  
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add colored header
      doc.setFillColor(16, 185, 129); // emerald-600
      doc.rect(0, 0, 210, 25, 'F');
      
      // Add company name and logo
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('Flyscape - Boarding Pass', 105, 15, { align: 'center' });
      
      // Add booking reference
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Booking Reference: ${String(bookingId || 'N/A')}`, 105, 35, { align: 'center' });
      
      // Add passenger information
      doc.setFontSize(14);
      doc.text('Passenger Information', 20, 50);
      doc.setFontSize(12);
      doc.text(`Name: ${String(passengerName || 'N/A')}`, 20, 60);
      
      // Add flight details
      doc.setFontSize(14);
      doc.text('Flight Details', 20, 75);
      doc.setFontSize(12);
      doc.text(`Airline: ${String(flight?.airline || 'N/A')}`, 20, 85);
      doc.text(`Flight Number: ${String(flight?.flightNumber || 'N/A')}`, 20, 95);
      doc.text(`From: ${String(flight?.from || 'N/A')}`, 20, 105);
      doc.text(`To: ${String(flight?.to || 'N/A')}`, 20, 115);
      doc.text(`Departure: ${formatDate(flight?.departureTime)} ${formatTime(flight?.departureTime)}`, 20, 125);
      doc.text(`Arrival: ${formatDate(flight?.arrivalTime)} ${formatTime(flight?.arrivalTime)}`, 20, 135);
      
      // Add barcode placeholder
      doc.setFontSize(14);
      doc.text('Scan at airport', 105, 160, { align: 'center' });
      doc.text(`${String(bookingId || 'N/A')}`, 105, 170, { align: 'center' });
      
      // Add footer
      doc.setFontSize(10);
      doc.text('Please arrive at the airport at least 2 hours before departure.', 105, 240, { align: 'center' });
      doc.text('Present this boarding pass at check-in counter.', 105, 245, { align: 'center' });
      
      // Save the PDF
      doc.save(`flyscape-ticket-${bookingId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleSendEmail = async (isInitial = false) => {
    if (!email) {
      alert('No email address available to send the ticket.');
      return;
    }
    
    if (!isInitial) {
      setIsSendingEmail(true);
    }
    
    try {
      // Generate a ticket PDF URL (in a real app)
      const pdfUrl = await generateTicketPDF({
        email,
        passengerName,
        flight,
        bookingId
      });
      
      // Send the email
      await sendTicketByEmail({
        email,
        passengerName,
        flight,
        bookingId,
        pdfUrl
      });
      
      setEmailSent(true);
      
      if (!isInitial) {
        alert('Boarding pass has been sent to your email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      if (!isInitial) {
        alert('Failed to send ticket by email. Please try again.');
      }
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  const handleShare = () => {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator.share({
        title: `Flight Ticket: ${flight.from} to ${flight.to}`,
        text: `Flight booking confirmation for ${passengerName}`,
      });
    } else {
      alert('Sharing functionality would be implemented here.');
    }
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <GradientText
          colors={["#10b981", "#6ee7b7", "#10b981"]}
          animationSpeed={5}
          className="text-3xl font-bold"
        >
          Booking Confirmed!
        </GradientText>
        <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
          Your flight has been booked successfully. Here's your ticket voucher.
        </p>
      </div>

      <SpotlightCard 
        className={`${
          isDark 
            ? 'bg-gray-800 border-gray-700 text-gray-100' 
            : 'bg-white border-emerald-100 text-gray-900'
        } rounded-xl shadow-lg border p-6`} 
        spotlightColor={isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)"} 
        spotlightSize={250}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-1`}>
              Flight Voucher
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
              Booking Reference: <span className="font-mono font-semibold">{bookingId}</span>
            </p>
          </div>
          {passengerNumber && totalPassengers && totalPassengers > 1 && (
            <div className={`mt-3 md:mt-0 px-3 py-1 ${
              isDark 
                ? 'bg-emerald-900/40 text-emerald-200' 
                : 'bg-emerald-100 text-emerald-800'
            } rounded-full text-sm font-medium`}>
              Passenger {passengerNumber} of {totalPassengers}
            </div>
          )}
        </div>

        <motion.div
          ref={voucherRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FaPlane className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-bold">Boarding Pass</h3>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80">Booking Reference</div>
                <div className="font-mono font-bold">{bookingId}</div>
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div className={`p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Passenger</div>
                <div className={`text-lg font-semibold flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FaUser className="h-4 w-4 mr-2 text-emerald-500" />
                  {passengerName}
                </div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Flight</div>
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{flight.airline} {flight.flightNumber}</div>
              </div>
            </div>

            <div className={`my-6 border-t border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} py-6`}>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-center mb-4 md:mb-0">
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatTime(flight.departureTime)}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(flight.departureTime)}</div>
                  <div className={`text-xl font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{flight.from}</div>
                </div>

                <div className="flex items-center justify-center w-full md:w-auto mb-4 md:mb-0">
                  <div className={`w-24 h-[2px] ${isDark ? 'bg-gray-600' : 'bg-gray-300'} hidden md:block`}></div>
                  <div className="mx-4">
                    <FaPlane className="h-8 w-8 text-emerald-500 transform rotate-90" />
                  </div>
                  <div className={`w-24 h-[2px] ${isDark ? 'bg-gray-600' : 'bg-gray-300'} hidden md:block`}></div>
                </div>

                <div className="text-center">
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatTime(flight.arrivalTime)}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(flight.arrivalTime)}</div>
                  <div className={`text-xl font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{flight.to}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Booking Date</div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(bookingDate)}</div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Class</div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Economy</div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gate</div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>--</div>
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-6 text-center`}>
            <FaBarcode className={`h-16 w-full ${isDark ? 'text-gray-300' : 'text-gray-800'}`} />
            <div className={`mt-2 font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{bookingId}</div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 flex flex-wrap justify-center gap-3`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-70"
          >
            {isDownloading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FaDownload className="mr-2" />
                Download PDF
              </>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendEmail()}
            disabled={isSendingEmail}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-70"
          >
            {isSendingEmail ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </>
            ) : emailSent ? (
              <>
                <FaCheck className="mr-2" />
                Resend Email
              </>
            ) : (
              <>
                <FaEnvelope className="mr-2" />
                Email Ticket
              </>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className={`flex items-center justify-center px-4 py-2 ${
              isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-700 hover:bg-gray-800'
            } text-white rounded-md transition-colors`}
          >
            <FaShareAlt className="mr-2" />
            Share
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBookAgain}
            className={`flex items-center justify-center px-4 py-2 ${
              isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-700 hover:bg-gray-800'
            } text-white rounded-md transition-colors`}
          >
            <FaPlane className="mr-2" />
            Book Again
          </motion.button>
        </div>
      </SpotlightCard>

      <div className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {emailSent ? (
          <p>A copy of this voucher has been sent to your email {email}.</p>
        ) : (
          <p>You can download or send this ticket to your email.</p>
        )}
        <p className="mt-2">Please arrive at the airport at least 2 hours before departure.</p>
      </div>
    </div>
  );
} 