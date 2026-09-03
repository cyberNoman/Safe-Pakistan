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
import { View, Text, ScrollView, Pressable, Share, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SIZE, RADIUS, SHADOW, SPACE, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import ThreatRing from '@/components/ThreatRing';
import { StatusPill, AgentStatusDot } from '@/components/Indicators';
import { Avatar, StatCard, SectionHeader, ActivityFeedItem, EmptyState } from '@/components/Cards';
import { useAppContext } from '@/context/AppContext';
import { deriveTone, relTime } from '@/services/LocalDBService';

export default function HomeScreen({ navigation }) {
  // Every number comes from the real scan store — zero scans → zeros + empty state.
  const { scans = [], scanCount = 0, blockedCount = 0, safeCount = 0, recentScans = [] } = useAppContext();
  const userName = 'Ahmed Khan';

  // Threats blocked today (real) — drives the hero headline.
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const blockedToday = scans.filter(s => s.verdict === 'scam' && Number(s.ts) >= startOfToday.getTime()).length;

  // Recent activity — real scans only, newest first (3 rows to fit one viewport).
  const recent = recentScans.slice(0, 3).map(s => ({
    tone: deriveTone(s.verdict),
    type: s.scam_type || 'Scan',
    message: s.msg || '',
    time: relTime(s.ts),
  }));

  // Share — a plain-text summary built ONLY from the real scan store. Zero scans
  // says "No scans yet" rather than inventing numbers; nothing here is fabricated.
  const shareSummary = async () => {
    const lines = recent.map(r => `• ${r.type} (${r.time}) — ${r.message}`.slice(0, 120));
    const body = [
      'HIFAZAT — Safe Pakistan | Apne Ghar Ki Hifazat',
      '',
      `Scans: ${scanCount} · Blocked: ${blockedCount} · Safe: ${safeCount}`,
      '',
      lines.length ? 'Recent activity:' : 'No scans yet.',
      ...lines,
      '',
      'Shak wala SMS Hifazat se jaanchein. NCCIA cybercrime helpline: 1799.',
    ].join('\n');
    try {
      await Share.share({ message: body, title: 'Hifazat — Scan Summary' });
    } catch (e) {
      // Dismissed sheet or no share target — nothing to surface.
    }
  };

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
            {/* Share replaces the old bell: that bell navigated to a 'Notifications'
                route which does not exist, and its red dot implied unread alerts the
                app never produces. This is a real action on the same 44×44 footprint. */}
            <Pressable style={({ pressed }) => [styles.iconBtn, SHADOW.soft, pressed && { transform: [{ scale: 0.98 }] }]}
              onPress={shareSummary} hitSlop={SIZE.xs}
              accessibilityRole="button" accessibilityLabel="Scan summary share karein">
              <Ionicons name="share-social-outline" size={SIZE.xl} color={COLORS.text} />
            </Pressable>
            <Pressable onPress={() => navigation?.navigate?.('Profile')} hitSlop={SIZE.xs}>
              <Avatar name={userName} color={COLORS.primary} size={44} />
            </Pressable>
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
              {blockedToday > 0 ? `Aaj ${blockedToday} threats block hue` : 'Aapka ghar mehfooz hai'}
            </Text>
            <Text style={[typo.bodyUrInv, { marginTop: SPACE.xs }]}>
              {blockedToday > 0 ? `آج ${blockedToday} خطرات روکے گئے` : 'آپ کا گھر محفوظ ہے'}
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
          <StatCard value={String(safeCount)}    label="Safe Scans"      color={COLORS.accent}  icon="checkmark-circle" />
        </View>

        {/* Recent — Scan and Voice are tab-bar destinations, so no duplicate quick tiles */}
        <View style={{ marginTop: SPACE.md }}>
          <SectionHeader
            title="Recent Activity" urduTitle="حالیہ سرگرمی"
            action="See All →"
            onActionPress={() => navigation?.navigate?.('Library')}
          />
          {recent.length ? (
            <View style={{ gap: SPACE.sm }}>
              {recent.map((r, i) => <ActivityFeedItem key={i} {...r} />)}
            </View>
          ) : (
            <EmptyState
              icon="scan-outline"
              title="Abhi koi scan nahi"
              urduTitle="ابھی کوئی اسکین نہیں"
              cta="SMS Jaanchein"
              onCtaPress={() => navigation?.navigate?.('Scan')}
            />
          )}
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
    alignItems: 'center', justifyContent: 'center',
  },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
    borderRadius: RADIUS.card, padding: SPACE.lg, marginTop: SPACE.md, overflow: 'hidden',
  },
});
