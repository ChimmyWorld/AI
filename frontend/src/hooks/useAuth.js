import { create } from 'zustand';
import api from '../api'; // Use our configured API client

const useAuth = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth by checking localStorage and fetching profile
  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      
      if (!token) {
        set({ user: null, loading: false });
        return;
      }
      
      console.log('Initializing auth with token');
      const response = await api.get('/auth/profile');
      console.log('Profile data:', response.data);
      set({ user: response.data, loading: false });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Clear token if it's invalid
      localStorage.removeItem('token');
      set({ user: null, loading: false });
    }
  },

  login: async (username, password) => {
    try {
      set({ loading: true, error: null });
      console.log('Attempting login for user:', username);
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ user, loading: false });
      console.log('Login successful for user:', user.username);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      });
      return false;
    }
  },

  register: async (username, email, password) => {
    try {
      set({ loading: true, error: null });
      console.log('Attempting registration for user:', username);
      const response = await api.post('/auth/register', { username, email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ user, loading: false });
      console.log('Registration successful for user:', user.username);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, error: null });
    console.log('User logged out');
  },

  updateProfile: async (userData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.put('/users/profile', userData);
      
      if (response.data) {
        set({ user: response.data, loading: false });
        return { success: true };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      };
    }
  },

  // For demo/testing purposes only
  setDummyUser: (username) => {
    if (username) {
      set({ user: { username } });
    }
  },
}));

// Add an initialization call when imported
useAuth.getState().initialize();

export { useAuth };
