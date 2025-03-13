import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { formatters } from '@community-forum/shared';
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * Post item component for displaying a post in a list
 * Demonstrates using shared formatters for dates and numbers
 */
const PostItem = ({ post, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(post)}>
      <View style={styles.header}>
        <Text style={styles.category}>{post.category.toUpperCase()}</Text>
        <Text style={styles.timeAgo}>{formatters.formatRelativeTime(post.createdAt)}</Text>
      </View>
      
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content}>{formatters.truncateText(post.content, 150)}</Text>
      
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      )}
      
      <View style={styles.footer}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{post.author.username}</Text>
        </View>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Icon name="thumbs-up" size={16} color="#4F8EF7" />
            <Text style={styles.statText}>{formatters.formatNumber(post.upvotes)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="thumbs-down" size={16} color="#F75D4F" />
            <Text style={styles.statText}>{formatters.formatNumber(post.downvotes)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="comment" size={16} color="#808080" />
            <Text style={styles.statText}>{formatters.formatNumber(post.commentCount)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  category: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F8EF7',
  },
  timeAgo: {
    fontSize: 12,
    color: '#808080',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 12,
    color: '#808080',
    marginLeft: 4,
  },
});

export default PostItem;
