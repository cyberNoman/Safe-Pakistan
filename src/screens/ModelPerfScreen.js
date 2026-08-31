/**
 * ModelPerfScreen — Settings > Model Performance.
 * Transparency screen: accuracy, false-positive rate, latency, dataset size,
 * plus a two-bar comparison of keyword baseline vs the AI system.
 *
 * Wire `metrics` to GET /model/metrics on your backend.
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, RADIUS, SIZE, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo, enText } from '@/theme/typography';
import ThreatRing from '@/components/ThreatRing';
import { SectionHeader } from '@/components/Cards';

const METRICS = [
  { l:'Accuracy',        v:'94.2', unit:'%',  ur:'درستگی',    c: COLORS.accent },
  { l:'False positives', v:'3.1',  unit:'%',  ur:'غلط الارم', c: COLORS.warning },
  { l:'Avg latency',     v:'340',  unit:'ms', ur:'رفتار',     c: COLORS.primary },
  { l:'Dataset size',    v:'52k',  unit:'',   ur:'ڈیٹا',      c: COLORS.text },
];

const BARS = [
  { l:'Keyword baseline', ur:'پرانا طریقہ',      v: 68, flat: COLORS.textMuted },
  { l:'Hifazat AI',            ur:'حفاظت اے آئی',        v: 94, flat: null },
];

export default function ModelPerfScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: SPACE.lg, paddingBottom: SPACE.xxl }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
          <Pressable onPress={() => navigation?.goBack?.()} style={[styles.iconBtn, SHADOW.soft]}>
            <Ionicons name="chevron-back" size={18} color={COLORS.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={enText(SIZE.xs, FONTS.enExtra, COLORS.textMuted, { letterSpacing: 1 })}>
              SETTINGS
            </Text>
            <Text style={enText(SIZE.lg, FONTS.enExtra, COLORS.text, { marginTop: 1 })}>
              Model Performance
            </Text>
          </View>
        </View>

        {/* Hero */}
        <LinearGradient
          colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
          style={[styles.hero, SHADOW.elevated]}
        >
          <View style={{ flex: 1 }}>
            <Text style={enText(SIZE.xs, FONTS.enExtra, COLORS.white70, { letterSpacing: 1.2 })}>
              LIVE MODEL · v2.4
            </Text>
            <Text style={styles.heroNum}>94.2%</Text>
            <Text style={enText(SIZE.sm, FONTS.enSemibold, COLORS.white80, { marginTop: 6 })}>
              Overall accuracy
            </Text>
            <Text style={[typo.labelUr, { color: COLORS.white80, marginTop: 3 }]}>مجموعی درستگی</Text>
          </View>
          <ThreatRing score={94} size={88} color={COLORS.accent} label="ACCURACY" />
        </LinearGradient>

        {/* Metric grid */}
        <View style={styles.grid}>
          {METRICS.map(m => (
            <View key={m.l} style={[styles.metric, SHADOW.soft]}>
              <View style={[styles.metricBar, { backgroundColor: m.c }]} />
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
                <Text style={styles.metricNum}>{m.v}</Text>
                <Text style={enText(SIZE.sm, FONTS.enBold, COLORS.textMuted)}>{m.unit}</Text>
              </View>
              <Text style={enText(SIZE.sm, FONTS.enBold, COLORS.text, { marginTop: SPACE.sm })}>{m.l}</Text>
              <Text style={[typo.labelUr, { marginTop: 2 }]}>{m.ur}</Text>
            </View>
          ))}
        </View>

        {/* Comparison */}
        <View style={{ marginTop: SPACE.lg }}>
          <SectionHeader title="Keyword vs AI" urduTitle="موازنہ" />
          <View style={[styles.card, SHADOW.card]}>
            <View style={styles.barChart}>
              {BARS.map(b => (
                <View key={b.l} style={{ alignItems: 'center', gap: SPACE.sm, width: 88 }}>
                  <Text style={enText(SIZE.lg, FONTS.enBlack, b.flat ? COLORS.textMuted : COLORS.primary, {
                    fontVariant: ['tabular-nums'],
                  })}>{b.v}%</Text>
                  {b.flat ? (
                    <View style={{ width: 60, height: (b.v/100)*112, borderTopLeftRadius: RADIUS.sm, borderTopRightRadius: RADIUS.sm, backgroundColor: b.flat }} />
                  ) : (
                    <LinearGradient
                      colors={gradients.hero.colors} start={{x:0,y:1}} end={{x:0,y:0}}
                      style={{ width: 60, height: (b.v/100)*112, borderTopLeftRadius: RADIUS.sm, borderTopRightRadius: RADIUS.sm }}
                    />
                  )}
                  <Text style={enText(SIZE.sm, FONTS.enBold, COLORS.text, { textAlign: 'center', lineHeight: 17 })}>
                    {b.l}
                  </Text>
                  <Text style={[typo.labelUr, { textAlign: 'center' }]}>{b.ur}</Text>
                </View>
              ))}
            </View>
            <View style={styles.callout}>
              <Text style={enText(SIZE.base, FONTS.enSemibold, COLORS.text, { lineHeight: 22 })}>
                AI system 26% zyada scam pakadta hai.
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footnote}>
          Tested on 52,000 real Pakistani SMS messages · Last evaluated 12 Aug 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  iconBtn: {
    width: 40, height: 40, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
    borderRadius: RADIUS.card, padding: SPACE.md, marginTop: SPACE.md, overflow: 'hidden',
  },
  heroNum: {
    ...typo.scoreEn, color: COLORS.white,
    marginTop: 6, lineHeight: 42, letterSpacing: -1,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm, marginTop: SPACE.md },
  metric: {
    width: '47.5%', flexGrow: 1,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.btn, padding: SPACE.md,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  metricBar: { position: 'absolute', top: 0, left: 0, width: 3, height: 30 },
  metricNum: {
    fontFamily: FONTS.enBlack, fontSize: SIZE.xl, color: COLORS.text,
    fontVariant: ['tabular-nums'], lineHeight: 28,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACE.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  barChart: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'center', gap: SPACE.xl, height: 200,
  },
  callout: {
    marginTop: SPACE.md, padding: SPACE.sm, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.surface2,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  footnote: enText(SIZE.xs, FONTS.enMedium, COLORS.textMuted, {
    marginTop: SPACE.md, lineHeight: 18,
  }),
});
