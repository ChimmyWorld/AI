import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import {
  Image as ImageIcon,
  Link as LinkIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../api';

const CreatePostForm = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('free');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setMedia(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveMedia = () => {
    setMedia(null);
    setMediaPreview(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      
      if (media) {
        formData.append('media', media);
      }
      
      await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Reset form
      setTitle('');
      setContent('');
      setCategory('free');
      setMedia(null);
      setMediaPreview(null);
      
      // Notify parent component
      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="category-label">Category</InputLabel>
        <Select
          labelId="category-label"
          value={category}
          label="Category"
          onChange={(e) => setCategory(e.target.value)}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 300,
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1.5,
                  fontSize: "14px",
                  fontWeight: 400
                }
              }
            }
          }}
          sx={{
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 1.5
            }
          }}
        >
          <MenuItem value="free">Free</MenuItem>
          <MenuItem value="qna">Q&A</MenuItem>
          <MenuItem value="ai">AI</MenuItem>
        </Select>
      </FormControl>
      
      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        margin="normal"
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        multiline
        rows={6}
        margin="normal"
        sx={{ mb: 2 }}
      />
      
      {/* Media preview */}
      {mediaPreview && (
        <Box sx={{ 
          mb: 2, 
          position: 'relative',
          border: '1px solid #ccc',
          borderRadius: '4px',
          p: 1
        }}>
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
              zIndex: 1
            }}
            size="small"
            onClick={handleRemoveMedia}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          
          {media.type.startsWith('image/') ? (
            <Box
              component="img"
              src={mediaPreview}
              alt="Media preview"
              sx={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: '4px'
              }}
            />
          ) : media.type.startsWith('video/') ? (
            <Box
              component="video"
              src={mediaPreview}
              controls
              sx={{
                width: '100%',
                maxHeight: '300px',
                borderRadius: '4px'
              }}
            />
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography>
                {media.name} ({Math.round(media.size / 1024)} KB)
              </Typography>
            </Box>
          )}
        </Box>
      )}
      
      {/* Media upload options */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: 2
      }}>
        <input
          accept="image/*,video/*"
          id="media-upload"
          type="file"
          onChange={handleMediaChange}
          style={{ display: 'none' }}
        />
        
        <label htmlFor="media-upload">
          <Button
            component="span"
            startIcon={<CloudUploadIcon />}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: '#ccc',
              color: '#878A8C'
            }}
          >
            Upload
          </Button>
        </label>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button 
          variant="text" 
          onClick={onCancel}
          disabled={loading}
          sx={{ 
            color: '#878A8C',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)'
            }
          }}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !title.trim()}
          sx={{
            bgcolor: '#FF4500',
            '&:hover': {
              bgcolor: '#e03d00'
            },
            '&.Mui-disabled': {
              bgcolor: '#ffcbba',
              color: 'white'
            }
          }}
        >
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </Box>
    </Box>
  );
};

export default CreatePostForm;
