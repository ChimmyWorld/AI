import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

const PostCard = ({ post, onPress }) => {
  const { title, content, category, author, createdAt, upvotes, downvotes, commentCount, media } = post;
  const { user } = useAuth();
  
  // Format the post date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Calculate vote count
  const voteCount = (upvotes?.length || 0) - (downvotes?.length || 0);
  
  // Check if user has voted on this post
  const hasUpvoted = user && upvotes?.includes(user._id);
  const hasDownvoted = user && downvotes?.includes(user._id);
  
  // Format category name
  const getCategoryName = (cat) => {
    switch (cat) {
      case 'free': return 'Free';
      case 'qna': return 'Q&A';
      case 'ai': return 'AI';
      default: return cat;
    }
  };
  
  // Truncate content if too long
  const truncatedContent = content && content.length > 150 
    ? `${content.substring(0, 150)}...` 
    : content;
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <Text style={styles.category}>r/{getCategoryName(category)}</Text>
        <Text style={styles.authorInfo}>
          Posted by u/{author?.username || 'Anonymous'} • {formattedDate}
        </Text>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      {truncatedContent && (
        <Text style={styles.content}>{truncatedContent}</Text>
      )}
      
      {media && media.length > 0 && media[0].type === 'image' && (
        <Image 
          source={{ uri: media[0].url }} 
          style={styles.mediaImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.footer}>
        <View style={styles.voteContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons 
              name="arrow-upward" 
              size={20} 
              color={hasUpvoted ? '#FF4500' : '#878A8C'} 
            />
          </TouchableOpacity>
          
          <Text style={[
            styles.voteCount, 
            voteCount > 0 ? styles.positiveVote : 
            voteCount < 0 ? styles.negativeVote : null
          ]}>
            {voteCount}
          </Text>
          
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons 
              name="arrow-downward" 
              size={20} 
              color={hasDownvoted ? '#7193FF' : '#878A8C'} 
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.commentButton}>
          <MaterialCommunityIcons name="comment-outline" size={20} color="#878A8C" />
          <Text style={styles.commentCount}>{commentCount || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={20} color="#878A8C" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  category: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1A1A1B',
  },
  authorInfo: {
    fontSize: 12,
    color: '#787C7E',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1B',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#1A1A1B',
    marginBottom: 8,
    lineHeight: 20,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#F0F0F0',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  iconButton: {
    padding: 4,
  },
  voteCount: {
    marginHorizontal: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1B',
  },
  positiveVote: {
    color: '#FF4500',
  },
  negativeVote: {
    color: '#7193FF',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  commentCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#878A8C',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#878A8C',
  },
});

export default PostCard;
