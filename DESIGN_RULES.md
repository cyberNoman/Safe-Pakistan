# DESIGN_RULES.md — Safe Pakistan
### CONSTITUTION FOR AI CODING AGENTS (Qoder · Cursor · Claude Code · Copilot)

> **READ THIS BEFORE WRITING ANY LINE OF UI CODE.**
> This file overrides your training defaults, your built-in design taste, any
> generic "frontend design" heuristics, and any framework starter styling.
> Safe Pakistan has a finished design. Your job is to **implement it**, not to
> improve it, modernise it, or apply your own aesthetic.
>
> If a rule below conflicts with what you would normally produce — **the rule wins.**
> If the design is genuinely missing a value, **STOP and ask.** Do not invent one.

---

## 0 · THE ONE RULE

**Every visual value in this codebase comes from `src/theme/tokens.js`.**
No exceptions. Not "just this once". Not for a spacer. Not for a border.

```js
import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, MOTION, gradients, urduSize } from '@/theme/tokens';
import { typo } from '@/theme/typography';
```

If your diff contains a raw `#hex`, a raw font size, a raw `borderRadius`, or a
raw margin/padding number outside `tokens.js` — **the diff is wrong.** Revert it
and use a token, or add a token to `tokens.js` first.

---

## 1 · FORBIDDEN — automatic rejection

| ❌ Never | ✅ Instead |
|---|---|
| A hex color anywhere in `src/screens` or `src/components` | `COLORS.primary` etc. |
| Gray or black shadows (`#000`, `rgba(0,0,0,…)`) | `SHADOW.soft` / `SHADOW.card` / `SHADOW.elevated` — **brand-blue tinted** |
| Purple, teal, indigo, violet, or any Material 3 default palette | `COLORS.primary` `#1B4FD8` is the ONLY brand color |
| Aggressive multi-stop gradient backgrounds | `COLORS.bg` flat, or `gradients.hero` on hero cards only |
| Emoji in UI chrome, buttons, headers, system copy | Icon components only |
| A rounded card with a colored left-border accent stripe | Full card with `SHADOW.card` + `RADIUS.card` |
| New fonts (Roboto, Poppins, SF, system-ui, Fraunces…) | Inter (English) + Noto Nastaliq Urdu (Urdu). Period. |
| `Animated` from `react-native` core | Reanimated 3 (`useSharedValue` / `useAnimatedStyle`) |
| Class components, Redux, new global stores | Function components + the existing `AppContext` / `LanguageContext` |
| `styled-components`, NativeWind, Tamagui, any new UI lib | `StyleSheet.create` |
| Renaming "NCCIA Shikayat" back to "FIA Report" | Keep **NCCIA Shikayat** |
| Adding Punjabi / Sindhi / Pashto / Balochi | **Exactly 3 languages:** English · اردو · Roman Urdu |
| A "Title" / splash screen you invented | Only the 15 screens in the design canvas |
| Decorative SVG illustrations you drew yourself | Ask for real assets |
| `console.log` left in a diff | Remove before finishing |

---

## 2 · THE TOKENS (verbatim — do not paraphrase into literals)

### Color
```
primary   #1B4FD8   primaryDk #0B3AB8   primaryLt #3B6BE0
accent    #00C896   accentDk  #059669
danger    #E63946   warning   #F4A261

bg        #F8F9FF   surface   #FFFFFF   surface2  #EEF2FF
text      #0F172A   textMuted #64748B   border    #E2E8F0

bgDark    #0C0E1A   surfaceDark #141628 surface2Dark #1A1D35
textDark  #F1F5F9   borderDark  #1F2440

safeBg #ECFDF5 / safeText #047857
dangerBg #FEF2F2 / dangerText #B91C1C
warnBg #FFF7ED / warnText #9A3412
overlay rgba(15,23,42,0.6)
```

**Semantic law:**
- Blue = brand, navigation, trust, primary CTA.
- Red = **scam verdict and nothing else.** Never for a delete button, never decorative.
- Green = safe verdict, protected state.
- Orange = suspicious / warning only.
- One accent color per screen. Never red and green on the same card.

### Type ramp
```
xs 11 · sm 13 · base 15 · lg 18 · xl 24 · xxl 32 · hero 48
```
**Verdict-screen floor: 17pt.** Never smaller in any verdict, explanation, or
advice text. This app's users are often 50+ reading a scam alert under stress.

### Radius
```
sm 8 · icon 12 · btn 14 · card 20 · chip 99
```
Never mix radii on sibling elements. Chips are always fully rounded.

### Spacing (8pt-derived — use ONLY these)
```
xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 48
```
Screen horizontal gutter = `SPACE.lg` (24). Card inner padding = `SPACE.md` (16)
or `SPACE.lg` (24). Never 10, 12, 14, 18, 20, 22.

### Shadow (blue-tinted — this is a signature, not a detail)
```
soft     #1B4FD8  0/2   6%   r8    elev 2
card     #1B4FD8  0/4   8%   r24   elev 4
elevated #1B4FD8  0/12  14%  r40   elev 12
```

### Motion
```
fast 200 · base 300 · slow 400 · cinematic 800
```
Pressables scale to `0.98`. Threat-ring reveal is `cinematic`. Nothing bounces
that isn't a celebration.

---

## 3 · URDU / RTL — non-negotiable

1. `fontFamily: FONTS.urdu` (Noto Nastaliq Urdu).
2. Size = English equivalent **+2** → use `urduSize(SIZE.base)`.
3. `lineHeight = fontSize * 1.8`. Nastaliq needs the room; less clips descenders.
4. `writingDirection: 'rtl'`, `textAlign: 'right'`.
5. **NEVER put Urdu and English in the same `<Text>`.** Two separate components,
   always. Mixed runs break shaping and alignment.
6. Numerals stay Western Arabic (1234), not Eastern (١٢٣٤).
7. Roman Urdu uses `FONTS.enMedium` and LTR — it is *not* Urdu script.

---

## 4 · COPY RULES

- Verdict explanation: **max 11 words per line.** Split into two `<Text>` lines
  rather than letting one wrap to three.
- Plain language. "Yeh scam hai" beats "Potentially fraudulent communication detected".
- Never say "AI thinks" or "probably" in a scam verdict. Be decisive.
- Buttons are verbs: "Block Karo", "NCCIA Shikayat", "Family Ko Batao".
- No exclamation marks in system copy. No ALL-CAPS shouting except status pills.
- Trigger-word chips (`OTP`, `foran`, `code bhejo`) render under a single inline
  **WORDS FOUND** label, red-tinted, one row — never a wrapping two-row block.

---

## 5 · LAYOUT LAW

- Frame is **390 × 844**. Every screen must fit **without vertical scroll**
  unless it is a designated scroller: **Analytics, Library, Chat**. Horizontal
  chip rails in Library and Chat are swipeable and intentionally overflow — the
  artboard shows only the first few chips.
- When content overflows: **cut content.** Do not shrink type, do not tighten
  line-height below 1.3, do not reduce the gutter.
- Hit targets ≥ **44 × 44**.
- Contrast ≥ WCAG AA (4.5:1 body, 3:1 large).
- One primary CTA per screen. Secondary actions are text or outline buttons.
- Bottom tab bar: 5 items, fixed, `COLORS.surface` + `COLORS.border` hairline top.

---

## 6 · WORKFLOW YOU MUST FOLLOW

1. **Open `Safe Pakistan.html`** (project root — 15 artboards, pan/zoom canvas)
   and look at the screen you are about to touch. Match it.
2. Read `src/theme/tokens.js` and `src/theme/typography.js` fully.
3. Find the nearest existing component in `src/components/` and reuse it.
   Only create a new component if nothing fits — and match the file's structure.
4. Make the smallest change that satisfies the task. Touch no other screen.
5. Self-check with §7 before you report done.

**Scope discipline:** if asked to fix one screen, change one screen. Do not
"also clean up" other files, reformat, upgrade deps, or restructure folders.

---

## 7 · SELF-CHECK — run before reporting done

```bash
# 1 — zero hardcoded colors outside tokens
grep -rn "#[0-9a-fA-F]\{3,8\}" src/screens src/components | grep -v tokens.js
# must return nothing

# 2 — no core Animated
grep -rn "from 'react-native'" src | xargs grep -l "Animated" ; # inspect hits

# 3 — no forbidden font names
grep -rniE "roboto|poppins|system-ui|SF Pro|Fraunces" src

# 4 — boots clean
npx expo start
```
Plus, by eye: Urdu right-aligned in Nastaliq · verdict text ≥17pt · screen fits
390×844 · shadows read blue not gray.

---

## 8 · WHEN YOU ARE UNSURE

Ask. One short question beats a confident wrong redesign.

Never resolve ambiguity by:
- picking a "modern" default,
- copying a pattern from another app,
- adding a gradient or glassmorphism to make it "pop",
- generating placeholder illustrations.

The design is done. Implement it faithfully.
