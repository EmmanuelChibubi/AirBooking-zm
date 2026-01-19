import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Select, MenuItem, InputLabel, FormControl, Button, Container, Typography, Box, CircularProgress, Alert, Grid, Paper, Card, CardContent } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Flights = () => {
    const [flights, setFlights] = useState([]);
    const [airports, setAirports] = useState([]);
    const [allFlights, setAllFlights] = useState([]);
    const [formData, setFormData] = useState({
        departure_airport: '',
        arrival_airport: '',
        departure_date: null,
        flight_number: '',
        min_price: '',
        max_price: '',
        start_date: null,
        end_date: null,
        sort_by: '',
        sort_order: 'asc',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [noFlightsFound, setNoFlightsFound] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchAirports = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/airports/');
                setAirports(res.data);
            } catch (err) {
                console.error('Failed to fetch airports:', err);
            }
        };

        const fetchAllFlights = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/all-flights/');
                setAllFlights(res.data);
            } catch (err) {
                console.error('Failed to fetch all flights:', err);
            }
        };

        fetchAirports();
        fetchAllFlights();
    }, []);

    const {
        departure_airport,
        arrival_airport,
        departure_date,
        flight_number,
        min_price,
        max_price,
        start_date,
        end_date,
        sort_by,
        sort_order,
    } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleDateChange = (name, date) => {
        setFormData({ ...formData, [name]: date });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setFlights([]);
        setNoFlightsFound(false);

        if (!isAuthenticated) {
            setError('Please log in to search for flights.');
            setLoading(false);
            return;
        }

        const params = {
            departure_airport,
            arrival_airport,
            departure_date: departure_date ? dayjs(departure_date).format('YYYY-MM-DD') : '',
            flight_number,
            min_price,
            max_price,
            start_date: start_date ? dayjs(start_date).format('YYYY-MM-DD') : '',
            end_date: end_date ? dayjs(end_date).format('YYYY-MM-DD') : '',
            sort_by,
            sort_order,
        };

        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('http://localhost:8000/api/flights/search/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            });
            setFlights(res.data);
            if (res.data.length === 0) {
                setNoFlightsFound(true);
            }
        } catch (err) {
            console.error(err.response?.data);
            setError('Failed to fetch flights. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" mb={3}>
                    Search Flights
                </Typography>
                <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="departure-airport-label">Departure Airport</InputLabel>
                                <Select
                                    labelId="departure-airport-label"
                                    id="departure_airport"
                                    name="departure_airport"
                                    value={departure_airport}
                                    onChange={onChange}
                                    label="Departure Airport"
                                >
                                    <MenuItem value="" sx={{ py: 1.5, px: 2 }}>Select Departure Airport</MenuItem>
                                    {airports.map((airport) => (
                                        <MenuItem key={airport} value={airport} sx={{ py: 1.5, px: 2 }}>{airport}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="arrival-airport-label">Arrival Airport</InputLabel>
                                <Select
                                    labelId="arrival-airport-label"
                                    id="arrival_airport"
                                    name="arrival_airport"
                                    value={arrival_airport}
                                    onChange={onChange}
                                    label="Arrival Airport"
                                >
                                    <MenuItem value="" sx={{ py: 1.5, px: 2 }}>Select Arrival Airport</MenuItem>
                                    {airports.map((airport) => (
                                        <MenuItem key={airport} value={airport} sx={{ py: 1.5, px: 2 }}>{airport}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="flight-number-label">Flight</InputLabel>
                                <Select
                                    labelId="flight-number-label"
                                    id="flight_number"
                                    name="flight_number"
                                    value={flight_number}
                                    onChange={onChange}
                                    label="Flight"
                                >
                                    <MenuItem value="" sx={{ py: 1.5, px: 2 }}>Select Flight</MenuItem>
                                    {allFlights.map((flight) => (
                                        <MenuItem key={flight.id} value={flight.flight_number} sx={{ py: 1.5, px: 2 }}>
                                            {flight.flight_number}: {flight.departure_airport} → {flight.arrival_airport}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Departure Date"
                                    value={departure_date}
                                    onChange={(date) => handleDateChange('departure_date', date)}
                                    renderInput={(params) => <TextField {...params} margin="normal" fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                fullWidth
                                id="min_price"
                                label="Min Price"
                                name="min_price"
                                type="number"
                                value={min_price}
                                onChange={onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="normal"
                                fullWidth
                                id="max_price"
                                label="Max Price"
                                name="max_price"
                                type="number"
                                value={max_price}
                                onChange={onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Start Date"
                                    value={start_date}
                                    onChange={(date) => handleDateChange('start_date', date)}
                                    renderInput={(params) => <TextField {...params} margin="normal" fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="End Date"
                                    value={end_date}
                                    onChange={(date) => handleDateChange('end_date', date)}
                                    renderInput={(params) => <TextField {...params} margin="normal" fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="sort-by-label">Sort By</InputLabel>
                                <Select
                                    labelId="sort-by-label"
                                    id="sort_by"
                                    name="sort_by"
                                    value={sort_by}
                                    onChange={onChange}
                                    label="Sort By"
                                >
                                    <MenuItem value="" sx={{ py: 1.5, px: 2 }}>Select Sort Option</MenuItem>
                                    <MenuItem value="price" sx={{ py: 1.5, px: 2 }}>Price</MenuItem>
                                    <MenuItem value="departure_time" sx={{ py: 1.5, px: 2 }}>Departure Time</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="sort-order-label">Sort Order</InputLabel>
                                <Select
                                    labelId="sort-order-label"
                                    id="sort_order"
                                    name="sort_order"
                                    value={sort_order}
                                    onChange={onChange}
                                    label="Sort Order"
                                >
                                    <MenuItem value="asc" sx={{ py: 1.5, px: 2 }}>Ascending</MenuItem>
                                    <MenuItem value="desc" sx={{ py: 1.5, px: 2 }}>Descending</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ width: '50%' }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Search Flights'}
                        </Button>
                    </Box>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </Box>

                <Box sx={{ mt: 4, width: '100%' }}>
                    {loading && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}
                    {!loading && noFlightsFound && (
                        <Alert severity="info">No flights found for your search criteria.</Alert>
                    )}
                    {!loading && flights.length > 0 && (
                        <Grid container spacing={2}>
                            {flights.map(flight => (
                                <Grid item xs={12} key={flight.id}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" component="div">
                                                {flight.flight_number}: {flight.departure_airport} to {flight.arrival_airport}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Depart: {dayjs(flight.departure_time).format('YYYY-MM-DD HH:mm')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Arrive: {dayjs(flight.arrival_time).format('YYYY-MM-DD HH:mm')}
                                            </Typography>
                                            <Typography variant="h6" color="primary" mt={1}>
                                                Price: ${flight.price}
                                            </Typography>
                                            <Typography variant="body2">
                                                Available Seats: {flight.available_seats}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Status: {flight.status.replace(/_/g, ' ').toUpperCase()}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                component={Link}
                                                to={`/book-flight/${flight.id}`}
                                                sx={{ mt: 2 }}
                                            >
                                                Book Now
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default Flights;