import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container, Typography, Box, CircularProgress, Alert, Paper, Button,
    Table, TableContainer, TableHead, TableRow, TableCell, TableBody,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    Grid
} from '@mui/material';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'; // Changed DatePicker to DateTimePicker
import dayjs from 'dayjs';

const AdminDashboard = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [pendingUsers, setPendingUsers] = useState([]);
    const [flights, setFlights] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingFlights, setLoadingFlights] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // State for new flight dialog
    const [openAddFlightDialog, setOpenAddFlightDialog] = useState(false);
    const [newFlightData, setNewFlightData] = useState({
        flight_number: '',
        departure_airport: '',
        arrival_airport: '',
        departure_time: dayjs(),
        arrival_time: dayjs(),
        price: '',
        available_seats: '',
        status: 'on_time',
    });

    // Effect for authorization check
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (!isAdmin) {
            navigate('/'); // Redirect non-admins
        }
    }, [isAuthenticated, isAdmin, navigate]);

    // Fetch Pending Users
    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            const fetchPendingUsers = async () => {
                setLoadingUsers(true);
                try {
                    const token = localStorage.getItem('access_token');
                    const res = await axios.get('http://localhost:8000/api/admin/users/pending/', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setPendingUsers(res.data);
                } catch (err) {
                    console.error(err.response?.data);
                    setError('Failed to fetch pending users.');
                } finally {
                    setLoadingUsers(false);
                }
            };
            fetchPendingUsers();
        }
    }, [isAuthenticated, isAdmin]);

    // Fetch Flights
    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            const fetchFlights = async () => {
                setLoadingFlights(true);
                try {
                    const token = localStorage.getItem('access_token');
                    const res = await axios.get('http://localhost:8000/api/admin/flights/', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setFlights(res.data);
                } catch (err) {
                    console.error(err.response?.data);
                    setError('Failed to fetch flights.');
                } finally {
                    setLoadingFlights(false);
                }
            };
            fetchFlights();
        }
    }, [isAuthenticated, isAdmin]);

    const handleApproveUser = async (userId) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(
                `http://localhost:8000/api/admin/users/${userId}/approve/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setSuccessMessage('User approved successfully!');
            setPendingUsers(pendingUsers.filter((user) => user.id !== userId)); // Remove from pending list
            // Optionally, re-fetch all users to ensure consistency if needed
        } catch (err) {
            console.error(err.response?.data);
            setError('Failed to approve user.');
        }
    };

    const handleRejectUser = async (userId) => {
        // This functionality needs a backend endpoint. Assuming one exists or can be created.
        // For now, we'll just filter from the list and show a success message
        try {
            // await axios.post(`http://localhost:8000/api/admin/users/${userId}/reject/`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setSuccessMessage('User rejected successfully! (Backend endpoint needs implementation)');
            setPendingUsers(pendingUsers.filter((user) => user.id !== userId));
        } catch (err) {
            console.error(err.response?.data);
            setError('Failed to reject user.');
        }
    };

    const handleOpenAddFlightDialog = () => {
        setOpenAddFlightDialog(true);
    };

    const handleCloseAddFlightDialog = () => {
        setOpenAddFlightDialog(false);
        setNewFlightData({
            flight_number: '',
            departure_airport: '',
            arrival_airport: '',
            departure_time: dayjs(),
            arrival_time: dayjs(),
            price: '',
            available_seats: '',
            status: 'on_time',
        });
    };

    const handleNewFlightChange = (e) => {
        setNewFlightData({ ...newFlightData, [e.target.name]: e.target.value });
    };

    const handleNewFlightDateChange = (name, date) => {
        setNewFlightData({ ...newFlightData, [name]: date });
    };

    const handleAddFlight = async () => {
        try {
            const token = localStorage.getItem('access_token');
            // Format dates for backend (ISO 8601 string)
            const formattedData = {
                ...newFlightData,
                departure_time: newFlightData.departure_time.toISOString(),
                arrival_time: newFlightData.arrival_time.toISOString(),
                price: parseFloat(newFlightData.price),
                available_seats: parseInt(newFlightData.available_seats),
            };
            await axios.post('http://localhost:8000/api/admin/flights/', formattedData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccessMessage('Flight added successfully!');
            handleCloseAddFlightDialog();
            // Re-fetch flights to update the list
            const res = await axios.get('http://localhost:8000/api/admin/flights/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFlights(res.data);
        } catch (err) {
            console.error(err.response?.data);
            setError('Failed to add flight.');
        }
    };

    if (!isAuthenticated || !isAdmin) {
        return (
            <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">Access Denied. You must be an admin to view this page.</Alert>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 4 }}>
            <Typography component="h1" variant="h4" mb={3}>
                Admin Dashboard
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

            <Grid container spacing={4}>
                {/* Pending Users Section */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h5" mb={2}>Pending Users</Typography>
                        {loadingUsers ? (
                            <Box display="flex" justifyContent="center"><CircularProgress /></Box>
                        ) : pendingUsers.length === 0 ? (
                            <Alert severity="info">No pending users.</Alert>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Username</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pendingUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.id}</TableCell>
                                                <TableCell>{user.username}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleApproveUser(user.id)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleRejectUser(user.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>

                {/* Flight Management Section */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h5">Flight Management</Typography>
                            <Button variant="contained" onClick={handleOpenAddFlightDialog}>
                                Add New Flight
                            </Button>
                        </Box>
                        {loadingFlights ? (
                            <Box display="flex" justifyContent="center"><CircularProgress /></Box>
                        ) : flights.length === 0 ? (
                            <Alert severity="info">No flights found.</Alert>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Flight No.</TableCell>
                                            <TableCell>Route</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {flights.map((flight) => (
                                            <TableRow key={flight.id}>
                                                <TableCell>{flight.flight_number}</TableCell>
                                                <TableCell>{flight.departure_airport} - {flight.arrival_airport}</TableCell>
                                                <TableCell>{flight.status.replace(/_/g, ' ')}</TableCell>
                                                <TableCell align="right">
                                                    <Button variant="outlined" size="small" sx={{ mr: 1 }}>Edit</Button>
                                                    <Button variant="outlined" color="error" size="small">Delete</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Add Flight Dialog */}
            <Dialog open={openAddFlightDialog} onClose={handleCloseAddFlightDialog}>
                <DialogTitle>Add New Flight</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Flight Number"
                                name="flight_number"
                                value={newFlightData.flight_number}
                                onChange={handleNewFlightChange}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Departure Airport"
                                name="departure_airport"
                                value={newFlightData.departure_airport}
                                onChange={handleNewFlightChange}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Arrival Airport"
                                name="arrival_airport"
                                value={newFlightData.arrival_airport}
                                onChange={handleNewFlightChange}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker // Changed DatePicker to DateTimePicker
                                    label="Departure Time"
                                    value={newFlightData.departure_time}
                                    onChange={(date) => handleNewFlightDateChange('departure_time', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker // Changed DatePicker to DateTimePicker
                                    label="Arrival Time"
                                    value={newFlightData.arrival_time}
                                    onChange={(date) => handleNewFlightDateChange('arrival_time', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Price"
                                name="price"
                                type="number"
                                value={newFlightData.price}
                                onChange={handleNewFlightChange}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Available Seats"
                                name="available_seats"
                                type="number"
                                value={newFlightData.available_seats}
                                onChange={handleNewFlightChange}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Status"
                                name="status"
                                value={newFlightData.status}
                                onChange={handleNewFlightChange}
                                margin="normal"
                            >
                                <MenuItem value="on_time">On Time</MenuItem>
                                <MenuItem value="delayed">Delayed</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddFlightDialog}>Cancel</Button>
                    <Button onClick={handleAddFlight} variant="contained" color="primary">Add Flight</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;