import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, RADIUS, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { LanguageChip } from '@/components/Cards';

const LANGS = [
  { code:'en', flag:'🇬🇧', label:'English' },
  { code:'ur', flag:'🇵🇰', label:'اردو' },
  { code:'ru', flag:'🇵🇰', label:'Roman Urdu' },
];

export default function WelcomeScreen({ navigation }) {
  const [lang, setLang] = useState('ur');

  return (
    <View style={{ flex: 1, backgroundColor: '#0B2A8C' }}>
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
                  <Stop offset="0" stopColor="#fff" />
                  <Stop offset="1" stopColor="#A7F3D0" />
                </SvgGradient>
              </Defs>
              <Path d="M55 6 L12 22 V62 C12 92 30 112 55 122 C80 112 98 92 98 62 V22 Z" fill="url(#g)" />
              <Path d="M38 64 L50 76 L74 50" stroke="#0B2A8C" strokeWidth="6"
                strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
        </View>

        {/* Text */}
        <View style={{ paddingHorizontal: 28, alignItems: 'center', marginTop: 12 }}>
          <Text style={styles.heroEn}>Apna Ghar Mehfooz Karo</Text>
          <Text style={[typo.heroUr, { color: '#fff', textAlign: 'center', marginTop: 8 }]}>
            اپنا گھر محفوظ کرو
          </Text>
          <Text style={styles.subtitle}>
            Pakistan's AI guardian. Scams, fake calls aur frauds se bachao —
            apne aur apne gharane ko.
          </Text>
        </View>

        {/* Language */}
        <View style={{ marginTop: 'auto', marginBottom: 24 }}>
          <Text style={styles.selectLabel}>SELECT LANGUAGE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}
          >
            {LANGS.map(l => (
              <LanguageChip key={l.code} flag={l.flag} label={l.label}
                active={lang === l.code} onPress={() => setLang(l.code)} />
            ))}
          </ScrollView>
        </View>

        {/* CTA */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 18, gap: 10 }}>
          <Pressable onPress={() => navigation?.replace?.('Main')} style={styles.cta}>
            <Text style={styles.ctaText}>Shuru Karen</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
          </Pressable>
          <Pressable hitSlop={8}>
            <Text style={styles.signin}>I already have an account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 22, backgroundColor: '#fff' },

  shieldWrap: { alignItems: 'center', marginTop: 48 },
  shieldOuter: {
    width: 180, height: 180, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.accent, shadowOpacity: 0.45, shadowRadius: 36, shadowOffset:{width:0,height:0},
    elevation: 16,
  },

  heroEn: { fontFamily: FONTS.enExtra, fontSize: 34, color: '#fff', textAlign: 'center', letterSpacing: -0.5, lineHeight: 38 },
  subtitle: {
    fontFamily: FONTS.enMedium, fontSize: 15, color: 'rgba(255,255,255,0.8)',
    textAlign: 'center', marginTop: 14, lineHeight: 22, maxWidth: 320,
  },

  selectLabel: {
    fontFamily: FONTS.enBold, fontSize: 11, color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.2, textAlign: 'center', marginBottom: 10,
  },

  cta: {
    height: 56, borderRadius: 14, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 32, shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  ctaText: { fontFamily: FONTS.enExtra, fontSize: 17, color: COLORS.primary },
  signin: { textAlign: 'center', fontFamily: FONTS.enSemibold, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
});
