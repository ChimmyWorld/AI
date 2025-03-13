import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const SplashDesign = () => {
  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B00', // Orange background
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashDesign;
