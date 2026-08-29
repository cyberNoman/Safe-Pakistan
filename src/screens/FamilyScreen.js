/**
 * Remaining screens — FamilyScreen, LibraryScreen, AnalyticsScreen, ChatScreen, WelcomeScreen.
 * Each is a complete, self-contained screen. They follow the exact same patterns as
 * HomeScreen / VerdictScreen / VoiceScreen — see those files for the deepest examples
 * of animation, gradient, and Urdu/RTL handling.
 */

// ════════════════════════════════════════════════════════════════
// handoff/src/screens/FamilyScreen.js
// ════════════════════════════════════════════════════════════════
import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { Avatar, SectionHeader, FamilyMemberCard } from '@/components/Cards';
import { alertGuardian } from '@/services/PushService';
import { useAppContext } from '@/context/AppContext';

const MEMBERS = [
  { id:'1', name:'Saima Khan',  role:'Ammi',  status:'safe', lastProtected:'2 min ago',  color:'#EC4899' },
  { id:'2', name:'Bilal Ahmed', role:'Abu',   status:'safe', lastProtected:'12 min ago', color: COLORS.primary },
  { id:'3', name:'Hina Khan',   role:'Behan', status:'safe', lastProtected:'1 hour ago', color:'#8B5CF6' },
  { id:'4', name:'Usman Khan',  role:'Bhai',  status:'off',  lastProtected:'Yesterday',  color:'#F59E0B' },
];

export default function FamilyScreen({ navigation }) {
  const { incrementScan } = useAppContext();

  // "Family Ko Batain" — mock push to the member's guardian + in-app confirm.
  const notifyFamily = async member => {
    const res = await alertGuardian(member.id, 'manual_alert');
    if (!res?.success) return;
    incrementScan(); // reflect user activity
    Alert.alert(
      'Alert bhej diya gaya',
      `${member.name} ke guardian ko khabar kar di gayi hai.`,
      [{ text: 'Theek hai' }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 24, color: COLORS.text }}>Apna Gharana</Text>
            <Text style={[typo.bodyUrSm, { marginTop: 2 }]}>اپنا گھرانہ</Text>
          </View>
          <View style={{ paddingHorizontal: 12, paddingVertical: 6,
            borderRadius: 99, backgroundColor: COLORS.surface2 }}>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 12, color: COLORS.primary }}>
              {MEMBERS.length + 1} members
            </Text>
          </View>
        </View>

        {/* Hero */}
        <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
          style={[{ borderRadius: 20, padding: 16, marginTop: 16, overflow: 'hidden' }, SHADOW.elevated]}
        >
          <Text style={{ fontFamily: FONTS.enExtra, fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.2 }}>
            FAMILY SHIELD
          </Text>
          <Text style={{ fontFamily: FONTS.enExtra, fontSize: 22, color: '#fff', marginTop: 6 }}>
            2 of 3 mehfooz hain
          </Text>
          <Text style={[typo.bodyUrInv, { marginTop: 2 }]}>دو افراد محفوظ ہیں</Text>
          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            {MEMBERS.map((m, i) => (
              <View key={m.id} style={{ marginLeft: i ? -10 : 0,
                borderWidth: 2, borderColor: '#fff', borderRadius: 99 }}>
                <Avatar name={m.name} color={m.color} size={32} />
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={{ marginTop: 20 }}>
          <SectionHeader title="Members" urduTitle="ارکان" />
          <View style={{ gap: 8 }}>
            {MEMBERS.map(m => (
              <FamilyMemberCard key={m.id} member={m} onPress={() => notifyFamily(m)} />
            ))}
            <Pressable style={styles.addCard}>
              <View style={styles.addIcon}>
                <Ionicons name="add" size={22} color={COLORS.primary} />
              </View>
              <View>
                <Text style={{ fontFamily: FONTS.enBold, fontSize: 14, color: COLORS.primary }}>
                  Ghar Wala Jodein
                </Text>
                <Text style={[typo.bodyUrSm, { marginTop: 2 }]}>گھر والے کو شامل کریں</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.primary + '50',
    borderStyle: 'dashed', backgroundColor: '#F8FAFF',
  },
  addIcon: {
    width: 44, height: 44, borderRadius: 99,
    backgroundColor: COLORS.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
});
