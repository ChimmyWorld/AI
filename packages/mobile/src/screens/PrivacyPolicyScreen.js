import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyPolicyScreen = ({ onAccept, onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Privacy Policy</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Bullseye Privacy Policy</Text>
        <Text style={styles.date}>Last Updated: March 12, 2025</Text>
        
        <Text style={styles.paragraph}>
          At Bullseye, we take your privacy seriously. This Privacy Policy explains how we collect, 
          use, disclose, and safeguard your information when you use our mobile application.
        </Text>
        
        <Text style={styles.sectionTitle}>Information We Collect</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Personal Information:</Text> When you register an account, we collect your username, 
          email address, and password. We may also collect optional profile information such as a profile picture.
        </Text>
        
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Content Information:</Text> We collect the content you post, comments you make, 
          and your interactions with other users' content.
        </Text>
        
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Usage Information:</Text> We collect information about how you use the app, 
          including your browsing history within the app, time spent on various screens, and features you interact with.
        </Text>
        
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Device Information:</Text> We collect device-specific information such as your 
          device model, operating system, unique device identifiers, and mobile network information.
        </Text>
        
        <Text style={styles.sectionTitle}>How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
          {'\n'}- Provide, maintain, and improve our services
          {'\n'}- Create and maintain your account
          {'\n'}- Process and complete transactions
          {'\n'}- Send you technical notices and support messages
          {'\n'}- Respond to your comments and questions
          {'\n'}- Develop new products and services
          {'\n'}- Monitor and analyze usage patterns
          {'\n'}- Protect against, identify, and prevent fraud and other illegal activity
        </Text>
        
        <Text style={styles.sectionTitle}>Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          We use MongoDB for database storage, JWT for secure authentication, and Cloudinary for 
          media file storage. We implement appropriate technical and organizational measures to 
          protect your personal information against unauthorized or unlawful processing, accidental 
          loss, destruction, or damage.
        </Text>
        
        <Text style={styles.sectionTitle}>User Content</Text>
        <Text style={styles.paragraph}>
          Our platform allows you to upload content including text posts, comments, and media files. 
          Please be aware that any content you share may be viewed by other users. We do not claim ownership 
          of your content, but you grant us a license to use, host, and display your content in connection 
          with providing our services.
        </Text>
        
        <Text style={styles.sectionTitle}>Third-Party Services</Text>
        <Text style={styles.paragraph}>
          We may use third-party services such as analytics providers and advertising networks. These 
          third parties may use cookies, web beacons, and other technologies to collect information 
          about your use of our app and other websites and applications.
        </Text>
        
        <Text style={styles.sectionTitle}>Your Rights</Text>
        <Text style={styles.paragraph}>
          Depending on your location, you may have certain rights regarding your personal information, 
          including:
          {'\n'}- Access to your personal information
          {'\n'}- Correction of inaccurate information
          {'\n'}- Deletion of your personal information
          {'\n'}- Restriction of processing of your personal information
          {'\n'}- Data portability
          {'\n'}- Objection to processing
        </Text>
        
        <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by 
          posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </Text>
        
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at:
          {'\n'}support@bullseye-app.com
        </Text>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={onAccept}>
          <Text style={styles.acceptButtonText}>I Accept</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#FF4500',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  acceptButton: {
    backgroundColor: '#FF4500',
  },
  backButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
  }
});

export default PrivacyPolicyScreen;
