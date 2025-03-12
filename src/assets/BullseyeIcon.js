import React from 'react';
import { View } from 'react-native';

// Simple component that renders a bullseye icon
// This is a plain JS component that works in both web and native
const BullseyeIcon = ({ size = 50, color = '#FF4500' }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: (size * 0.7) / 2,
          borderWidth: 2,
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
};

export default BullseyeIcon;
