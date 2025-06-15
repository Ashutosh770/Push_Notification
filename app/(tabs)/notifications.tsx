import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
    addNotificationListeners,
    getExpoPushToken,
    getFirebaseToken,
    initializeFirebaseMessaging,
    requestNotificationPermission,
    sendTestNotification
} from '@/services/NotificationService';

export default function NotificationScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [firebaseToken, setFirebaseToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  useEffect(() => {
    // Request notification permissions when component mounts
    const setupNotifications = async () => {
      try {
        const permissionGranted = await requestNotificationPermission();
        setPermissionStatus(permissionGranted ? 'granted' : 'denied');

        if (permissionGranted) {
          // Get Expo push token
          const expoToken = await getExpoPushToken();
          if (expoToken) setExpoPushToken(expoToken);

          // Get Firebase token
          const fbToken = await getFirebaseToken();
          if (fbToken) setFirebaseToken(fbToken);

          // Initialize Firebase messaging
          initializeFirebaseMessaging();
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
        setPermissionStatus('error');
      }
    };

    setupNotifications();

    // Add notification listeners
    const cleanup = addNotificationListeners(
      (notification) => {
        setNotification(notification);
      },
      (response) => {
        console.log('Notification response:', response);
      }
    );

    // Clean up listeners when component unmounts
    return cleanup;
  }, []);

  const handleSendTestNotification = async () => {
    if (expoPushToken) {
      try {
        await sendTestNotification(expoPushToken);
      } catch (error) {
        console.error('Error sending test notification:', error);
      }
    } else {
      console.log('No Expo push token available');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title">Push Notifications</ThemedText>
        
        <ThemedView style={styles.infoContainer}>
          <ThemedText type="subtitle">Permission Status</ThemedText>
          <ThemedText>{permissionStatus}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoContainer}>
          <ThemedText type="subtitle">Expo Push Token</ThemedText>
          <ThemedText style={styles.tokenText}>{expoPushToken || 'No token available'}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoContainer}>
          <ThemedText type="subtitle">Firebase Token</ThemedText>
          <ThemedText style={styles.tokenText}>{firebaseToken || 'No token available'}</ThemedText>
        </ThemedView>

        {notification && (
          <ThemedView style={styles.infoContainer}>
            <ThemedText type="subtitle">Last Notification</ThemedText>
            <ThemedText>Title: {notification.request.content.title}</ThemedText>
            <ThemedText>Body: {notification.request.content.body}</ThemedText>
            <ThemedText>Data: {JSON.stringify(notification.request.content.data)}</ThemedText>
          </ThemedView>
        )}

        <View style={styles.buttonContainer}>
          <Button 
            title="Send Test Notification" 
            onPress={handleSendTestNotification} 
            disabled={!expoPushToken}
          />
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
    gap: 16,
  },
  infoContainer: {
    marginTop: 10,
    gap: 8,
  },
  tokenText: {
    fontSize: 12,
    flexWrap: 'wrap',
  },
  buttonContainer: {
    marginTop: 20,
  },
});