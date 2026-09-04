import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZE, RADIUS, SHADOW, SPACE, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { SectionHeader, EmptyState } from '@/components/Cards';
import { useAppContext } from '@/context/AppContext';
import { savedAmountFor } from '@/services/LocalDBService';

// Sun..Sat Roman-Urdu abbreviations — match the artboard's day labels.
const DAY_ABBR = ['Itw', 'Pir', 'Mng', 'Bdh', 'Jma', 'Jum', 'Hft'];
const ROW_COLORS = [COLORS.danger, COLORS.warning, COLORS.primaryLt, COLORS.accentDk];

// Group the real scans into the last 7 calendar days (oldest → newest).
function last7Days(scans) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const buckets = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(today); start.setDate(today.getDate() - i);
    const end = new Date(start); end.setDate(start.getDate() + 1);
    const dayRows = scans.filter(s => Number(s.ts) >= start.getTime() && Number(s.ts) < end.getTime());
    buckets.push({
      d: DAY_ABBR[start.getDay()],
      scans: dayRows.length,
      blocked: dayRows.filter(s => s.verdict === 'scam').length,
    });
  }
  return buckets;
}

// Blocked (scam) scans grouped by type → count + PKR saved. Each row sums the
// rupee amount the message itself quoted (captured at scan time), falling back
// to the per-type estimate for records with none — so the rows still add up to
// the hero total instead of contradicting it.
function scamBreakdown(scans) {
  const groups = {};
  scans.filter(s => s.verdict === 'scam').forEach(s => {
    const label = s.scam_type || 'Other Scam';
    if (!groups[label]) groups[label] = { label, count: 0, amount: 0 };
    groups[label].count += 1;
    groups[label].amount += savedAmountFor(s);
  });
  return Object.values(groups).sort((a, b) => b.count - a.count);
}

export default function AnalyticsScreen({ navigation }) {
  // Report computes ONLY from the real scan store. Zero scans → clean empty state.
  const { scans = [], savedAmount = 0, blockedCount = 0, scanCount = 0 } = useAppContext();

  const days = useMemo(() => last7Days(scans), [scans]);
  const types = useMemo(() => scamBreakdown(scans), [scans]);
  const max = Math.max(1, ...days.map(d => d.scans));
  const isEmpty = scanCount === 0;

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

        {isEmpty ? (
          <EmptyState
            icon="stats-chart-outline"
            title="Abhi koi scan nahi"
            urduTitle="ابھی کوئی اسکین نہیں"
            cta="SMS Jaanchein"
            onCtaPress={() => navigation?.navigate?.('Scan')}
          />
        ) : (
          <>
            {/* Hero — real money saved: SUM of the amounts the blocked messages quoted */}
            <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
              style={[styles.hero, SHADOW.elevated]}
            >
              <Text style={styles.heroLabel}>TOTAL BACHAYA</Text>
              <Text style={[typo.scoreEn, { color: COLORS.white, marginTop: SPACE.sm }]}>Rs {savedAmount.toLocaleString()}</Text>
              <View style={styles.estimateChip}>
                <Ionicons name="information-circle" size={SIZE.sm} color={COLORS.white} />
                <Text style={styles.estimateText}>real amounts · else per-type estimate</Text>
              </View>
              <Text style={[typo.bodyEnInv, { marginTop: SPACE.sm }]}>
                {blockedCount} scam{blockedCount === 1 ? '' : 's'} block kar ke aapne yeh nuqsaan bachaya.
              </Text>
            </LinearGradient>

            {/* Chart — last 7 days of real activity */}
            <View style={[styles.card, SHADOW.card, { marginTop: SPACE.md }]}>
              <View style={styles.chartHead}>
                <Text style={styles.cardTitle}>7 Din Ki Activity</Text>
                <View style={styles.legendRow}>
                  <Legend color={COLORS.danger} label="Blocked" />
                  <Legend color={COLORS.accent} label="Safe" />
                </View>
              </View>
              <View style={styles.chart}>
                {days.map((d, i) => {
                  const safe = d.scans - d.blocked;
                  const totalH = (d.scans / max) * 120;
                  return (
                    <View key={i} style={styles.dayCol}>
                      <View style={styles.bar}>
                        {d.scans > 0 && <View style={{ height: (d.blocked / d.scans) * totalH, backgroundColor: COLORS.danger }} />}
                        {d.scans > 0 && <View style={{ height: (safe / d.scans) * totalH, backgroundColor: COLORS.accent }} />}
                      </View>
                      <Text style={styles.dayLabel}>{d.d}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Breakdown — real scam types only */}
            <View style={{ marginTop: SPACE.md }}>
              <SectionHeader title="Scam Breakdown" urduTitle="فراڈ کی اقسام" />
              {types.length ? (
                <View style={[styles.card, SHADOW.card, { gap: SPACE.md }]}>
                  {types.map((t, i) => {
                    const pct = (t.count / blockedCount) * 100;
                    const c = ROW_COLORS[i % ROW_COLORS.length];
                    return (
                      <View key={t.label}>
                        <View style={styles.breakHead}>
                          <View style={styles.breakLabels}>
                            <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.text }}>{t.label}</Text>
                            <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.textMuted }}>· {t.count}</Text>
                          </View>
                          <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.sm, color: c, fontVariant: ['tabular-nums'] }}>
                            Rs {t.amount.toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View style={{ height: '100%', width: `${pct}%`, backgroundColor: c, borderRadius: RADIUS.chip }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={[styles.card, SHADOW.card]}>
                  <Text style={styles.emptyNote}>Abhi koi scam block nahi hua.</Text>
                </View>
              )}
            </View>

            <Pressable style={styles.shareBtn}>
              <Ionicons name="share-social" size={SIZE.lg} color={COLORS.white} />
              <Text style={styles.shareText}>Report Share Karein</Text>
            </Pressable>
          </>
        )}
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
  estimateChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.xs, alignSelf: 'flex-start',
    marginTop: SPACE.sm, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs,
    borderRadius: RADIUS.chip, backgroundColor: COLORS.white20,
  },
  estimateText: { fontFamily: FONTS.enSemibold, fontSize: SIZE.xs, color: COLORS.white, letterSpacing: 0.3 },
  emptyNote: { fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.textMuted, textAlign: 'center' },
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
