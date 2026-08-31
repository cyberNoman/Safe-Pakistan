/**
 * App.js — entry point. Loads fonts then renders the navigator.
 * Drop this into the root of your Expo project (or merge with existing App.js).
 */
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
    Inter_700Bold, Inter_800ExtraBold, Inter_900Black,
    NotoNastaliqUrdu_400Regular, NotoNastaliqUrdu_700Bold,
  });
  const [fontsTimedOut, setFontsTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFontsTimedOut(true), 5000);
    return () => clearTimeout(timer);
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
          <AppNavigator />
        </AppProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
