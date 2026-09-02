/**
 * FamilyScreen — Family Shield roster.
 * Roster is exactly 3 (05-screen-fit): header chip "3 members", hero "2 of 3
 * mehfooz hain", 3 avatars, 3 list rows — all four numbers stay in sync.
 * Fits one 390×844 viewport (no vertical scroll by design).
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { Avatar, SectionHeader, FamilyMemberCard } from '@/components/Cards';
import { alertGuardian } from '@/services/PushService';
import { FamilyService } from '@/services/FamilyService';

const MEMBERS = [
  { id:'1', name:'Saima Khan',  role:'Ammi',  status:'safe', lastProtected:'2 min ago',  color: COLORS.accentDk },
  { id:'2', name:'Bilal Ahmed', role:'Abu',   status:'safe', lastProtected:'12 min ago', color: COLORS.primary },
  { id:'3', name:'Usman Khan',  role:'Bhai',  status:'off',  lastProtected:'Yesterday',  color: COLORS.warning },
];

export default function FamilyScreen({ navigation }) {
  // "Family Ko Batain" — simulated push to the member's guardian + in-app confirm.
  // A family alert is NOT a scan, so it never touches the real scan stats.
  const notifyFamily = async member => {
    const res = await alertGuardian(member.id, 'manual_alert');
    if (!res?.success) return;
    Alert.alert(
      'Alert bhej diya gaya',
      `${member.name} ke guardian ko khabar kar di gayi hai.`,
      [{ text: 'Theek hai' }]
    );
  };

  // "Ghar Wala Jodein" — generate an invite code to share with the member.
  const addMember = () => {
    const code = FamilyService.generateCode();
    Alert.alert(
      'Invite Code',
      `Share this code with family member: ${code}`,
      [{ text: 'Theek hai' }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.text }}>Apna Gharana</Text>
            <Text style={[typo.bodyUrSm, { marginTop: SPACE.xs }]}>اپنا گھرانہ</Text>
          </View>
          <View style={styles.countChip}>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.sm, color: COLORS.primary }}>
              {MEMBERS.length} members
            </Text>
          </View>
        </View>

        {/* Hero */}
        <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
          style={[styles.hero, SHADOW.elevated]}>
          <Text style={styles.heroLabel}>
            FAMILY SHIELD
          </Text>
          <Text style={styles.heroTitle}>
            2 of 3 mehfooz hain
          </Text>
          <Text style={[typo.bodyUrInv, { marginTop: SPACE.xs }]}>دو افراد محفوظ ہیں</Text>
          <View style={{ flexDirection: 'row', marginTop: SPACE.md }}>
            {MEMBERS.map((m, i) => (
              <View key={m.id} style={{ marginLeft: i ? -SPACE.sm : 0,
                borderWidth: 2, borderColor: COLORS.white, borderRadius: RADIUS.chip }}>
                <Avatar name={m.name} color={m.color} size={32} />
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={{ marginTop: SPACE.md }}>
          <SectionHeader title="Members" urduTitle="ارکان" />
          <View style={{ gap: SPACE.sm }}>
            {MEMBERS.map(m => (
              <FamilyMemberCard key={m.id} member={m} onPress={() => notifyFamily(m)} />
            ))}
            <Pressable style={styles.addCard} onPress={addMember}>
              <View style={styles.addIcon}>
                <Ionicons name="add" size={SIZE.xl} color={COLORS.primary} />
              </View>
              <View>
                <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.primary }}>
                  Ghar Wala Jodein
                </Text>
                <Text style={[typo.bodyUrSm, { marginTop: SPACE.xs }]}>گھر والے کو شامل کریں</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACE.lg, paddingBottom: SPACE.xl },
  countChip: {
    paddingHorizontal: SPACE.sm, paddingVertical: SPACE.sm,
    borderRadius: RADIUS.chip, backgroundColor: COLORS.surface2,
  },
  hero: { borderRadius: RADIUS.card, padding: SPACE.md, marginTop: SPACE.md, overflow: 'hidden' },
  heroLabel: {
    fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.white + 'B3', letterSpacing: 1.2,
  },
  heroTitle: {
    fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.white, marginTop: SPACE.xs,
  },
  addCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    padding: SPACE.md, borderRadius: RADIUS.btn,
    borderWidth: 1.5, borderColor: COLORS.primary + '50',
    borderStyle: 'dashed', backgroundColor: COLORS.bg,
  },
  addIcon: {
    width: 44, height: 44, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
});
