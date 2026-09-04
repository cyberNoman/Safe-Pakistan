import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { COLORS, FONTS, RADIUS, SIZE, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo, enText } from '@/theme/typography';
import { LanguageChip } from '@/components/Cards';
import { useLanguageContext } from '@/context/LanguageContext';

const LANGS = [
  { code:'en', label:'English' },
  { code:'ur', label:'اردو' },
  { code:'ru', label:'Roman Urdu' },
];

export default function WelcomeScreen({ navigation }) {
  const { language, setLang } = useLanguageContext();
  const [note, setNote] = useState(null);

  // Honest fallback: sign-in does not exist in this release. Say so and point at
  // the working path — never leave a dead tap.
  const onSignIn = () => setNote("Auth V2 sprint one mein hai — abhi 'Shuru Karen' use karein.");

  // Auto-hide the note.
  useEffect(() => {
    if (!note) return undefined;
    const t = setTimeout(() => setNote(null), 3000);
    return () => clearTimeout(t);
  }, [note]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryDk }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top','bottom']}>
        {/* Progress dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Hero shield */}
        <View style={styles.shieldWrap}>
          <View style={styles.shieldOuter}>
            <Svg width={110} height={130} viewBox="0 0 110 130">
              <Defs>
                <SvgGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={COLORS.white} />
                  <Stop offset="1" stopColor={COLORS.accent} />
                </SvgGradient>
              </Defs>
              <Path d="M55 6 L12 22 V62 C12 92 30 112 55 122 C80 112 98 92 98 62 V22 Z" fill="url(#g)" />
              <Path d="M38 64 L50 76 L74 50" stroke={COLORS.primaryDk} strokeWidth="6"
                strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
        </View>

        {/* Text */}
        <View style={{ paddingHorizontal: SPACE.lg, alignItems: 'center', marginTop: SPACE.sm }}>
          <Text style={[typo.titleEnInv, styles.heroEn]}>Apna Ghar Mehfooz Karo</Text>
          <Text style={[typo.heroUr, { color: COLORS.white, textAlign: 'center', marginTop: SPACE.sm }]}>
            اپنا گھر محفوظ کرو
          </Text>
          <Text style={[typo.bodyEnInv, styles.subtitle]}>
            Pakistan's AI guardian. Scams, fake calls aur frauds se bachao —
            apne aur apne gharane ko.
          </Text>
        </View>

        {/* Honest note — inline above the auto-margin rail, so nothing shifts */}
        {note ? (
          <Animated.View entering={FadeInUp.duration(200)} exiting={FadeOutDown.duration(200)}
            style={styles.note}>
            <Ionicons name="information-circle" size={SIZE.base} color={COLORS.white} />
            <Text style={styles.noteText}>{note}</Text>
          </Animated.View>
        ) : null}

        {/* Language */}
        <View style={{ marginTop: 'auto', marginBottom: SPACE.lg }}>
          <Text style={styles.selectLabel}>SELECT LANGUAGE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACE.md, gap: SPACE.sm }}
          >
            {LANGS.map(l => (
              <LanguageChip key={l.code} label={l.label}
                active={language === l.code} onPress={() => setLang(l.code)} />
            ))}
          </ScrollView>
        </View>

        {/* CTA */}
        <View style={{ paddingHorizontal: SPACE.lg, paddingBottom: SPACE.md, gap: SPACE.sm }}>
          <Pressable onPress={() => navigation?.replace?.('Main')} style={styles.cta}>
            <Text style={styles.ctaText}>Shuru Karen</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
          </Pressable>
          <Pressable hitSlop={8} onPress={onSignIn}
            style={({ pressed }) => [styles.signinBtn, pressed && { opacity: 0.7 }]}>
            <Text style={styles.signin}>I already have an account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: SPACE.sm },
  dot: { width: 6, height: 6, borderRadius: RADIUS.chip, backgroundColor: COLORS.white30 },
  dotActive: { width: 22, backgroundColor: COLORS.white },

  shieldWrap: { alignItems: 'center', marginTop: SPACE.xxl },
  shieldOuter: {
    width: 180, height: 180, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.white12,
    borderWidth: 1, borderColor: COLORS.white20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.accent, shadowOpacity: 0.45, shadowRadius: 36, shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },

  heroEn: { textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { textAlign: 'center', marginTop: SPACE.sm, maxWidth: 320 },

  selectLabel: enText(SIZE.xs, FONTS.enBold, COLORS.white70, {
    letterSpacing: 1.2, textAlign: 'center', marginBottom: SPACE.sm,
  }),

  cta: {
    height: 56, borderRadius: RADIUS.btn, backgroundColor: COLORS.white,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.sm,
    ...SHADOW.elevated,
  },
  ctaText: { fontFamily: FONTS.enExtra, fontSize: 17, color: COLORS.primary },
  signin: enText(SIZE.sm, FONTS.enSemibold, COLORS.white80, { textAlign: 'center' }),
  // 44pt hit target for the sign-in line.
  signinBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  // Honest note — glass pill on the blue hero gradient.
  note: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    marginHorizontal: SPACE.lg, marginTop: SPACE.md,
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    borderRadius: RADIUS.chip,
    backgroundColor: COLORS.white12, borderWidth: 1, borderColor: COLORS.white20,
  },
  noteText: { fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.white, flex: 1 },
});
