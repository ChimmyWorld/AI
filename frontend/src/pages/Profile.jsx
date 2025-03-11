import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  Paper,
  Divider,
  Grid,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Container,
  Tooltip,
  Stack,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Chat as ChatIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  Cake as CakeIcon
} from '@mui/icons-material';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid white',
  boxShadow: theme.shadows[3],
  margin: '0 auto',
  marginTop: -60,
  backgroundColor: '#FF4500',
  fontSize: '3rem'
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [userStats, setUserStats] = useState({
    karma: 0,
    posts: 0,
    comments: 0,
    dateJoined: ''
  });
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: ''
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || ''
      }));

      // Set when the user joined
      setUserStats(prev => ({
        ...prev,
        dateJoined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        }) : 'Unknown'
      }));

      // Fetch user stats
      fetchUserStats();
    }
  }, [user]);

  // Fetch user posts and comments when tab changes
  useEffect(() => {
    if (user) {
      if (tabValue === 1) {
        fetchUserPosts();
      } else if (tabValue === 2) {
        fetchUserComments();
      }
    }
  }, [tabValue, user]);

  const fetchUserStats = async () => {
    try {
      // This would be an actual API call in a real application
      // For now, we'll use fake data
      setUserStats(prev => ({
        ...prev,
        karma: Math.floor(Math.random() * 1000) + 100,
        posts: Math.floor(Math.random() * 30) + 1,
        comments: Math.floor(Math.random() * 50) + 10
      }));
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchUserPosts = async () => {
    if (!user) return;
    
    try {
      setLoadingPosts(true);
      const response = await api.get(`/posts/user/${user._id}`);
      setUserPosts(response.data);
      
      // Update stats with actual post count
      setUserStats(prev => ({
        ...prev,
        posts: response.data.length
      }));
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load your posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchUserComments = async () => {
    if (!user) return;
    
    try {
      setLoadingComments(true);
      const response = await api.get(`/posts/comments/user/${user._id}`);
      setUserComments(response.data);
      
      // Update stats with actual comment count
      setUserStats(prev => ({
        ...prev,
        comments: response.data.length
      }));
    } catch (error) {
      console.error('Error fetching user comments:', error);
      setError('Failed to load your comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      const response = await api.put('/api/users/profile', {
        username: formData.username,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword || undefined
      });

      setSuccess('Profile updated successfully');
      setIsEditing(false);
      
      // Update localStorage with new username
      localStorage.setItem('username', formData.username);
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Reload the page to refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete('/api/users/profile');
      logout();
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await api.delete(`/posts/comments/${postId}/${commentId}`);
      fetchUserComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      {/* Banner and Basic Info */}
      <Paper sx={{ height: 120, bgcolor: '#0079D3', borderRadius: '4px 4px 0 0' }} />
      
      <Paper sx={{ borderRadius: '0 0 4px 4px', pb: 2 }}>
        <Box sx={{ px: 3, position: 'relative', textAlign: 'center' }}>
          <StyledAvatar>
            {user.username ? user.username[0].toUpperCase() : '?'}
          </StyledAvatar>
          
          <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
            {user.username}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CakeIcon fontSize="small" />
              Bullseye member since {userStats.dateJoined}
            </Box>
          </Typography>

          {/* User Stats */}
          <Grid container spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
            <Grid item>
              <Paper elevation={0} sx={{ bgcolor: '#f8f9fa', p: 2, textAlign: 'center', minWidth: 100, borderRadius: 2 }}>
                <ArrowUpwardIcon color="primary" />
                <Typography variant="h6">{userStats.karma}</Typography>
                <Typography variant="body2" color="text.secondary">Karma</Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper elevation={0} sx={{ bgcolor: '#f8f9fa', p: 2, textAlign: 'center', minWidth: 100, borderRadius: 2 }}>
                <ChatIcon color="primary" />
                <Typography variant="h6">{userStats.posts}</Typography>
                <Typography variant="body2" color="text.secondary">Posts</Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper elevation={0} sx={{ bgcolor: '#f8f9fa', p: 2, textAlign: 'center', minWidth: 100, borderRadius: 2 }}>
                <FavoriteIcon color="primary" />
                <Typography variant="h6">{userStats.comments}</Typography>
                <Typography variant="body2" color="text.secondary">Comments</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ width: '100%', bgcolor: 'background.paper', mt: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            textColor="primary"
            indicatorColor="primary"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
              }
            }}
          >
            <Tab label="Profile" />
            <Tab label="Posts" />
            <Tab label="Comments" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <form onSubmit={handleUpdate}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditing,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditing,
                    }}
                  />
                  {isEditing && (
                    <>
                      <Divider sx={{ my: 2 }}>Password</Divider>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                      />
                      <TextField
                        fullWidth
                        label="New Password (optional)"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        helperText="Leave blank to keep current password"
                      />
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={!formData.newPassword}
                      />
                    </>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    {!isEditing ? (
                      <Button
                        variant="contained"
                        onClick={() => setIsEditing(true)}
                        startIcon={<EditIcon />}
                        sx={{ 
                          bgcolor: '#0079D3',
                          '&:hover': {
                            bgcolor: '#006CBD',
                          }
                        }}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          type="submit"
                          startIcon={<SaveIcon />}
                          sx={{ 
                            bgcolor: '#0079D3',
                            '&:hover': {
                              bgcolor: '#006CBD',
                            }
                          }}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setIsEditing(false)}
                          startIcon={<CancelIcon />}
                          color="inherit"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setShowDeleteDialog(true)}
                      startIcon={<DeleteIcon />}
                    >
                      Delete Account
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ py: 2 }}>
              {loadingPosts ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress color="primary" />
                </Box>
              ) : userPosts.length > 0 ? (
                <Stack spacing={2}>
                  {userPosts.map((post) => (
                    <Paper 
                      key={post._id} 
                      elevation={0}
                      sx={{ 
                        mb: 2, 
                        borderRadius: 2,
                        border: '1px solid #ccc',
                        '&:hover': {
                          border: '1px solid #898989'
                        }
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography color="textSecondary" variant="caption" sx={{ mr: 1 }}>
                            Posted in {post.category}
                          </Typography>
                          <Typography color="textSecondary" variant="caption">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                        
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {post.title}
                        </Typography>
                        
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {post.content.length > 150 
                            ? `${post.content.substring(0, 150)}...` 
                            : post.content}
                        </Typography>
                        
                        {post.media && post.media.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            {post.media[0].type === 'image' ? (
                              <img 
                                src={post.media[0].url} 
                                alt="Post media" 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '200px',
                                  borderRadius: '4px'
                                }} 
                              />
                            ) : (
                              <video 
                                controls 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '200px', 
                                  borderRadius: '4px'
                                }}
                              >
                                <source src={post.media[0].url} />
                              </video>
                            )}
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Button 
                            startIcon={<ChatIcon />}
                            size="small"
                            onClick={() => navigate(`/post/${post._id}`)}
                            sx={{ mr: 1, color: 'text.secondary' }}
                          >
                            {post.comments ? post.comments.length : 0} Comments
                          </Button>
                          
                          <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                            <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                            {post.upvotes ? post.upvotes.length : 0}
                          </Typography>
                          
                          <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                            {post.downvotes ? post.downvotes.length : 0}
                          </Typography>
                          
                          <Box sx={{ flexGrow: 1 }} />
                          
                          <Button
                            startIcon={<EditIcon />}
                            size="small"
                            onClick={() => navigate(`/post/${post._id}?edit=true`)}
                            sx={{ color: 'primary.main' }}
                          >
                            Edit
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary">You haven't created any posts yet</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      mt: 2,
                      backgroundColor: '#FF4500',
                      '&:hover': { backgroundColor: '#E03D00' }
                    }}
                    onClick={() => navigate('/?new=true')}
                  >
                    Create Your First Post
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ py: 2 }}>
              {loadingComments ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress color="primary" />
                </Box>
              ) : userComments.length > 0 ? (
                <Stack spacing={2}>
                  {userComments.map((commentItem) => (
                    <Paper 
                      key={commentItem.comment._id} 
                      elevation={0}
                      sx={{ 
                        mb: 2, 
                        borderRadius: 2,
                        border: '1px solid #ccc',
                        '&:hover': {
                          border: '1px solid #898989'
                        }
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>
                            On post: {commentItem.postTitle}
                          </Typography>
                          <Typography color="textSecondary" variant="caption">
                            {new Date(commentItem.comment.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body1" sx={{ mb: 2, pl: 2, borderLeft: '3px solid #FF4500' }}>
                          {commentItem.comment.content}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Button 
                            startIcon={<ChatIcon />}
                            size="small"
                            onClick={() => navigate(`/post/${commentItem.postId}`)}
                            sx={{ mr: 1, color: 'text.secondary' }}
                          >
                            View Post
                          </Button>
                          
                          <Box sx={{ flexGrow: 1 }} />
                          
                          <Button
                            startIcon={<EditIcon />}
                            size="small"
                            onClick={() => navigate(`/post/${commentItem.postId}?editComment=${commentItem.comment._id}`)}
                            sx={{ color: 'primary.main', mr: 1 }}
                          >
                            Edit
                          </Button>
                          
                          <Button
                            startIcon={<DeleteIcon />}
                            size="small"
                            onClick={() => handleDeleteComment(commentItem.postId, commentItem.comment._id)}
                            sx={{ color: 'error.main' }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary">You haven't commented on any posts yet</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      mt: 2,
                      backgroundColor: '#FF4500',
                      '&:hover': { backgroundColor: '#E03D00' }
                    }}
                    onClick={() => navigate('/')}
                  >
                    Browse Posts to Comment
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>
        </Box>
      </Paper>

      <Dialog 
        open={showDeleteDialog} 
        onClose={() => setShowDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Delete Account</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            All your posts and comments will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setShowDeleteDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 20 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            sx={{ borderRadius: 20 }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
