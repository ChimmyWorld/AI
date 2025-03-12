import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const BullseyeLogo = ({ size = 60, color = '#FF4500' }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg height={size} width={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6" />
        <Circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth="6" />
        <Circle cx="50" cy="50" r="15" fill={color} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BullseyeLogo;
