import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Divider,
  Avatar,
  TextField,
  CircularProgress,
  Menu,
  MenuItem,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ArrowUpward as UpvoteIcon,
  ArrowDownward as DownvoteIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  // Convert URLs in text to clickable links
  const convertLinksToHTML = (text) => {
    if (!text) return '';
    
    // Use a simple regex that will match all URLs including Twitter links with query params
    const urlRegex = /https?:\/\/[^\s]+/g;
    
    // Split the text by URLs and map each part
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Find all matches and build the parts array
    while ((match = urlRegex.exec(text)) !== null) {
      // Add text before the URL
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the URL as a link component
      const url = match[0];
      parts.push(
        <a 
          key={match.index} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#0079D3', textDecoration: 'none' }}
        >
          {url}
        </a>
      );
      
      lastIndex = match.index + url.length;
    }
    
    // Add any remaining text after the last URL
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${id}`);
      setPost(response.data);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/posts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      handleCloseMenu();
      navigate('/');
    } catch (err) {
      console.error("Error deleting post:", err);
      setError('Failed to delete post');
    }
  };

  const handleVote = async (voteType) => {
    if (!user) return;
    try {
      await api.post(`/posts/${id}/vote`, { voteType }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchPost();
    } catch (err) {
      console.error("Error voting:", err);
      setError('Failed to vote');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await api.post(`/posts/${id}/comments`, 
        { content: commentText },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setCommentText('');
      fetchPost();
    } catch (err) {
      console.error("Error adding comment:", err);
      setError('Failed to add comment');
    }
  };

  const handleEditComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditCommentText(content);
  };

  const handleUpdateComment = async (commentId) => {
    try {
      await api.put(`/posts/${id}/comments/${commentId}`, 
        { content: editCommentText },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setEditingCommentId(null);
      setEditCommentText('');
      fetchPost();
    } catch (err) {
      console.error("Error updating comment:", err);
      setError('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/posts/${id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchPost();
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError('Failed to delete comment');
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ mt: 4 }}>
      <Typography color="error" align="center">{error}</Typography>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
        Back to Home
      </Button>
    </Box>
  );

  if (!post) return (
    <Box sx={{ mt: 4 }}>
      <Typography align="center">Post not found</Typography>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
        Back to Home
      </Button>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: isMobile ? 1 : 2 }}>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
        Back to Posts
      </Button>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
            {/* Vote buttons */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'row' : 'column', 
              alignItems: 'center',
              justifyContent: isMobile ? 'flex-start' : 'center',
              mb: isMobile ? 2 : 0
            }}>
              <IconButton
                onClick={() => handleVote('up')}
                color={post.upvotes?.includes(user?._id) ? 'primary' : 'default'}
                size={isMobile ? 'small' : 'medium'}
              >
                <UpvoteIcon />
              </IconButton>
              <Typography sx={{ mx: isMobile ? 2 : 0 }}>
                {(post.upvotes?.length || 0) - (post.downvotes?.length || 0)}
              </Typography>
              <IconButton
                onClick={() => handleVote('down')}
                color={post.downvotes?.includes(user?._id) ? 'primary' : 'default'}
                size={isMobile ? 'small' : 'medium'}
              >
                <DownvoteIcon />
              </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                mb: 1,
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: isMobile ? 1 : 0
                }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#FF4500' }}>
                    {post.author?.username ? post.author.username.charAt(0) : '?'}
                  </Avatar>
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    Posted by {post.author?.username || 'Anonymous'} • {new Date(post.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                
                {user && post.author && user._id === post.author._id && (
                  <IconButton size="small" onClick={handleOpenMenu}>
                    <MoreIcon />
                  </IconButton>
                )}
              </Box>

              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                sx={{ mb: 2, fontWeight: 'medium' }}
              >
                {post.title}
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ mb: 3, whiteSpace: 'pre-line' }}
              >
                {convertLinksToHTML(post.content)}
              </Typography>
              
              {/* Media files */}
              {post.media && post.media.length > 0 && (
                <Box sx={{ mt: 2, mb: 3 }}>
                  {post.media.map((mediaItem, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      {mediaItem.type === 'image' ? (
                        <img 
                          src={mediaItem.url} 
                          alt="Post media" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '500px', 
                            display: 'block', 
                            margin: '0 auto',
                            borderRadius: '8px'
                          }}
                        />
                      ) : mediaItem.type === 'video' ? (
                        <video 
                          controls 
                          src={mediaItem.url} 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '500px', 
                            display: 'block', 
                            margin: '0 auto',
                            borderRadius: '8px'
                          }}
                        />
                      ) : null}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Comments section */}
      <Paper sx={{ p: isMobile ? 2 : 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>
        
        {user ? (
          <Box sx={{ display: 'flex', mb: 3, gap: 1.5, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: '#FF4500', 
                display: isMobile ? 'none' : 'flex' 
              }}
            >
              {user.username ? user.username[0].toUpperCase() : '?'}
            </Avatar>
            <TextField
              fullWidth
              placeholder="Add a comment"
              multiline
              minRows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button 
              variant="contained" 
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              sx={{ 
                borderRadius: 2,
                alignSelf: isMobile ? 'flex-end' : 'flex-start',
                mt: isMobile ? 1 : 0,
                backgroundColor: commentText.trim() ? '#FF4500' : 'grey.400',
                '&:hover': { 
                  backgroundColor: commentText.trim() ? '#E03D00' : 'grey.400' 
                }
              }}
            >
              Comment
            </Button>
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Log in or sign up to leave a comment
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/login')}
                sx={{ borderRadius: 2 }}
              >
                Log In
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/register')}
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: '#FF4500',
                  '&:hover': { backgroundColor: '#E03D00' }
                }}
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => (
            <Box key={comment._id} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 0.5,
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: 'grey.500' }}>
                  {comment.author?.username ? comment.author.username[0].toUpperCase() : '?'}
                </Avatar>
                {comment.author ? (
                  <Typography variant="body2" fontWeight="bold">
                    {user && user._id && comment.author && comment.author._id && 
                     user._id === comment.author._id ? 
                      user.username : comment.author.username || 'Anonymous'}
                  </Typography>
                ) : (
                  <Typography variant="body2" fontWeight="bold">
                    Anonymous
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  • {new Date(comment.createdAt).toLocaleString()}
                </Typography>
                
                {user && comment.author && user._id === comment.author._id && (
                  <Box sx={{ display: 'flex', ml: 'auto' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditComment(comment._id, comment.content)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              
              {editingCommentId === comment._id ? (
                <Box sx={{ ml: 4, mt: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button 
                      size="small" 
                      onClick={() => setEditingCommentId(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained" 
                      onClick={() => handleUpdateComment(comment._id)}
                      sx={{ 
                        backgroundColor: '#FF4500',
                        '&:hover': { backgroundColor: '#E03D00' }
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ ml: 4 }}>
                  {convertLinksToHTML(comment.content)}
                </Typography>
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" align="center">
            No comments yet. Be the first to share your thoughts!
          </Typography>
        )}
      </Paper>

      {/* Post Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleDeletePost} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Post
        </MenuItem>
      </Menu>
    </Box>
  );
}
