import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  Dimensions, 
  ActivityIndicator,
  PixelRatio,
  NativeModules 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const DebugScreen = ({ navigation }) => {
  const [errorLogs, setErrorLogs] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [networkStatus, setNetworkStatus] = useState('unknown');
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [renderMetrics, setRenderMetrics] = useState({});
  const [storageInfo, setStorageInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshAllData();
      return () => {}; // cleanup function
    }, [])
  );

  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadErrorLogs(),
      collectDeviceInfo(),
      checkNetworkStatus(),
      getMemoryUsage(),
      getStorageUsage()
    ]);
    setIsLoading(false);
  };

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
    const { width, height } = Dimensions.get('window');
    const info = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      version: Platform.Version,
      appVersion: '1.0.0', // Replace with your app version
      deviceModel: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
      screenDimensions: `${width}x${height}`,
      pixelRatio: `${PixelRatio.get()}`,
      timezone: new Date().getTimezoneOffset() / -60, // Convert to hours and flip sign
      locale: NativeModules.I18nManager ? 
              (NativeModules.I18nManager.localeIdentifier || 'unknown') : 
              'unknown'
    };
    
    setDeviceInfo(info);
  };

  const checkNetworkStatus = async () => {
    try {
      // Using fetch to check network availability
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://chimmyworld-ai.onrender.com/health', {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setNetworkStatus('connected');
        const data = await response.json();
        console.log('Server health status:', data);
      } else {
        setNetworkStatus('error');
      }
    } catch (error) {
      console.error('Network check failed:', error);
      setNetworkStatus('disconnected');
    }
  };

  const getMemoryUsage = () => {
    // This is a simulated value since direct memory access is limited in React Native
    // In a real implementation, you might use native modules
    const usedMemory = Math.round(Math.random() * 100);
    setMemoryUsage({
      used: usedMemory,
      free: 100 - usedMemory,
      timestamp: new Date().toISOString()
    });
  };

  const getStorageUsage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      let keyCount = keys.length;
      
      // Sample a few keys to estimate total size
      const sampleSize = Math.min(10, keys.length);
      if (sampleSize > 0) {
        const sampleKeys = keys.slice(0, sampleSize);
        for (const key of sampleKeys) {
          const value = await AsyncStorage.getItem(key);
          totalSize += value ? value.length : 0;
        }
        // Estimate total based on sample
        totalSize = (totalSize / sampleSize) * keys.length;
      }
      
      setStorageInfo({
        keys: keyCount,
        estimatedSize: `~${(totalSize / 1024).toFixed(2)} KB`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }
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
    const logsText = JSON.stringify({
      errorLogs,
      deviceInfo,
      networkStatus,
      memoryUsage,
      renderMetrics,
      storageInfo
    }, null, 2);
    
    console.log('EXPORTED LOGS:', logsText);
    
    // Create a timestamp for the filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `debug_export_${timestamp}.json`;
    
    // Alert user that logs have been exported
    Alert.alert(
      'Logs Exported', 
      `Logs have been printed to the console. In a production app, these would be saved to logs/${filename} or sent to a server.`
    );
  };

  const testCrash = () => {
    Alert.alert(
      'Test Crash',
      'This will simulate an app crash. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Crash App', 
          style: 'destructive',
          onPress: () => {
            // Force a JavaScript error
            setTimeout(() => {
              try {
                const obj = null;
                obj.nonExistentMethod(); // This will crash
              } catch (err) {
                // Log the error before actually crashing
                console.error('Simulated crash:', err);
                
                // Now actually throw it to trigger a real crash
                throw err;
              }
            }, 500);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Debug Information</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Loading debug information...</Text>
        </View>
      ) : (
        <ScrollView>
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
            <Text style={styles.sectionHeader}>Network Status</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Status: </Text>
                <Text style={{
                  color: networkStatus === 'connected' ? 'green' : 
                         networkStatus === 'disconnected' ? 'red' : 'orange'
                }}>
                  {networkStatus}
                </Text>
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.miniButton, {backgroundColor: '#4CAF50'}]} 
              onPress={checkNetworkStatus}
            >
              <Text style={styles.miniButtonText}>Check Now</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Storage Usage</Text>
            <View style={styles.infoContainer}>
              {Object.entries(storageInfo).map(([key, value]) => (
                <Text key={key} style={styles.infoText}>
                  <Text style={styles.infoLabel}>{key}: </Text>
                  {value?.toString()}
                </Text>
              ))}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Memory Usage</Text>
            {memoryUsage && (
              <View>
                <View style={styles.memoryBar}>
                  <View 
                    style={[
                      styles.memoryUsed, 
                      {width: `${memoryUsage.used}%`},
                      {backgroundColor: memoryUsage.used > 80 ? '#f44336' : 
                                      memoryUsage.used > 60 ? '#FF9800' : '#4CAF50'}
                    ]} 
                  />
                </View>
                <Text style={styles.memoryText}>
                  Used: {memoryUsage.used}% | Free: {memoryUsage.free}%
                </Text>
              </View>
            )}
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
        </ScrollView>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={refreshAllData}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={clearErrorLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={exportLogs}>
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, {backgroundColor: '#f44336'}]} onPress={testCrash}>
          <Text style={styles.buttonText}>Test Crash</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  memoryBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  memoryUsed: {
    height: '100%',
  },
  memoryText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
  miniButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
  },
  miniButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DebugScreen;
