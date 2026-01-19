import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Paper, Card, CardContent } from '@mui/material';
import dayjs from 'dayjs';
import { useAuth } from '../AuthContext';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        const fetchBookings = async () => {
            if (!isAuthenticated) {
                setError('Please log in to view your bookings.');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('access_token');
                const res = await axios.get('http://localhost:8000/api/bookings/my-trips/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBookings(res.data);
            } catch (err) {
                console.error(err.response?.data);
                setError('Failed to fetch bookings. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [isAuthenticated, user]);

    if (loading) {
        return (
            <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
                <Box display="flex" justifyContent="center"><CircularProgress /></Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" mb={3}>
                    My Bookings
                </Typography>
                {bookings.length === 0 ? (
                    <Typography variant="body1">You have no bookings yet.</Typography>
                ) : (
                    <Grid container spacing={2} sx={{ width: '100%' }}>
                        {bookings.map((booking) => (
                            <Grid item xs={12} key={booking.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            Flight: {booking.flight.flight_number}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            From: {booking.flight.departure_airport} to {booking.flight.arrival_airport}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Departure: {dayjs(booking.flight.departure_time).format('YYYY-MM-DD HH:mm')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Booking Time: {dayjs(booking.booking_time).format('YYYY-MM-DD HH:mm')}
                                        </Typography>
                                        {booking.seats_reserved && booking.seats_reserved.length > 0 && (
                                            <Typography variant="body2" color="text.secondary">
                                                Seats Reserved: {booking.seats_reserved.join(', ')}
                                            </Typography>
                                        )}
                                        <Typography variant="body2">
                                            Payment Status: {booking.payment_status.toUpperCase()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Paper>
        </Container>
    );
};

export default MyBookings;