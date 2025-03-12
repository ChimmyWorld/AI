import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DebugScreen = ({ navigation }) => {
  const [errorLogs, setErrorLogs] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({});

  useEffect(() => {
    loadErrorLogs();
    collectDeviceInfo();
  }, []);

  const loadErrorLogs = async () => {
    try {
      const logsString = await AsyncStorage.getItem('errorLogs');
      if (logsString) {
        const logs = JSON.parse(logsString);
        setErrorLogs(logs);
      }
    } catch (error) {
      console.error('Failed to load error logs:', error);
      Alert.alert('Error', 'Failed to load error logs: ' + error.message);
    }
  };

  const collectDeviceInfo = async () => {
    // Collect basic device/environment info
    const info = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      version: Platform.Version,
      appVersion: '1.0.0', // Replace with your app version
      deviceModel: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
    };
    
    setDeviceInfo(info);
  };

  const clearErrorLogs = async () => {
    try {
      await AsyncStorage.removeItem('errorLogs');
      setErrorLogs([]);
      Alert.alert('Success', 'Error logs cleared successfully');
    } catch (error) {
      console.error('Failed to clear error logs:', error);
      Alert.alert('Error', 'Failed to clear error logs: ' + error.message);
    }
  };

  const exportLogs = () => {
    // In a real app, you might want to export logs via email, file, or API
    // For now, we'll just display them in a big alert
    const logsText = JSON.stringify(errorLogs, null, 2);
    console.log('EXPORTED LOGS:', logsText);
    Alert.alert('Logs Exported', 'Logs have been printed to the console');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Debug Information</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Device Information</Text>
        <View style={styles.infoContainer}>
          {Object.entries(deviceInfo).map(([key, value]) => (
            <Text key={key} style={styles.infoText}>
              <Text style={styles.infoLabel}>{key}: </Text>
              {value?.toString()}
            </Text>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Error Logs ({errorLogs.length})</Text>
        {errorLogs.length > 0 ? (
          <ScrollView style={styles.logsContainer}>
            {errorLogs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                <Text style={styles.logError}>{log.error}</Text>
                <Text style={styles.logStack}>{log.stack}</Text>
                {log.componentStack && (
                  <Text style={styles.logComponentStack}>{log.componentStack}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No error logs found</Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={loadErrorLogs}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={clearErrorLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={exportLogs}>
          <Text style={styles.buttonText}>Export Logs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FF4500',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoContainer: {
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  logsContainer: {
    maxHeight: 300,
  },
  logItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  logError: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 4,
  },
  logStack: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  logComponentStack: {
    fontSize: 12,
    color: '#777',
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DebugScreen;
