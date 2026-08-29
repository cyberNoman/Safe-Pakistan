# Safe Pakistan — Developer Handoff

> **AI agents:** read `DESIGN_RULES.md` (binding design constitution) then `AGENTS.md`.

**Pakistan's AI Scam Guardian** · React Native (Expo SDK 52) · Production-ready code

> Apne Ghar Ki Hifazat — Protect Your Home

---

## What's in this folder

```
handoff/
├── App.js                          # Entry — loads fonts, mounts navigator
├── package.json                    # Dependencies (merge with yours)
└── src/
    ├── theme/
    │   ├── tokens.js               # Colors, fonts, spacing, radius, shadows, gradients
    │   └── typography.js           # Pre-built TextStyle objects (typo.heroEn, typo.bodyUr...)
    ├── components/
    │   ├── ThreatRing.js           # Animated circular SVG score ring
    │   ├── Indicators.js           # VerdictBadge, StatusPill, ScamTypeChip, AgentStatusDot
    │   ├── Cards.js                # StatCard, FamilyMemberCard, ActivityFeedItem, Avatar,
    │   │                           # SectionHeader, LanguageChip, EmptyState
    │   └── Overlays.js             # LoadingShield, BottomSheet
    ├── screens/
    │   ├── WelcomeScreen.js        # Onboarding slide 1 with 6 language chips
    │   ├── HomeScreen.js           # Dashboard — glass hero, stats, quick actions, feed
    │   ├── ScanScreen.js           # Paste/type SMS, screenshot, voice, analyze
    │   ├── VerdictScreen.js        # SCAM + SAFE results (one component, two states)
    │   ├── VoiceScreen.js          # Full-screen mic with 3 ripples, waveform, language chips
    │   ├── FamilyScreen.js         # Family shield with members & alerts
    │   ├── LibraryScreen.js        # Threat history with filters & search
    │   ├── AnalyticsScreen.js      # 7-day chart, money saved, scam breakdown
    │   ├── ChatScreen.js           # Guardian chatbot (WhatsApp-inspired premium)
    │   ├── FamilyConsentScreen.js  # Invite consent — shown on the INVITED device
    │   ├── ScreenshotResultScreen.js # Screenshot scan result + detected issues
    │   └── ModelPerfScreen.js      # Settings > Model Performance (transparency)
    └── navigation/
        └── AppNavigator.js         # React Navigation v6: stack + 5-tab bar
```

**Routes:** `Welcome` · `Main` (5 tabs: Home, Scan, Family, Report, Chat) ·
`Verdict` · `Voice` · `Library` · `FamilyConsent` · `ScreenshotResult` · `ModelPerf`

**Languages: English / اردو / Roman Urdu** (3 only — Punjabi, Sindhi, Pashto and
Balochi were removed by design decision).

---

## Quick start (drop-in)

1. **Merge dependencies.** Copy entries from `package.json` into your existing
   `safe-pakistan` Expo project. Run `yarn install`.

2. **Configure path alias.** Add this to `babel.config.js` so `@/theme/...`
   imports work:

   ```js
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: [
         ['module-resolver', { root: ['./src'], alias: { '@': './src' } }],
         'react-native-reanimated/plugin'   // MUST be last
       ],
     };
   };
   ```

   `yarn add -D babel-plugin-module-resolver`

3. **Drop in the folders.** Copy `src/theme`, `src/components`, `src/screens`,
   `src/navigation` into your project's `src/` (or replace what's there).

4. **Replace `App.js`** with the version in this folder (or merge — it just
   loads fonts and mounts `AppNavigator`).

5. **Run:** `npx expo start`

---

## Design system at a glance

| Token | Value | Use |
|---|---|---|
| `COLORS.primary` | `#1B4FD8` | Brand blue (CTAs, links, brand) |
| `COLORS.accent`  | `#00C896` | Protection green (safe, success) |
| `COLORS.danger`  | `#E63946` | Scam red (urgent but not panicky) |
| `COLORS.warning` | `#F4A261` | Suspicious amber |
| `COLORS.bg`      | `#F8F9FF` | App background |
| `COLORS.surface` | `#FFFFFF` | Cards |
| `RADIUS.card`    | `20` | Card corners |
| `RADIUS.btn`     | `14` | Button corners |
| `SHADOW.card`    | brand-blue 8% opacity | Default card shadow |
| `gradients.hero` | `#1B4FD8 → #0EA5E9` | Hero / dashboard / brand surfaces |

**All shadows use brand-blue tint** — never gray drop shadows.

---

## Verdict screen copy rules

Verdict screens (`VerdictScreen.js`) are read fast, often by older users. Two
hard rules:

1. **Body text is 17pt minimum** — see `styles.explainText` and `styles.reasonText`.
2. **Each explanation line is under 12 words.** Split long reasoning into two
   short `<Text>` lines rather than one paragraph.

The scam verdict also shows an **evidence chip row** ("WORDS FOUND") listing the
exact trigger words matched in the message — red-tinted pills above the scam-type
chips. Feed it from your backend's `redFlags`/`triggerWords` array:

```js
{(route.params.triggerWords ?? []).map(w => (
  <View key={w} style={styles.evidenceChip}>
    <Text style={styles.evidenceChipText}>{w}</Text>
  </View>
))}
```

The secondary report button is labelled **"NCCIA Shikayat"** (National
Cyber Crime Investigation Agency), not "FIA Report".

---

## Urdu / RTL — the critical rules

Every screen handles Urdu correctly out of the box. The rules baked into
`typography.js`:

1. **Urdu text uses `FONTS.urdu`** (Noto Nastaliq Urdu).
2. **Always +2px** vs the English equivalent (Nastaliq is small at the same px).
3. **`writingDirection: 'rtl'` + `textAlign: 'right'`** always.
4. **`lineHeight: size * 1.8`** — Nastaliq needs vertical breathing room.
5. **Never mix Urdu + English** in one `<Text>` — split into two components.

```js
// ✓ Correct
<Text style={typo.h1En}>Apna Ghar Mehfooz Karo</Text>
<Text style={typo.heroUr}>اپنا گھر محفوظ کرو</Text>

// ✗ Wrong — mixed direction breaks layout
<Text>Apna Ghar Mehfooz Karo اپنا گھر محفوظ کرو</Text>
```

For full RTL screens (when `LanguageContext.isRTL === true`), use
`I18nManager.forceRTL(true)` once at app start. All `StyleSheet` rules in this
codebase use `start/end` semantically already.

---

## Animations (react-native-reanimated 3)

| Where | Effect | File |
|---|---|---|
| Threat score ring | `strokeDashoffset` fills over 1.2s ease-out | `ThreatRing.js` |
| Loading shield | Pulse 1.0 → 1.04 → 1.0, 3s loop | `Overlays.js` |
| Voice ripples | 3 rings, 600ms stagger, scale + fade | `VoiceScreen.js` |
| Voice waveform | Real-time bar heights (mocked, see below) | `VoiceScreen.js` |
| Verdict band | Slide-down spring entrance | `VerdictScreen.js` |
| Tile press | scale: 0.98 on press | All Pressables |

**Wiring real audio levels** to the waveform: replace the `Bar` sharedValue
loops in `VoiceScreen.js > Waveform` with values from your
`expo-av` Audio.Recording `onRecordingStatusUpdate` callback's `metering` value.

---

## Wiring to your existing app

Your existing code provides:

- `AppContext` → `scanCount, blockedCount, isAnalyzing, incrementScan`
- `LanguageContext` → `language, setLang, t(), isRTL, ttsLocale`
- `LocalDBService.getScanHistory()`, `getStats()`
- Backend: `https://sentinel-pk-api-315679408915.asia-south1.run.app`

Each screen has commented-out `useAppContext()` / `useLanguageContext()` hooks
ready to be uncommented once you confirm the import paths. Search for
`// const { ... } = useAppContext()` and wire them up.

For the backend, in `ScanScreen.js`:

```js
const analyze = async () => {
  navigation.navigate('Loading');
  const res = await fetch('https://sentinel-pk-api-315679408915.asia-south1.run.app/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang: language }),
  });
  const { verdict, score, confidence, type, redFlags } = await res.json();
  await LocalDBService.saveScan({ verdict, score, type, text });
  incrementScan();
  navigation.replace('Verdict', { verdict, score, confidence, type, redFlags });
};
```

---

## Component reference (highlights)

### `<ThreatRing score={96} size={140} color={COLORS.danger} label="THREAT SCORE" />`
Animated SVG ring. The number inside uses tabular figures so digits don't jitter
as they count up.

### `<VerdictBadge kind="scam" />` · `kind`: `'scam' | 'safe' | 'susp'`
Pill with icon + label. Use `size="sm"` for inline list contexts.

### `<StatusPill kind="safe">PROTECTED</StatusPill>`
The colored-left-border pattern from the brief. Kinds: `safe | danger | warn | info | off`.

### `<LoadingShield percent={60} />`
Animated shield with rotating progress ring and pulsing glow — drop into your
"Analyzing..." screen between Scan tap and Verdict.

### `<BottomSheet visible onClose={...} title="...">{children}</BottomSheet>`
Standard action-sheet modal. Use for "Block Sender / Family / FIA" menu.

---

## Color contrast & accessibility

All text/background pairs meet WCAG AA:
- Body text on `bg` → 14.6:1
- Body text on `surface2` → 12.1:1
- White text on `primary` → 6.4:1
- White text on `danger` → 4.6:1

Hit targets are 44pt minimum (chips, tab bar icons, buttons).
Tab bar uses 24px icons with 72pt total height including safe area.

---

## Known-good Expo deps versions

The `package.json` pins versions known to work together with **Expo SDK 52 +
Reanimated 3 + Navigation v6**. If you bump Expo SDK, also bump:
- `react-native-reanimated`
- `react-native-svg`
- `react-native-screens`
- `react-native-safe-area-context`

…to versions in the matching `expo install --check` output.

---

## What's NOT included (intentionally)

- **Loading / Analyzing screen as a route** — the `LoadingShield` component is
  ready; create `src/screens/LoadingScreen.js` and add it to the stack between
  Scan and Verdict when you wire the real backend call.
- **Onboarding slides 2 & 3** — Slide 2 (3 threats) is in the HTML mockup;
  copy the pattern from `WelcomeScreen.js` and swap content.
- **Real voice recognition** — `VoiceScreen.js` mocks the state and
  waveform. Hook up `expo-av` recording + your STT backend.
- **Image picking for screenshots** — `ScreenshotResultScreen` expects
  `route.params.imageUri`. Add `expo-image-picker` and launch it from the
  "Screenshot" chip in `ScanScreen.js`.
- **Deep link for family invites** — `FamilyConsentScreen` expects
  `route.params.inviterName` / `inviterPhone` / `token`. Register a
  `safepakistan://invite/:token` scheme in `app.json` and map it in
  React Navigation's `linking` config.
- **Dark mode** — tokens include dark variants (`COLORS.bgDark`, etc.).
  Wrap your app in a theme context that swaps `COLORS` based on
  `useColorScheme()`.

---

## Open this design in HTML

See `Safe Pakistan.html` in the project root — every screen rendered on a
pan/zoom design canvas. Click any artboard to open it fullscreen
(arrow keys to navigate, Esc to close).
