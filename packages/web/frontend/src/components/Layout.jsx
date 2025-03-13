import { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Avatar, 
  Badge, 
  Menu, 
  MenuItem, 
  IconButton, 
  Container, 
  Grid, 
  Paper, 
  Divider, 
  InputBase, 
  Tooltip, 
  useMediaQuery, 
  useTheme, 
  SwipeableDrawer, 
  Collapse, 
  ListItemButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import PostIcon from '@mui/icons-material/Description';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChatIcon from '@mui/icons-material/Chat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

const drawerWidth = 220;

// Categories/Topics
const categories = [
  { name: 'Home', icon: <HomeIcon />, path: '/' },
  { name: 'Free', icon: <FiberNewIcon />, path: '/?category=free' },
  { name: 'Q&A', icon: <QuestionAnswerIcon />, path: '/?category=qna' },
  { name: 'AI', icon: <SmartToyIcon />, path: '/?category=ai' }
];

// Reddit-style logo
const RedditLogo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Box
      component="div"
      sx={{
        width: 32,
        height: 32,
        backgroundColor: '#FF4500',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        mr: 1
      }}
    >
      <Typography variant="h6" fontWeight="bold">B</Typography>
    </Box>
    <Typography
      variant="h6"
      noWrap
      sx={{ color: 'black', fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}
    >
      bullseye
    </Typography>
  </Box>
);

// Reddit-like style for badges
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#FF4500',
    color: 'white',
    fontWeight: 'bold',
  },
}));

// Reddit-like search bar
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '20px',
  backgroundColor: alpha(theme.palette.common.white, 0.9),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 1),
  },
  border: '1px solid #ccc',
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

function Layout({ children }) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Search functionality
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    
    if (event.target.value.trim()) {
      setSearchAnchorEl(event.currentTarget);
      performSearch(event.target.value);
    } else {
      setSearchAnchorEl(null);
      setSearchResults([]);
    }
  };
  
  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      // Search posts
      const response = await api.get(`/posts/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSearchClose = () => {
    setSearchAnchorEl(null);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchAnchorEl(null);
  };
  
  const handleSearchResultClick = (postId) => {
    navigate(`/post/${postId}`);
    handleSearchClose();
    setSearchQuery('');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
    if (notifications.length > 0) {
      setNotifications([]);
    }
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  // Reddit-style sidebar content
  const drawer = (
    <Box sx={{ overflow: 'auto', py: 1.5, bgcolor: 'white', height: '100%' }}>
      <List sx={{ px: 0 }}>
        {categories.map((item) => {
          const isActive = location.pathname === '/' && 
            ((item.path === '/' && !location.search) || 
             (location.search && item.path.includes(location.search)));
          
          return (
            <ListItem key={item.name} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: 0,
                  color: isActive ? '#0079D3' : '#1A1A1B',
                  backgroundColor: isActive ? 'rgba(0, 121, 211, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  fontWeight: isActive ? '500' : 'normal',
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: '36px',
                  color: isActive ? '#0079D3' : '#878A8C',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.name} 
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: isActive ? '500' : '400',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ my: 1.5 }} />
      
      {/* Topics Section - Collapsible */}
      <Box sx={{ px: 2, mb: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          mb: 1
        }}
        onClick={() => setExpandedCategories(!expandedCategories)}
        >
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontSize: '10px', 
              fontWeight: 'bold', 
              color: '#878A8C',
              textTransform: 'uppercase',
              letterSpacing: '0.7px'
            }}
          >
            Topics
          </Typography>
          <IconButton size="small" sx={{ p: 0 }}>
            {expandedCategories ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
        
        <Collapse in={expandedCategories} timeout="auto" unmountOnExit>
          <List disablePadding>
            {['Technology', 'Sports', 'Business', 'News', 'Entertainment'].map((topic) => (
              <ListItem key={topic} disablePadding>
                <ListItemButton
                  sx={{
                    py: 0.75,
                    px: 1,
                    borderRadius: '4px',
                    fontSize: '14px',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemText 
                    primary={topic} 
                    primaryTypographyProps={{
                      fontSize: '14px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Box>
      
      <Divider sx={{ my: 1.5 }} />
      
      {/* Resources Section */}
      <Box sx={{ px: 2 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontSize: '10px', 
            fontWeight: 'bold', 
            color: '#878A8C',
            textTransform: 'uppercase',
            letterSpacing: '0.7px',
            mb: 1
          }}
        >
          Resources
        </Typography>
        
        <List disablePadding>
          {['About', 'Help Center', 'Terms of Service', 'Privacy Policy'].map((item) => (
            <ListItem key={item} disablePadding>
              <ListItemButton
                sx={{
                  py: 0.75,
                  px: 1,
                  borderRadius: '4px',
                  fontSize: '14px',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemText 
                  primary={item} 
                  primaryTypographyProps={{
                    fontSize: '14px',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', bgcolor: '#DAE0E6' }}>
      {/* Reddit-style header */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'black',
          borderBottom: '1px solid #EDEFF1',
          height: '48px'
        }}
      >
        <Toolbar sx={{ minHeight: '48px !important', height: '48px', px: { xs: 1, sm: 2 } }}>
          {/* Left section: Logo and menu toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <RouterLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <RedditLogo />
            </RouterLink>
          </Box>
          
          {/* Middle section: Search bar */}
          <Box sx={{ 
            display: 'flex', 
            flexGrow: 1, 
            justifyContent: 'center', 
            mx: { xs: 1, sm: 2 }
          }}>
            <Search sx={{ 
              width: { xs: '100%', sm: '400px' },
              maxWidth: '800px'
            }}>
              <InputBase
                placeholder="Search Bullseye…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ 
                  color: 'inherit', 
                  width: '100%',
                  pl: 2,
                  pr: searchQuery ? 0 : 2,
                  py: 0.5
                }}
                endAdornment={
                  <InputAdornment position="end">
                    {isSearching ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : searchQuery ? (
                      <IconButton 
                        size="small" 
                        onClick={handleClearSearch}
                        sx={{ mr: 0.5 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <SearchIcon sx={{ mr: 1 }} />
                    )}
                  </InputAdornment>
                }
              />
              
              {/* Search results dropdown */}
              <Menu
                anchorEl={searchAnchorEl}
                open={Boolean(searchAnchorEl)}
                onClose={handleSearchClose}
                PaperProps={{
                  sx: {
                    width: { xs: '300px', sm: '400px' },
                    maxHeight: '400px',
                    mt: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                {isSearching ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : searchResults.length > 0 ? (
                  searchResults.map(post => (
                    <MenuItem 
                      key={post._id} 
                      onClick={() => handleSearchResultClick(post._id)}
                      sx={{ py: 1.5 }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" noWrap>
                          {post.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          in {post.category} • by u/{post.author.username}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                ) : searchQuery.trim().length >= 2 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No results found for "{searchQuery}"
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Type at least 2 characters to search
                    </Typography>
                  </Box>
                )}
              </Menu>
            </Search>
          </Box>
          
          {/* Right section: User actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            {user ? (
              <>
                <IconButton 
                  size="small"
                  onClick={handleNotificationsOpen}
                >
                  <StyledBadge badgeContent={0} color="error">
                    <NotificationsIcon fontSize="small" />
                  </StyledBadge>
                </IconButton>
                
                <Button
                  onClick={handleMenuOpen}
                  variant="text"
                  size="small"
                  sx={{ 
                    ml: 1, 
                    color: 'inherit',
                    textTransform: 'none',
                    fontSize: '14px',
                    borderRadius: '4px',
                    '&:hover': { bgcolor: '#f6f7f8' }
                  }}
                  endIcon={<KeyboardArrowDownIcon />}
                  startIcon={
                    <Avatar 
                      sx={{ 
                        width: 24, 
                        height: 24,
                        fontSize: '12px',
                        bgcolor: '#FF4500'
                      }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  }
                >
                  {matches ? user?.username : ''}
                </Button>
                
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: {
                      width: '200px',
                      mt: 0.5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #EDEFF1' }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        fontSize: '16px',
                        bgcolor: '#FF4500',
                        mr: 1.5
                      }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {user?.username}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '12px', color: '#878A8C' }}>
                        u/{user?.username}
                      </Typography>
                    </Box>
                  </Box>
                  <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <Box component="span" sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary="Log Out" />
                  </MenuItem>
                </Menu>
                
                <Menu
                  anchorEl={notificationsAnchorEl}
                  open={Boolean(notificationsAnchorEl)}
                  onClose={handleNotificationsClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: {
                      width: '320px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      mt: 0.5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box sx={{ 
                    p: 0, 
                    borderBottom: '1px solid #EDEFF1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="h6" sx={{ p: 2, fontWeight: 'medium', fontSize: '16px' }}>
                      No new notifications
                    </Typography>
                    <Box 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                      }}
                    >
                      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        {/* Outer circle */}
                        <circle cx="30" cy="30" r="28" fill="#F3F3F3" stroke="#CCCCCC" strokeWidth="1" />
                        {/* Middle circle */}
                        <circle cx="30" cy="30" r="21" fill="#E0E0E0" stroke="#CCCCCC" strokeWidth="1" />
                        {/* Inner circle */}
                        <circle cx="30" cy="30" r="14" fill="#FF8A80" stroke="#FF5252" strokeWidth="1" />
                        {/* Bullseye */}
                        <circle cx="30" cy="30" r="7" fill="#FF4500" stroke="#B71C1C" strokeWidth="1" />
                      </svg>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#878A8C', textAlign: 'center' }}>
                      Nothing to see here yet!
                    </Typography>
                  </Box>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  variant="outlined"
                  component={RouterLink} 
                  to="/login"
                  size="small"
                  sx={{ 
                    borderRadius: '20px',
                    borderColor: '#0079D3',
                    color: '#0079D3',
                    textTransform: 'none',
                    mr: 1,
                    fontSize: '14px',
                    fontWeight: 'bold',
                    '&:hover': { borderColor: '#0079D3', bgcolor: 'rgba(0,121,211,0.05)' }
                  }}
                >
                  Log In
                </Button>
                
                <Button 
                  variant="contained"
                  component={RouterLink} 
                  to="/register"
                  size="small"
                  sx={{ 
                    borderRadius: '20px',
                    bgcolor: '#FF4500',
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#E03D00' }
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Left sidebar - desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: 'none',
            marginTop: '48px',
            height: 'calc(100% - 48px)',
          },
          width: drawerWidth,
          flexShrink: 0,
        }}
        open
      >
        {drawer}
      </Drawer>
      
      {/* Left sidebar - mobile */}
      <SwipeableDrawer
        variant="temporary"
        open={mobileOpen}
        onOpen={handleDrawerToggle}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            marginTop: '48px',
            height: 'calc(100% - 48px)',
          },
        }}
      >
        {drawer}
      </SwipeableDrawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { sm: `${drawerWidth}px` },
          marginTop: '48px',
          minHeight: 'calc(100vh - 48px)',
          bgcolor: '#DAE0E6'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
