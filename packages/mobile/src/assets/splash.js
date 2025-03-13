import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { safeCall } from '../utils/errorUtils';
import { LinearGradient } from 'expo-linear-gradient';
import TargetIcon from './TargetIcon';

const BullseyeSplash = ({ onComplete }) => {
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  
  React.useEffect(() => {
    // Animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
    ]).start(() => {
      // Safely call onComplete - this prevents the "undefined is not a function" error
      if (onComplete) {
        safeCall(onComplete, []);
      }
    });
  }, [onComplete]); // Add onComplete to dependency array

  return (
    <LinearGradient
      colors={['#FF8C00', '#FF6347', '#FF4500']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <TargetIcon size={120} />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default BullseyeSplash;
