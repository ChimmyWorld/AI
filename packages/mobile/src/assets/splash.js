import React from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { safeCall } from '../utils/errorUtils';

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
    <View style={[styles.container, {backgroundColor: '#FF4500'}]}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.circle}>
          <Text style={styles.text}>B</Text>
        </View>
      </Animated.View>
    </View>
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
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 60,
    fontWeight: 'bold',
  }
});

export default BullseyeSplash;
