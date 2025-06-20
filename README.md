# Expo Push Notification Project


A React Native project with Expo and Firebase Push Notifications integration.

## Table of Contents
- [Setup](#setup)
- [Package Versions](#package-versions)
- [Configuration](#configuration)
- [Firebase Integration](#firebase-integration)
- [Android Setup](#android-setup)
- [Testing](#testing)
- [Additional Notes](#additional-notes)

## Setup

### Initial Project Setup
```bash
# Create new Expo project
npx create-expo-app Push_Notification
cd Push_Notification
--Need android/, native mods run   ----> npx expo prebuild

# Install required dependencies
npm install expo-notifications expo-device
npm install --save-dev @types/react @tsconfig/react-native babel-plugin-module-resolver
```

## Package Versions

### Core Dependencies
```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-notifications": "~0.27.6",
    "expo-device": "~5.9.3",
    "expo-constants": "~15.4.5",
    "expo-router": "~3.4.7",
    "expo-linking": "~6.2.2",
    "expo-splash-screen": "~0.26.4",
    "expo-status-bar": "~1.11.1",
    "react": "18.2.0",
    "react-native": "0.73.4",
    "@react-native-firebase/app": "^18.7.3",
    "@react-native-firebase/messaging": "^18.7.3"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "@tsconfig/react-native": "^3.0.3",
    "babel-plugin-module-resolver": "^5.0.0",
    "typescript": "^5.3.0"
  }
}
```

### Android Configuration
```gradle
// android/build.gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.8.0"
    }
    dependencies {
        classpath 'com.google.gms:google-services:4.4.2'
    }
}
```

### Firebase Dependencies
```gradle
// android/app/build.gradle
dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.2')
    implementation 'com.google.firebase:firebase-analytics'
    implementation 'com.google.firebase:firebase-messaging'
}
```

### Important Notes
- These versions are compatible with Expo SDK 50
- Firebase versions should match your Firebase Console project
- React Native version should match your Expo SDK version
- Always check for the latest compatible versions in the [Expo documentation](https://docs.expo.dev/versions/latest/)

## Configuration

### TypeScript Configuration
`tsconfig.json`:
```json
{
  "extends": "@tsconfig/react-native/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "jsx": "react-native",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

### Babel Configuration
`babel.config.js`:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
        },
      ],
    ],
  };
};
```

## Firebase Integration

### Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Add Android app:
   - Package name: `com.pushnotification.app`
   - Download `google-services.json`

### Android Configuration
1. Place `google-services.json` in the project root
2. Update `app.json`:
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "com.pushnotification.app",
      "permissions": ["NOTIFICATIONS"]
    }
  }
}
```

### Install Firebase Dependencies
```bash
npx expo install @react-native-firebase/app @react-native-firebase/messaging

```

### First, add the google-services plugin as a dependency inside of your 
```/android/build.gradle file:

buildscript {
  dependencies {
    // ... other dependencies
    classpath 'com.google.gms:google-services:4.4.2'
    // Add me --- /\
  }
}
```
### execute the plugin by adding the following to your /android/app/build.gradle file:

apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services' // <- Add this line

## Notification Configuration

### Notification Service
`notification.ts`:
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: '7ba05442-2282-4e0a-9d15-415635a2fa8e'
    })).data;
  }

  return token;
}
```

## Android Setup

### Android Manifest
`android/app/src/main/AndroidManifest.xml`:
```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    
    <application>
        <!-- Firebase Messaging Service -->
        <service
            android:name=".java.MyFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
    </application>
</manifest>
```

### Firebase Service
`android/app/src/main/java/com/pushnotification/app/MyFirebaseMessagingService.java`:
```java
package com.pushnotification.app;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        // Handle received message
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        // Handle new token
    }
}
```

## Testing

### Local Testing
```typescript
// Send local notification
await sendLocalNotification(
  'Test Notification',
  'This is a test notification!'
);
```

### Push Notification Testing
1. Get device token from the app
2. Use Firebase Console to send test notification
3. Or use Expo's push notification tool:
```bash
expo push:send --to <EXPO_PUSH_TOKEN> --title "Test" --body "Test message"
```

## Additional Notes

### Best Practices
- Always test on physical devices
- Keep `google-services.json` secure and don't commit to public repositories
- Handle notification permissions gracefully
- Consider implementing notification grouping for multiple notifications
- Test notifications in different app states (foreground, background, killed)

### Common Issues
1. **Permission Denied**
   - Ensure proper permissions in AndroidManifest.xml
   - Request permissions at runtime for Android 13+

2. **Token Issues**
   - Verify Firebase project configuration
   - Check internet connectivity
   - Ensure proper package name in Firebase console

3. **Notification Not Showing**
   - Check notification channel configuration
   - Verify notification payload format
   - Test on physical device

### Security Considerations
1. Store Firebase credentials securely
2. Implement proper token management
3. Validate notification payloads
4. Handle notification permissions appropriately

## Contributing
Feel free to submit issues and enhancement requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
