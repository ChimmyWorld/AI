import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

const Post = ({ post, onPress, onVote }) => {
  // Format the post creation time
  const formattedTime = post.createdAt ? 
    formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 
    'recently';

  // Handle vote button press
  const handleVote = (type) => {
    if (onVote) {
      onVote(post._id, type);
    }
  };

  // Determine if post has media
  const hasMedia = post.media && post.media.length > 0;
  
  // Get the first media item for preview
  const firstMedia = hasMedia ? post.media[0] : null;
  
  // Set category colors
  const getCategoryColor = () => {
    switch (post.category) {
      case 'free': return '#4CAF50'; // Green
      case 'qa': return '#2196F3';   // Blue
      case 'ai': return '#9C27B0';   // Purple
      default: return '#757575';     // Grey
    }
  };

  // Format the category name
  const formatCategory = (category) => {
    switch (category) {
      case 'free': return 'Free';
      case 'qa': return 'Q&A';
      case 'ai': return 'AI';
      default: return category;
    }
  };

  return (
    <TouchableOpacity style={styles.postContainer} onPress={() => onPress(post._id)}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          {post.author && (
            <>
              <Text style={styles.username}>{post.author.username || 'Anonymous'}</Text>
              <Text style={styles.karma}>• {post.author.karma || 0} karma</Text>
            </>
          )}
          <Text style={styles.timestamp}>• {formattedTime}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
          <Text style={styles.categoryText}>{formatCategory(post.category)}</Text>
        </View>
      </View>
      
      <Text style={styles.title}>{post.title}</Text>
      
      {post.content && (
        <Text style={styles.content} numberOfLines={3}>
          {post.content}
        </Text>
      )}
      
      {hasMedia && firstMedia.type === 'image' && (
        <Image 
          source={{ uri: firstMedia.url }} 
          style={styles.mediaPreview} 
          resizeMode="cover"
        />
      )}
      
      {hasMedia && firstMedia.type === 'video' && (
        <View style={styles.videoPreview}>
          <Image 
            source={{ uri: firstMedia.url.replace('mp4', 'jpg') }} 
            style={styles.mediaPreview} 
            resizeMode="cover"
          />
          <View style={styles.playButton}>
            <MaterialIcons name="play-arrow" size={40} color="#fff" />
          </View>
        </View>
      )}
      
      {hasMedia && post.media.length > 1 && (
        <Text style={styles.moreMedia}>+{post.media.length - 1} more</Text>
      )}
      
      <View style={styles.postFooter}>
        <View style={styles.voteContainer}>
          <TouchableOpacity onPress={() => handleVote('up')}>
            <MaterialIcons name="arrow-upward" size={20} color="#757575" />
          </TouchableOpacity>
          <Text style={styles.voteCount}>{post.votes?.total || 0}</Text>
          <TouchableOpacity onPress={() => handleVote('down')}>
            <MaterialIcons name="arrow-downward" size={20} color="#757575" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.commentContainer}>
          <MaterialIcons name="comment" size={20} color="#757575" />
          <Text style={styles.commentCount}>{post.commentCount || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  karma: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  content: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  mediaPreview: {
    width: '100%',
    height: 180,
    borderRadius: 6,
    marginVertical: 6,
  },
  videoPreview: {
    position: 'relative',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreMedia: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteCount: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
});

export default Post;
