---
description: Safe Pakistan — what this app is, how it is built, and how to work in it. Always applies.
alwaysApply: true
---

# Safe Pakistan — Project Rules

**What it is.** A scam-detection app for Pakistan. A user pastes a suspicious SMS,
WhatsApp message, screenshot, or live phone call; the app returns a clear verdict —
SCAM / SUSPICIOUS / SAFE — in plain Urdu-English, plus one obvious next action.
Tagline: *Apne Ghar Ki Hifazat* (Protect your home).

**Who uses it.** Ordinary Pakistani families, many aged 45+, on mid-range Android,
often reading a scam alert while panicking. Clarity beats cleverness every time.

**Stack.** React Native · Expo SDK 52 · React Navigation v6 · Reanimated 3 · react-native-svg.
Import alias `@` → `./src`.

## The design is already finished
`Safe Pakistan.html` at the repo root contains all 15 screens as artboards on a
pan/zoom canvas. **It is the specification.** Open it and look at the screen you
are about to touch before you write code.

You are implementing a finished design. You are not the designer. Do not
modernise it, do not apply your own taste, do not substitute a pattern you like
better. See `10-design-law.md` — those rules override your defaults.

## Folder map
```
src/theme/tokens.js       COLORS FONTS SIZE RADIUS SPACE SHADOW MOTION gradients urduSize
src/theme/typography.js   typo.*  (heroEn, bodyEn, bodyUr, labelUr, …)
src/components/           ThreatRing · Indicators · Cards · Overlays
src/screens/              12 screens (map below)
src/navigation/           AppNavigator.js — native stack + 5 bottom tabs
```

| Screen file | Artboard |
|---|---|
| WelcomeScreen.js | 01 Welcome / language select |
| HomeScreen.js | 03 Home dashboard |
| ScanScreen.js | 04 Scan entry |
| VerdictScreen.js | 06 Scam verdict · 07 Safe verdict |
| ScreenshotResultScreen.js | 13 Screenshot result |
| VoiceScreen.js | 08 Live call analysis |
| FamilyScreen.js | 09 Family Shield |
| FamilyConsentScreen.js | 14 Invite consent |
| LibraryScreen.js | 10 Threat Library |
| AnalyticsScreen.js | 11 Analytics |
| ModelPerfScreen.js | 15 Model performance |
| ChatScreen.js | 12 Guardian chat |

## Setup
```bash
yarn install
npx expo start
```
`babel.config.js` already has the `@` alias and keeps
`react-native-reanimated/plugin` last. Do not reorder it.

## Working style
1. Look at the artboard.
2. Read `tokens.js` + `typography.js` before styling anything.
3. Reuse the nearest existing component in `src/components/` — only create a new
   one if nothing fits, and match the existing file's structure.
4. Make the **smallest** change that satisfies the task. Touch one screen.
5. Check `05-screen-fit.md` — is this screen a designated scroller or must it fit 844px?
6. Run the checks in `40-self-check.md` before you say you are done.

**Scope discipline.** Asked to fix one screen → change one screen. No drive-by
reformatting, no dependency upgrades, no folder restructuring, no "while I was
here" refactors.
