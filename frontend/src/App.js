import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './Layout'; // Import the new Layout component
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Flights from './components/Flights';
import BookFlight from './components/BookFlight';
import MyBookings from './components/MyBookings';
import AdminDashboard from './components/AdminDashboard';
import { AuthProvider } from './AuthContext';

// Define a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A shade of blue
    },
    secondary: {
      main: '#dc004e', // A shade of red
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS and apply basic Material-UI styles */}
      <AuthProvider> {/* Wrap the entire application with the AuthProvider component */}
        <Router>
          <Layout> {/* Wrap the entire application with the Layout component */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/flights" element={<Flights />} />
              <Route path="/book-flight/:flightId" element={<BookFlight />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/admin" element={<AdminDashboard />} /> {/* New: Admin Dashboard Route */}
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;