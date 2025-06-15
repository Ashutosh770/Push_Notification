import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [isSending, setIsSending] = useState(false);

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
    if (!expoPushToken) {
      Alert.alert('Error', 'No push token available. Please check your notification permissions.');
      return;
    }

    try {
      setIsSending(true);
      await sendTestNotification(expoPushToken);
      Alert.alert('Success', 'Test notification sent successfully!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title">Notifications</ThemedText>
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.section}>
          <ThemedView style={styles.infoContainer}>
            <ThemedText type="subtitle">Permission Status</ThemedText>
            <ThemedText style={styles.statusText}>{permissionStatus}</ThemedText>
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

          <TouchableOpacity
            style={[styles.button, isSending && styles.buttonDisabled]}
            onPress={handleSendTestNotification}
            disabled={isSending || !expoPushToken}>
            {isSending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Send Test Notification</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    padding: 20,
    gap: 16,
  },
  infoContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});