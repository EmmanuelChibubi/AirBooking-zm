import { AppBar, Toolbar, Typography, Button, Container, Box, Tooltip, Avatar } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          zIndex: 1100,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.03)'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', py: 0.8 }}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                gap: 1.5
              }}
            >
              <Box
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'primary.main',
                  p: 1.2,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 4px 15px rgba(255,215,0,0.4)',
                  transform: 'rotate(-45deg)',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'rotate(0deg)' }
                }}
              >
                <FlightTakeoffIcon fontSize="medium" />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  color: 'primary.main',
                  fontSize: '1.6rem',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                AirBooking
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isAuthenticated ? (
                <>
                  <Tooltip title="Book New Flight">
                    <Button
                      color="primary"
                      component={Link}
                      to="/flights"
                      startIcon={<SearchIcon />}
                      sx={{ fontWeight: 800, px: 2, borderRadius: 2 }}
                    >
                      Flights
                    </Button>
                  </Tooltip>
                  <Tooltip title="View Your Booking History">
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to="/my-bookings"
                      startIcon={<HistoryIcon />}
                      sx={{
                        fontWeight: 800,
                        px: 2.5,
                        borderRadius: 3,
                        ml: 1,
                        boxShadow: '0 4px 12px rgba(10,25,47,0.2)'
                      }}
                    >
                      My History
                    </Button>
                  </Tooltip>
                  {isAdmin && (
                    <Button variant="soft" color="secondary" component={Link} to="/admin" size="small" sx={{ ml: 1, fontWeight: 700 }}>Admin</Button>
                  )}
                  <Box sx={{ ml: 2, pl: 2, borderLeft: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', lineHeight: 1 }}>
                        Logged in as
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {user?.username}
                      </Typography>
                    </Box>
                    <Tooltip title={`Profile: ${user?.username}`}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: 'primary.main',
                          color: 'secondary.main',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {user?.username?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                    <Tooltip title="Logout">
                      <Button
                        color="error"
                        size="small"
                        onClick={handleLogout}
                        sx={{ minWidth: 0, p: 1, opacity: 0.6, '&:hover': { opacity: 1 } }}
                      >
                        <PersonIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                  </Box>
                </>
              ) : (
                <>
                  <Button color="primary" component={Link} to="/login" sx={{ fontWeight: 800 }}>Login</Button>
                  <Button variant="contained" color="primary" component={Link} to="/register" sx={{ borderRadius: 3, px: 4, fontWeight: 800 }}>
                    Join Now
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;