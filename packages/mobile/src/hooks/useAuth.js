import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import AuthService from '../services/auth';
import UserService from '../services/users';

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
        // Check if token exists
        const isAuth = await AuthService.isAuthenticated();
        
        if (isAuth) {
          // Get current user data from API
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
        // If token is invalid, clear it
        await AuthService.logout();
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
      const response = await AuthService.login(credentials);
      
      // Set user in state
      setUser(response.user);
      
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to login';
      setError(errorMessage);
      Alert.alert('Login Failed', errorMessage);
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await AuthService.register(userData);
      
      // Login after registration
      if (response) {
        return await login({
          email: userData.email,
          password: userData.password
        });
      }
      
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to register';
      setError(errorMessage);
      Alert.alert('Registration Failed', errorMessage);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AuthService.logout();
      
      // Clear user from state
      setUser(null);
      
      return true;
    } catch (err) {
      console.error('Failed to logout:', err);
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const updatedUser = await UserService.updateProfile(profileData);
      
      // Update user in state
      setUser(prev => ({ ...prev, ...updatedUser }));
      
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      Alert.alert('Update Failed', errorMessage);
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
        register, 
        logout, 
        updateProfile,
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
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
