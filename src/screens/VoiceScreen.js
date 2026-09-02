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
  withTiming, withDelay, Easing, FadeInUp, FadeOutDown,
} from 'react-native-reanimated';

import { COLORS, FONTS, RADIUS, SIZE, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo, enText } from '@/theme/typography';

const LANGS = [
  { code:'en', label:'EN' },
  { code:'ur', label:'اردو' },
  { code:'ru', label:'Roman Urdu' },
];

// Spoken-style prompts. Tapping one hands the question to the Guardian chat,
// which is where a real answer exists — this screen has no STT engine.
const HINTS = [
  '"Yeh SMS scam hai ya nahi?"',
  '"JazzCash ka helpline number kya hai?"',
  '"BISP 8171 ka asli message kaisa hota hai?"',
];

export default function VoiceScreen({ navigation }) {
  const [lang, setLang] = useState('ur');
  const [state, setState] = useState('listening'); // 'idle' | 'listening' | 'processing' | 'done'
  const [note, setNote] = useState(null);

  // Honest fallback: speech-to-text is NOT wired (see the P0 note at the top of
  // this file). Tapping the mic says so and points at typing instead of faking it.
  const onMicTap = () => setNote('Voice input device par nahi — type karein');

  // A hint chip is a real question → open the Guardian chat with it pre-filled.
  const onHintTap = (h) => navigation?.navigate?.('Main', {
    screen: 'Chat',
    params: { prefill: String(h).replace(/"/g, '') },
  });

  // Auto-hide the note.
  useEffect(() => {
    if (!note) return undefined;
    const t = setTimeout(() => setNote(null), 2600);
    return () => clearTimeout(t);
  }, [note]);

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
          <Ionicons name="close" size={20} color={COLORS.white} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={enText(SIZE.base, FONTS.enExtra, COLORS.white)}>Voice Guardian</Text>
          <Text style={[typo.labelUr, { color: COLORS.white70, marginTop: 2 }]}>آواز محافظ</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Language chips */}
      <View style={styles.langRow}>
        {LANGS.map(l => (
          <Pressable key={l.code} onPress={() => setLang(l.code)} style={[
            styles.langChip,
            lang === l.code
              ? { backgroundColor: COLORS.white }
              : { backgroundColor: COLORS.white08, borderColor: COLORS.white15, borderWidth: 1 }
          ]}>
            <Text style={enText(SIZE.xs, FONTS.enBold, lang === l.code ? COLORS.primary : COLORS.white)}>
              {l.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Mic with ripples */}
      <View style={styles.center}>
        <Pressable
          onPress={onMicTap}
          accessibilityLabel="Mic — voice input is device par available nahi"
          style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}
        >
          <MicRipples active={state === 'listening'} />
        </Pressable>

        <View style={{ alignItems: 'center', marginTop: SPACE.xl }}>
          <Text style={styles.stateLabel}>
            {state === 'listening' && '● LISTENING'}
            {state === 'processing' && '… PROCESSING'}
            {state === 'idle' && '○ TAP TO SPEAK'}
            {state === 'done' && '✓ DONE'}
          </Text>
          <Text style={enText(SIZE.xl, FONTS.enExtra, COLORS.white, { marginTop: SPACE.sm, textAlign: 'center' })}>
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

        {/* Honest mic note — absolute overlay, so the 844px layout is untouched */}
        {note ? (
          <Animated.View entering={FadeInUp.duration(200)} exiting={FadeOutDown.duration(200)}
            style={[styles.note, SHADOW.elevated]}>
            <Ionicons name="information-circle" size={SIZE.base} color={COLORS.white} />
            <Text style={styles.noteText}>{note}</Text>
          </Animated.View>
        ) : null}
      </View>

      {/* Voice hints — tappable: each hands its question to the Guardian chat */}
      <View style={styles.hints}>
        <Text style={enText(SIZE.xs, FONTS.enBold, COLORS.white70, {
          letterSpacing: 1.2, textAlign: 'center', marginBottom: SPACE.sm,
        })}>
          YEH BOL KAR DEKHEIN
        </Text>
        {HINTS.map((h, i) => (
          <Pressable key={i} onPress={() => onHintTap(h)}
            style={({ pressed }) => [styles.hintChip, pressed && { transform: [{ scale: 0.98 }] }]}>
            <Text style={enText(SIZE.sm, FONTS.enMedium, COLORS.white)}>{h}</Text>
          </Pressable>
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
        <Ionicons name="mic" size={56} color={COLORS.white} />
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
      { width: 5, borderRadius: RADIUS.sm / 2, backgroundColor: i % 2 === 0 ? COLORS.accent : COLORS.white },
      animatedStyle,
    ]} />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgDark },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACE.lg, paddingTop: SPACE.xs,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.white08,
    borderWidth: 1, borderColor: COLORS.white15,
    alignItems: 'center', justifyContent: 'center',
  },
  langRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 6, marginTop: SPACE.md,
  },
  langChip: { paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs, borderRadius: RADIUS.chip },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACE.xl },
  micWrap: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  ripple: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    borderWidth: 1.5, borderColor: COLORS.accent,
  },
  micCore: {
    width: 130, height: 130, borderRadius: 65,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.white25,
    shadowColor: COLORS.primary, shadowOffset:{width:0,height:0},
    shadowOpacity: 0.6, shadowRadius: 40, elevation: 12,
  },
  stateLabel: { fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.accent, letterSpacing: 1.5 },
  waveform: {
    flexDirection: 'row', alignItems: 'center', gap: 5, height: 52,
  },
  hints: { paddingHorizontal: SPACE.lg, paddingBottom: SPACE.lg, gap: SPACE.sm },
  // Tappable now → 44pt hit-target floor.
  hintChip: {
    minHeight: 44, justifyContent: 'center',
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.white08,
    borderWidth: 1, borderColor: COLORS.white12,
  },
  note: {
    position: 'absolute', bottom: SPACE.md, alignSelf: 'center', maxWidth: '90%',
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    backgroundColor: COLORS.surface2Dark, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    borderRadius: RADIUS.chip, borderWidth: 1, borderColor: COLORS.borderDark,
  },
  noteText: { fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.white, flexShrink: 1 },
});
