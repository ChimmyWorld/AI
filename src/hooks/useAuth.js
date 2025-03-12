import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, getCurrentUser } from '../api';
import { Alert } from 'react-native';

// Create Auth Context
const AuthContext = createContext(null);

// Provider component that wraps the app and makes auth available to any child component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token and user data from AsyncStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const { token, user } = await loginUser(credentials);
      
      // Store token and user data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Set user in state
      setUser(user);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      Alert.alert('Login Failed', err.response?.data?.message || 'Failed to login');
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const { token, user } = await registerUser(userData);
      
      // Store token and user data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Set user in state
      setUser(user);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
      Alert.alert('Registration Failed', err.response?.data?.message || 'Failed to register');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Remove token and user data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Clear user from state
      setUser(null);
      
      return true;
    } catch (err) {
      console.error('Failed to logout:', err);
      return false;
    }
  };

  // Check if user is logged in
  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        register, 
        isAuthenticated, 
        loading, 
        error 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for components to get auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
