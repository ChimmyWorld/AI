import { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Button, Avatar, Badge, Menu, MenuItem, IconButton, Container, Grid, Paper, Divider, InputBase, Tooltip, useMediaQuery, useTheme, SwipeableDrawer } from '@mui/material';
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
import SearchIcon from '@mui/icons-material/Search';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import MenuIcon from '@mui/icons-material/Menu';
import TrackChangesIcon from '@mui/icons-material/TrackChanges'; // Bullseye icon
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import { styled, alpha } from '@mui/material/styles';

const drawerWidth = 240;

const categories = [
  { name: 'Home', icon: <HomeIcon />, path: '/' },
  { name: 'Free', icon: <FiberNewIcon />, path: '/?category=free' },
  { name: 'Q&A', icon: <QuestionAnswerIcon />, path: '/?category=qa' },
  { name: 'AI', icon: <SmartToyIcon />, path: '/?category=ai' }
];

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#FF4500',
    color: 'white',
    fontWeight: 'bold',
  },
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
    minWidth: '300px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(theme.palette.common.black, 0.54),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

const BullseyeIcon = () => (
  <TrackChangesIcon sx={{ color: '#FF4500', fontSize: 28 }} />
);

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [mobileOpen, setMobileOpen] = useState(false);
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
      const fetchNotifications = async () => {
        try {
          const response = await api.get('/notifications', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setNotifications(response.data || []);
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      };

      fetchNotifications();
      
      // Set up interval to check notifications every 30 seconds
      const intervalId = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [user]);

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

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleGoToPost = (postId) => {
    handleNotificationClose();
    navigate(`/post/${postId}`);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const drawer = (
    <Box sx={{ p: 2, pt: 4 }}>
      <Paper elevation={0} sx={{ borderRadius: 2, mb: 2, p: 2, backgroundColor: 'white' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          FEEDS
        </Typography>
        <List disablePadding>
          {categories.map((category) => (
            <ListItem 
              button 
              key={category.name} 
              component={Link} 
              to={category.path}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{ 
                borderRadius: 2,
                mb: 0.5,
                py: 1,
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
        </List>
      </Paper>
        
      {user && (
        <Paper elevation={0} sx={{ borderRadius: 2, p: 2, backgroundColor: 'white' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ACCOUNT
          </Typography>
          <ListItem 
            button 
            onClick={() => {
              navigate('/profile');
              if (isMobile) setMobileOpen(false);
            }}
            sx={{ 
              borderRadius: 2,
              py: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 69, 0, 0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
        </Paper>
      )}
      
      <Paper elevation={0} sx={{ borderRadius: 2, mt: 2, p: 2, backgroundColor: 'white' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          POPULAR COMMUNITIES
        </Typography>
        <List disablePadding>
          {popularCommunities.map((community) => (
            <ListItem 
              button 
              key={community.name}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{ 
                borderRadius: 2,
                mb: 0.5,
                py: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 69, 0, 0.1)'
                }
              }}
            >
              <ListItemText 
                primary={community.name} 
                secondary={community.members} 
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#DAE0E6', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'black',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Toolbar sx={{ padding: isMobile ? '0 8px' : undefined }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <IconButton 
            edge="start" 
            color="inherit" 
            sx={{ mr: isMobile ? 0 : 1 }}
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
              color: '#FF4500',
              fontSize: isMobile ? '1rem' : '1.25rem',
            }}
            onClick={() => navigate('/')}
          >
            Bullseye
          </Typography>

          {!isMobile && (
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search Bullseye"
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <>
              <Tooltip title="Notifications">
                <IconButton 
                  color="inherit" 
                  onClick={handleNotificationClick}
                  sx={{ mx: isMobile ? 0.5 : 1 }}
                  aria-label="notifications"
                >
                  <StyledBadge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </StyledBadge>
                </IconButton>
              </Tooltip>

              {isMobile ? (
                <IconButton 
                  color="inherit" 
                  onClick={() => navigate('/profile')}
                  sx={{ mx: 0.5 }}
                >
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#FF4500' }}>
                    {user.username ? user.username[0].toUpperCase() : '?'}
                  </Avatar>
                </IconButton>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/profile')}
                    startIcon={<Avatar sx={{ width: 28, height: 28, bgcolor: '#FF4500' }}>{user.username ? user.username[0].toUpperCase() : '?'}</Avatar>}
                    sx={{ 
                      ml: 1, 
                      textTransform: 'none',
                      borderRadius: '20px',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    {user.username}
                  </Button>
                  
                  <Button 
                    color="inherit" 
                    onClick={logout}
                    sx={{ 
                      ml: 1,
                      borderRadius: '20px',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              {isMobile ? (
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/login')}
                  sx={{ 
                    borderRadius: 20,
                    minWidth: 0,
                    px: 1.5,
                    backgroundColor: '#FF4500',
                    '&:hover': {
                      backgroundColor: '#E03D00'
                    }
                  }}
                >
                  Login
                </Button>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/login')}
                    sx={{ 
                      borderRadius: 20,
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
                      borderRadius: 20,
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
            width: isMobile ? '300px' : '350px',
            maxHeight: '400px',
            mt: 1,
            borderRadius: 2
          }
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={handleMarkAllRead}>
                <MarkChatReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Box sx={{ py: 2, textAlign: 'center', width: '100%' }}>
              <Typography variant="body2" color="text.secondary">No notifications</Typography>
            </Box>
          </MenuItem>
        ) : (
          notifications.map(notification => (
            <MenuItem 
              key={notification._id} 
              onClick={() => {
                handleNotificationRead(notification._id);
                if (notification.postId) {
                  handleGoToPost(notification.postId);
                }
              }}
              sx={{ 
                whiteSpace: 'normal',
                py: 1.5,
                px: 2,
                borderLeft: notification.read ? 'none' : '3px solid #FF4500',
                bgcolor: notification.read ? 'transparent' : 'rgba(255, 69, 0, 0.05)'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {new Date(notification.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
      
      {/* Mobile drawer */}
      {isMobile ? (
        <SwipeableDrawer
          open={mobileOpen}
          onOpen={() => setMobileOpen(true)}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              marginTop: '56px', // Adjust for smaller mobile app bar
            },
          }}
        >
          {drawer}
        </SwipeableDrawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              marginTop: '64px',
              borderRight: 'none',
              backgroundColor: 'transparent',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: isMobile ? 0 : drawerWidth,
          marginTop: { xs: '56px', sm: '64px' },
          paddingTop: 4,
          paddingX: isMobile ? 1 : 3
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {children}
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Popular Communities
                </Typography>
                <List dense>
                  {popularCommunities.map((community, index) => (
                    <ListItem 
                      key={index}
                      button
                      sx={{
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: index < 3 ? '#FF4500' : '#0079D3',
                            fontSize: '12px'
                          }}
                        >
                          {community.name.split('/')[1][0].toUpperCase()}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={community.name} 
                        secondary={`${community.members} members`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    size="small" 
                    sx={{ 
                      textTransform: 'none', 
                      color: '#0079D3',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 121, 211, 0.1)'
                      }
                    }}
                  >
                    View All Communities
                  </Button>
                </Box>
              </Paper>
              
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Bullseye is a community forum where you can share links, ask questions, and discuss various topics.
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                  {new Date().getFullYear()} Bullseye Community Forum
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
