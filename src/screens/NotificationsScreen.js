import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Sample notifications data - in a real app, this would come from the API
const mockNotifications = [
  {
    id: '1',
    type: 'upvote',
    message: 'Your post "React Native Tips" received an upvote',
    isRead: false,
    time: '5m ago',
  },
  {
    id: '2',
    type: 'comment',
    message: 'JohnDoe commented on your post "MongoDB vs Firebase"',
    isRead: false,
    time: '1h ago',
  },
  {
    id: '3',
    type: 'follow',
    message: 'UserX started following you',
    isRead: true,
    time: '3h ago',
  },
  {
    id: '4',
    type: 'mention',
    message: 'You were mentioned in a comment by DevGuru',
    isRead: true,
    time: '1d ago',
  },
];

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map(item => 
        item.id === id ? { ...item, isRead: true } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(item => ({ ...item, isRead: true }))
    );
  };

  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'upvote':
        return <MaterialIcons name="arrow-upward" size={24} color="#FF4500" />;
      case 'comment':
        return <MaterialIcons name="comment" size={24} color="#0079D3" />;
      case 'follow':
        return <MaterialIcons name="person-add" size={24} color="#00B87C" />;
      case 'mention':
        return <MaterialIcons name="alternate-email" size={24} color="#F9A825" />;
      default:
        return <MaterialIcons name="notifications" size={24} color="#878A8C" />;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.iconContainer}>
        {renderNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Notifications</Text>
      <TouchableOpacity onPress={markAllAsRead}>
        <Text style={styles.markAllReadText}>Mark all as read</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.targetIconContainer}>
            <MaterialIcons name="gps-fixed" size={60} color="#CCCCCC" />
          </View>
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyText}>
            When you get notifications, they'll show up here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  markAllReadText: {
    color: '#FF4500',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  unreadItem: {
    backgroundColor: '#F8F9FA',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#787C7E',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4500',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  targetIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#787C7E',
    textAlign: 'center',
  },
});

export default NotificationsScreen;
