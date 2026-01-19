import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyTrips = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8000/api/bookings/my-trips/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBookings(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchBookings();
    }, []);

    return (
        <div>
            <h2>My Trips</h2>
            {bookings.map(booking => (
                <div key={booking.id}>
                    <h3>Booking ID: {booking.id}</h3>
                    <p>Flight: {booking.flight}</p>
                    <p>Payment Status: {booking.payment_status}</p>
                </div>
            ))}
        </div>
    );
};

export default MyTrips;
