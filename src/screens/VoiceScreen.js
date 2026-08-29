/**
 * VoiceScreen — full-screen guardian voice agent.
 * Animated mic with 3 ripples, real-time waveform (mocked here),
 * language chips, state machine: idle / listening / processing / done.
 *
 * P0 DECISION: voice stays fully MOCKED — waveform animation only, no real
 * audio recording. Real audio metering (expo-av `metering`) is AGENTS.md
 * open task #2 and is intentionally NOT implemented here.
 *
 * Hook up your expo-speech / Voice-recognition layer to setState('listening' | 'processing').
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withDelay, Easing,
} from 'react-native-reanimated';

import { COLORS, FONTS, RADIUS, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';

const LANGS = [
  { code:'en', label:'EN' },
  { code:'ur', label:'اردو' },
  { code:'ru', label:'Roman Urdu' },
];

export default function VoiceScreen({ navigation }) {
  const [lang, setLang] = useState('ur');
  const [state, setState] = useState('listening'); // 'idle' | 'listening' | 'processing' | 'done'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Radial backgrounds via two overlapping LinearGradients */}
      <LinearGradient
        colors={['rgba(27,79,216,0.55)', 'rgba(27,79,216,0)']}
        style={[StyleSheet.absoluteFill, { opacity: 1 }]}
      />
      <LinearGradient
        colors={['rgba(0,200,150,0)', 'rgba(0,200,150,0.18)']}
        style={StyleSheet.absoluteFill}
        start={{x:0.5, y:0.4}} end={{x:0.5, y:1}}
      />

      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation?.goBack?.()} style={styles.iconBtn}>
          <Ionicons name="close" size={20} color="#fff" />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.enExtra, fontSize: 15, color: '#fff' }}>Voice Guardian</Text>
          <Text style={[typo.labelUr, { color: 'rgba(255,255,255,0.7)', marginTop: 2 }]}>آواز محافظ</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Language chips */}
      <View style={styles.langRow}>
        {LANGS.map(l => (
          <Pressable key={l.code} onPress={() => setLang(l.code)} style={[
            styles.langChip,
            lang === l.code
              ? { backgroundColor: '#fff' }
              : { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1 }
          ]}>
            <Text style={{
              fontFamily: FONTS.enBold, fontSize: 12,
              color: lang === l.code ? COLORS.primary : '#fff',
            }}>{l.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Mic with ripples */}
      <View style={styles.center}>
        <MicRipples active={state === 'listening'} />

        <View style={{ alignItems: 'center', marginTop: 36 }}>
          <Text style={styles.stateLabel}>
            {state === 'listening' && '● LISTENING'}
            {state === 'processing' && '… PROCESSING'}
            {state === 'idle' && '○ TAP TO SPEAK'}
            {state === 'done' && '✓ DONE'}
          </Text>
          <Text style={{ fontFamily: FONTS.enExtra, fontSize: 22, color: '#fff', marginTop: 8, textAlign: 'center' }}>
            {state === 'listening' && 'Bolein, main sun raha hoon'}
            {state === 'processing' && 'Samajh raha hoon...'}
            {state === 'idle' && 'Tap karke shuru karein'}
            {state === 'done' && 'Aapka jawab tayar hai'}
          </Text>
          <Text style={[typo.bodyUrInv, { textAlign: 'center', marginTop: 6 }]}>
            {state === 'listening' && 'بولیں، میں سن رہا ہوں'}
            {state === 'processing' && 'سمجھ رہا ہوں'}
          </Text>
        </View>

        {state === 'listening' && <Waveform />}
      </View>

      {/* Voice hints */}
      <View style={styles.hints}>
        <Text style={{
          fontFamily: FONTS.enBold, fontSize: 11, color: 'rgba(255,255,255,0.7)',
          letterSpacing: 1.2, textAlign: 'center', marginBottom: 10,
        }}>
          YEH BOL KAR DEKHEIN
        </Text>
        {[
          '"Yeh SMS scam hai ya nahi?"',
          '"JazzCash ka helpline number kya hai?"',
          '"BISP 8171 ka asli message kaisa hota hai?"',
        ].map((h, i) => (
          <View key={i} style={styles.hintChip}>
            <Text style={{ fontFamily: FONTS.enMedium, fontSize: 13, color: '#fff' }}>{h}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ── Mic with 3 staggered ripple rings ────────────────────────
function MicRipples({ active }) {
  return (
    <View style={styles.micWrap}>
      {[0, 1, 2].map(i => <Ripple key={i} delay={i * 600} active={active} />)}
      <LinearGradient
        colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
        style={styles.micCore}
      >
        <Ionicons name="mic" size={56} color="#fff" />
      </LinearGradient>
    </View>
  );
}

function Ripple({ delay, active }) {
  const scale = useSharedValue(0.55);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    if (!active) return;
    scale.value = withDelay(delay,
      withRepeat(withTiming(1.1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false));
    opacity.value = withDelay(delay,
      withRepeat(withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false));
  }, [active]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  return <Animated.View style={[styles.ripple, style]} />;
}

// ── Live waveform (mocked — replace with real audio level callbacks) ──
function Waveform() {
  const bars = [0.4, 0.7, 1.0, 0.6, 0.8, 0.5, 0.9, 0.65, 0.4];
  return (
    <View style={styles.waveform}>
      {bars.map((h, i) => <Bar key={i} h={h} i={i} />)}
    </View>
  );
}

function Bar({ h, i }) {
  const sv = useSharedValue(h);
  useEffect(() => {
    sv.value = withRepeat(
      withSequence(
        withTiming(h * 1.4, { duration: 320 + i*30 }),
        withTiming(h * 0.5, { duration: 280 + i*30 }),
      ), -1, true
    );
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    height: 12 + sv.value * 40,
  }));
  return (
    <Animated.View style={[
      { width: 5, borderRadius: 4, backgroundColor: i % 2 === 0 ? COLORS.accent : '#fff' },
      animatedStyle,
    ]} />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgDark },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 4,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  langRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 6, marginTop: 18,
  },
  langChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  micWrap: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  ripple: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    borderWidth: 1.5, borderColor: COLORS.accent,
  },
  micCore: {
    width: 130, height: 130, borderRadius: 65,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: COLORS.primary, shadowOffset:{width:0,height:0},
    shadowOpacity: 0.6, shadowRadius: 40, elevation: 12,
  },
  stateLabel: { fontFamily: FONTS.enExtra, fontSize: 11, color: COLORS.accent, letterSpacing: 1.5 },
  waveform: {
    flexDirection: 'row', alignItems: 'center', gap: 5, height: 52,
  },
  hints: { paddingHorizontal: 20, paddingBottom: 24, gap: 8 },
  hintChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
});
