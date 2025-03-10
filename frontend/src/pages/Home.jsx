import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  TextField
} from '@mui/material';
import {
  ArrowUpward as UpvoteIcon,
  ArrowDownward as DownvoteIcon,
  Comment as CommentIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [openNewPost, setOpenNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', media: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get category from URL params
  const category = new URLSearchParams(location.search).get('category') || 'free';

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/posts?category=${category}`);
      setPosts(response.data);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!user) return;
    try {
      await axios.post(`/api/posts/${postId}/vote`, { type: voteType }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchPosts();
    } catch (err) {
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

      await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setOpenNewPost(false);
      setNewPost({ title: '', content: '', media: null });
      fetchPosts();
    } catch (err) {
      setError('Failed to create post');
    }
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
            Create Post
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
                    color={post.userVote === 'up' ? 'primary' : 'default'}
                  >
                    <UpvoteIcon />
                  </IconButton>
                  <Typography>{post.votes}</Typography>
                  <IconButton
                    onClick={() => handleVote(post._id, 'down')}
                    color={post.userVote === 'down' ? 'primary' : 'default'}
                  >
                    <DownvoteIcon />
                  </IconButton>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>{post.author[0]}</Avatar>
                    <Typography variant="body2">Posted by {post.author}</Typography>
                  </Box>
                  <Typography variant="h6">{post.title}</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>{post.content}</Typography>
                  {post.mediaUrl && (
                    <Box sx={{ mt: 2 }}>
                      {post.mediaType?.startsWith('image') ? (
                        <img src={post.mediaUrl} alt="Post media" style={{ maxWidth: '100%' }} />
                      ) : post.mediaType?.startsWith('video') ? (
                        <video controls src={post.mediaUrl} style={{ maxWidth: '100%' }} />
                      ) : null}
                    </Box>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CommentIcon fontSize="small" />
                    <Typography variant="body2">{post.comments?.length || 0} comments</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

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
    </Box>
  );
}
