import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          console.warn("Token expired, logging out...");
          logout();
          return;
        }

        // Assuming your decoded token has a 'username' and 'is_admin' field
        const currentUser = {
          id: decodedToken.user_id,
          username: decodedToken.username, // Adjust based on your token payload
          isAdmin: decodedToken.is_admin || false, // Adjust based on your token payload
          // You might also want to include approval_status here if available in the token
        };
        setUser(currentUser);
        setIsAuthenticated(true);
        setIsAdmin(currentUser.isAdmin);
      } catch (error) {
        console.error("Failed to decode token:", error);
        logout(); // Token is invalid, log out
      }
    }
  }, []);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    try {
      const decodedToken = jwtDecode(accessToken);
      const currentUser = {
        id: decodedToken.user_id,
        username: decodedToken.username, // Adjust based on your token payload
        isAdmin: decodedToken.is_admin || false, // Adjust based on your token payload
      };
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsAdmin(currentUser.isAdmin);
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // Axios Interceptor to handle 401 errors globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("Unauthorized request detected, logging out...");
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
