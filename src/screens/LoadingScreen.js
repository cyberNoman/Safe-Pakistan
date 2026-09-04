/**
 * LoadingScreen — full-screen analyze state between Scan and Verdict.
 * Calls the backend (falls back to the offline engine) then replaces itself
 * with the Verdict screen. Must fit 390×844 without scroll.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SIZE, RADIUS, SPACE, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { LoadingShield } from '@/components/Overlays';
import { analyzeText } from '@/services/api';
// Pure rupee-figure extractor (lives beside the verdict's other text helpers).
// Imported here so the amount is captured from the FULL text at scan time — the
// stored `msg` is truncated to 90 chars and must never be re-parsed later.
import { extractAmount } from '@/screens/VerdictScreen';
import { useAppContext } from '@/context/AppContext';

const STEPS = [
  { icon: 'person-outline', label: 'Sender Check' },
  { icon: 'link-outline',   label: 'Link Scanner' },
  { icon: 'search-outline', label: 'Pattern Match' },
];

export default function LoadingScreen({ route, navigation }) {
  const text = route?.params?.text ?? '';
  const { recordScan } = useAppContext();

  useEffect(() => {
    let alive = true;
    (async () => {
      // Race the analysis against a minimum dwell so the shield/steps
      // choreography always plays, even when the offline engine answers instantly.
      const [result] = await Promise.all([
        analyzeText(text),
        new Promise(r => setTimeout(r, 1400)),
      ]);
      // Persist every scan to the real store — Home / Report / Library read ONLY this.
      // Never blocks the verdict: a persist failure still routes to the result.
      try {
        const amt = extractAmount(text);
        await recordScan({
          ts: Date.now(),
          verdict: result?.verdict,
          score: result?.score,
          scam_type: result?.type,
          layer_used: result?.model_used,
          msg: String(text || '').slice(0, 90),
          // amount_found=false ⇒ Report labels the figure "estimated" and
          // computeStats falls back to the per-scam-type estimate.
          amount: amt.found ? amt.amount : 0,
          amount_found: amt.found,
        });
      } catch (e) {
        // ignore — analytics persistence must never block the user
      }
      // Forward the scanned text alongside the result so the verdict screen can
      // quote it in the NCCIA complaint / share report (analyze contract untouched).
      if (alive) navigation.replace('Verdict', { ...result, messageText: text });
    })();
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LinearGradient
      colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
      style={styles.bg}
    >
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />

        <View style={styles.center}>
          <LoadingShield percent={72} size={130} />

          <Text style={styles.title}>ANALYZING</Text>
          <Text style={[typo.bodyUrInv, styles.subtitle]}>پیغام کی جانچ جاری ہے</Text>
        </View>

        {/* 3-step checklist */}
        <View style={styles.checklist}>
          {STEPS.map((s, i) => (
            <View key={s.label} style={[styles.step, i > 0 && styles.stepDivider]}>
              <View style={styles.stepIcon}>
                <Ionicons name={s.icon} size={16} color={COLORS.white} />
              </View>
              <Text style={styles.stepLabel}>{s.label}</Text>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, padding: SPACE.lg, justifyContent: 'center' },
  center: { alignItems: 'center' },
  title: {
    fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.white,
    letterSpacing: 2, marginTop: SPACE.lg,
  },
  subtitle: { marginTop: SPACE.xs },
  checklist: {
    marginTop: SPACE.xl, borderRadius: RADIUS.card,
    backgroundColor: COLORS.white + '1F',
    borderWidth: 1, borderColor: COLORS.white + '33',
    paddingHorizontal: SPACE.md,
  },
  step: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
    paddingVertical: SPACE.md,
  },
  stepDivider: { borderTopWidth: 1, borderTopColor: COLORS.white + '25' },
  stepIcon: {
    width: 36, height: 36, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.white + '25',
    alignItems: 'center', justifyContent: 'center',
  },
  stepLabel: {
    flex: 1, fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.white,
  },
});
