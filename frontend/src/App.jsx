import { BrowserRouter as Router, Routes, Route, createRoutesFromElements } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetail from './pages/PostDetail';
import ErrorBoundary from './components/ErrorBoundary';
import PostCard from './components/PostCard';

const theme = createTheme({
  palette: {
    mode: 'light', 
    primary: {
      main: '#ff4500',  
    },
    background: {
      default: '#f6f7f8', 
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1b',
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
          '&:hover': {
            boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: '100% !important', // Ensure containers don't restrict width too much
          padding: '0 8px', // Minimal padding to avoid overflow issues
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          width: '100%',
          maxWidth: '100%',
        }
      }
    }
  },
  typography: {
    fontFamily: '"Noto Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h6: {
      fontSize: '1rem', // Smaller heading for better space usage
    },
    body1: {
      fontSize: '0.875rem', // Slightly smaller body text
    },
    body2: {
      fontSize: '0.8rem',
    }
  },
});

// Configure router with future flags to eliminate warnings
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function App() {
  console.log('=== APP VERSION ===');
  console.log('Version: 1.1.0 - Reddit UI Update');
  console.log('Build time:', new Date().toISOString());
  console.log('Environment:', import.meta.env.MODE);
  console.log('Components loaded:', 
    Boolean(Layout) ? 'Layout ✓' : 'Layout ✗',
    Boolean(Home) ? 'Home ✓' : 'Home ✗', 
    Boolean(PostDetail) ? 'PostDetail ✓' : 'PostDetail ✗',
    Boolean(PostCard) ? 'PostCard ✓' : 'PostCard ✗'
  );
  console.log('==================');
  
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router {...routerOptions}>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/post/:id" element={<PostDetail />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
