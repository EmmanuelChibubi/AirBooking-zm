import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const { username, email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await axios.post('http://localhost:8000/api/auth/register/', {
                username,
                email,
                password,
            });
            setSuccess('Registration successful! Please log in.');
            console.log(res.data);
            navigate('/login');
        } catch (err) {
            console.error(err.response.data);
            if (err.response && err.response.data) {
                const errorMessages = Object.values(err.response.data).flat();
                setError(errorMessages.join(' '));
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Register
                </Typography>
                <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={onChange}
                        error={!!error && error.includes('username')}
                        helperText={error.includes('username') ? error : ''}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={onChange}
                        error={!!error && error.includes('email')}
                        helperText={error.includes('email') ? error : ''}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={onChange}
                        error={!!error && error.includes('password')}
                        helperText={error.includes('password') ? error : ''}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                    </Button>
                    {error && !error.includes('username') && !error.includes('email') && !error.includes('password') && (
                        <Alert severity="error">{error}</Alert>
                    )}
                    {success && <Alert severity="success">{success}</Alert>}
                </Box>
            </Box>
        </Container>
    );
};

export default Register;