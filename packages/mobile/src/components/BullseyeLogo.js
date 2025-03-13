import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BullseyeIcon from '../assets/BullseyeIcon';

const BullseyeLogo = ({ size = 'medium' }) => {
  const logoSize = size === 'small' ? 30 : size === 'large' ? 80 : 50;
  const fontSize = size === 'small' ? 16 : size === 'large' ? 28 : 22;

  return (
    <View style={styles.container}>
      <BullseyeIcon size={logoSize} color="#FF4500" />
      <Text style={[styles.title, { fontSize }]}>Bullseye</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#FF4500',
  },
});

export default BullseyeLogo;
