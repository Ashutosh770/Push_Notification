import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  registerForPushNotificationsAsync,
  removeNotificationSubscription,
  sendLocalNotification
} from '@/notification';

export default function HomeScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
  const [notification, setNotification] = useState<boolean>(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token: string | undefined) => setExpoPushToken(token));

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = addNotificationReceivedListener((notification: Notifications.Notification) => {
      setNotification(true);
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      console.log('Notification tapped:', response);
    });

    return () => {
      if (notificationListener.current) {
        removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const handleTestNotification = async () => {
    await sendLocalNotification(
      'Test Notification',
      'This is a test notification from your app!'
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/image.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome! Algorizz</ThemedText>
      </ThemedView>

      <ThemedView style={styles.notificationContainer}>
        <ThemedText type="subtitle">Push Notifications</ThemedText>
        <ThemedText style={styles.tokenText}>
          Your Expo push token: {expoPushToken ? expoPushToken : 'Loading...'}
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={handleTestNotification}>
          <ThemedText style={styles.buttonText}>Test Notification</ThemedText>
        </Pressable>
      </ThemedView>

   
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 250,
    width: 400,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  notificationContainer: {
    gap: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(161, 206, 220, 0.1)',
  },
  tokenText: {
    fontSize: 12,
    opacity: 0.7,
  },
  button: {
    backgroundColor: '#A1CEDC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#1D3D47',
    fontWeight: 'bold',
  },
});
