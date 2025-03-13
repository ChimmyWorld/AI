import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../hooks/useAuth';
import { createPost } from '../api';

const categories = [
  { id: 'free', name: 'Free' },
  { id: 'qna', name: 'Q&A' },
  { id: 'ai', name: 'AI' }
];

const CreatePostScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your post');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);
    try {
      const newPost = {
        title,
        content,
        category: selectedCategory,
      };
      
      await createPost(newPost);
      
      Alert.alert(
        'Success',
        'Your post has been created!',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryPicker = () => {
    if (!showCategoryPicker) return null;
    
    return (
      <View style={styles.categoryPickerContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.selectedCategoryItem
            ]}
            onPress={() => {
              setSelectedCategory(category.id);
              setShowCategoryPicker(false);
            }}
          >
            <Text
              style={[
                styles.categoryItemText,
                selectedCategory === category.id && styles.selectedCategoryItemText
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Post</Text>
      </View>
      
      <View style={styles.formContainer}>
        <TouchableOpacity
          style={styles.categorySelector}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
        >
          <Text style={styles.categorySelectorText}>
            {selectedCategory
              ? categories.find(c => c.id === selectedCategory)?.name
              : 'Select Category'}
          </Text>
          <MaterialIcons
            name={showCategoryPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color="#7C7C7C"
          />
        </TouchableOpacity>
        
        {renderCategoryPicker()}
        
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          maxLength={300}
        />
        
        <TextInput
          style={styles.contentInput}
          placeholder="What would you like to share? (optional)"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={() => Alert.alert('Coming Soon', 'Image upload will be available soon!')}
          >
            <MaterialIcons name="image" size={24} color="#7C7C7C" />
            <Text style={styles.mediaButtonText}>Add Image</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.postButton,
              (!title.trim() || !selectedCategory) && styles.disabledButton
            ]}
            disabled={loading || !title.trim() || !selectedCategory}
            onPress={handleSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#7C7C7C',
  },
  categoryPickerContainer: {
    marginTop: -8,
    marginBottom: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#DDDDDD',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedCategoryItem: {
    backgroundColor: '#F6F7F8',
  },
  categoryItemText: {
    fontSize: 16,
  },
  selectedCategoryItemText: {
    fontWeight: 'bold',
    color: '#FF4500',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 200,
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  mediaButtonText: {
    marginLeft: 8,
    color: '#7C7C7C',
  },
  postButton: {
    backgroundColor: '#FF4500',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreatePostScreen;
