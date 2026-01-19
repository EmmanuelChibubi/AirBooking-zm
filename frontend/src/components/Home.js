import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Welcome to Air Booking
                </Typography>
                <Typography variant="h6" color="textSecondary" paragraph>
                    Book your flights easily and conveniently. Find the best deals and explore destinations around the world.
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => navigate('/flights')}
                    >
                        Browse Flights
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Home;
