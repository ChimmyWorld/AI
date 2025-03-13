import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../hooks/useAuth';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SearchScreen from '../screens/SearchScreen';

// Stacks
const MainStack = createStackNavigator();
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const NotificationsStack = createStackNavigator();

// Tabs
const Tab = createBottomTabNavigator();

// Authentication navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Home stack navigator
const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="Feed" 
      component={HomeScreen}
      options={{ 
        title: 'Bullseye',
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        }
      }} 
    />
    <HomeStack.Screen 
      name="PostDetail" 
      component={PostDetailScreen}
      options={{ title: 'Post' }} 
    />
    <HomeStack.Screen 
      name="Search" 
      component={SearchScreen}
      options={{ title: 'Search' }} 
    />
  </HomeStack.Navigator>
);

// Profile stack navigator
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="UserProfile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }} 
    />
  </ProfileStack.Navigator>
);

// Notifications stack navigator
const NotificationsStackNavigator = () => (
  <NotificationsStack.Navigator>
    <NotificationsStack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ title: 'Notifications' }} 
    />
  </NotificationsStack.Navigator>
);

// Main tab navigator (for authenticated users)
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#FF4500',
      tabBarInactiveTintColor: '#787C7E',
      headerShown: false,
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
      }
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeStackNavigator} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="home" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen 
      name="Search" 
      component={SearchScreen} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="search" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen 
      name="CreatePost" 
      component={CreatePostScreen} 
      options={{
        tabBarLabel: 'Post',
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="add-circle-outline" color={color} size={28} />
        ),
      }}
    />
    <Tab.Screen 
      name="Notifications" 
      component={NotificationsStackNavigator} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="notifications" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStackNavigator} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="person" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading screen if auth is being checked
  if (loading) {
    return null; // You could add a splash screen here
  }
  
  return (
    <NavigationContainer>
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated() ? (
          <MainStack.Screen name="Main" component={TabNavigator} />
        ) : (
          <MainStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </MainStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
