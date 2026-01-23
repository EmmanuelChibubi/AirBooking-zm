import { jsPDF } from 'jspdf';
import dayjs from 'dayjs';

/**
 * Generates and downloads a PDF ticket for a flight booking.
 * @param {Object} booking - The booking object containing flight and user details.
 */
export const downloadBookingPDF = (booking) => {
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
        title: `Ticket_${booking.flight.flight_number}`,
        subject: 'Flight Booking Confirmation',
        author: 'AirBooking System',
    });

    // Header
    doc.setFontSize(22);
    doc.setTextColor(25, 118, 210); // MUI Primary Blue
    doc.text('AirBooking - e-Ticket', 105, 20, { align: 'center' });

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 30, 190, 30);

    // Booking Details Section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Booking Confirmation', 20, 45);

    doc.setFontSize(12);
    doc.text(`Booking Reference: #${booking.id}`, 20, 55);
    doc.text(`Booking Time: ${dayjs(booking.booking_time).format('YYYY-MM-DD HH:mm')}`, 20, 62);
    doc.text(`Passenger: ${booking.user?.username || 'N/A'}`, 20, 69);

    // Flight Information Section
    doc.setDrawColor(25, 118, 210);
    doc.setFillColor(243, 246, 249);
    doc.rect(20, 80, 170, 60, 'FD');

    doc.setFontSize(14);
    doc.setTextColor(25, 118, 210);
    doc.text(`Flight: ${booking.flight.flight_number}`, 30, 90);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('From:', 30, 100);
    doc.text(booking.flight.departure_airport, 60, 100);
    doc.text('To:', 30, 107);
    doc.text(booking.flight.arrival_airport, 60, 107);

    doc.text('Departure:', 30, 117);
    doc.text(dayjs(booking.flight.departure_time).format('YYYY-MM-DD HH:mm'), 60, 117);
    doc.text('Arrival:', 30, 124);
    doc.text(dayjs(booking.flight.arrival_time).format('YYYY-MM-DD HH:mm'), 60, 124);

    // Seat Information
    doc.setFontSize(14);
    doc.setTextColor(25, 118, 210);
    doc.text('Seats Reserved:', 30, 150);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(booking.seats_reserved?.join(', ') || 'None', 70, 150);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for choosing AirBooking. Have a safe flight!', 105, 180, { align: 'center' });
    doc.text('This is a computer-generated document.', 105, 185, { align: 'center' });

    // Save the PDF
    doc.save(`AirBooking_Ticket_${booking.flight.flight_number}_${booking.id}.pdf`);
};
