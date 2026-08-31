import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZE, RADIUS, SHADOW, SPACE, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { SectionHeader } from '@/components/Cards';

const DAYS = [
  { d:'Pir',  blocked:4, scans:8 },  { d:'Mng', blocked:2, scans:5 },
  { d:'Bdh',  blocked:6, scans:11 }, { d:'Jma', blocked:3, scans:7 },
  { d:'Jum',  blocked:8, scans:14 }, { d:'Hft', blocked:5, scans:9 },
  { d:'Itw',  blocked:7, scans:12 },
];

const TYPES = [
  { l:'BISP 8171 Fraud',      ur:'بے نظیر فراڈ', count:8, amount:45000, c: COLORS.danger },
  { l:'JazzCash Phishing',    ur:'جاز کیش',     count:5, amount:32000, c: COLORS.warning },
  { l:'Friend Impersonation', ur:'دوست کا روپ', count:3, amount:28000, c: COLORS.primaryLt },
  { l:'OTP Theft',            ur:'او ٹی پی',    count:2, amount:15000, c: COLORS.accentDk },
];

export default function AnalyticsScreen({ navigation }) {
  const max = Math.max(...DAYS.map(d => d.scans));
  const total = TYPES.reduce((a, b) => a + b.count, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      {/* Designated scroller (artboard 11) — vertical scroll is intended */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <View>
            <Text style={styles.title}>Report</Text>
            <Text style={[typo.bodyUrSm, { marginTop: SPACE.xs }]}>رپورٹ</Text>
          </View>
          <View style={styles.pills}>
            {['7 Din', '30 Din', 'Saal'].map((t, i) => (
              <View key={i} style={[styles.timePill,
                i === 0 ? { backgroundColor: COLORS.text } : { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }
              ]}>
                <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: i === 0 ? COLORS.white : COLORS.textMuted }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hero saved */}
        <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
          style={[styles.hero, SHADOW.elevated]}
        >
          <Text style={styles.heroLabel}>TOTAL BACHAYA</Text>
          <Text style={[typo.scoreEn, { color: COLORS.white, marginTop: SPACE.sm }]}>Rs 1,20,000</Text>
          <Text style={[typo.bodyEnInv, { marginTop: SPACE.xs }]}>
            Aapne apne gharane ko 1 lakh 20 hazaar rupees ka nuqsaan se bachaya.
          </Text>
        </LinearGradient>

        {/* Chart */}
        <View style={[styles.card, SHADOW.card, { marginTop: SPACE.md }]}>
          <View style={styles.chartHead}>
            <Text style={styles.cardTitle}>7 Din Ki Activity</Text>
            <View style={styles.legendRow}>
              <Legend color={COLORS.danger} label="Blocked" />
              <Legend color={COLORS.accent} label="Safe" />
            </View>
          </View>
          <View style={styles.chart}>
            {DAYS.map((d, i) => {
              const safe = d.scans - d.blocked;
              const totalH = (d.scans / max) * 120;
              return (
                <View key={i} style={styles.dayCol}>
                  <View style={styles.bar}>
                    <View style={{ height: (d.blocked / d.scans) * totalH, backgroundColor: COLORS.danger }} />
                    <View style={{ height: (safe / d.scans) * totalH, backgroundColor: COLORS.accent }} />
                  </View>
                  <Text style={styles.dayLabel}>{d.d}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Breakdown */}
        <View style={{ marginTop: SPACE.md }}>
          <SectionHeader title="Scam Breakdown" urduTitle="فراڈ کی اقسام" />
          <View style={[styles.card, SHADOW.card, { gap: SPACE.md }]}>
            {TYPES.map((t, i) => {
              const pct = (t.count / total) * 100;
              return (
                <View key={i}>
                  <View style={styles.breakHead}>
                    <View style={styles.breakLabels}>
                      <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.text }}>{t.l}</Text>
                      <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.textMuted }}>· {t.count}</Text>
                    </View>
                    <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.sm, color: t.c, fontVariant: ['tabular-nums'] }}>
                      Rs {t.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={{ height: '100%', width: `${pct}%`, backgroundColor: t.c, borderRadius: RADIUS.chip }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-social" size={SIZE.lg} color={COLORS.white} />
          <Text style={styles.shareText}>Report Share Karein</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, label }) {
  return (
    <View style={styles.legend}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACE.lg, paddingBottom: SPACE.xl },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.text },
  pills: { flexDirection: 'row', gap: SPACE.sm },
  timePill: { paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs, borderRadius: RADIUS.chip },
  hero: { borderRadius: RADIUS.card, padding: SPACE.md, marginTop: SPACE.md, overflow: 'hidden' },
  heroLabel: {
    fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.white + 'CC', letterSpacing: 1.2,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACE.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  cardTitle: { fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.text },
  legendRow: { flexDirection: 'row', gap: SPACE.sm },
  chart: {
    marginTop: SPACE.md, height: 140, flexDirection: 'row',
    alignItems: 'flex-end', justifyContent: 'space-between', gap: SPACE.sm,
  },
  dayCol: { flex: 1, alignItems: 'center', gap: SPACE.sm },
  bar: { width: SIZE.xl, borderRadius: RADIUS.sm, overflow: 'hidden' },
  dayLabel: { fontFamily: FONTS.enBold, fontSize: SIZE.xs, color: COLORS.textMuted, letterSpacing: 0.3 },
  breakHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  breakLabels: { flexDirection: 'row', gap: SPACE.sm, alignItems: 'baseline' },
  barTrack: { marginTop: SPACE.sm, height: 6, borderRadius: RADIUS.chip, backgroundColor: COLORS.border, overflow: 'hidden' },
  shareBtn: {
    marginTop: SPACE.md, height: 52, borderRadius: RADIUS.btn,
    backgroundColor: COLORS.text, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: SPACE.sm,
  },
  shareText: { fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.white },
  legend: { flexDirection: 'row', alignItems: 'center', gap: SPACE.xs },
  legendDot: { width: SPACE.sm, height: SPACE.sm, borderRadius: RADIUS.sm },
  legendLabel: { fontFamily: FONTS.enSemibold, fontSize: SIZE.xs, color: COLORS.textMuted },
});
