/**
 * ThreatRing — circular SVG progress ring with animated fill.
 * Props: score (0-100), size, color, label
 *
 * Requires: react-native-svg, react-native-reanimated
 *   expo install react-native-svg
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ThreatRing({
  score = 96,
  size = 140,
  color = COLORS.danger,
  label,
}) {
  const stroke = Math.max(6, size * 0.085);
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 1200,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: C - progress.value * C,
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={COLORS.border}
          strokeWidth={stroke}
          opacity={0.35}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={C}
          animatedProps={animatedProps}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={{
          fontFamily: FONTS.enBlack,
          fontSize: size * 0.28,
          color,
          fontVariant: ['tabular-nums'],
          includeFontPadding: false,
        }}>{score}</Text>
        <Text style={{
          fontFamily: FONTS.enSemibold,
          fontSize: size * 0.085,
          color: COLORS.textMuted,
          marginTop: 4,
          letterSpacing: 0.5,
        }}>{label || '/ 100'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  center: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
});
