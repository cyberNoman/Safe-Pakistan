/**
 * HomeScreen — dashboard with glass hero, stat row, recent activity.
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
// import { useAppContext } from '@/context/AppContext';
// import { useLanguageContext } from '@/context/LanguageContext';

export default function HomeScreen({ navigation }) {
  // const { scanCount = 312, blockedCount = 47, recentScans = [] } = useAppContext();
  // const { t } = useLanguageContext();
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
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.headerRow}>
          <View>
            <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.textMuted }}>
              Assalam o Alaikum
            </Text>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 22, color: COLORS.text, marginTop: 2 }}>
              {userName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable style={[styles.iconBtn, SHADOW.soft]} onPress={() => navigation?.navigate?.('Notifications')}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
              <View style={styles.dot} />
            </Pressable>
            <Avatar name={userName} color={COLORS.primary} size={40} />
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
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 20, color: '#fff', marginTop: 12, lineHeight: 26 }}>
              Aaj 3 threats block hue
            </Text>
            <Text style={[typo.bodyUrSm, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
              آج 3 خطرات روکے گئے
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
              <AgentStatusDot label="SMS" status="on" />
              <AgentStatusDot label="VOICE" status="on" />
              <AgentStatusDot label="LINK" status="on" />
              <AgentStatusDot label="FAMILY" status="busy" />
            </View>
          </View>
          <ThreatRing score={98} size={92} color="#00C896" label="PROTECTED" />
        </LinearGradient>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <StatCard value="47"  label="Threats Blocked" color={COLORS.danger}  icon="shield" />
          <StatCard value="312" label="Total Scans"     color={COLORS.primary} icon="scan" />
          <StatCard value="5"   label="Family Safe"     color={COLORS.accent}  icon="people" />
        </View>

        {/* Recent — Scan + Voice are tab-bar destinations, so no duplicate quick tiles */}
        <View style={{ marginTop: 16 }}>
          <SectionHeader
            title="Recent Activity" urduTitle="حالیہ سرگرمی"
            action="See All →"
            onActionPress={() => navigation?.navigate?.('Library')}
          />
          <View style={{ gap: 8 }}>
            {recent.map((r, i) => <ActivityFeedItem key={i} {...r} />)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickTile({ title, sub, icon, colors, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      { flex: 1 }, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
    ]}>
      <LinearGradient colors={colors} start={{x:0,y:0}} end={{x:1,y:1}}
        style={[styles.tile, SHADOW.card]}
      >
        <View style={styles.tileIcon}>
          <Ionicons name={icon} size={20} color="#fff" />
        </View>
        <View>
          <Text style={{ fontFamily: FONTS.enExtra, fontSize: 14, color: '#fff' }}>{title}</Text>
          <Text style={{ fontFamily: FONTS.enMedium, fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>
            {sub}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  dot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 99,
    backgroundColor: COLORS.danger, borderWidth: 2, borderColor: '#fff',
  },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderRadius: 24, padding: 20, marginTop: 18, overflow: 'hidden',
  },
  tile: {
    height: 110, borderRadius: RADIUS.card, padding: 14,
    justifyContent: 'space-between',
  },
  tileIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
});
