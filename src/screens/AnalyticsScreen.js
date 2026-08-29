import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOW, gradients } from '@/theme/tokens';
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
  { l:'JazzCash Phishing',    ur:'جاز کیش',     count:5, amount:32000, c: '#F97316' },
  { l:'Friend Impersonation', ur:'دوست کا روپ', count:3, amount:28000, c: COLORS.warning },
  { l:'OTP Theft',            ur:'او ٹی پی',    count:2, amount:15000, c: '#8B5CF6' },
];

export default function AnalyticsScreen({ navigation }) {
  const max = Math.max(...DAYS.map(d => d.scans));
  const total = TYPES.reduce((a, b) => a + b.count, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 24, color: COLORS.text }}>Report</Text>
            <Text style={[typo.bodyUrSm, { marginTop: 2 }]}>رپورٹ</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {['7 Din', '30 Din', 'Saal'].map((t, i) => (
              <View key={i} style={[styles.timePill,
                i === 0 ? { backgroundColor: COLORS.text } : { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }
              ]}>
                <Text style={{ fontFamily: FONTS.enBold, fontSize: 12, color: i === 0 ? '#fff' : COLORS.textMuted }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hero saved */}
        <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
          style={[styles.hero, SHADOW.elevated]}
        >
          <Text style={{ fontFamily: FONTS.enExtra, fontSize: 11, color: 'rgba(255,255,255,0.8)', letterSpacing: 1.2 }}>
            TOTAL BACHAYA
          </Text>
          <Text style={styles.heroNum}>Rs 1,20,000</Text>
          <Text style={[typo.bodyEnInv, { marginTop: 6, lineHeight: 19 }]}>
            Aapne apne gharane ko 1 lakh 20 hazaar rupees ka nuqsaan se bachaya.
          </Text>
        </LinearGradient>

        {/* Chart */}
        <View style={[styles.card, SHADOW.card, { marginTop: 18 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 15, color: COLORS.text }}>7 Din Ki Activity</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Legend color={COLORS.danger} label="Blocked" />
              <Legend color={COLORS.accent} label="Safe" />
            </View>
          </View>
          <View style={styles.chart}>
            {DAYS.map((d, i) => {
              const safe = d.scans - d.blocked;
              const totalH = (d.scans / max) * 120;
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 22, borderRadius: 6, overflow: 'hidden' }}>
                    <View style={{ height: (d.blocked / d.scans) * totalH, backgroundColor: COLORS.danger }} />
                    <View style={{ height: (safe / d.scans) * totalH, backgroundColor: COLORS.accent }} />
                  </View>
                  <Text style={{ fontFamily: FONTS.enBold, fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.3 }}>{d.d}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Breakdown */}
        <View style={{ marginTop: 18 }}>
          <SectionHeader title="Scam Breakdown" urduTitle="فراڈ کی اقسام" />
          <View style={[styles.card, SHADOW.card, { gap: 14 }]}>
            {TYPES.map((t, i) => {
              const pct = (t.count / total) * 100;
              return (
                <View key={i}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
                      <Text style={{ fontFamily: FONTS.enBold, fontSize: 13, color: COLORS.text }}>{t.l}</Text>
                      <Text style={{ fontFamily: FONTS.enMedium, fontSize: 11, color: COLORS.textMuted }}>· {t.count}</Text>
                    </View>
                    <Text style={{ fontFamily: FONTS.enExtra, fontSize: 13, color: t.c, fontVariant: ['tabular-nums'] }}>
                      Rs {t.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={{ height: '100%', width: `${pct}%`, backgroundColor: t.c, borderRadius: 99 }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-social" size={18} color="#fff" />
          <Text style={{ fontFamily: FONTS.enExtra, fontSize: 15, color: '#fff' }}>Report Share Karein</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
      <Text style={{ fontFamily: FONTS.enSemibold, fontSize: 11, color: COLORS.textMuted }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  hero: { borderRadius: 20, padding: 18, marginTop: 16, overflow: 'hidden' },
  heroNum: {
    fontFamily: FONTS.enBlack, fontSize: 40, color: '#fff',
    marginTop: 8, fontVariant: ['tabular-nums'], letterSpacing: -1,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chart: {
    marginTop: 16, height: 140, flexDirection: 'row',
    alignItems: 'flex-end', justifyContent: 'space-between', gap: 6,
  },
  barTrack: { marginTop: 6, height: 6, borderRadius: 99, backgroundColor: COLORS.border, overflow: 'hidden' },
  shareBtn: {
    marginTop: 16, height: 52, borderRadius: 14,
    backgroundColor: COLORS.text, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
});
