/**
 * VerdictScreen — handles both SCAM and SAFE verdicts via `verdict` prop.
 * Uses Reanimated entrance for the danger band + ring fill.
 */
import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';

import { COLORS, FONTS, RADIUS, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import ThreatRing from '@/components/ThreatRing';
import { ScamTypeChip } from '@/components/Indicators';
// ScamTypeChip is available for the Library/Screenshot screens; the scam verdict
// deliberately uses only the evidence chips to keep the card inside one screen.

export default function VerdictScreen({ route, navigation }) {
  const verdict = route?.params?.verdict ?? 'scam'; // 'scam' | 'safe'
  const score   = route?.params?.score   ?? (verdict === 'scam' ? 96 : 12);
  const confidence = route?.params?.confidence ?? (verdict === 'scam' ? 95 : 99);
  const type    = route?.params?.type ?? (verdict === 'scam' ? 'BISP 8171 Fraud' : 'JazzCash Official');

  const isScam = verdict === 'scam';
  const gradient = isScam ? gradients.danger : gradients.safe;

  // Slide-down entrance for the verdict band
  const bandY = useSharedValue(-40);
  useEffect(() => {
    bandY.value = withDelay(80, withSpring(0, { damping: 14, stiffness: 110 }));
  }, []);
  const bandStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bandY.value }] }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
        {/* Top band */}
        <Animated.View style={[bandStyle]}>
          <LinearGradient
            colors={gradient.colors} start={gradient.start} end={gradient.end}
            style={styles.band}
          >
            <View style={styles.bandHeader}>
              <Pressable onPress={() => navigation?.goBack?.()} style={styles.iconBtn}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </Pressable>
              <Text style={styles.bandLabel}>SCAN COMPLETE</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.bandHero}>
              <View style={styles.verdictPill}>
                <Ionicons name={isScam ? 'warning' : 'checkmark-circle'} size={18} color="#fff" />
                <Text style={styles.verdictPillText}>
                  {isScam ? 'FRAUD / SCAM' : 'MEHFOOZ / SAFE'}
                </Text>
              </View>
              <Text style={[typo.bodyUrInv, { textAlign: 'center', marginTop: 8 }]}>
                {isScam ? 'دھوکہ! یہ پیغام جعلی ہے' : 'یہ پیغام محفوظ ہے'}
              </Text>

              <View style={styles.ringWrap}>
                <ThreatRing score={score} size={112} color="#fff"
                  label={isScam ? 'THREAT SCORE' : 'LOW RISK'} />
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{confidence}% Yaqeen</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: '#fff' }]}>
                  <Text style={[styles.chipText, { color: isScam ? COLORS.danger : COLORS.safeText }]}>
                    {type}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Details */}
        <View style={{ padding: 20, gap: 12 }}>
          {isScam ? <MoneySaved amount={50000} /> : null}
          {isScam ? <ScamDetails /> : <SafeDetails />}
        </View>
      </ScrollView>

      {/* Action sheet */}
      <View style={styles.actionSheet}>
        <View style={styles.sheetHandle} />
        {isScam ? (
          <>
            <Pressable style={[styles.btn, { backgroundColor: COLORS.danger }]}>
              <Ionicons name="close-circle" size={18} color="#fff" />
              <Text style={styles.btnText}>Sender Block Karein</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable style={[styles.btn, styles.btnSm, { backgroundColor: COLORS.primary, flex: 1 }]}>
                <Text style={[styles.btnText, { fontSize: 13 }]}>Family Ko Batain</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnSm, styles.btnOutline, { flex: 1 }]}>
                <Text style={[styles.btnText, { color: COLORS.text, fontSize: 13 }]}>NCCIA Shikayat</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable style={[styles.btn, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.btnText}>Home Par Wapas Jaaein</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function ScamDetails() {
  return (
    <View style={[styles.card, SHADOW.elevated, { padding: 14 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text style={{ fontFamily: FONTS.enExtra, fontSize: 17, color: COLORS.text }}>Kya galat hai?</Text>
        <Text style={{ fontFamily: FONTS.enExtra, fontSize: 11, color: COLORS.textMuted, letterSpacing: 0.8 }}>
          WORDS FOUND
        </Text>
      </View>

      {/* Evidence chips — exact trigger words found in the message. Keep to 3 short
          words so the row never wraps; the design budget is one row. */}
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
        {['OTP', 'foran', 'account band'].map(w => (
          <View key={w} style={styles.evidenceChip}>
            <Text style={styles.evidenceChipText}>{w}</Text>
          </View>
        ))}
      </View>

      <View style={styles.explain}>
        <Text style={styles.explainText}>BISP sirf 8171 se SMS bhejta hai.</Text>
        <Text style={[styles.explainText, { marginTop: 5 }]}>Yeh number nakli hai. Paisa na bhejein.</Text>
      </View>
    </View>
  );
}

function SafeDetails() {
  return (
    <View style={[styles.card, SHADOW.card]}>
      <Text style={{ fontFamily: FONTS.enExtra, fontSize: 17, color: COLORS.text }}>
        Yeh message theek lagta hai
      </Text>
      <Text style={[typo.bodyUrSm, { marginTop: 6 }]}>یہ پیغام ٹھیک لگتا ہے</Text>
      <View style={styles.explain}>
        <Text style={styles.explainText}>"Rs 5,000 Saima Khan ko bheja gaya."</Text>
      </View>
      {['Sender asli hai — JazzCash 4444','Koi shak wala link nahi','Aapke transaction se milta hai']
        .map((r, i) => (
        <View key={i} style={styles.reason}>
          <View style={styles.reasonCheck}>
            <Ionicons name="checkmark" size={14} color={COLORS.accent} />
          </View>
          <Text style={styles.reasonText}>{r}</Text>
        </View>
      ))}
    </View>
  );
}

function MoneySaved({ amount }) {
  return (
    <LinearGradient colors={['#ECFDF5', '#D1FAE5']} start={{x:0,y:0}} end={{x:1,y:1}}
      style={[styles.card, { borderColor: COLORS.accent + '40', padding: 13, flexDirection:'row', alignItems:'center', gap: 12 }]}
    >
      <View style={styles.moneyIcon}>
        <Ionicons name="cash" size={18} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.enBold, fontSize: 11, color: '#047857', letterSpacing: 0.6 }}>
          BACHAYA / SAVED
        </Text>
        <Text style={{ fontFamily: FONTS.enBlack, fontSize: 19, color: '#065F46',
          marginTop: 1, fontVariant: ['tabular-nums'] }}>
          Rs. {amount.toLocaleString('en-PK')} bachaya
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  band: { paddingBottom: 28 },
  bandHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 4,
  },
  bandLabel: { fontFamily: FONTS.enExtra, fontSize: 11, color: 'rgba(255,255,255,0.8)', letterSpacing: 1.2 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  bandHero: { alignItems: 'center', marginTop: 12, gap: 10 },
  verdictPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 99,
  },
  verdictPillText: { fontFamily: FONTS.enExtra, fontSize: 13, color: '#fff', letterSpacing: 1.2 },
  ringWrap: {
    marginTop: 2, padding: 5, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontFamily: FONTS.enBold, fontSize: 12, color: '#fff' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  explain: {
    marginTop: 12, padding: 13, backgroundColor: COLORS.surface2, borderRadius: 12,
  },
  explainText: {
    fontFamily: FONTS.enSemibold, fontSize: 17, color: COLORS.text, lineHeight: 24,
  },
  evidenceChip: {
    paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99,
    backgroundColor: '#FEE9EA', borderWidth: 1, borderColor: COLORS.danger + '33',
  },
  evidenceChipText: { fontFamily: FONTS.enBold, fontSize: 13, color: COLORS.danger },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  reasonText: { fontFamily: FONTS.enSemibold, fontSize: 17, color: COLORS.text, flex: 1 },
  reasonCheck: {
    width: 22, height: 22, borderRadius: 99,
    backgroundColor: COLORS.safeBg, alignItems: 'center', justifyContent: 'center',
  },
  moneyIcon: {
    width: 36, height: 36, borderRadius: 11, flexShrink: 0,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  actionSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 8,
    shadowColor: '#0F172A', shadowOffset:{width:0,height:-8},
    shadowOpacity: 0.12, shadowRadius: 32, elevation: 16,
  },
  sheetHandle: {
    alignSelf: 'center', width: 36, height: 4, borderRadius: 99,
    backgroundColor: '#CBD5E1', marginBottom: 8,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    height: 50, borderRadius: 14,
  },
  btnSm: { height: 44 },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.border },
  btnText: { fontFamily: FONTS.enExtra, fontSize: 15, color: '#fff' },
});
