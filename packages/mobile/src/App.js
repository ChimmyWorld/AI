import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './hooks/useAuth';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import all screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import TermsAndConditionsScreen from './screens/TermsAndConditionsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import SearchScreen from './screens/SearchScreen';
import DebugScreen from './screens/DebugScreen';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Error Boundary component
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            {this.state.error && this.state.error.toString()}
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Create the navigation stack
const Stack = createStackNavigator();

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      try {
        console.log("Splash screen: Starting initialization");
        // Your initialization logic here
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("Splash screen: Initialization complete");
      } catch (e) {
        console.warn("Splash screen error:", e);
      } finally {
        console.log("Splash screen: Setting appIsReady to true");
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      console.log("Splash screen: appIsReady is true, hiding splash screen");
      SplashScreen.hideAsync().then(() => {
        console.log("Splash screen: Successfully hidden");
      }).catch(error => {
        console.error("Splash screen: Error hiding splash screen", error);
      });
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Return empty while splash screen is shown
  }
  
  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen} 
                options={{ title: "Register" }}
              />
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ title: "Home" }}
              />
              <Stack.Screen 
                name="PostDetail" 
                component={PostDetailScreen} 
                options={{ title: "Post Detail" }}
              />
              <Stack.Screen 
                name="CreatePost" 
                component={CreatePostScreen} 
                options={{ title: "Create Post" }}
              />
              <Stack.Screen 
                name="Terms" 
                component={TermsAndConditionsScreen} 
                options={{ title: "Terms & Conditions" }}
              />
              <Stack.Screen 
                name="Privacy" 
                component={PrivacyPolicyScreen} 
                options={{ title: "Privacy Policy" }}
              />
              <Stack.Screen 
                name="Search" 
                component={SearchScreen} 
                options={{ title: "Search" }}
              />
              <Stack.Screen 
                name="Debug" 
                component={DebugScreen} 
                options={{ title: "Debug" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
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
  errorText: {
    fontSize: 16,
    color: '#343a40',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default App;
