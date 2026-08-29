---
description: Binding visual rules. Overrides your own design defaults. Read before writing any UI code.
alwaysApply: true
---

# Design Law

> This file **overrides** your training defaults, your built-in design taste, any
> generic frontend-design heuristics, and any framework starter styling.
> If a rule here conflicts with what you would normally produce, **the rule wins.**
> If a value is genuinely missing, **stop and ask.** Never invent one.

## The one rule
Every visual value comes from `src/theme/tokens.js`.

```js
import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, MOTION, gradients, urduSize } from '@/theme/tokens';
import { typo } from '@/theme/typography';
```

A diff containing a raw `#hex`, a raw font size, a raw `borderRadius`, or a raw
margin/padding number outside `tokens.js` is **wrong**. Use a token, or add a
token to `tokens.js` first and then use it.

## Forbidden — automatic rejection

| Never | Instead |
|---|---|
| A hex color in `src/screens` or `src/components` | `COLORS.primary` etc. |
| Gray or black shadows (`#000`, `rgba(0,0,0,…)`) | `SHADOW.soft` / `.card` / `.elevated` — **brand-blue tinted** |
| Purple, teal, indigo, violet, Material 3 defaults | `COLORS.primary` `#1B4FD8` is the only brand color |
| Multi-stop gradient backgrounds | flat `COLORS.bg`; `gradients.hero` on hero cards only |
| Emoji in buttons, headers, chrome, system copy | icon components only |
| Rounded card with a colored left-border accent stripe | full card, `SHADOW.card` + `RADIUS.card` |
| New fonts (Roboto, Poppins, SF, system-ui, Fraunces) | Inter (English) + Noto Nastaliq Urdu (Urdu) |
| `Animated` from `react-native` core | Reanimated 3 (`useSharedValue`/`useAnimatedStyle`) |
| Class components, Redux, new global stores | function components + existing `AppContext`/`LanguageContext` |
| styled-components, NativeWind, Tamagui, any new UI lib | `StyleSheet.create` |
| "FIA Report" | **"NCCIA Shikayat"** |
| Punjabi / Sindhi / Pashto / Balochi | exactly 3: English · اردو · Roman Urdu |
| A splash or "title" screen you invented | only the 15 designed screens |
| SVG illustrations you drew yourself | ask for real assets |
| `console.log` left in a diff | remove it |

## Tokens (verbatim — never paraphrase into literals)

**Color**
```
primary #1B4FD8  primaryDk #0B3AB8  primaryLt #3B6BE0
accent  #00C896  accentDk  #059669
danger  #E63946  warning   #F4A261
bg #F8F9FF  surface #FFFFFF  surface2 #EEF2FF
text #0F172A  textMuted #64748B  border #E2E8F0
bgDark #0C0E1A  surfaceDark #141628  surface2Dark #1A1D35
textDark #F1F5F9  borderDark #1F2440
safeBg #ECFDF5 / safeText #047857
dangerBg #FEF2F2 / dangerText #B91C1C
warnBg #FFF7ED / warnText #9A3412
overlay rgba(15,23,42,0.6)
```

**Semantic law.** Blue = brand, nav, trust, primary CTA. Red = **scam verdict and
nothing else** (never a delete button, never decorative). Green = safe / protected.
Orange = suspicious only. One accent per screen. Never red and green on one card.

**Type ramp** `xs 11 · sm 13 · base 15 · lg 18 · xl 24 · xxl 32 · hero 48`
→ **Verdict-screen floor is 17pt.** Never smaller in any verdict, explanation, or
advice text.

**Radius** `sm 8 · icon 12 · btn 14 · card 20 · chip 99`. Never mix radii on
siblings. Chips are always fully rounded.

**Spacing** `xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 48` — only these.
Screen gutter `SPACE.lg`. Card padding `SPACE.md` or `SPACE.lg`.
Never 10, 12, 14, 18, 20, 22.

**Shadow** (blue-tinted — a brand signature, not a detail)
```
soft     #1B4FD8 0/2  6%  r8  elev 2
card     #1B4FD8 0/4  8%  r24 elev 4
elevated #1B4FD8 0/12 14% r40 elev 12
```

**Motion** `fast 200 · base 300 · slow 400 · cinematic 800`.
Pressables scale to `0.98`. Threat-ring reveal is `cinematic`. Nothing bounces
that is not a celebration.

## Layout law
- Frame **390 × 844**. Screens fit **without vertical scroll** unless the design
  scrolls — see `05-screen-fit.md` for the authoritative scroller list and for the
  content cuts you must not re-add.
- Overflow → **cut content.** Do not shrink type, do not drop line-height below
  1.3, do not reduce the gutter.
- Hit targets ≥ **44 × 44**. Contrast ≥ WCAG AA.
- One primary CTA per screen; secondary actions are text or outline buttons.
- Bottom tab bar: 5 fixed items, `COLORS.surface` + `COLORS.border` hairline top.

## When unsure
Ask one short question. Never resolve ambiguity by picking a "modern" default,
copying another app's pattern, adding a gradient or glassmorphism to make it
"pop", or generating placeholder illustrations.
