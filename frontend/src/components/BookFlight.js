import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Button, Card, CardContent, Grid } from '@mui/material';
import { useAuth } from '../AuthContext';
import dayjs from 'dayjs';
import DownloadIcon from '@mui/icons-material/Download';
import { downloadBookingPDF } from '../utils/pdfGenerator';

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
    const [bookedData, setBookedData] = useState(null);

    useEffect(() => {
        const fetchDetails = async (retryWithoutToken = false) => {
            try {
                const token = retryWithoutToken ? null : localStorage.getItem('access_token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const flightRes = await axios.get(`http://127.0.0.1:8000/api/flights/${flightId}/`, {
                    headers: headers,
                });
                setFlight(flightRes.data);

                const occupiedSeatsRes = await axios.get(`http://127.0.0.1:8000/api/flights/${flightId}/occupied-seats/`, {
                    headers: headers,
                });
                setOccupiedSeats(occupiedSeatsRes.data);

            } catch (err) {
                if (err.response?.status === 401 && !retryWithoutToken) {
                    console.warn("Fetch details failed with 401, retrying without token...");
                    return fetchDetails(true);
                }
                console.error('Fetch flight details/occupied seats error:', err);
                setError(`Failed to fetch flight details or occupied seats: ${err.response?.data?.detail || err.message}. Check if server is running at 127.0.0.1:8000`);
            } finally {
                if (!retryWithoutToken) {
                    setLoading(false);
                }
            }
        };

        fetchDetails();
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
            const res = await axios.post('http://127.0.0.1:8000/api/bookings/',
                { flight_id: flightId, payment_status: 'paid', seats_reserved: selectedSeats }, // Simulate payment as 'paid'
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setBookingSuccess('Flight booked successfully! You can now download your e-ticket below.');
            setBookedData(res.data);
            console.log('Booking successful:', res.data);
            // Removed auto-redirect to allow downloading the ticket
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
        <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Paper elevation={0} className="glass-panel" sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 4 }}>
                <Typography component="h1" variant="h4" mb={1} sx={{ color: 'primary.main', fontWeight: 800 }}>
                    Book Your Journey
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" mb={3}>
                    Flight {flight.flight_number} • {flight.departure_airport} to {flight.arrival_airport}
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={8}>
                        <Card variant="outlined" className="glass-card" sx={{ height: '100%', borderRadius: 4 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6" color="primary">Itinerary</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {flight.status === 'on_time' && <Box className="pulse-dot" />}
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                            {flight.status.replace(/_/g, ' ').toUpperCase()}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={5}>
                                        <Typography variant="caption" color="text.secondary">Departure</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{dayjs(flight.departure_time).format('HH:mm')}</Typography>
                                        <Typography variant="caption">{dayjs(flight.departure_time).format('MMM DD, YYYY')}</Typography>
                                    </Grid>
                                    <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box sx={{ width: '100%', borderBottom: '2px dashed #ccc' }} />
                                    </Grid>
                                    <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" color="text.secondary">Arrival</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{dayjs(flight.arrival_time).format('HH:mm')}</Typography>
                                        <Typography variant="caption">{dayjs(flight.arrival_time).format('MMM DD, YYYY')}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined" className="glass-card" sx={{ height: '100%', borderRadius: 4, background: 'linear-gradient(135deg, #0A192F 0%, #172A45 100%) !important', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>Destination Info</Typography>
                                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="h3">☀️</Typography>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>28°C</Typography>
                                        <Typography variant="caption">Sunny at {flight.arrival_airport.split(' ').slice(-2, -1)}</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                                    Expect clear skies for your arrival. Perfect travel weather!
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ my: 3, width: '100%', p: 3, bgcolor: 'background.default', borderRadius: 4 }}>
                    <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>Cabin Seat Selection</Typography>
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
                    color="secondary"
                    fullWidth
                    size="large"
                    onClick={handleBookFlight}
                    disabled={bookingLoading || selectedSeats.length === 0}
                    sx={{ mt: 2, py: 2, fontSize: '1.1rem', boxShadow: '0 8px 16px rgba(255,215,0,0.2)' }}
                >
                    {bookingLoading ? <CircularProgress size={24} color="inherit" /> : `Confirm & Pay $${totalPrice}`}
                </Button>
                {bookingSuccess && (
                    <Alert
                        severity="success"
                        sx={{ mt: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => downloadBookingPDF(bookedData)}
                                sx={{ mt: 1 }}
                            >
                                Download Ticket (PDF)
                            </Button>
                        }
                    >
                        {bookingSuccess}
                    </Alert>
                )}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Paper>
        </Container>
    );
};

export default BookFlight;
