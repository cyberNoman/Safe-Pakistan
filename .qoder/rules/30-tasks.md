---
description: Backend contract, stubbed contexts, and the open task queue. Read when picking up work.
---

# Backend

Base: `https://sentinel-pk-api-315679408915.asia-south1.run.app`

`POST /analyze`
```json
// request
{ "text": "...", "language": "en|ur|roman", "channel": "sms|whatsapp|call|screenshot" }
// response
{ "verdict": "scam|suspicious|safe", "score": 0-100, "confidence": 0-1,
  "type": "otp_theft|prize|impersonation|loan|job|...", "redFlags": ["OTP","foran"] }
```

Wire it in `ScanScreen.analyze()`. Pass `redFlags` through to `VerdictScreen`
as `triggerWords` — it renders them as the red **WORDS FOUND** chips.
Handle: no network, 5s timeout, and a non-200 → route to a retry state, never a
blank screen. Never show a raw error string to the user.

# Contexts (already stubbed — uncomment, do not replace)

Each screen has commented `useAppContext()` / `useLanguageContext()` calls.
Uncomment and fix the import paths. Do not invent new state stores.

- `AppContext`: `scanCount, blockedCount, isAnalyzing, incrementScan`
- `LanguageContext`: `language, setLang, t(), isRTL, ttsLocale`
- `LocalDBService`: `getScanHistory()`, `getStats()` (AsyncStorage-backed)

# Open tasks

| # | Task | Files |
|---|---|---|
| 1 | Real `POST /analyze` + `LoadingScreen` route (artboard 05) | `ScanScreen.js`, new `src/screens/LoadingScreen.js`, `AppNavigator.js` |
| 2 | Real audio metering for the waveform (`expo-av` `metering`) | `VoiceScreen.js > Waveform` |
| 3 | Onboarding slides 2 & 3 (artboard 02 pattern) | copy from `WelcomeScreen.js` |
| 4 | `expo-image-picker` launch from the Screenshot chip | `ScanScreen.js` → `ScreenshotResultScreen` |
| 5 | Deep link `safepakistan://invite/:token` | `app.json`, `AppNavigator.js` linking config |
| 6 | Dark mode via `useColorScheme()` + `COLORS.*Dark` tokens | `tokens.js`, theme context |

Take one task per change. Do not bundle two tasks in one diff.
