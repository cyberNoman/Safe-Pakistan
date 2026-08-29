/**
 * Typography presets — pre-built TextStyle objects.
 * Usage:  <Text style={typo.heroEn}>Apna Ghar Mehfooz Karo</Text>
 *         <Text style={typo.bodyUr}>اپنا گھر محفوظ کرو</Text>
 *
 * URDU RULES (enforced automatically):
 *   - writingDirection: 'rtl'
 *   - textAlign: 'right'
 *   - +2px vs English equivalent
 *   - 1.8x line-height
 */
import { FONTS, SIZE, COLORS, urduSize } from './tokens';

const en = (size, weight, color = COLORS.text, extra = {}) => ({
  fontFamily: weight,
  fontSize: size,
  color,
  ...extra,
});

const ur = (size, weight = FONTS.urdu, color = COLORS.text, extra = {}) => ({
  fontFamily: weight,
  fontSize: urduSize(size),
  color,
  writingDirection: 'rtl',
  textAlign: 'right',
  lineHeight: urduSize(size) * 1.8,
  ...extra,
});

export const typo = {
  // English
  heroEn:     en(SIZE.hero, FONTS.enExtra,   COLORS.text, { letterSpacing: -0.8, lineHeight: SIZE.hero * 1.1 }),
  titleEn:    en(SIZE.xxl,  FONTS.enExtra,   COLORS.text, { letterSpacing: -0.4 }),
  h1En:       en(SIZE.xl,   FONTS.enExtra,   COLORS.text),
  h2En:       en(SIZE.lg,   FONTS.enExtra,   COLORS.text),
  bodyEn:     en(SIZE.base, FONTS.enMedium,  COLORS.text,      { lineHeight: SIZE.base * 1.5 }),
  bodyEnSm:   en(SIZE.sm,   FONTS.enMedium,  COLORS.textMuted, { lineHeight: SIZE.sm * 1.5 }),
  labelEn:    en(SIZE.xs,   FONTS.enBold,    COLORS.textMuted, { letterSpacing: 0.8 }),
  numberEn:   en(SIZE.xxl,  FONTS.enBlack,   COLORS.text,      { fontVariant: ['tabular-nums'] }),
  scoreEn:    en(40,        FONTS.enBlack,   COLORS.text,      { fontVariant: ['tabular-nums'], letterSpacing: -0.6 }),

  // Urdu
  heroUr:     ur(SIZE.xl,   FONTS.urduBold,  COLORS.text),
  titleUr:    ur(SIZE.lg,   FONTS.urduBold,  COLORS.text),
  bodyUr:     ur(SIZE.base, FONTS.urdu,      COLORS.text),
  bodyUrSm:   ur(SIZE.sm,   FONTS.urdu,      COLORS.textMuted),
  labelUr:    ur(SIZE.xs,   FONTS.urdu,      COLORS.textMuted),

  // Inverse (on dark / gradient backgrounds)
  heroEnInv:  en(SIZE.hero, FONTS.enExtra,   COLORS.white, { letterSpacing: -0.8 }),
  titleEnInv: en(SIZE.xxl,  FONTS.enExtra,   COLORS.white),
  bodyEnInv:  en(SIZE.base, FONTS.enMedium,  COLORS.white, { opacity: 0.85, lineHeight: SIZE.base * 1.5 }),
  bodyUrInv:  ur(SIZE.base, FONTS.urdu,      COLORS.white, { opacity: 0.85 }),
};

// Helper for mixing dynamic colors
export const enText = en;
export const urText = ur;
