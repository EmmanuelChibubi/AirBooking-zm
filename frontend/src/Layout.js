import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <FlightIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Button color="inherit" component={Link} to="/">AirBooking</Button>
          </Typography>
          {isAuthenticated ? (
            <>
              <Typography variant="subtitle1" color="inherit" sx={{ mr: 2 }}>
                Welcome, {user?.username}
              </Typography>
              <Button color="inherit" component={Link} to="/flights">Flights</Button>
              <Button color="inherit" component={Link} to="/my-bookings">My Bookings</Button>
              {isAdmin && ( // Show admin link only to admin users
                <Button color="inherit" component={Link} to="/admin">Admin</Button>
              )}
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/register">Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout;