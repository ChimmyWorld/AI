import create from 'zustand';
import api from '../api'; // Use our configured API client

const useAuth = create((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (username, password) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', user.username);
      set({ user: { username: user.username, _id: user._id }, loading: false });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        loading: false 
      });
      return false;
    }
  },

  register: async (username, email, password) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', user.username);
      set({ user: { username: user.username, _id: user._id }, loading: false });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        loading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    set({ user: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      set({ user: { username } });
    }
  },
}));

export { useAuth };
