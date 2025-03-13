import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import Svg, { Circle } from 'react-native-svg';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function AppLoading({ onFinish, startAsync, children }) {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        if (startAsync) {
          await startAsync();
        }
        // Artificially delay for a smoother experience
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsReady(true);
        if (onFinish) {
          onFinish();
        }
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (isReady) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <BullseyeIcon />
          <Text style={styles.appName}>Bullseye</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {children}
    </View>
  );
}

// Bullseye Target Icon Component
const BullseyeIcon = () => {
  return (
    <Svg height="150" width="150" viewBox="0 0 100 100">
      {/* Outer circle */}
      <Circle
        cx="50"
        cy="50"
        r="45"
        stroke="white"
        strokeWidth="3"
        fill="none"
      />
      {/* Middle circle */}
      <Circle
        cx="50"
        cy="50"
        r="30"
        stroke="white"
        strokeWidth="3"
        fill="none"
      />
      {/* Inner circle */}
      <Circle
        cx="50"
        cy="50"
        r="15"
        stroke="white"
        strokeWidth="3"
        fill="white"
      />
      {/* Bullseye center */}
      <Circle
        cx="50"
        cy="50"
        r="5"
        fill="#FF6B00"
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B00', // Orange background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    marginTop: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  }
});
