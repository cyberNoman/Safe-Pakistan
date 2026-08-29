/**
 * Safe Pakistan — Design Tokens
 * Single source of truth for colors, type, spacing, radius, shadows.
 * Import: import { COLORS, FONTS, SIZE, RADIUS, SHADOW, SPACE, gradients } from '@/theme/tokens';
 */

export const COLORS = {
  // Brand
  primary:    '#1B4FD8',
  primaryDk:  '#0B3AB8',
  primaryLt:  '#3B6BE0',
  accent:     '#00C896',
  accentDk:   '#059669',
  danger:     '#E63946',
  warning:    '#F4A261',

  // Surfaces (light)
  bg:         '#F8F9FF',
  surface:    '#FFFFFF',
  surface2:   '#EEF2FF',
  text:       '#0F172A',
  textMuted:  '#64748B',
  border:     '#E2E8F0',

  // Surfaces (dark)
  bgDark:        '#0C0E1A',
  surfaceDark:   '#141628',
  surface2Dark:  '#1A1D35',
  textDark:      '#F1F5F9',
  borderDark:    '#1F2440',

  // Status helpers
  safeBg:    '#ECFDF5',
  safeText:  '#047857',
  dangerBg:  '#FEF2F2',
  dangerText:'#B91C1C',
  warnBg:    '#FFF7ED',
  warnText:  '#9A3412',

  // Transparent
  white:    '#FFFFFF',
  black:    '#000000',
  overlay:  'rgba(15,23,42,0.6)',
};

// Gradients use react-native-linear-gradient — usage:
//   <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}>
export const gradients = {
  hero:   { colors: ['#1B4FD8', '#0EA5E9'], start:{x:0,y:0}, end:{x:1,y:1} },
  danger: { colors: ['#E63946', '#FF6B6B'], start:{x:0,y:0}, end:{x:1,y:1} },
  safe:   { colors: ['#059669', '#00C896'], start:{x:0,y:0}, end:{x:1,y:1} },
  warn:   { colors: ['#F4A261', '#F59E0B'], start:{x:0,y:0}, end:{x:1,y:1} },
  safeBg: { colors: ['#ECFDF5', '#D1FAE5'], start:{x:0,y:0}, end:{x:1,y:1} },
};

export const FONTS = {
  // English — Inter, loaded via expo-font in App.js
  enRegular:  'Inter_400Regular',
  enMedium:   'Inter_500Medium',
  enSemibold: 'Inter_600SemiBold',
  enBold:     'Inter_700Bold',
  enExtra:    'Inter_800ExtraBold',
  enBlack:    'Inter_900Black',

  // Urdu — Noto Nastaliq Urdu (RTL)
  urdu:       'NotoNastaliqUrdu_400Regular',
  urduBold:   'NotoNastaliqUrdu_700Bold',
};

export const SIZE = {
  xs:   11,
  sm:   13,
  base: 15,
  lg:   18,
  xl:   24,
  xxl:  32,
  hero: 48,
};

// Urdu sizes are always +2px vs English equivalent (per design system rule)
export const urduSize = (size) => size + 2;

export const RADIUS = {
  sm:   8,
  icon: 12,
  btn:  14,
  card: 20,
  chip: 99,
};

export const SPACE = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

// Shadows — brand blue at 8% / 14% opacity
// On Android, elevation kicks in; iOS uses shadowColor/Offset/Opacity/Radius.
export const SHADOW = {
  soft: {
    shadowColor: '#1B4FD8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#1B4FD8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#1B4FD8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 40,
    elevation: 12,
  },
};

// Animation timings (use with Reanimated)
export const MOTION = {
  fast:      200,
  base:      300,
  slow:      400,
  cinematic: 800,
  // shared shape: { duration, easing }
};
