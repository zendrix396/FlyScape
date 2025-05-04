import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlane, FaUser, FaBarcode, FaDownload, FaShareAlt, FaEnvelope, FaCheck } from 'react-icons/fa';
import GradientText from './GradientText';
import SpotlightCard from './SpotlightCard';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { sendTicketByEmail, generateTicketPDF } from '../services/emailService';
import { useNavigate } from 'react-router-dom';

export default function Voucher({ booking }) {
  const voucherRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  
  const { flight, passengerName, bookingId, bookingDate, email, passengerNumber, totalPassengers } = booking;
  
  // Send ticket by email on initial load
  useEffect(() => {
    if (email && !emailSent) {
      handleSendEmail(true);
    }
  }, []);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleDownload = async () => {
    if (!voucherRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Due to persistent issues with complex CSS, we'll use direct jsPDF text-based PDF generation
      // Create a simple PDF with basic text and some styling
      const pdf = new jsPDF();
      const margin = 15;
      let y = margin;
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      // Add a colored header
      pdf.setFillColor(16, 185, 129); // #10b981 emerald-600
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Add company logo/name on the colored header
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255); // White
      pdf.text('AeroVoyage', margin, 25);
      
      // Add a simple plane icon next to the company name
      // Draw a simple plane shape with lines
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(255, 255, 255);
      const planeX = margin + 120;
      const planeY = 25;
      
      // Plane body
      pdf.line(planeX, planeY, planeX + 15, planeY);
      // Nose
      pdf.line(planeX + 15, planeY, planeX + 20, planeY - 2);
      pdf.line(planeX + 20, planeY - 2, planeX + 15, planeY - 4);
      // Tail
      pdf.line(planeX, planeY, planeX - 5, planeY - 5);
      pdf.line(planeX - 5, planeY - 5, planeX, planeY - 3);
      // Wings
      pdf.line(planeX + 5, planeY, planeX + 3, planeY + 5);
      pdf.line(planeX + 3, planeY + 5, planeX + 10, planeY);
      pdf.line(planeX + 5, planeY, planeX + 3, planeY - 5);
      pdf.line(planeX + 3, planeY - 5, planeX + 10, planeY);
      
      // Start content below the colored header
      y = 50;
      
      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(17, 24, 39); // #111827 gray-900
      pdf.text('Boarding Pass', margin, y);
      y += 10;
      
      // Add booking reference in a box
      pdf.setFillColor(243, 244, 246); // #f3f4f6 gray-100
      pdf.roundedRect(pageWidth - margin - 80, y - 10, 80, 15, 3, 3, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // #6b7280 gray-500
      pdf.text('BOOKING REFERENCE', pageWidth - margin - 75, y - 4);
      pdf.setFontSize(12);
      pdf.setTextColor(17, 24, 39);
      pdf.text(bookingId, pageWidth - margin - 75, y + 2);
      
      y += 15;
      
      // Add horizontal line
      pdf.setDrawColor(229, 231, 235); // #e5e7eb gray-200
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 15;
      
      // Passenger info section
      pdf.setFillColor(16, 185, 129, 0.1); // Light emerald background
      pdf.roundedRect(margin, y - 5, pageWidth - (margin * 2), 20, 3, 3, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text('PASSENGER', margin + 5, y);
      
      pdf.setFontSize(14);
      pdf.setTextColor(17, 24, 39);
      pdf.text(passengerName, margin + 5, y + 10);
      
      y += 30;
      
      // Flight details section header
      pdf.setFontSize(14);
      pdf.setTextColor(16, 185, 129); // Emerald-600
      pdf.text('Flight Details', margin, y);
      y += 10;
      
      // Flight details
      pdf.setFontSize(12);
      pdf.setTextColor(17, 24, 39); // Gray-900
      pdf.text(`Flight: ${flight.airline} ${flight.flightNumber}`, margin, y);
      y += 15;
      
      // Create a table-like structure for departure and arrival
      const col1Width = (pageWidth - margin * 2) / 2 - 10;
      
      // Draw boxes for departure and arrival
      pdf.setFillColor(243, 244, 246); // #f3f4f6 gray-100
      pdf.roundedRect(margin, y - 5, col1Width, 40, 3, 3, 'F');
      pdf.roundedRect(margin + col1Width + 20, y - 5, col1Width, 40, 3, 3, 'F');
      
      // Add a plane icon between departure and arrival
      pdf.setDrawColor(16, 185, 129);
      pdf.setLineWidth(1);
      const midX = margin + col1Width + 10;
      const midY = y + 15;
      
      // Draw plane
      pdf.line(midX - 5, midY, midX + 5, midY);
      pdf.line(midX + 5, midY, midX + 8, midY - 2);
      pdf.line(midX - 5, midY, midX - 8, midY - 2);
      
      // Departure
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text('DEPARTURE', margin + 5, y);
      
      // Arrival
      pdf.text('ARRIVAL', margin + col1Width + 25, y);
      y += 5;
      
      // Departure time and location
      pdf.setFontSize(16);
      pdf.setTextColor(17, 24, 39); // Gray-900
      pdf.text(formatTime(flight.departureTime), margin + 5, y + 5);
      pdf.text(formatTime(flight.arrivalTime), margin + col1Width + 25, y + 5);
      
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text(formatDate(flight.departureTime), margin + 5, y + 12);
      pdf.text(formatDate(flight.arrivalTime), margin + col1Width + 25, y + 12);
      
      pdf.setFontSize(12);
      pdf.setTextColor(17, 24, 39); // Gray-900
      pdf.text(flight.from, margin + 5, y + 22);
      pdf.text(flight.to, margin + col1Width + 25, y + 22);
      
      y += 45;
      
      // Add details row
      const detailWidth = (pageWidth - (margin * 2) - 20) / 3;
      
      // Flight duration box
      pdf.setFillColor(243, 244, 246); // #f3f4f6 gray-100
      pdf.roundedRect(margin, y - 5, detailWidth, 30, 3, 3, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text('DURATION', margin + 5, y);
      
      pdf.setFontSize(12);
      pdf.setTextColor(17, 24, 39); // Gray-900
      const duration = typeof flight.duration === 'string' 
        ? flight.duration 
        : `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m`;
      pdf.text(duration, margin + 5, y + 10);
      
      // Class box
      pdf.setFillColor(243, 244, 246); // #f3f4f6 gray-100
      pdf.roundedRect(margin + detailWidth + 10, y - 5, detailWidth, 30, 3, 3, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text('CLASS', margin + detailWidth + 15, y);
      
      pdf.setFontSize(12);
      pdf.setTextColor(17, 24, 39); // Gray-900
      pdf.text('Economy', margin + detailWidth + 15, y + 10);
      
      // Gate box
      pdf.setFillColor(243, 244, 246); // #f3f4f6 gray-100
      pdf.roundedRect(margin + (detailWidth * 2) + 20, y - 5, detailWidth, 30, 3, 3, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text('GATE', margin + (detailWidth * 2) + 25, y);
      
      pdf.setFontSize(12);
      pdf.setTextColor(17, 24, 39); // Gray-900
      pdf.text('--', margin + (detailWidth * 2) + 25, y + 10);
      
      y += 40;
      
      // Barcode
      pdf.setFillColor(243, 244, 246); // #f3f4f6 gray-100
      pdf.rect(margin, y - 5, pageWidth - (margin * 2), 50, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text('BOOKING ID', margin + 5, y + 5);
      
      // Add fake barcode (just for visual representation)
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      const barcodeY = y + 10;
      const barcodeHeight = 25;
      const barcodeWidth = 120;
      const barcodeX = (pageWidth / 2) - (barcodeWidth / 2);
      
      // Draw series of vertical lines to simulate barcode
      for (let i = 0; i < barcodeWidth; i += 2) {
        if (Math.random() > 0.4) { // Random pattern for barcode
          const lineHeight = Math.random() * (barcodeHeight - 5) + 5;
          pdf.line(
            barcodeX + i, 
            barcodeY, 
            barcodeX + i, 
            barcodeY + lineHeight
          );
        }
      }
      
      // Booking ID text under barcode
      pdf.setFontSize(12);
      pdf.setTextColor(17, 24, 39); // Gray-900
      pdf.text(bookingId, barcodeX + (barcodeWidth / 2) - 20, barcodeY + barcodeHeight + 7);
      
      // Footer
      y = pageHeight - 30;
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text('Please arrive at the airport at least 2 hours before departure.', margin, y);
      y += 5;
      pdf.text(`This ticket was issued for ${email} on ${new Date().toLocaleDateString()}.`, margin, y);
      
      // AeroVoyage info at the bottom of the page
      pdf.setFillColor(16, 185, 129); // Emerald-600
      pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.text('AeroVoyage - Your journey begins with us.', margin, pageHeight - 3);
      
      // Save the PDF
      pdf.save(`AeroVoyage-Ticket-${bookingId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download ticket. Please try again later.');
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
        <p className="text-gray-500 mt-2">
          Your flight has been booked successfully. Here's your ticket voucher.
        </p>
      </div>

      <SpotlightCard className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6" spotlightColor="rgba(16, 185, 129, 0.2)">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Flight Voucher
            </h2>
            <p className="text-gray-500">
              Booking Reference: <span className="font-mono font-semibold">{bookingId}</span>
            </p>
          </div>
          {passengerNumber && totalPassengers && totalPassengers > 1 && (
            <div className="mt-3 md:mt-0 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
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
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500">Passenger</div>
                <div className="text-lg font-semibold flex items-center">
                  <FaUser className="h-4 w-4 mr-2 text-emerald-500" />
                  {passengerName}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Flight</div>
                <div className="text-lg font-semibold">{flight.airline} {flight.flightNumber}</div>
              </div>
            </div>

            <div className="my-6 border-t border-b border-gray-200 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-center mb-4 md:mb-0">
                  <div className="text-3xl font-bold">{formatTime(flight.departureTime)}</div>
                  <div className="text-sm text-gray-500">{formatDate(flight.departureTime)}</div>
                  <div className="text-xl font-semibold mt-2">{flight.from}</div>
                </div>

                <div className="flex items-center justify-center w-full md:w-auto mb-4 md:mb-0">
                  <div className="w-24 h-[2px] bg-gray-300 hidden md:block"></div>
                  <div className="mx-4">
                    <FaPlane className="h-8 w-8 text-emerald-500 transform rotate-90" />
                  </div>
                  <div className="w-24 h-[2px] bg-gray-300 hidden md:block"></div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold">{formatTime(flight.arrivalTime)}</div>
                  <div className="text-sm text-gray-500">{formatDate(flight.arrivalTime)}</div>
                  <div className="text-xl font-semibold mt-2">{flight.to}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Booking Date</div>
                <div className="font-semibold">{formatDate(bookingDate)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Class</div>
                <div className="font-semibold">Economy</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Gate</div>
                <div className="font-semibold">--</div>
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div className="bg-gray-100 p-6 text-center">
            <FaBarcode className="h-16 w-full" />
            <div className="mt-2 font-mono text-sm">{bookingId}</div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="bg-gray-50 p-4 flex flex-wrap justify-center gap-3">
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
            className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <FaShareAlt className="mr-2" />
            Share
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBookAgain}
            className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <FaPlane className="mr-2" />
            Book Again
          </motion.button>
        </div>
      </SpotlightCard>

      <div className="mt-6 text-center text-sm text-gray-500">
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