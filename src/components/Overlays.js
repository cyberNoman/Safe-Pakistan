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
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, gradients } from '@/theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';

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
          <Ionicons name="shield-checkmark" size={32} color="#fff" />
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

const styles = StyleSheet.create({
  shieldWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  glow: { position: 'absolute' },
  shieldCore: { position: 'absolute' },
  shieldGrad: {
    width: 62, height: 62, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset:{width:0,height:8},
    shadowOpacity: 0.35, shadowRadius: 24, elevation: 8,
  },
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingHorizontal: 20, paddingBottom: 32,
  },
  handle: {
    alignSelf: 'center', width: 36, height: 4, borderRadius: 99,
    backgroundColor: '#CBD5E1', marginBottom: 12,
  },
  sheetTitle: {
    fontFamily: FONTS.enExtra, fontSize: 18, color: COLORS.text, marginBottom: 12,
  },
});
