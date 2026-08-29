# AGENTS.md — Safe Pakistan

Instructions for an AI coding agent (Qoder / Cursor / Claude Code) working in this repo.

> **Read `DESIGN_RULES.md` FIRST.** It is the binding visual constitution and overrides
> your own design defaults. This file covers setup, architecture, and tasks only.

## Project
Safe Pakistan — Pakistan's AI scam guardian. React Native, **Expo SDK 52**, React Navigation v6, Reanimated 3, react-native-svg.
Tagline: *Apne Ghar Ki Hifazat*.

## Setup (run first)
```bash
yarn install
yarn add -D babel-plugin-module-resolver
npx expo start
```
`babel.config.js` MUST contain the module-resolver alias `@ -> ./src`, and `react-native-reanimated/plugin` MUST be the last plugin. See README.md step 2.

## Layout
```
src/theme/tokens.js       COLORS, FONTS, SPACING, RADIUS, SHADOW, gradients  <- single source of truth
src/theme/typography.js   typo.* TextStyle objects (heroEn, bodyUr, ...)
src/components/           ThreatRing, Indicators, Cards, Overlays
src/screens/              12 screens (see README tree)
src/navigation/           AppNavigator.js — stack + 5 tabs
```

## Hard rules — do not violate
1. **Never hardcode a color, font size, radius, or spacing value.** Import from `@/theme/tokens` and `@/theme/typography`. If a value is missing, add a token — don't inline it.
2. **Shadows are brand-blue tinted** (`SHADOW.card`), never gray/black.
3. **Verdict copy:** body text ≥ 17pt, and every explanation line < 12 words. Split long reasoning into two `<Text>` lines. Older users read these fast.
4. **Urdu:** use `FONTS.urdu` (Noto Nastaliq Urdu), size = English + 2, `lineHeight = size * 1.8`, `writingDirection:'rtl'`, `textAlign:'right'`. **Never mix Urdu and English in one `<Text>`** — always two components.
5. **Three languages only:** English, اردو, Roman Urdu. Do not re-add Punjabi/Sindhi/Pashto/Balochi.
6. **Report button label is "NCCIA Shikayat"**, never "FIA Report".
7. Hit targets ≥ 44pt. Contrast ≥ WCAG AA.
8. Screens must fit without vertical scroll where the design has none — prefer cutting content over shrinking type.

## Style conventions
- Function components + hooks only. No class components.
- One `StyleSheet.create` per file, named `styles`, at the bottom.
- Animations via Reanimated 3 (`useSharedValue` / `useAnimatedStyle`), not `Animated` from RN core.
- Pressables scale to `0.98` on press.
- Screens take data via `route.params`; no global fetching inside components.

## Contexts to wire (already stubbed)
Each screen has commented `useAppContext()` / `useLanguageContext()` calls. Uncomment and fix import paths — do not invent new state stores.
- `AppContext`: `scanCount, blockedCount, isAnalyzing, incrementScan`
- `LanguageContext`: `language, setLang, t(), isRTL, ttsLocale`
- `LocalDBService.getScanHistory()`, `getStats()`

## Backend
`https://sentinel-pk-api-315679408915.asia-south1.run.app`
`POST /analyze` → `{ verdict, score, confidence, type, redFlags }`
Wire it in `ScanScreen.analyze()` (see README for the exact snippet). Pass `redFlags` through to `Verdict` as `triggerWords` — the verdict screen renders them as red "WORDS FOUND" chips.

## Open tasks (good first agent tasks)
| # | Task | Files |
|---|---|---|
| 1 | Wire real `POST /analyze` call + `LoadingScreen` route | `ScanScreen.js`, new `src/screens/LoadingScreen.js`, `AppNavigator.js` |
| 2 | Real audio metering for the waveform (`expo-av` `metering`) | `VoiceScreen.js > Waveform` |
| 3 | Onboarding slides 2 & 3 | copy pattern from `WelcomeScreen.js` |
| 4 | `expo-image-picker` launch from the Screenshot chip | `ScanScreen.js` → `ScreenshotResultScreen` |
| 5 | Deep link `safepakistan://invite/:token` | `app.json`, `AppNavigator.js` linking config |
| 6 | Dark mode via `useColorScheme()` + `COLORS.*Dark` tokens | `tokens.js`, theme context |

## Verification before you finish
- `npx expo start` boots with no red screen.
- No new hardcoded hex colors: `grep -rn "#[0-9a-fA-F]\{6\}" src/screens src/components` returns nothing outside `tokens.js`.
- Urdu strings render right-aligned in Nastaliq.
- Changed screens still fit a 390×844 viewport.

## Visual reference
`Safe Pakistan.html` (project root) — all 15 artboards on a pan/zoom canvas. Consult it before changing any layout.
