import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Stack,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Collapse
} from '@mui/material';
import {
  ArrowUpward as UpvoteIcon,
  ArrowDownward as DownvoteIcon,
  Comment as CommentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [openNewPost, setOpenNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', media: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openComments, setOpenComments] = useState({});
  const [commentText, setCommentText] = useState('');

  // Get category from URL params
  const category = new URLSearchParams(location.search).get('category') || 'free';

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let endpoint = category === 'all' ? '/posts' : `/posts/category/${category}`;
      const response = await api.get(endpoint);
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMenu = (event, post) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPost(post);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedPost(null);
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    try {
      await api.delete(`/posts/${selectedPost._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchPosts();
      handleCloseMenu();
    } catch (err) {
      console.error("Error deleting post:", err);
      setError('Failed to delete post');
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!user) return;
    try {
      await api.post(`/posts/${postId}/vote`, { voteType }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchPosts();
    } catch (err) {
      console.error("Error voting:", err);
      setError('Failed to vote');
    }
  };

  const handleNewPost = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      formData.append('category', category);
      
      if (newPost.media) {
        formData.append('media', newPost.media);
      }

      await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setOpenNewPost(false);
      setNewPost({ title: '', content: '', media: null });
      fetchPosts();
    } catch (err) {
      console.error("Error creating post:", err);
      setError('Failed to create post');
    }
  };

  const toggleComments = (postId) => {
    setOpenComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      await api.post(`/posts/${postId}/comments`, 
        { content: commentText },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setCommentText('');
      fetchPosts();
    } catch (err) {
      console.error("Error adding comment:", err);
      setError('Failed to add comment');
    }
  };

  const navigateToPostDetail = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ textTransform: 'capitalize' }}>
          {category} Posts
        </Typography>
        {user && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewPost(true)}
          >
            New Post
          </Button>
        )}
      </Box>

      <Stack spacing={2}>
        {posts.map(post => (
          <Card key={post._id}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <IconButton
                    onClick={() => handleVote(post._id, 'up')}
                    color={post.upvotes?.includes(user?._id) ? 'primary' : 'default'}
                  >
                    <UpvoteIcon />
                  </IconButton>
                  <Typography>{(post.upvotes?.length || 0) - (post.downvotes?.length || 0)}</Typography>
                  <IconButton
                    onClick={() => handleVote(post._id, 'down')}
                    color={post.downvotes?.includes(user?._id) ? 'primary' : 'default'}
                  >
                    <DownvoteIcon />
                  </IconButton>
                </Box>

                <Box sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigateToPostDetail(post._id)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {post.author?.username ? post.author.username.charAt(0) : '?'}
                    </Avatar>
                    <Typography variant="body2">Posted by {post.author?.username || 'Anonymous'}</Typography>
                    
                    {user && post.author && user._id === post.author._id && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMenu(e, post);
                        }}
                      >
                        <MoreIcon />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Typography variant="h6">{post.title}</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>{post.content}</Typography>
                  
                  {post.media && post.media.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {post.media.map((mediaItem, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          {mediaItem.type === 'image' ? (
                            <img src={mediaItem.url} alt="Post media" style={{ maxWidth: '100%', maxHeight: '400px' }} />
                          ) : mediaItem.type === 'video' ? (
                            <video controls src={mediaItem.url} style={{ maxWidth: '100%', maxHeight: '400px' }} />
                          ) : null}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
              
              <Box 
                sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComments(post._id);
                }}
              >
                <CommentIcon fontSize="small" />
                <Typography variant="body2">{post.comments?.length || 0} comments</Typography>
              </Box>
              
              <Collapse in={openComments[post._id]}>
                <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #eee' }}>
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 20, height: 20 }}>
                            {comment.author?.username ? comment.author.username.charAt(0) : '?'}
                          </Avatar>
                          <Typography variant="body2" fontWeight="bold">
                            {comment.author?.username || 'Anonymous'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 0.5, pl: 3.5 }}>
                          {comment.content}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No comments yet</Typography>
                  )}
                  
                  {user && (
                    <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post._id);
                          }
                        }}
                      />
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handleAddComment(post._id)}
                      >
                        Post
                      </Button>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* New Post Dialog */}
      <Dialog open={openNewPost} onClose={() => setOpenNewPost(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            multiline
            rows={4}
            margin="normal"
          />
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setNewPost({ ...newPost, media: e.target.files[0] })}
            style={{ marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewPost(false)}>Cancel</Button>
          <Button onClick={handleNewPost} variant="contained">Post</Button>
        </DialogActions>
      </Dialog>

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
