import React from 'react';,
import ErrorBoundary from './utils/GlobalErrorHandler'; { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './hooks/useAuth';
import BullseyeSplash from './assets/splash';
import TermsAndConditionsScreen from './screens/TermsAndConditionsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import RegisterScreen from './screens/RegisterScreen';
import DebugScreen from './screens/DebugScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple MVP screens
const LoginScreen = ({ onLogin, onRegister }) => (
  <View style={styles.screenContainer}>
    <Text style={styles.title}>Bullseye</Text>
    <Text style={styles.subtitle}>Community Forum</Text>
    
    <View style={styles.form}>
      <TouchableOpacity style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.buttonOutline} onPress={onRegister}>
        <Text style={styles.buttonOutlineText}>Register</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const HomeScreen = ({ onLogout, onViewPost, onDebug }) => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    // Simulate loading posts
    const timer = setTimeout(() => {
      setPosts([
        { id: 1, title: 'Welcome to Bullseye!', author: 'Admin', likes: 42, comments: 5 },
        { id: 2, title: 'How to use the forum effectively', author: 'Moderator', likes: 24, comments: 3 },
        { id: 3, title: 'Community guidelines', author: 'Admin', likes: 31, comments: 7 },
      ]);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bullseye Forum</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#FF4500" />
      ) : (
        <View style={styles.postList}>
          {posts.map(post => (
            <TouchableOpacity key={post.id} style={styles.postItem} onPress={onViewPost}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postAuthor}>Posted by {post.author}</Text>
              <View style={styles.postStats}>
                <Text style={styles.postStatItem}>?§Ô∏è {post.likes}</Text>
                <Text style={styles.postStatItem}>?í¨ {post.comments}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <TouchableOpacity style={styles.debugButton} onPress={onDebug}>
        <Text style={styles.debugButtonText}>Debug</Text>
      </TouchableOpacity>
    </View>
  );
};

const PostDetailScreen = ({ onBack }) => (
  <View style={styles.screenContainer}>
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.backButton}>??Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Post Detail</Text>
    </View>
    
    <View style={styles.postDetail}>
      <Text style={styles.postDetailTitle}>Welcome to Bullseye!</Text>
      <Text style={styles.postDetailAuthor}>Posted by Admin ??2 days ago</Text>
      
      <Text style={styles.postDetailContent}>
        Welcome to the Bullseye community forum! This is a place where you can discuss topics,
        ask questions, and connect with other community members.
        
        Please make sure to follow our community guidelines and be respectful to others.
        
        Happy posting!
      </Text>
      
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>?§Ô∏è Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>?í¨ Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>‚§¥Ô∏è Share</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.commentsSection}>
        <Text style={styles.commentsSectionTitle}>Comments (5)</Text>
        {/* Comment items would go here */}
      </View>
    </View>
  </View>
);

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console for debugging
    console.error("Error caught by ErrorBoundary:", error);
    console.error("Component stack:", errorInfo?.componentStack);
    
    // Store error in AsyncStorage for later viewing
    this.storeError(error, errorInfo);
  }
  
  storeError = async (error, errorInfo) => {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: error?.toString() || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        componentStack: errorInfo?.componentStack || 'No component stack',
      };
      
      // Get existing logs if any
      const existingLogsString = await AsyncStorage.getItem('errorLogs');
      const existingLogs = existingLogsString ? JSON.parse(existingLogsString) : [];
      
      // Add new log and store back (limit to 50 entries)
      const updatedLogs = [errorLog, ...existingLogs].slice(0, 50);
      await AsyncStorage.setItem('errorLogs', JSON.stringify(updatedLogs));
    } catch (storageError) {
      console.error('Failed to store error log:', storageError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error?.toString() || 'Unknown error'}</Text>
          <View style={styles.errorDetails}>
            <Text style={styles.errorStack}>
              {this.state.errorInfo?.componentStack || 'No component stack available'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const [screen, setScreen] = useState('splash'); // 'splash', 'terms', 'privacy', 'login', 'register', 'home', 'post', 'debug'
  const [appReady, setAppReady] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  useEffect(() => {
    // Check if terms and privacy have been accepted previously
    const checkAcceptance = async () => {
      try {
        const hasAcceptedTerms = await AsyncStorage.getItem('termsAccepted');
        const hasAcceptedPrivacy = await AsyncStorage.getItem('privacyAccepted');
        
        if (hasAcceptedTerms === 'true') {
          setTermsAccepted(true);
        }
        
        if (hasAcceptedPrivacy === 'true') {
          setPrivacyAccepted(true);
        }
      } catch (error) {
        console.error('Failed to check acceptance status:', error);
      }
    };
    
    // Simulate app initialization
    const prepareApp = async () => {
      try {
        await checkAcceptance();
        
        // Add any other initialization logic here
        console.log('App initialized successfully');
        
        // After splash screen finishes, go to terms or login
        setTimeout(() => {
          setAppReady(true);
        }, 3000); // Minimum 3 seconds splash screen
      } catch (error) {
        console.error('Failed to initialize app:', error);
        Alert.alert('Initialization Error', error.toString());
      }
    };
    
    prepareApp();
  }, []);
  
  // Handle splash screen completion - FIX: Wrap this in try/catch to prevent crashes
  const handleSplashComplete = () => {
    try {
      if (termsAccepted && privacyAccepted) {
        setScreen('login');
      } else if (termsAccepted) {
        setScreen('privacy');
      } else {
        setScreen('terms');
      }
    } catch (error) {
      console.error('Error in handleSplashComplete:', error);
      // Fallback to login screen if there's an error
      setScreen('login');
    }
  };
  
  // Terms and conditions handlers
  const handleAcceptTerms = async () => {
    try {
      await AsyncStorage.setItem('termsAccepted', 'true');
      setTermsAccepted(true);
      setScreen('privacy');
    } catch (error) {
      console.error('Failed to save terms acceptance:', error);
      Alert.alert('Error', 'Could not save your choice. Please try again.');
    }
  };
  
  const handleDeclineTerms = () => {
    Alert.alert(
      'Terms Declined',
      'You must accept the Terms and Conditions to use Bullseye.',
      [{ text: 'Review Again', onPress: () => setScreen('terms') }]
    );
  };
  
  // Privacy policy handlers
  const handleAcceptPrivacy = async () => {
    try {
      await AsyncStorage.setItem('privacyAccepted', 'true');
      setPrivacyAccepted(true);
      setScreen('login');
    } catch (error) {
      console.error('Failed to save privacy acceptance:', error);
      Alert.alert('Error', 'Could not save your choice. Please try again.');
    }
  };
  
  const handlePrivacyBack = () => {
    setScreen('terms');
  };
  
  const handleLogin = () => setScreen('home');
  const handleLogout = () => setScreen('login');
  const handleRegister = () => setScreen('register');
  const handleViewPost = () => setScreen('post');
  const handleBackToHome = () => setScreen('home');
  const handleRegisterComplete = () => setScreen('login');
  
  const handleOpenDebugScreen = () => {
    setScreen('debug');
  };
  
  // FIX: Repair the splash screen handler to prevent the undefined function error
  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        // FIX: Use a safecall wrapper for handleSplashComplete
        return <BullseyeSplash onComplete={() => {
          try {
            if (typeof handleSplashComplete === 'function') {
              handleSplashComplete();
            } else {
              console.warn('handleSplashComplete is not defined');
              setScreen('login'); // Fallback
            }
          } catch (error) {
            console.error('Error in splash completion:', error);
            setScreen('login'); // Fallback
          }
        }} />;
      case 'terms':
        return (
          <TermsAndConditionsScreen 
            onAccept={handleAcceptTerms} 
            onDecline={handleDeclineTerms} 
          />
        );
      case 'privacy':
        return (
          <PrivacyPolicyScreen 
            onAccept={handleAcceptPrivacy} 
            onBack={handlePrivacyBack} 
          />
        );
      case 'login':
        return (
          <LoginScreen 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
          />
        );
      case 'register':
        return (
          <RegisterScreen 
            onComplete={handleRegisterComplete} 
            onBack={() => setScreen('login')} 
          />
        );
      case 'home':
        return (
          <HomeScreen 
            onLogout={handleLogout} 
            onViewPost={handleViewPost} 
            onDebug={handleOpenDebugScreen}
          />
        );
      case 'post':
        return (
          <PostDetailScreen 
            onBack={handleBackToHome} 
          />
        );
      case 'debug':
        return (
          <DebugScreen 
            onBack={handleBackToHome}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />;
    }
  };
  
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <SafeAreaView style={styles.container}>
            {renderScreen()}
          </SafeAreaView>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#343a40',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorDetails: {
    width: '100%',
    maxHeight: 200,
    padding: 10,
    backgroundColor: '#f1f3f5',
    borderRadius: 5,
    marginBottom: 20,
  },
  errorStack: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  button: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonOutline: {
    borderColor: '#FF4500',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: '#FF4500',
    fontSize: 16,
    fontWeight: '500',
  },
  screenContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutText: {
    color: '#FF4500',
    fontSize: 16,
  },
  backButton: {
    color: '#FF4500',
    fontSize: 16,
  },
  postList: {
    width: '100%',
  },
  postItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  postAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  postStats: {
    flexDirection: 'row',
  },
  postStatItem: {
    marginRight: 15,
    color: '#666',
  },
  postDetail: {
    width: '100%',
  },
  postDetailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  postDetailAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  postDetailContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 5,
  },
  actionButtonText: {
    color: '#666',
    fontSize: 14,
  },
  commentsSection: {
    width: '100%',
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  debugButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default App;

