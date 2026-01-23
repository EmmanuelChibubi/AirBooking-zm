import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg" sx={{ mt: 8 }}>
            <Box
                className="glass-panel"
                sx={{
                    py: 12,
                    px: 4,
                    textAlign: 'center',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
                }}
            >
                {/* Decorative background circle */}
                <Box sx={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
                    zIndex: 0
                }} />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography
                        variant="h2"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 900,
                            color: 'primary.main',
                            letterSpacing: '-1px',
                            lineHeight: 1.1,
                            fontSize: { xs: '2.5rem', md: '4rem' }
                        }}
                    >
                        The Future of <br />
                        <Box component="span" sx={{ color: 'secondary.main', textShadow: '0 4px 12px rgba(255,215,0,0.3)' }}>Luxury Travel</Box>
                    </Typography>
                    <Typography
                        variant="h6"
                        color="textSecondary"
                        paragraph
                        sx={{
                            maxWidth: '600px',
                            mx: 'auto',
                            mt: 3,
                            fontWeight: 400,
                            lineHeight: 1.6,
                            opacity: 0.8
                        }}
                    >
                        Experience Zambia like never before. Seamless booking,
                        premium cabins, and unmatched reliability.
                        Your journey begins with a single click.
                    </Typography>

                    <Box sx={{ mt: 6, display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => navigate('/flights')}
                            sx={{
                                px: 6,
                                py: 2,
                                borderRadius: 4,
                                fontSize: '1.1rem',
                                boxShadow: '0 10px 20px rgba(10,25,47,0.2)'
                            }}
                        >
                            Browse Flights
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{
                                px: 6,
                                py: 2,
                                borderRadius: 4,
                                fontSize: '1.1rem',
                                borderWidth: 2,
                                '&:hover': { borderWidth: 2 }
                            }}
                        >
                            Guest Access
                        </Button>
                    </Box>

                    <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center', gap: { xs: 4, md: 8 }, opacity: 0.6, flexWrap: 'wrap' }}>
                        <Typography variant="overline" sx={{ fontWeight: 'bold' }}>✈️ 500+ Routes</Typography>
                        <Typography variant="overline" sx={{ fontWeight: 'bold' }}>🛡️ Secured Booking</Typography>
                        <Typography variant="overline" sx={{ fontWeight: 'bold' }}>⭐ 24/7 Support</Typography>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default Home;
