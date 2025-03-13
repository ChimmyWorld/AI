import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const BullseyeTarget = () => {
  return (
    <Svg height="200" width="200" viewBox="0 0 100 100">
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

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (onFinish) {
        onFinish();
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <BullseyeTarget />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B00', // Orange background as requested
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen;
