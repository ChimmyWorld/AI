import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TermsAndConditionsScreen = ({ onAccept, onDecline }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Terms & Conditions</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Bullseye App Terms of Service</Text>
        <Text style={styles.date}>Last Updated: March 12, 2025</Text>
        
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to Bullseye! These Terms of Service ("Terms") govern your use of the Bullseye mobile application 
          (the "App"), operated by Bullseye Team ("we," "us," or "our"). By using our App, you agree to these Terms 
          in their entirety. If you do not agree to these Terms, please do not use the App.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Account Registration</Text>
        <Text style={styles.paragraph}>
          To use certain features of the App, you may need to register for an account. You agree to provide accurate, 
          current, and complete information during the registration process and to update such information to keep it 
          accurate, current, and complete. You are responsible for safeguarding your password. You agree not to disclose 
          your password to any third party and to take sole responsibility for any activities or actions under your account.
        </Text>
        
        <Text style={styles.sectionTitle}>3. User Content</Text>
        <Text style={styles.paragraph}>
          Our App allows you to post, link, store, share and otherwise make available certain information, text, graphics, 
          videos, or other material ("User Content"). You are responsible for the User Content that you post on or through 
          the App, including its legality, reliability, and appropriateness.
        </Text>
        <Text style={styles.paragraph}>
          By posting User Content on or through the App, you represent and warrant that: (i) the User Content is yours 
          (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, 
          and (ii) the posting of your User Content on or through the App does not violate the privacy rights, publicity 
          rights, copyrights, contract rights or any other rights of any person.
        </Text>
        
        <Text style={styles.sectionTitle}>4. Community Guidelines</Text>
        <Text style={styles.paragraph}>
          You agree not to use the App to:
          {'\n'}- Post illegal content
          {'\n'}- Harass, abuse, or harm another person
          {'\n'}- Impersonate another user or person
          {'\n'}- Post content that is hateful, threatening, or pornographic
          {'\n'}- Spam or advertise without authorization
          {'\n'}- Violate any applicable laws or regulations
        </Text>
        
        <Text style={styles.sectionTitle}>5. Privacy Policy</Text>
        <Text style={styles.paragraph}>
          Please review our Privacy Policy, which also governs your use of the App, to understand our practices regarding 
          the collection, use, and disclosure of your personal information.
        </Text>
        
        <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          The App and its original content (excluding User Content), features, and functionality are and will remain the 
          exclusive property of Bullseye Team and its licensors. The App is protected by copyright, trademark, and other 
          laws of both the United States and foreign countries.
        </Text>
        
        <Text style={styles.sectionTitle}>7. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend your account and bar access to the App immediately, without prior notice or liability, 
          under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach 
          of the Terms.
        </Text>
        
        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          In no event shall Bullseye Team, nor its directors, employees, partners, agents, suppliers, or affiliates, be 
          liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
          loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or 
          inability to access or use the App.
        </Text>
        
        <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
          material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a 
          material change will be determined at our sole discretion.
        </Text>
        
        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms, please contact us at support@bullseye-app.com
        </Text>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.declineButton]} onPress={onDecline}>
          <Text style={styles.declineButtonText}>Decline</Text>
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
  declineButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  declineButtonText: {
    color: '#333',
    fontSize: 16,
  }
});

export default TermsAndConditionsScreen;
