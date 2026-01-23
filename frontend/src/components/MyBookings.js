import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Paper, Card, CardContent } from '@mui/material';
import dayjs from 'dayjs';
import { useAuth } from '../AuthContext';
import { downloadBookingPDF } from '../utils/pdfGenerator';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

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
                const res = await axios.get('http://127.0.0.1:8000/api/bookings/my-trips/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBookings(res.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    // Handled by global interceptor
                    return;
                }
                console.error('Fetch bookings error:', err);
                setError(`Failed to fetch bookings: ${err.response?.data?.detail || err.message}. Check if server is running at 127.0.0.1:8000`);
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
        <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Paper elevation={0} className="glass-panel" sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 4 }}>
                <Typography component="h1" variant="h4" mb={1} sx={{ color: 'primary.main', fontWeight: 800 }}>
                    My Bookings
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" mb={4}>
                    View and manage your upcoming journeys
                </Typography>
                {bookings.length === 0 ? (
                    <Typography variant="body1">You have no bookings yet.</Typography>
                ) : (
                    <Grid container spacing={3} sx={{ width: '100%' }}>
                        {bookings.map((booking) => (
                            <Grid item xs={12} key={booking.id}>
                                <Card variant="outlined" className="glass-card" sx={{ borderRadius: 4, overflow: 'hidden', borderLeft: '6px solid #FFD700 !important' }}>
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
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.03)', p: 1.5, borderRadius: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                Total Paid: ${(booking.seats_reserved.length * booking.flight.price).toFixed(2)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ px: 1.5, py: 0.5, borderRadius: 10, bgcolor: 'success.main', color: 'white', fontWeight: 'bold' }}>
                                                {booking.payment_status.toUpperCase()}
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            onClick={() => downloadBookingPDF(booking)}
                                            sx={{ mt: 2 }}
                                        >
                                            Download Ticket (PDF)
                                        </Button>
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