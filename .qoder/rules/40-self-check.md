---
description: Run this before reporting any UI task complete.
alwaysApply: true
---

# Self-check — required before you report done

```bash
# 1 — zero hardcoded colors outside tokens.js  (must return nothing)
grep -rn "#[0-9a-fA-F]\{3,8\}" src/screens src/components | grep -v tokens.js

# 2 — no core Animated (must return nothing)
grep -rn "Animated" src/screens src/components | grep -v reanimated

# 3 — no forbidden font names (must return nothing)
grep -rniE "roboto|poppins|system-ui|SF Pro|Fraunces" src

# 4 — no stray magic spacing (inspect every hit)
grep -rnE "(padding|margin|gap)[A-Za-z]*: *(10|12|14|18|20|22)\b" src

# 5 — boots clean, no red screen
npx expo start
```

By eye:
- Urdu renders right-aligned in Nastaliq, descenders not clipped.
- Verdict body text ≥ 17pt.
- The screen fits 390 × 844 with no scroll (unless it is a designed scroller).
- Shadows read **blue**, not gray.
- Compare side by side against the artboard in `Safe Pakistan.html`.

In your final message, state: which artboard you matched, which tokens you used,
and which of the five checks you ran. If you skipped a check, say so.
