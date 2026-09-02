/**
 * LoadingShield — animated shield + rotating ring used during analyze state.
 * Plus BottomSheet for action menus.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps,
  withRepeat, withTiming, withSequence, withSpring, Easing,
  FadeInDown, FadeOutUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ── LoadingShield ────────────────────────────────────────────
export function LoadingShield({ percent = 60, size = 120 }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(percent / 100, { duration: 800 });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false
    );
  }, [percent]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: C - progress.value * C,
  }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={[styles.shieldWrap, { width: size, height: size }]}>
      {/* glow */}
      <View style={[styles.glow, { width: size + 40, height: size + 40 }]} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="g" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.35" />
              <Stop offset="100%" stopColor={COLORS.accent} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#g)" />
        </Svg>
      </View>

      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size/2} cy={size/2} r={r}
          stroke={COLORS.border} strokeWidth={stroke} fill="none" />
        <AnimatedCircle cx={size/2} cy={size/2} r={r}
          stroke={COLORS.primary} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={C} fill="none"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          animatedProps={animatedProps}
        />
      </Svg>

      <Animated.View style={[styles.shieldCore, pulseStyle]}>
        <LinearGradient
          colors={gradients.hero.colors}
          start={gradients.hero.start}
          end={gradients.hero.end}
          style={styles.shieldGrad}
        >
          <Ionicons name="shield-checkmark" size={SIZE.xxl} color={COLORS.white} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

// ── BottomSheet ──────────────────────────────────────────────
export function BottomSheet({ visible, onClose, children, title }) {
  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        {title ? <Text style={styles.sheetTitle}>{title}</Text> : null}
        {children}
      </View>
    </Modal>
  );
}

// ── FamilyAlertBanner ────────────────────────────────────────
// Foreground in-app banner for a received HIFAZAT family push alert (task E).
// App.js shows this when expo-notifications delivers { verdict, risk } while
// the app is open; the background/killed path is the OS/FCM system
// notification. Colour follows the verdict (scam→danger is legitimate — this
// IS a scam-verdict surface). Auto-dismisses; never fakes delivery.
export function FamilyAlertBanner({ alert, onDismiss }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!alert) return undefined;
    const t = setTimeout(() => onDismiss?.(), 6000);
    return () => clearTimeout(t);
  }, [alert, onDismiss]);

  if (!alert) return null;

  const v = String(alert.verdict || '').toUpperCase();
  const isScam = v === 'SCAM';
  const isSusp = v === 'SUSPICIOUS';
  const color = isScam ? COLORS.danger : isSusp ? COLORS.warning : COLORS.accent;
  const icon = isScam ? 'warning' : isSusp ? 'alert-circle' : 'shield-checkmark';
  const risk = Number(alert.risk || 0);

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.alertBanner, { top: insets.top + SPACE.sm }, SHADOW.elevated]}>
      <View style={[styles.alertIcon, { backgroundColor: color + '1A' }]}>
        <Ionicons name={icon} size={SIZE.lg} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.alertTitle}>HIFAZAT ALERT</Text>
        <Text style={styles.alertBody} numberOfLines={3}>
          <Text style={{ color, fontFamily: FONTS.enBlack }}>{v}</Text>
          {` SMS — risk ${risk}/100. Do not reply. Call now.`}
        </Text>
      </View>
      <Pressable onPress={() => onDismiss?.()} hitSlop={SIZE.sm} style={styles.alertClose}
        accessibilityLabel="Alert band karein">
        <Ionicons name="close" size={SIZE.lg} color={COLORS.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shieldWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  glow: { position: 'absolute' },
  shieldCore: { position: 'absolute' },
  shieldGrad: {
    width: 62, height: 62, borderRadius: RADIUS.card,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW.elevated,
  },
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.card, borderTopRightRadius: RADIUS.card,
    paddingTop: SPACE.sm, paddingHorizontal: SPACE.lg, paddingBottom: SPACE.xl,
    ...SHADOW.elevated,
  },
  handle: {
    alignSelf: 'center', width: 36, height: SPACE.xs, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.border, marginBottom: SPACE.sm,
  },
  sheetTitle: {
    fontFamily: FONTS.enExtra, fontSize: SIZE.lg, color: COLORS.text, marginBottom: SPACE.sm,
  },
  alertBanner: {
    position: 'absolute', left: SPACE.lg, right: SPACE.lg, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: SPACE.md, borderWidth: 1, borderColor: COLORS.border,
  },
  alertIcon: {
    width: 40, height: 40, borderRadius: RADIUS.icon, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  alertTitle: {
    fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.textMuted, letterSpacing: 1,
  },
  alertBody: {
    fontFamily: FONTS.enSemibold, fontSize: SIZE.lg, color: COLORS.text,
    lineHeight: SIZE.lg * 1.35, marginTop: SPACE.xs,
  },
  alertClose: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
});
