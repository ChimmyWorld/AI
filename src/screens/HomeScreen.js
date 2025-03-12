import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { getPosts } from '../api';
import PostCard from '../components/PostCard';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'free', name: 'Free' },
  { id: 'qna', name: 'Q&A' },
  { id: 'ai', name: 'AI' }
];

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);

  const fetchPosts = async (category = selectedCategory) => {
    try {
      setError(null);
      setLoading(true);
      
      // Get category filter (empty string for 'all')
      const categoryFilter = category === 'all' ? '' : category;
      const data = await getPosts(categoryFilter);
      
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handlePostPress = (postId) => {
    navigation.navigate('PostDetail', { postId });
  };

  const renderCategoryTabs = () => (
    <View style={styles.tabContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tabItem,
              selectedCategory === item.id && styles.selectedTab
            ]}
            onPress={() => handleCategorySelect(item.id)}
          >
            <Text 
              style={[
                styles.tabText,
                selectedCategory === item.id && styles.selectedTabText
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {renderCategoryTabs()}
      
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchPosts()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              onPress={() => handlePostPress(item._id)} 
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#FF4500']}
            />
          }
          contentContainerStyle={posts.length === 0 ? styles.emptyListContent : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts found</Text>
              <Text style={styles.emptySubText}>
                Be the first to create a post in this category!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  tabContainer: {
    backgroundColor: 'white',
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  selectedTab: {
    backgroundColor: '#FF4500',
  },
  tabText: {
    color: '#1A1A1B',
    fontWeight: '500',
  },
  selectedTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#7C7C7C',
    textAlign: 'center',
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
});

export default HomeScreen;
