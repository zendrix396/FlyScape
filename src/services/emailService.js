// Email service using EmailJS (you'd need to add this dependency)
// npm install emailjs-com

import emailjs from 'emailjs-com';

// Initialize with your EmailJS user ID
// Replace these with your actual EmailJS credentials
const USER_ID = 'YOUR_USER_ID'; 
const SERVICE_ID = 'YOUR_SERVICE_ID';
const TICKET_TEMPLATE_ID = 'ticket_template';

/**
 * Sends a flight ticket via email
 * @param {Object} ticketData - The ticket data
 * @param {string} ticketData.email - Recipient email
 * @param {string} ticketData.passengerName - Passenger name
 * @param {Object} ticketData.flight - Flight details
 * @param {string} ticketData.bookingId - Booking reference
 * @param {string} ticketData.pdfUrl - Optional URL to the PDF ticket (if generated)
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendTicketByEmail = async (ticketData) => {
  try {
    const { email, passengerName, flight, bookingId, pdfUrl } = ticketData;
    
    const templateParams = {
      to_email: email,
      to_name: passengerName,
      flight_number: flight.flightNumber,
      airline: flight.airline,
      from_city: flight.from,
      to_city: flight.to,
      departure_time: new Date(flight.departureTime).toLocaleString(),
      arrival_time: new Date(flight.arrivalTime).toLocaleString(),
      booking_reference: bookingId,
      ticket_url: pdfUrl || 'Not available',
    };
    
    // Comment this out if you don't have EmailJS configured yet
    // const response = await emailjs.send(SERVICE_ID, TICKET_TEMPLATE_ID, templateParams, USER_ID);
    // return response;
    
    // For demonstration, log what would be sent
    console.log('Would send email with:', templateParams);
    return { status: 200, text: 'Email would be sent (demo mode)' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Generate a ticket PDF
 * @param {Object} ticketData - Same as sendTicketByEmail
 * @returns {Promise<string>} - Promise resolving to the PDF URL
 */
export const generateTicketPDF = async (ticketData) => {
  try {
    // In a real implementation, you would use a library like jsPDF or
    // a server-side service to generate and store the PDF
    
    console.log('Would generate PDF for:', ticketData);
    
    // For demonstration, return a mock URL
    return 'https://example.com/tickets/ticket-' + ticketData.bookingId + '.pdf';
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate ticket PDF');
  }
}; 