/**
 * HomeScreen — dashboard with glass hero, stat row, recent activity.
 * Fits one 390×844 viewport (no vertical scroll by design).
 *
 * Wiring expected:
 *   - useAppContext()   →   { scanCount, blockedCount, familyCount, recentScans }
 *   - useLanguageContext() → { language, t() }
 *   - navigation prop from React Navigation
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SIZE, RADIUS, SHADOW, SPACE, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import ThreatRing from '@/components/ThreatRing';
import { StatusPill, AgentStatusDot } from '@/components/Indicators';
import { Avatar, StatCard, SectionHeader, ActivityFeedItem } from '@/components/Cards';
import { useAppContext } from '@/context/AppContext';

export default function HomeScreen({ navigation }) {
  const { scanCount = 312, blockedCount = 47, recentScans = [] } = useAppContext();
  const userName = 'Ahmed Khan';

  const recent = [
    { tone:'danger', type:'BISP 8171 Fraud', message:'Mubarak ho! Apko 25,000 mile hain...', time:'2m' },
    { tone:'warn',   type:'Unknown Link',     message:'Aapka JazzCash account verify karein...', time:'1h' },
    { tone:'safe',   type:'JazzCash Official',message:'Your transfer of Rs 5,000 to...', time:'3h' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.headerRow}>
          <View>
            <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.textMuted }}>
              Assalam o Alaikum
            </Text>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.text, marginTop: SPACE.xs }}>
              {userName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
            <Pressable style={[styles.iconBtn, SHADOW.soft]} onPress={() => navigation?.navigate?.('Notifications')}>
              <Ionicons name="notifications-outline" size={SIZE.xl} color={COLORS.text} />
              <View style={styles.dot} />
            </Pressable>
            <Avatar name={userName} color={COLORS.primary} size={44} />
          </View>
        </View>

        {/* Hero card */}
        <LinearGradient
          colors={gradients.hero.colors}
          start={gradients.hero.start} end={gradients.hero.end}
          style={[styles.hero, SHADOW.elevated]}
        >
          <View style={{ flex: 1 }}>
            <StatusPill kind="safe">PROTECTED · MEHFOOZ</StatusPill>
            <Text style={styles.heroTitle}>
              Aaj 3 threats block hue
            </Text>
            <Text style={[typo.bodyUrInv, { marginTop: SPACE.xs }]}>
              آج 3 خطرات روکے گئے
            </Text>
            <View style={{ flexDirection: 'row', gap: SPACE.sm, marginTop: SPACE.md, flexWrap: 'wrap' }}>
              <AgentStatusDot label="SMS" status="on" />
              <AgentStatusDot label="VOICE" status="on" />
              <AgentStatusDot label="LINK" status="on" />
              <AgentStatusDot label="FAMILY" status="busy" />
            </View>
          </View>
          <ThreatRing score={98} size={92} color={COLORS.accent} label="PROTECTED" />
        </LinearGradient>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: SPACE.sm, marginTop: SPACE.md }}>
          <StatCard value={String(blockedCount)} label="Threats Blocked" color={COLORS.danger}  icon="shield" />
          <StatCard value={String(scanCount)}    label="Total Scans"     color={COLORS.primary} icon="scan" />
          <StatCard value="5"                    label="Family Safe"     color={COLORS.accent}  icon="people" />
        </View>

        {/* Recent — Scan and Voice are tab-bar destinations, so no duplicate quick tiles */}
        <View style={{ marginTop: SPACE.md }}>
          <SectionHeader
            title="Recent Activity" urduTitle="حالیہ سرگرمی"
            action="See All →"
            onActionPress={() => navigation?.navigate?.('Library')}
          />
          <View style={{ gap: SPACE.sm }}>
            {recent.map((r, i) => <ActivityFeedItem key={i} {...r} />)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACE.lg, paddingBottom: SPACE.xl },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  heroTitle: {
    fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.white,
    marginTop: SPACE.sm, lineHeight: SIZE.xl * 1.3,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  dot: {
    position: 'absolute', top: SPACE.sm, right: SPACE.sm,
    width: 8, height: 8, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.danger, borderWidth: 2, borderColor: COLORS.white,
  },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
    borderRadius: RADIUS.card, padding: SPACE.lg, marginTop: SPACE.md, overflow: 'hidden',
  },
});
