import React, { createContext, useState, useEffect } from 'react';
import { api, authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('token', access);
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      
      // Redirect based on user role
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      
      toast.success('Login successful');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      toast.success('Registration successful. Please login.');
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different types of error responses
      if (error.response?.data) {
        // If there are field-specific errors, display them
        const errorData = error.response.data;
        if (typeof errorData === 'object' && !Array.isArray(errorData)) {
          // Handle field-specific validation errors
          Object.keys(errorData).forEach(field => {
            const errorMessages = errorData[field];
            if (Array.isArray(errorMessages)) {
              errorMessages.forEach(message => {
                toast.error(`${field}: ${message}`);
              });
            } else if (typeof errorMessages === 'string') {
              toast.error(`${field}: ${errorMessages}`);
            }
          });
        } else {
          // Handle general error message
          toast.error(error.response.data.message || 'Registration failed');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
      
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUserData
  };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};