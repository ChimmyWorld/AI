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
import PostService from '../services/posts';
import CommentService from '../services/comments';
import LoadingSpinner from '../components/LoadingSpinner';
import Comment from '../components/Comment';

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
      const data = await PostService.getPost(postId);
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
      const updatedPost = await PostService.votePost(postId, voteType);
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
      await CommentService.addComment(postId, { content: commentText.trim() });
      setCommentText('');
      fetchPost(); // Refresh post data to show new comment
    } catch (err) {
      console.error('Error adding comment:', err);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentVote = async (postId, commentId, voteType) => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to vote on comments');
      return;
    }

    try {
      await CommentService.voteComment(postId, commentId, voteType);
      fetchPost(); // Refresh to show updated vote counts
    } catch (err) {
      console.error('Error voting on comment:', err);
      Alert.alert('Error', 'Failed to register your vote. Please try again.');
    }
  };

  const handleEditComment = async (postId, commentId, data) => {
    try {
      await CommentService.updateComment(postId, commentId, data);
      fetchPost(); // Refresh to show updated comment
    } catch (err) {
      console.error('Error updating comment:', err);
      Alert.alert('Error', 'Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await CommentService.deleteComment(postId, commentId);
              fetchPost(); // Refresh to remove deleted comment
            } catch (err) {
              console.error('Error deleting comment:', err);
              Alert.alert('Error', 'Failed to delete comment. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleReplyToComment = async (postId, commentId, data) => {
    try {
      await CommentService.addComment(postId, {
        ...data,
        parentId: commentId
      });
      fetchPost(); // Refresh to show new reply
    } catch (err) {
      console.error('Error adding reply:', err);
      Alert.alert('Error', 'Failed to add reply. Please try again.');
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
    return <LoadingSpinner text="Loading post..." />;
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
                onPress={() => handleVote('up')}
              >
                <MaterialIcons 
                  name="arrow-upward" 
                  size={24} 
                  color={post.userVote === 'up' ? '#FF4500' : '#878A8C'} 
                />
              </TouchableOpacity>
              
              <Text style={[
                styles.voteCount, 
                post.votes?.total > 0 ? styles.positiveVote : 
                post.votes?.total < 0 ? styles.negativeVote : null
              ]}>
                {post.votes?.total || 0}
              </Text>
              
              <TouchableOpacity 
                style={styles.voteButton}
                onPress={() => handleVote('down')}
              >
                <MaterialIcons 
                  name="arrow-downward" 
                  size={24} 
                  color={post.userVote === 'down' ? '#7193FF' : '#878A8C'} 
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
          
          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!commentText.trim() || submitting) && styles.disabledButton
              ]}
              onPress={handleAddComment}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {post.comments?.length > 0 ? (
            <View style={styles.commentsList}>
              {post.comments.map(comment => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  postId={postId}
                  onVote={handleCommentVote}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onReply={handleReplyToComment}
                />
              ))}
            </View>
          ) : (
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    color: '#FF4500',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
  },
  postHeader: {
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0079D3',
    marginBottom: 4,
  },
  authorInfo: {
    fontSize: 12,
    color: '#787C7E',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 10,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1C1C1C',
    marginBottom: 10,
  },
  mediaImage: {
    width: '100%',
    height: 300,
    borderRadius: 4,
    marginBottom: 10,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
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
    marginHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1A1A1B',
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
    padding: 4,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#878A8C',
  },
  commentsSection: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 12,
  },
  commentsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1A1A1B',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align at the bottom
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EDEFF1',
    borderRadius: 4,
    backgroundColor: '#F6F7F8',
    padding: 8,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    color: '#1A1A1B',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EDEFF1',
  },
  submitButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 40,
  },
  disabledButton: {
    backgroundColor: '#FFB280',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentsList: {
    marginTop: 10,
  },
  noCommentsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 14,
    color: '#787C7E',
    textAlign: 'center',
  },
});

export default PostDetailScreen;
