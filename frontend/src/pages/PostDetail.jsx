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
  Paper
} from '@mui/material';
import {
  ArrowUpward as UpvoteIcon,
  ArrowDownward as DownvoteIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

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
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2 }}>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
        Back to Posts
      </Button>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Vote buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconButton
                onClick={() => handleVote('up')}
                color={post.upvotes?.includes(user?._id) ? 'primary' : 'default'}
              >
                <UpvoteIcon />
              </IconButton>
              <Typography>{(post.upvotes?.length || 0) - (post.downvotes?.length || 0)}</Typography>
              <IconButton
                onClick={() => handleVote('down')}
                color={post.downvotes?.includes(user?._id) ? 'primary' : 'default'}
              >
                <DownvoteIcon />
              </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {post.author?.username ? post.author.username.charAt(0) : '?'}
                  </Avatar>
                  <Typography>Posted by {post.author?.username || 'Anonymous'}</Typography>
                </Box>
                
                {user && post.author && user._id === post.author._id && (
                  <IconButton size="small" onClick={handleOpenMenu}>
                    <MoreIcon />
                  </IconButton>
                )}
              </Box>

              <Typography variant="h5" sx={{ mb: 2 }}>{post.title}</Typography>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>{post.content}</Typography>
              
              {/* Media files */}
              {post.media && post.media.length > 0 && (
                <Box sx={{ mt: 2, mb: 3 }}>
                  {post.media.map((mediaItem, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      {mediaItem.type === 'image' ? (
                        <img 
                          src={mediaItem.url} 
                          alt="Post media" 
                          style={{ maxWidth: '100%', maxHeight: '500px', display: 'block', margin: '0 auto' }}
                        />
                      ) : mediaItem.type === 'video' ? (
                        <video 
                          controls 
                          src={mediaItem.url} 
                          style={{ maxWidth: '100%', maxHeight: '500px', display: 'block', margin: '0 auto' }}
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
      <Typography variant="h6" sx={{ mb: 2 }}>
        {post.comments?.length || 0} Comments
      </Typography>
      
      {user && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Comment as {user.username}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="What are your thoughts?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              disabled={!commentText.trim()}
              onClick={handleAddComment}
            >
              Comment
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Comments list */}
      {post.comments && post.comments.length > 0 ? (
        post.comments.map((comment, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar sx={{ width: 24, height: 24 }}>
                {comment.author?.username ? comment.author.username.charAt(0) : '?'}
              </Avatar>
              <Typography variant="body2" fontWeight="bold">
                {comment.author?.username || 'Anonymous'}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ pl: 4 }}>
              {comment.content}
            </Typography>
          </Paper>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          No comments yet. Be the first to comment!
        </Typography>
      )}

      {/* Post Actions Menu */}
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
