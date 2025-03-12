import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../hooks/useAuth';
import { getPost, voteOnPost, addComment } from '../api';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPost(postId);
      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to vote on posts');
      return;
    }

    try {
      const updatedPost = await voteOnPost(postId, voteType);
      setPost(updatedPost);
    } catch (err) {
      console.error('Error voting:', err);
      Alert.alert('Error', 'Failed to register your vote. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to comment');
      return;
    }

    setSubmitting(true);
    try {
      await addComment(postId, commentText.trim());
      setCommentText('');
      fetchPost(); // Refresh post data to show new comment
    } catch (err) {
      console.error('Error adding comment:', err);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchPost}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const voteCount = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
  const hasUpvoted = user && post.upvotes?.includes(user._id);
  const hasDownvoted = user && post.downvotes?.includes(user._id);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Text style={styles.category}>r/{post.category}</Text>
            <Text style={styles.authorInfo}>
              Posted by u/{post.author?.username || 'Anonymous'} • {formatDate(post.createdAt)}
            </Text>
          </View>
          
          <Text style={styles.title}>{post.title}</Text>
          
          {post.content && (
            <Text style={styles.content}>{post.content}</Text>
          )}
          
          {post.media && post.media.length > 0 && post.media[0].type === 'image' && (
            <Image 
              source={{ uri: post.media[0].url }} 
              style={styles.mediaImage}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.actionsBar}>
            <View style={styles.voteContainer}>
              <TouchableOpacity 
                style={styles.voteButton}
                onPress={() => handleVote('upvote')}
              >
                <MaterialIcons 
                  name="arrow-upward" 
                  size={24} 
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
              
              <TouchableOpacity 
                style={styles.voteButton}
                onPress={() => handleVote('downvote')}
              >
                <MaterialIcons 
                  name="arrow-downward" 
                  size={24} 
                  color={hasDownvoted ? '#7193FF' : '#878A8C'} 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="share" size={20} color="#878A8C" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="bookmark-border" size={20} color="#878A8C" />
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>
            Comments ({post.comments?.length || 0})
          </Text>
          
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment, index) => (
              <View key={comment._id || index} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>
                    {comment.author?.username || 'Anonymous'}
                  </Text>
                  <Text style={styles.commentDate}>
                    {formatDate(comment.createdAt)}
                  </Text>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity style={styles.commentActionButton}>
                    <MaterialIcons name="arrow-upward" size={16} color="#878A8C" />
                  </TouchableOpacity>
                  <Text style={styles.commentVotes}>0</Text>
                  <TouchableOpacity style={styles.commentActionButton}>
                    <MaterialIcons name="arrow-downward" size={16} color="#878A8C" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.commentActionButton}>
                    <Text style={styles.replyText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noCommentsText}>No comments yet</Text>
              <Text style={styles.noCommentsSubText}>Be the first to share your thoughts!</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.postCommentButton,
            (!commentText.trim() || submitting) && styles.disabledButton
          ]}
          disabled={!commentText.trim() || submitting}
          onPress={handleAddComment}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <MaterialIcons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  postHeader: {
    marginBottom: 12,
  },
  category: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1A1A1B',
    marginBottom: 4,
  },
  authorInfo: {
    fontSize: 12,
    color: '#787C7E',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1B',
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1B',
    marginBottom: 16,
  },
  mediaImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F0F0F0',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    marginHorizontal: 4,
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  positiveVote: {
    color: '#FF4500',
  },
  negativeVote: {
    color: '#7193FF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#878A8C',
  },
  commentsSection: {
    backgroundColor: 'white',
    padding: 16,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  commentItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#CCCCCC',
    paddingLeft: 12,
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  commentDate: {
    fontSize: 12,
    color: '#787C7E',
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentActionButton: {
    padding: 4,
    marginRight: 4,
  },
  commentVotes: {
    marginHorizontal: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  replyText: {
    fontSize: 12,
    color: '#878A8C',
    fontWeight: '500',
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noCommentsSubText: {
    fontSize: 14,
    color: '#787C7E',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F6F7F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  postCommentButton: {
    backgroundColor: '#FF4500',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
});

export default PostDetailScreen;
