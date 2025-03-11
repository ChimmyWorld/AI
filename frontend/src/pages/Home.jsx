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
  Collapse,
  Paper,
  FormControl,
  InputLabel,
  Select,
  CloudUploadIcon,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ArrowUpward as UpvoteIcon,
  ArrowDownward as DownvoteIcon,
  Comment as CommentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  NewReleases as NewReleasesIcon,
  Whatshot as WhatshotIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Chat as ChatIcon,
  Share as ShareIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [posts, setPosts] = useState([]);
  const [openNewPost, setOpenNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', media: null, category: 'free' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openComments, setOpenComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [sortBy, setSortBy] = useState('new'); // 'new', 'hot', 'top'
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostData, setEditPostData] = useState({ title: '', content: '', category: '' });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  // Update posts list filtering based on category
  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = '';
      
      if (sortBy && sortBy !== 'all') {
        query = `?sort=${sortBy}`;
      }
      
      const response = await api.get(`/posts${query}`);
      const postsWithComments = await Promise.all(
        response.data.map(async (post) => {
          // Get comments for each post
          const commentsResponse = await api.get(`/comments/${post._id}`);
          return { ...post, comments: commentsResponse.data };
        })
      );
      setPosts(postsWithComments);
      setError('');
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get category from URL params
  const category = new URLSearchParams(location.search).get('category') || 'all';

  const handleOpenMenu = (event, post) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPost(post);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedPost(null);
  };

  const handleDeletePost = async (postId) => {
    try {
      if (window.confirm('Are you sure you want to delete this post?')) {
        await api.delete(`/posts/${postId}`);
        setPosts(posts.filter(p => p._id !== postId));
        handleCloseMenu();
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError('Failed to delete post. Please try again.');
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
      formData.append('category', newPost.category);
      
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
      setNewPost({ title: '', content: '', media: null, category: 'free' });
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
      const response = await api.post(`/posts/${postId}/comments`, 
        { content: commentText },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPosts(posts.map(p => p._id === postId ? response.data : p));
      setCommentText('');
    } catch (err) {
      console.error("Error adding comment:", err);
      setError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
      setPosts(posts.map(p => p._id === postId ? response.data : p));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const navigateToPostDetail = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleEditPost = async (postId) => {
    try {
      const post = posts.find(p => p._id === postId);
      if (!post) return;
      
      setEditingPostId(postId);
      setEditPostData({
        title: post.title,
        content: post.content,
        category: post.category
      });
    } catch (err) {
      console.error('Error preparing post for edit:', err);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const response = await api.put(`/posts/${editingPostId}`, editPostData);
      setPosts(posts.map(p => p._id === editingPostId ? response.data : p));
      setEditingPostId(null);
      setEditPostData({ title: '', content: '', category: '' });
    } catch (err) {
      console.error('Failed to update post:', err);
      setError('Failed to update post. Please try again.');
    }
  };

  const handleEditComment = (postId, commentId, content) => {
    setEditingCommentId(commentId);
    setEditCommentText(content);
  };

  const handleUpdateComment = async (postId, commentId) => {
    try {
      const response = await api.put(`/posts/${postId}/comments/${commentId}`, {
        content: editCommentText
      });
      setPosts(posts.map(p => p._id === postId ? response.data : p));
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (err) {
      console.error('Failed to update comment:', err);
      setError('Failed to update comment. Please try again.');
    }
  };

  // Convert URLs in text to clickable links
  const convertLinksToHTML = (text) => {
    if (!text) return '';
    // Simplest regex that catches all URL formats
    const urlRegex = /(https?:\/\/\S+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#0079D3', textDecoration: 'none' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Category and post creation controls */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center', 
        justifyContent: 'space-between', 
        mb: 3,
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#1A1A1B' }}>
          {category === 'all' ? 'Home' : category.charAt(0).toUpperCase() + category.slice(1)}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto',
          gap: isMobile ? 1 : 0
        }}>
          {user && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewPost(true)}
              sx={{
                backgroundColor: '#FF4500',
                '&:hover': { backgroundColor: '#E03D00' },
                borderRadius: 5,
                px: 3,
                width: isMobile ? '100%' : 'auto'
              }}
            >
              New Post
            </Button>
          )}
          <Box sx={{ 
            display: 'flex', 
            ml: isMobile ? 0 : 2, 
            mt: isMobile ? 1 : 0,
            backgroundColor: '#f6f7f8', 
            borderRadius: 2,
            width: isMobile ? '100%' : 'auto'
          }}>
            <Button
              variant={sortBy === 'new' ? 'contained' : 'text'}
              onClick={() => setSortBy('new')}
              sx={{ 
                borderRadius: '16px 0 0 16px',
                backgroundColor: sortBy === 'new' ? '#FF4500' : 'transparent',
                color: sortBy === 'new' ? 'white' : 'inherit',
                '&:hover': { backgroundColor: sortBy === 'new' ? '#E03D00' : 'rgba(255,69,0,0.1)' },
                flex: isMobile ? 1 : 'auto',
                fontSize: isMobile ? '0.75rem' : 'inherit'
              }}
              startIcon={<NewReleasesIcon />}
            >
              New
            </Button>
            <Button
              variant={sortBy === 'hot' ? 'contained' : 'text'}
              onClick={() => setSortBy('hot')}
              sx={{ 
                borderRadius: 0,
                backgroundColor: sortBy === 'hot' ? '#FF4500' : 'transparent',
                color: sortBy === 'hot' ? 'white' : 'inherit',
                '&:hover': { backgroundColor: sortBy === 'hot' ? '#E03D00' : 'rgba(255,69,0,0.1)' },
                flex: isMobile ? 1 : 'auto',
                fontSize: isMobile ? '0.75rem' : 'inherit'
              }}
              startIcon={<WhatshotIcon />}
            >
              Hot
            </Button>
            <Button
              variant={sortBy === 'top' ? 'contained' : 'text'}
              onClick={() => setSortBy('top')}
              sx={{ 
                borderRadius: '0 16px 16px 0',
                backgroundColor: sortBy === 'top' ? '#FF4500' : 'transparent',
                color: sortBy === 'top' ? 'white' : 'inherit',
                '&:hover': { backgroundColor: sortBy === 'top' ? '#E03D00' : 'rgba(255,69,0,0.1)' },
                flex: isMobile ? 1 : 'auto',
                fontSize: isMobile ? '0.75rem' : 'inherit'
              }}
              startIcon={<TrendingUpIcon />}
            >
              Top
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Posts list */}
      <Stack spacing={2}>
        {posts.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6">No posts found in this category</Typography>
            {user && (
              <Button
                variant="contained"
                onClick={() => setOpenNewPost(true)}
                sx={{ mt: 2, backgroundColor: '#FF4500', '&:hover': { backgroundColor: '#E03D00' } }}
              >
                Create First Post
              </Button>
            )}
          </Paper>
        ) : (
          posts.map((post) => (
            <Paper 
              key={post._id} 
              elevation={0}
              sx={{ 
                display: 'flex', 
                mb: 2, 
                borderRadius: 2,
                border: '1px solid #ccc',
                '&:hover': {
                  border: '1px solid #898989'
                }
              }}
            >
              {/* Vote buttons column */}
              <Box sx={{ 
                p: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                backgroundColor: '#F8F9FA',
                borderRadius: '8px 0 0 8px',
                minWidth: '40px'
              }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleVote(post._id, 'upvote')}
                  sx={{ 
                    color: post.userVote === 'upvote' ? '#FF4500' : 'inherit',
                    '&:hover': { color: '#FF4500' }
                  }}
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: post.userVote === 'upvote' 
                      ? '#FF4500' 
                      : post.userVote === 'downvote' 
                        ? '#7193FF' 
                        : 'inherit'
                  }}
                >
                  {post.votes}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleVote(post._id, 'downvote')}
                  sx={{ 
                    color: post.userVote === 'downvote' ? '#7193FF' : 'inherit',
                    '&:hover': { color: '#7193FF' }
                  }}
                >
                  <ArrowDownwardIcon />
                </IconButton>
              </Box>
              
              {/* Post content */}
              <Box sx={{ p: 2, width: '100%' }}>
                {/* Post metadata */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Posted in {post.category.charAt(0).toUpperCase() + post.category.slice(1)} by{' '}
                    <Typography component="span" variant="caption" fontWeight="bold">
                      {post.author?.username || 'Anonymous'}
                    </Typography>
                    {' '}&bull;{' '}
                    {new Date(post.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                
                {/* Post title */}
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 'medium', 
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                    fontSize: isMobile ? '1rem' : '1.25rem'
                  }}
                  onClick={() => navigateToPostDetail(post._id)}
                >
                  {post.title}
                </Typography>
                
                {/* Post content */}
                <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                  {post.content.length > 300 
                    ? convertLinksToHTML(post.content.substring(0, 300) + '...') 
                    : convertLinksToHTML(post.content)
                  }
                </Typography>
                
                {/* Post media */}
                {post.media && (
                  <Box sx={{ mt: 1, mb: 2, maxHeight: 400, overflow: 'hidden' }}>
                    {post.media.includes('.mp4') ? (
                      <video 
                        controls 
                        width="100%" 
                        style={{ maxHeight: 400, objectFit: 'contain' }}
                      >
                        <source src={post.media} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img 
                        src={post.media} 
                        alt={post.title} 
                        style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }}
                      />
                    )}
                  </Box>
                )}
                
                {/* Post actions */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button 
                    startIcon={<ChatIcon />} 
                    onClick={() => toggleComments(post._id)}
                    sx={{ 
                      textTransform: 'none', 
                      color: 'text.secondary',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    {post.comments ? post.comments.length : 0} Comments
                  </Button>
                  
                  <Button 
                    startIcon={<ShareIcon />} 
                    sx={{ 
                      ml: 1, 
                      textTransform: 'none', 
                      color: 'text.secondary',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + '/post/' + post._id);
                    }}
                  >
                    Share
                  </Button>
                  
                  {user && post.author && user._id === post.author._id && (
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleOpenMenu(e, post)}
                      sx={{ ml: 1 }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Stack>

      {/* New Post Dialog */}
      <Dialog open={openNewPost} onClose={() => setOpenNewPost(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Create Post</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newPost.category || 'free'}
              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              label="Category"
            >
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="qna">Q&A</MenuItem>
              <MenuItem value="ai">AI</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={4}
            margin="normal"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          />
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*,video/*"
              style={{ display: 'none' }}
              id="media-upload"
              type="file"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setNewPost({ ...newPost, media: e.target.files[0] });
                }
              }}
            />
            <label htmlFor="media-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ borderRadius: 2 }}
              >
                Upload Media
              </Button>
            </label>
            {newPost.media && (
              <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                {newPost.media.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewPost(false)}>Cancel</Button>
          <Button
            onClick={handleNewPost}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              backgroundColor: '#FF4500',
              '&:hover': { backgroundColor: '#E03D00' }
            }}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comments in Posts */}
      {posts.map((post) => (
        <Collapse in={openComments[post._id]} key={`comments-${post._id}`}>
          <Paper 
            sx={{ 
              mb: 2, 
              p: 2, 
              borderRadius: 2,
              backgroundColor: '#F8F9FA',
              ml: isMobile ? 0 : 3,
              mr: 0,
              border: '1px solid #ccc',
            }}
          >
            {/* Comment form */}
            {user && (
              <Box sx={{ display: 'flex', mb: 3, gap: 1, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: '#FF4500',
                    fontSize: '0.875rem',
                    display: isMobile ? 'none' : 'flex'
                  }}
                >
                  {user.username ? user.username[0].toUpperCase() : '?'}
                </Avatar>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="What are your thoughts?"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  multiline
                  minRows={1}
                  maxRows={4}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleAddComment(post._id)}
                  disabled={!commentText.trim()}
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: commentText.trim() ? '#FF4500' : 'grey.400',
                    '&:hover': { 
                      backgroundColor: commentText.trim() ? '#E03D00' : 'grey.400' 
                    },
                    textTransform: 'none',
                    fontWeight: 'bold',
                    alignSelf: isMobile ? 'flex-end' : 'center',
                    mt: isMobile ? 1 : 0
                  }}
                >
                  Comment
                </Button>
              </Box>
            )}

            {/* Comments list */}
            <Box>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <Box 
                    key={comment._id} 
                    sx={{ 
                      mb: 2, 
                      pb: 2, 
                      borderBottom: '1px solid #eee',
                      '&:last-child': {
                        borderBottom: 'none',
                        mb: 0,
                        pb: 0
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 0.5,
                      flexWrap: isMobile ? 'wrap' : 'nowrap'
                    }}>
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24,
                          fontSize: '0.75rem',
                          bgcolor: 'grey.400'
                        }}
                      >
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
                        <Box sx={{ ml: 'auto', display: 'flex' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditComment(post._id, comment._id, comment.content)}
                            sx={{ p: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteComment(post._id, comment._id)}
                            sx={{ p: 0.5 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    
                    {editingCommentId === comment._id ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 4, mt: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          multiline
                          minRows={1}
                          maxRows={4}
                          sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button 
                            size="small" 
                            onClick={() => setEditingCommentId(null)}
                            sx={{ textTransform: 'none' }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained" 
                            onClick={() => handleUpdateComment(post._id, comment._id)}
                            sx={{ 
                              textTransform: 'none',
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
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No comments yet. Be the first to share your thoughts!
                </Typography>
              )}
            </Box>
          </Paper>
        </Collapse>
      ))}

      {/* Post menu for edit/delete */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEditPost(selectedPost._id)} sx={{ color: 'primary.main' }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Post
        </MenuItem>
        <MenuItem onClick={() => handleDeletePost(selectedPost._id)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Post
        </MenuItem>
      </Menu>

      {/* Edit Post Dialog */}
      <Dialog open={!!editingPostId} onClose={() => setEditingPostId(null)} fullWidth maxWidth="md">
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={editPostData.title}
            onChange={(e) => setEditPostData({...editPostData, title: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            multiline
            rows={4}
            fullWidth
            value={editPostData.content}
            onChange={(e) => setEditPostData({...editPostData, content: e.target.value})}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={editPostData.category}
              onChange={(e) => setEditPostData({...editPostData, category: e.target.value})}
            >
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="qa">Q&A</MenuItem>
              <MenuItem value="ai">AI</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingPostId(null)}>Cancel</Button>
          <Button onClick={handleUpdatePost} variant="contained" color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
