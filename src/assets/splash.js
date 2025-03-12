import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

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
      if (onComplete) {
        onComplete();
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>B</Text>
        </View>
        <Text style={styles.title}>Bullseye</Text>
        <Text style={styles.subtitle}>Your Community Forum</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logoText: {
    color: 'white',
    fontSize: 54,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  }
});

export default BullseyeSplash;
