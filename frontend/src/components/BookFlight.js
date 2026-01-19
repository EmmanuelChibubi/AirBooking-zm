import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Button, Card, CardContent, Grid } from '@mui/material';
import { useAuth } from '../AuthContext';
import dayjs from 'dayjs';

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F']; // Example seat rows

const BookFlight = () => {
    const { flightId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [flight, setFlight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [occupiedSeats, setOccupiedSeats] = useState([]);

    useEffect(() => {
        const fetchFlightDetails = async () => {
            if (!isAuthenticated) {
                setError('Please log in to book flights.');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('access_token');
                const flightRes = await axios.get(`http://localhost:8000/api/flights/${flightId}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setFlight(flightRes.data);

                const occupiedSeatsRes = await axios.get(`http://localhost:8000/api/flights/${flightId}/occupied-seats/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setOccupiedSeats(occupiedSeatsRes.data);

            } catch (err) {
                console.error(err.response?.data);
                setError('Failed to fetch flight details or occupied seats. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchFlightDetails();
    }, [flightId, isAuthenticated]);

    const handleSeatClick = (seatNumber) => {
        if (occupiedSeats.includes(seatNumber)) {
            return; // Cannot select occupied seats
        }
        setSelectedSeats(prevSelected =>
            prevSelected.includes(seatNumber)
                ? prevSelected.filter(seat => seat !== seatNumber)
                : [...prevSelected, seatNumber].sort()
        );
    };

    const handleBookFlight = async () => {
        if (!isAuthenticated) {
            setError('You must be logged in to book a flight.');
            return;
        }
        if (selectedSeats.length === 0) {
            setError('Please select at least one seat.');
            return;
        }
        setBookingLoading(true);
        setError('');
        setBookingSuccess('');
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post('http://localhost:8000/api/bookings/',
                { flight_id: flightId, payment_status: 'paid', seats_reserved: selectedSeats }, // Simulate payment as 'paid'
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setBookingSuccess('Flight booked successfully! Redirecting to your bookings...');
            console.log('Booking successful:', res.data);
            setTimeout(() => {
                navigate('/my-bookings');
            }, 2000); // Redirect after 2 seconds
        } catch (err) {
            console.error(err.response?.data);
            setError(err.response?.data?.error || 'Failed to book flight. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

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

    if (!flight) {
        return (
            <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="warning">Flight not found.</Alert>
            </Container>
        );
    }

    const generateSeats = () => {
        const seats = [];
        const numRows = Math.ceil(flight.total_seats / SEAT_ROWS.length);
        for (let i = 1; i <= numRows; i++) {
            SEAT_ROWS.forEach(rowLetter => {
                const seatNumber = `${i}${rowLetter}`;
                // Only add seats up to total_seats
                if (seats.length < flight.total_seats) {
                    seats.push(seatNumber);
                }
            });
        }
        return seats;
    };

    const allSeats = generateSeats();
    const totalPrice = (selectedSeats.length * flight.price).toFixed(2);

    return (
        <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" mb={3}>
                    Book Flight: {flight.flight_number}
                </Typography>
                <Card variant="outlined" sx={{ width: '100%', mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" component="div">
                            {flight.departure_airport} to {flight.arrival_airport}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Depart: {dayjs(flight.departure_time).format('YYYY-MM-DD HH:mm')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Arrive: {dayjs(flight.arrival_time).format('YYYY-MM-DD HH:mm')}
                        </Typography>
                        <Typography variant="h6" color="primary" mt={1}>
                            Price per seat: ${flight.price}
                        </Typography>
                        <Typography variant="body2">
                            Available Seats: {flight.available_seats} / {flight.total_seats}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Status: {flight.status.replace(/_/g, ' ').toUpperCase()}
                        </Typography>
                    </CardContent>
                </Card>

                <Box sx={{ my: 3, width: '100%' }}>
                    <Typography variant="h6" gutterBottom>Select Your Seats</Typography>
                    <Grid container spacing={1} justifyContent="center">
                        {allSeats.map(seatNumber => {
                            const isOccupied = occupiedSeats.includes(seatNumber);
                            const isSelected = selectedSeats.includes(seatNumber);
                            return (
                                <Grid item key={seatNumber}>
                                    <Button
                                        variant={isSelected ? 'contained' : 'outlined'}
                                        color={isOccupied ? 'error' : 'primary'}
                                        disabled={isOccupied}
                                        onClick={() => handleSeatClick(seatNumber)}
                                        sx={{ minWidth: '40px', padding: '5px 0' }}
                                    >
                                        {seatNumber}
                                    </Button>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>

                <Box sx={{ my: 3, width: '100%', textAlign: 'center' }}>
                    <Typography variant="h6">Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</Typography>
                    <Typography variant="h6">Total Price: ${totalPrice}</Typography>
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleBookFlight}
                    disabled={bookingLoading || selectedSeats.length === 0}
                    sx={{ mt: 2 }}
                >
                    {bookingLoading ? <CircularProgress size={24} color="inherit" /> : `Confirm Booking & Pay ($${totalPrice})`}
                </Button>
                {bookingSuccess && <Alert severity="success" sx={{ mt: 2 }}>{bookingSuccess}</Alert>}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Paper>
        </Container>
    );
};

export default BookFlight;
