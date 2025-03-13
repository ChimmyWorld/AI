import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  IconButton, 
  Avatar, 
  Link as MuiLink
} from '@mui/material';
import { 
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import { formatters } from '@community-forum/shared';

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const [voteStatus, setVoteStatus] = useState(post.userVote || 0);
  const [voteCount, setVoteCount] = useState(post.votes || 0);
  const [isVoting, setIsVoting] = useState(false);
  const { user } = useAuth();
  
  const handleVote = async (value) => {
    // Prevent voting if not logged in
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Prevent multiple vote requests
    if (isVoting) return;
    
    try {
      setIsVoting(true);
      
      // Calculate new vote value
      const newVoteValue = voteStatus === value ? 0 : value;
      
      // Optimistically update UI
      const voteChange = newVoteValue - voteStatus;
      setVoteStatus(newVoteValue);
      setVoteCount(prevCount => prevCount + voteChange);
      
      // Send vote to API
      await api.post(`/posts/${post._id}/vote`, { value: newVoteValue });
    } catch (error) {
      // Revert on error
      console.error('Voting failed:', error);
      setVoteStatus(post.userVote || 0);
      setVoteCount(post.votes || 0);
    } finally {
      setIsVoting(false);
    }
  };

  const handlePostClick = (e) => {
    // Don't navigate if clicking on vote buttons
    if (e.target.closest('.vote-button')) {
      return;
    }
    
    navigate(`/post/${post._id}`);
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 2, 
        borderRadius: '4px',
        border: '1px solid #ccc',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        bgcolor: 'white',
        '&:hover': {
          border: '1px solid #898989',
        }
      }}
    >
      {/* Vote sidebar */}
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 1,
          minWidth: '40px',
          bgcolor: '#F8F9FA',
          borderRight: '1px solid #EDEFF1'
        }}
      >
        <IconButton 
          size="small" 
          className="vote-button"
          onClick={() => handleVote(1)}
          sx={{ 
            color: voteStatus === 1 ? '#FF4500' : '#878A8C',
            p: 0.5
          }}
        >
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
        
        <Typography variant="body2" sx={{ 
          fontWeight: 'bold', 
          color: voteStatus === 1 ? '#FF4500' : voteStatus === -1 ? '#7193FF' : '#1A1A1B',
          fontSize: '12px',
          my: 0.5
        }}>
          {formatters.formatNumber(voteCount)}
        </Typography>
        
        <IconButton 
          size="small" 
          className="vote-button"
          onClick={() => handleVote(-1)}
          sx={{ 
            color: voteStatus === -1 ? '#7193FF' : '#878A8C',
            p: 0.5
          }}
        >
          <ArrowDownwardIcon fontSize="small" />
        </IconButton>
      </Box>
      
      {/* Main content */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          p: 1,
          cursor: 'pointer'
        }}
        onClick={handlePostClick}
      >
        {/* Post metadata */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '12px',
              color: '#787C7E',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            Posted in{' '}
            <Box 
              component="span" 
              sx={{ 
                fontWeight: 'bold',
                color: '#0079D3',
                mx: 0.5
              }}
            >
              {post.category}
            </Box>
            by{' '}
            <Box 
              component="span" 
              sx={{ 
                mx: 0.5,
                fontWeight: 'medium'
              }}
            >
              {post.author?.username || '[deleted]'}
            </Box>
            <Box component="span" sx={{ mx: 0.5 }}>•</Box>
            {formatters.formatRelativeTime(post.createdAt)}
          </Typography>
        </Box>
        
        {/* Post title */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '18px',
            fontWeight: 'medium',
            color: '#222',
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {post.title}
        </Typography>
        
        {/* Post content - truncated */}
        {post.content && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#1A1A1B',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {post.content}
          </Typography>
        )}
        
        {/* Media preview */}
        {post.mediaUrl && (
          <Box sx={{ 
            mb: 1, 
            maxHeight: '250px', 
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center'
          }}>
            {post.mediaType === 'image' ? (
              <Box 
                component="img" 
                src={post.mediaUrl} 
                alt="Post media" 
                sx={{ 
                  maxWidth: '100%', 
                  maxHeight: '250px', 
                  objectFit: 'contain'
                }} 
              />
            ) : post.mediaType === 'video' ? (
              <Box 
                component="video"
                controls
                sx={{ maxWidth: '100%', maxHeight: '250px' }}
              >
                <source src={post.mediaUrl} />
                Your browser does not support the video tag.
              </Box>
            ) : (
              <MuiLink 
                href={post.mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ color: '#0079D3', textDecoration: 'none' }}
              >
                {post.mediaUrl}
              </MuiLink>
            )}
          </Box>
        )}
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ChatBubbleOutlineIcon />}
            size="small"
            sx={{ 
              color: '#878A8C',
              textTransform: 'none',
              mr: 1,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
                color: '#1A1A1B'
              }
            }}
          >
            {formatters.formatNumber(post.commentCount || 0)} Comments
          </Button>
          
          <Button
            startIcon={<ShareIcon />}
            size="small"
            sx={{ 
              color: '#878A8C',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
                color: '#1A1A1B'
              }
            }}
          >
            Share
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PostCard;
