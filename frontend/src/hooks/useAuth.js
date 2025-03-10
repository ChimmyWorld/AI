import create from 'zustand';
import axios from 'axios';

const useAuth = create((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (username, password) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, username: userName } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', userName);
      set({ user: { username: userName }, loading: false });
      return true;
    } catch (error) {
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
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password
      });
      const { token, username: userName } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', userName);
      set({ user: { username: userName }, loading: false });
      return true;
    } catch (error) {
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
