import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

const Comment = ({ 
  comment, 
  onVote, 
  onEdit, 
  onDelete, 
  onReply,
  postId,
  depth = 0
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // Format the comment creation time
  const formattedTime = comment.createdAt ? 
    formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 
    'recently';

  // Check if user is the author of this comment
  const isAuthor = user && comment.author && user._id === comment.author._id;

  // Handle vote
  const handleVote = (type) => {
    if (onVote) {
      onVote(postId, comment._id, type);
    }
  };

  // Handle edit save
  const handleSaveEdit = () => {
    if (onEdit && editText.trim()) {
      onEdit(postId, comment._id, { content: editText.trim() });
      setIsEditing(false);
    }
  };

  // Handle reply submit
  const handleSubmitReply = () => {
    if (onReply && replyText.trim()) {
      onReply(postId, comment._id, { content: replyText.trim() });
      setIsReplying(false);
      setReplyText('');
    }
  };

  // Calculate left margin for nested comments
  const leftMargin = Math.min(depth * 12, 36); // Cap at 36px

  return (
    <View style={[styles.commentContainer, { marginLeft: leftMargin }]}>
      <View style={styles.commentHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>
            {comment.author ? comment.author.username : 'Anonymous'}
          </Text>
          {comment.author && (
            <Text style={styles.karma}>• {comment.author.karma || 0} karma</Text>
          )}
          <Text style={styles.timestamp}>• {formattedTime}</Text>
        </View>
      </View>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            multiline
            autoFocus
          />
          <View style={styles.editButtons}>
            <TouchableOpacity 
              style={[styles.editButton, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, styles.saveButton]}
              onPress={handleSaveEdit}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.content}>{comment.content}</Text>
      )}

      <View style={styles.commentFooter}>
        <View style={styles.voteContainer}>
          <TouchableOpacity onPress={() => handleVote('up')}>
            <MaterialIcons 
              name="arrow-upward" 
              size={16} 
              color={comment.userVote === 'up' ? '#FF4500' : '#757575'} 
            />
          </TouchableOpacity>
          <Text style={styles.voteCount}>{comment.votes?.total || 0}</Text>
          <TouchableOpacity onPress={() => handleVote('down')}>
            <MaterialIcons 
              name="arrow-downward" 
              size={16} 
              color={comment.userVote === 'down' ? '#9494FF' : '#757575'} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setIsReplying(!isReplying)}
          >
            <Text style={styles.actionButtonText}>Reply</Text>
          </TouchableOpacity>

          {isAuthor && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onDelete && onDelete(postId, comment._id)}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {isReplying && (
        <View style={styles.replyContainer}>
          <TextInput
            style={styles.replyInput}
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Write a reply..."
            multiline
            autoFocus
          />
          <View style={styles.replyButtons}>
            <TouchableOpacity 
              style={[styles.replyButton, styles.cancelButton]}
              onPress={() => setIsReplying(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.replyButton, styles.submitButton]}
              onPress={handleSubmitReply}
            >
              <Text style={styles.submitButtonText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Render nested replies if any */}
      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map(reply => (
            <Comment
              key={reply._id}
              comment={reply}
              onVote={onVote}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#ddd',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#333',
  },
  karma: {
    marginLeft: 4,
    fontSize: 11,
    color: '#666',
  },
  timestamp: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  content: {
    fontSize: 14,
    color: '#333',
    marginVertical: 6,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteCount: {
    marginHorizontal: 6,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  deleteButtonText: {
    color: '#f44336',
  },
  editContainer: {
    marginVertical: 6,
  },
  editInput: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    minHeight: 60,
    fontSize: 14,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editButton: {
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#fff',
  },
  replyContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  replyInput: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    minHeight: 60,
    fontSize: 14,
  },
  replyButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  replyButton: {
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  submitButtonText: {
    color: '#fff',
  },
  repliesContainer: {
    marginTop: 8,
  },
});

export default Comment;
