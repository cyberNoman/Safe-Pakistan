/**
 * AppNavigator — React Navigation v6 setup.
 * - Native stack for full-screen flows (Welcome, Verdict, Voice).
 * - Bottom tabs for the main 5 destinations.
 *
 * Install:
 *   yarn add @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
 *           react-native-safe-area-context react-native-screens
 */
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS } from '@/theme/tokens';

import WelcomeScreen   from '@/screens/WelcomeScreen';
import HomeScreen      from '@/screens/HomeScreen';
import ScanScreen      from '@/screens/ScanScreen';
import VerdictScreen   from '@/screens/VerdictScreen';
import VoiceScreen     from '@/screens/VoiceScreen';
import FamilyScreen    from '@/screens/FamilyScreen';
import LibraryScreen   from '@/screens/LibraryScreen';
import AnalyticsScreen from '@/screens/AnalyticsScreen';
import ChatScreen      from '@/screens/ChatScreen';
import FamilyConsentScreen     from '@/screens/FamilyConsentScreen';
import ScreenshotResultScreen  from '@/screens/ScreenshotResultScreen';
import ModelPerfScreen         from '@/screens/ModelPerfScreen';

const Stack = createNativeStackNavigator();
const Tabs  = createBottomTabNavigator();

const TAB_ICONS = {
  Home:   { on: 'home',          off: 'home-outline' },
  Scan:   { on: 'scan',          off: 'scan-outline' },
  Family: { on: 'people',        off: 'people-outline' },
  Report: { on: 'stats-chart',   off: 'stats-chart-outline' },
  Chat:   { on: 'chatbubble',    off: 'chatbubble-outline' },
};

function TabBarIcon({ name, focused }) {
  const icons = TAB_ICONS[name];
  return (
    <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 }}>
      {focused && <View style={styles.indicator} />}
      <Ionicons
        name={focused ? icons.on : icons.off}
        size={24}
        color={focused ? COLORS.primary : '#94A3B8'}
        style={{ marginTop: 4 }}
      />
    </View>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontFamily: FONTS.enSemibold, fontSize: 10, marginTop: -2 },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) => <TabBarIcon name={route.name} focused={focused} />,
      })}
    >
      <Tabs.Screen name="Home"   component={HomeScreen} />
      <Tabs.Screen name="Scan"   component={ScanScreen} />
      <Tabs.Screen name="Family" component={FamilyScreen} />
      <Tabs.Screen name="Report" component={AnalyticsScreen} />
      <Tabs.Screen name="Chat"   component={ChatScreen} />
    </Tabs.Navigator>
  );
}

export default function AppNavigator({ hasOnboarded = false }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}
        initialRouteName={hasOnboarded ? 'Main' : 'Welcome'}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Main"    component={MainTabs} />
        <Stack.Screen name="Verdict" component={VerdictScreen}
          options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Voice"   component={VoiceScreen}
          options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="FamilyConsent" component={FamilyConsentScreen}
          options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ScreenshotResult" component={ScreenshotResultScreen}
          options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ModelPerf" component={ModelPerfScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72 + (Platform.OS === 'ios' ? 18 : 0),
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 18 : 6,
    backgroundColor: '#FFFFFFE8',
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: -2 },
    position: 'absolute',
  },
  indicator: {
    position: 'absolute', top: 0,
    width: 22, height: 3, borderRadius: 3, backgroundColor: COLORS.primary,
  },
});
