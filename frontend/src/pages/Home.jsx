import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  useTheme,
  Alert
} from '@mui/material';
import {
  Whatshot as WhatshotIcon,
  TrendingUp as TrendingUpIcon,
  NewReleases as NewReleasesIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';

function Home() {
  // State variables for the posts and loading status
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('hot');
  const [openNewPost, setOpenNewPost] = useState(false);
  const [categories] = useState(['free', 'qna', 'ai']);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // Reference to the current category and query params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  
  useEffect(() => {
    if (categoryParam) {
      setCategory(categoryParam);
    } else {
      setCategory('all');
    }
  }, [categoryParam]);
  
  // Fetch posts when component mounts or when category/sort changes
  useEffect(() => {
    fetchPosts();
  }, [category, sortBy]);
  
  // Function to fetch posts from the server
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build the URL with the category and sort parameters
      let url = '/posts?sort=' + sortBy;
      if (category !== 'all') {
        url += '&category=' + category;
      }
      
      const response = await api.get(url);
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    navigate(newCategory === 'all' ? '/' : `/?category=${newCategory}`);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%',
      minHeight: '100vh', 
      bgcolor: '#DAE0E6',
      display: 'flex',
      justifyContent: 'center',
      pt: 2,
      pb: 4,
      px: { xs: 1, sm: 2 }
    }}>
      {/* Main content container */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '750px'
      }}>
        {/* Category filter */}
        <Box sx={{ 
          mb: 2,
          display: 'flex',
          overflow: 'hidden',
          bgcolor: 'white',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}>
          <Button
            variant="text"
            onClick={() => handleCategoryChange('all')}
            sx={{ 
              textTransform: 'none',
              borderRadius: 0,
              color: category === 'all' ? '#0079D3' : '#878A8C',
              borderBottom: category === 'all' ? '2px solid #0079D3' : 'none',
              py: 1,
              fontWeight: category === 'all' ? 'medium' : 'normal',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
                color: '#1A1A1B',
              },
              flex: 1
            }}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant="text"
              onClick={() => handleCategoryChange(cat)}
              sx={{ 
                textTransform: 'none',
                borderRadius: 0,
                color: category === cat ? '#0079D3' : '#878A8C',
                borderBottom: category === cat ? '2px solid #0079D3' : 'none',
                py: 1,
                fontWeight: category === cat ? 'medium' : 'normal',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.04)',
                  color: '#1A1A1B',
                },
                flex: 1
              }}
            >
              {cat === 'qna' ? 'Q&A' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </Box>
        
        {/* Sort options */}
        <Box sx={{ 
          mb: 2,
          display: 'flex',
          bgcolor: 'white',
          borderRadius: '4px',
          border: '1px solid #ccc',
          px: 2,
          py: 1
        }}>
          <Button
            startIcon={<WhatshotIcon />}
            size="small"
            onClick={() => setSortBy('hot')}
            sx={{ 
              textTransform: 'none',
              color: sortBy === 'hot' ? '#0079D3' : '#878A8C',
              fontWeight: sortBy === 'hot' ? 'medium' : 'normal',
              mr: 1,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
              }
            }}
          >
            Hot
          </Button>
          
          <Button
            startIcon={<NewReleasesIcon />}
            size="small"
            onClick={() => setSortBy('new')}
            sx={{ 
              textTransform: 'none',
              color: sortBy === 'new' ? '#0079D3' : '#878A8C',
              fontWeight: sortBy === 'new' ? 'medium' : 'normal',
              mr: 1,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
              }
            }}
          >
            New
          </Button>
          
          <Button
            startIcon={<TrendingUpIcon />}
            size="small"
            onClick={() => setSortBy('top')}
            sx={{ 
              textTransform: 'none',
              color: sortBy === 'top' ? '#0079D3' : '#878A8C',
              fontWeight: sortBy === 'top' ? 'medium' : 'normal',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
              }
            }}
          >
            Top
          </Button>
        </Box>
        
        {/* Create post button */}
        {user && (
          <Box sx={{ 
            mb: 2,
            display: 'flex',
            bgcolor: 'white',
            borderRadius: '4px',
            border: '1px solid #ccc',
            p: 1
          }}>
            <Avatar 
              sx={{ 
                width: 38, 
                height: 38,
                bgcolor: '#FF4500',
                fontSize: '16px',
                mr: 1
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenNewPost(true)}
              sx={{ 
                textAlign: 'left',
                justifyContent: 'flex-start',
                color: '#878A8C',
                border: '1px solid #ccc',
                borderRadius: '4px',
                px: 2,
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.04)',
                  borderColor: '#878A8C'
                }
              }}
            >
              Create Post
            </Button>
          </Box>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        )}
        
        {/* Error message */}
        {error && (
          <Box sx={{ my: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        
        {/* Posts list */}
        {!loading && !error && posts.length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'white', borderRadius: '4px' }}>
            <Typography variant="h6">No posts found</Typography>
            <Typography variant="body2" color="textSecondary">
              Be the first to post in this category!
            </Typography>
          </Paper>
        )}
        
        {!loading && !error && posts.map(post => (
          <PostCard key={post._id} post={post} />
        ))}
        
        {/* Create Post Modal */}
        <Dialog 
          open={openNewPost} 
          onClose={() => setOpenNewPost(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Create a Post</DialogTitle>
          <DialogContent>
            <CreatePostForm 
              onSuccess={() => {
                setOpenNewPost(false);
                fetchPosts();
              }}
              onCancel={() => setOpenNewPost(false)}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Home;
