import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './hooks/useAuth';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("App crashed with error:", error, errorInfo);
    
    // You can send this error to a logging service
    if (Platform.OS !== 'web') {
      Alert.alert(
        "App Error",
        `The app crashed with error: ${error.toString()}. Please report this issue.`,
        [{ text: "OK" }]
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            {this.state.error && this.state.error.toString()}
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// Simple MVP screens
const LoginScreen = ({ onLogin }) => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Login Screen</Text>
    <View style={styles.formGroup}>
      <Text style={styles.label}>Username</Text>
      <View style={styles.input}><Text>demo@example.com</Text></View>
    </View>
    <View style={styles.formGroup}>
      <Text style={styles.label}>Password</Text>
      <View style={styles.input}><Text>********</Text></View>
    </View>
    <TouchableOpacity style={styles.button} onPress={onLogin}>
      <Text style={styles.buttonText}>Login</Text>
    </TouchableOpacity>
    <Text style={styles.helperText}>* For demo, any credentials will work</Text>
  </View>
);

const HomeScreen = ({ onLogout, onViewPost }) => (
  <View style={styles.screenContainer}>
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>B</Text>
        </View>
        <Text style={styles.logoTitle}>bullseye</Text>
      </View>
      <TouchableOpacity style={styles.smallButton} onPress={onLogout}>
        <Text style={styles.smallButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
    
    <View style={styles.tabs}>
      <TouchableOpacity style={[styles.tab, styles.activeTab]}>
        <Text style={styles.activeTabText}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab}>
        <Text style={styles.tabText}>Free</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab}>
        <Text style={styles.tabText}>Q&A</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab}>
        <Text style={styles.tabText}>AI</Text>
      </TouchableOpacity>
    </View>
    
    <View style={styles.postContainer}>
      <TouchableOpacity style={styles.post} onPress={onViewPost}>
        <Text style={styles.postTitle}>Welcome to Bullseye!</Text>
        <Text style={styles.postContent}>This is our first community post. Click to view details and comments.</Text>
        <View style={styles.postMeta}>
          <Text style={styles.postAuthor}>Posted by: Admin</Text>
          <Text style={styles.postVotes}>▲ 42 ▼</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.post} onPress={onViewPost}>
        <Text style={styles.postTitle}>How to use the Bullseye app?</Text>
        <Text style={styles.postContent}>A quick guide to get started with our community forum app.</Text>
        <View style={styles.postMeta}>
          <Text style={styles.postAuthor}>Posted by: Guide</Text>
          <Text style={styles.postVotes}>▲ 38 ▼</Text>
        </View>
      </TouchableOpacity>
    </View>
    
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerButton}>
        <Text>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerButton}>
        <Text>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.footerButton, styles.createButton]}>
        <Text style={styles.createButtonText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerButton}>
        <Text>Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerButton}>
        <Text>Profile</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const PostDetailScreen = ({ onBack }) => (
  <View style={styles.screenContainer}>
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.screenTitle}>Post Detail</Text>
    </View>
    
    <View style={styles.postDetailContainer}>
      <Text style={styles.postDetailTitle}>Welcome to Bullseye!</Text>
      <Text style={styles.postDetailAuthor}>Posted by: Admin</Text>
      <Text style={styles.postDetailContent}>
        This is our first community post. Welcome to the Bullseye community forum!
        
        We're excited to have you join our growing community. Feel free to participate in discussions,
        ask questions, and share your thoughts on various topics.
      </Text>
      
      <View style={styles.votingContainer}>
        <TouchableOpacity style={styles.voteButton}>
          <Text style={styles.voteButtonText}>▲</Text>
        </TouchableOpacity>
        <Text style={styles.voteCount}>42</Text>
        <TouchableOpacity style={styles.voteButton}>
          <Text style={styles.voteButtonText}>▼</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.commentsSection}>
        <Text style={styles.commentsSectionTitle}>Comments</Text>
        
        <View style={styles.comment}>
          <Text style={styles.commentAuthor}>User123</Text>
          <Text style={styles.commentContent}>Great to be here! Looking forward to interesting discussions.</Text>
          <View style={styles.commentMeta}>
            <Text style={styles.commentTime}>2 hours ago</Text>
            <Text style={styles.commentVotes}>▲ 5 ▼</Text>
          </View>
        </View>
        
        <View style={styles.comment}>
          <Text style={styles.commentAuthor}>NewMember</Text>
          <Text style={styles.commentContent}>Just joined! This looks promising.</Text>
          <View style={styles.commentMeta}>
            <Text style={styles.commentTime}>1 hour ago</Text>
            <Text style={styles.commentVotes}>▲ 3 ▼</Text>
          </View>
        </View>
        
        <View style={styles.addCommentContainer}>
          <Text style={styles.addCommentLabel}>Add your comment:</Text>
          <View style={styles.commentInput}><Text>Type your comment here...</Text></View>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Post Comment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

const App = () => {
  const [screen, setScreen] = useState('login'); // 'login', 'home', 'post'
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // Simulate app initialization
    const prepareApp = async () => {
      try {
        // Add any initialization logic here
        console.log('App initialized successfully');
        setAppReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        Alert.alert('Initialization Error', error.toString());
      }
    };
    
    prepareApp();
  }, []);
  
  const handleLogin = () => setScreen('home');
  const handleLogout = () => setScreen('login');
  const handleViewPost = () => setScreen('post');
  const handleBackToHome = () => setScreen('home');
  
  if (!appReady) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text>Loading Bullseye...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
  
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <AuthProvider>
            {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
            {screen === 'home' && <HomeScreen onLogout={handleLogout} onViewPost={handleViewPost} />}
            {screen === 'post' && <PostDetailScreen onBack={handleBackToHome} />}
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web' ? {
      maxWidth: 500,
      maxHeight: 800,
      height: '100%',
      marginHorizontal: 'auto',
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: '#eaeaea',
    } : {})
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
    } : Platform.OS === 'ios' ? {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4
    } : {
      elevation: 4
    })
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  formGroup: {
    marginBottom: 15,
    padding: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#FF4500',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  smallButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
  },
  smallButtonText: {
    color: '#333',
    fontSize: 12,
  },
  helperText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 5,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#FF4500',
  },
  tabText: {
    color: '#333',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postContainer: {
    flex: 1,
    padding: 10,
  },
  post: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)'
    } : Platform.OS === 'ios' ? {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3
    } : {
      elevation: 2
    })
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postContent: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  postAuthor: {
    fontSize: 12,
    color: '#666',
  },
  postVotes: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    padding: 10,
  },
  footerButton: {
    alignItems: 'center',
    padding: 5,
  },
  createButton: {
    backgroundColor: '#FF4500',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#FF4500',
    fontWeight: '500',
  },
  postDetailContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
  },
  postDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postDetailAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  postDetailContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  votingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  voteButton: {
    padding: 8,
  },
  voteButtonText: {
    fontSize: 18,
    color: '#FF4500',
  },
  voteCount: {
    fontSize: 16,
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingTop: 15,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  comment: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentContent: {
    fontSize: 14,
  },
  commentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  commentVotes: {
    fontSize: 12,
    color: '#888',
  },
  addCommentContainer: {
    marginTop: 20,
  },
  addCommentLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
    backgroundColor: '#fcfcfc',
    marginBottom: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF4500',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default App;
