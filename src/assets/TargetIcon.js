import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const TargetIcon = ({ size = 100, color = 'white' }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Outer circle (red) */}
        <Circle cx="50" cy="50" r="50" fill="#E53935" />
        
        {/* Middle circle (white) */}
        <Circle cx="50" cy="50" r="35" fill="white" />
        
        {/* Inner circle (red) */}
        <Circle cx="50" cy="50" r="20" fill="#E53935" />
        
        {/* Bullseye center (white) */}
        <Circle cx="50" cy="50" r="5" fill="white" />
        
        {/* Arrow */}
        <Path 
          d="M85,15 L50,50 L60,5" 
          fill="#4DB6AC" 
          stroke="#4DB6AC" 
          strokeWidth="2" 
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TargetIcon;
