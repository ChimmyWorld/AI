import { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Button, Avatar, Badge, Menu, MenuItem, IconButton, Container, Grid, Paper, Divider } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const categories = [
  { name: 'Home', icon: <HomeIcon />, path: '/' },
  { name: 'Free', icon: <FiberNewIcon />, path: '/?category=free' },
  { name: 'Q&A', icon: <QuestionAnswerIcon />, path: '/?category=qna' },
  { name: 'AI', icon: <SmartToyIcon />, path: '/?category=ai' }
];

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#FF4500',
    color: 'white',
    fontWeight: 'bold',
  },
}));

const BullseyeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [popularCommunities, setPopularCommunities] = useState([
    { name: 'r/technology', members: '12.5M' },
    { name: 'r/science', members: '28.7M' },
    { name: 'r/gaming', members: '34.2M' },
    { name: 'r/movies', members: '26.9M' },
    { name: 'r/programming', members: '5.6M' }
  ]);

  // Determine active category from URL
  const activeCategory = location.search.includes('category=') 
    ? categories.find(c => location.search.includes(`category=${c.name.toLowerCase()}`))?.name 
    : 'Home';

  // Fetch notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleGoToPost = (postId) => {
    handleNotificationClose();
    navigate(`/post/${postId}`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#DAE0E6', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'black'
      }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            sx={{ mr: 1 }}
            onClick={() => navigate('/')}
          >
            <BullseyeIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              cursor: 'pointer', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              color: '#FF4500'
            }}
            onClick={() => navigate('/')}
          >
            Bullseye
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <>
              <IconButton 
                color="inherit" 
                onClick={handleNotificationClick}
                sx={{ mx: 1 }}
                aria-label="notifications"
              >
                <StyledBadge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </StyledBadge>
              </IconButton>

              <Button 
                color="inherit" 
                onClick={() => navigate('/profile')}
                startIcon={<Avatar sx={{ width: 24, height: 24, bgcolor: '#FF4500' }}>{user.username ? user.username[0] : '?'}</Avatar>}
                sx={{ ml: 1, textTransform: 'none' }}
              >
                {user.username}
              </Button>
              
              <Button 
                color="inherit" 
                onClick={logout}
                sx={{ ml: 1 }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ 
                  borderRadius: 5,
                  mr: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 69, 0, 0.1)'
                  }
                }}
              >
                Log In
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/register')}
                sx={{ 
                  borderRadius: 5,
                  backgroundColor: '#FF4500',
                  '&:hover': {
                    backgroundColor: '#E03D00'
                  }
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: { 
            width: '350px',
            maxHeight: '400px',
            mt: 1,
            borderRadius: 2
          }
        }}
      >
        <Box sx={{ p: 1, borderBottom: '1px solid #eee' }}>
          <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
        </Box>
        {notifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          notifications.map(notification => (
            <MenuItem 
              key={notification._id} 
              onClick={() => {
                handleNotificationRead(notification._id);
                handleGoToPost(notification.postId);
              }}
              sx={{ 
                whiteSpace: 'normal',
                py: 1,
                borderLeft: notification.read ? 'none' : '3px solid #FF4500',
                bgcolor: notification.read ? 'transparent' : 'rgba(255, 69, 0, 0.05)'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
            borderRight: 'none'
          },
        }}
      >
        <Box sx={{ p: 2, pt: 4 }}>
          <List>
            {categories.map((category) => (
              <ListItem 
                button 
                key={category.name} 
                component={Link} 
                to={category.path}
                sx={{ 
                  borderRadius: 2,
                  mb: 0.5,
                  backgroundColor: category.name === activeCategory ? 'rgba(255, 69, 0, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 69, 0, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: category.name === activeCategory ? '#FF4500' : 'inherit', minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={category.name} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      fontWeight: category.name === activeCategory ? 'bold' : 'normal',
                      color: category.name === activeCategory ? '#FF4500' : 'inherit'
                    } 
                  }} 
                />
              </ListItem>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            {user && (
              <ListItem 
                button 
                onClick={() => navigate('/profile')}
                sx={{ 
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 69, 0, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="My Profile" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: '64px',
          backgroundColor: '#DAE0E6'
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {children}
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Popular Communities
                </Typography>
                <List dense>
                  {popularCommunities.map((community, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <WhatshotIcon sx={{ color: index < 3 ? '#FF4500' : 'inherit' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={community.name} 
                        secondary={`${community.members} members`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Trending
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <TrendingUpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="How AI is changing the world" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <TrendingUpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Latest tech news roundup" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <TrendingUpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Tips for new developers" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
