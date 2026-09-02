/**
 * App.js — entry point. Loads fonts then renders the navigator.
 * Drop this into the root of your Expo project (or merge with existing App.js).
 *
 * Task E (receiving side): registers the expo-notifications foreground handler
 * and a received-listener that surfaces an in-app HIFAZAT family-alert banner
 * carrying { verdict, risk }. Background/killed delivery is the OS/FCM system
 * notification, which Expo shows automatically — no extra code path.
 */
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useFonts,
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
  Inter_700Bold,    Inter_800ExtraBold, Inter_900Black,
} from '@expo-google-fonts/inter';
import {
  NotoNastaliqUrdu_400Regular, NotoNastaliqUrdu_700Bold,
} from '@expo-google-fonts/noto-nastaliq-urdu';

import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider } from './src/context/AppContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { FamilyAlertBanner } from './src/components/Overlays';

// Foreground: show OUR in-app banner instead of the system one, so the family
// alert carries verdict + risk in brand styling. Background/killed delivery is
// the OS/FCM system notification (Expo handles it without this handler).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
    Inter_700Bold, Inter_800ExtraBold, Inter_900Black,
    NotoNastaliqUrdu_400Regular, NotoNastaliqUrdu_700Bold,
  });
  const [fontsTimedOut, setFontsTimedOut] = useState(false);
  const [familyAlert, setFamilyAlert] = useState(null); // { verdict, risk }

  useEffect(() => {
    const timer = setTimeout(() => setFontsTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Foreground family-alert listener → in-app banner (task E). Reads the
  // { verdict, risk } data payload the backend relay attaches at exp.host.
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification?.request?.content?.data || {};
      const verdict = String(data.verdict || '').toUpperCase();
      if (!verdict) return;
      setFamilyAlert({ verdict, risk: Number(data.risk || 0) });
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontsTimedOut) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FF' }}>
        <ActivityIndicator color="#1B4FD8" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppProvider>
          <View style={{ flex: 1 }}>
            <AppNavigator />
            <FamilyAlertBanner alert={familyAlert} onDismiss={() => setFamilyAlert(null)} />
          </View>
        </AppProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
