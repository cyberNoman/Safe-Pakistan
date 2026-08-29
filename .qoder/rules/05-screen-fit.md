---
description: Which screens scroll, which must fit 390x844, and the content cuts that make them fit.
alwaysApply: true
---

# Screen fit

Frame is **390 × 844**. The phone frames in `Safe Pakistan.html` have
`overflow:hidden` — anything past 844px is invisible, not scrollable.

## Designated scrollers — vertical scroll is intended
- `AnalyticsScreen` (artboard 11)
- `LibraryScreen` (artboard 10)
- `ChatScreen` (artboard 12) — message list scrolls, composer is pinned

Every other screen **must fit in one viewport.** No exceptions.

## Horizontal chip rails — swipeable, intentionally overflowing
These are `ScrollView horizontal` rails. The static artboard shows only the
first few chips; more exist off-screen to the right. Do not "fix" the truncation
and do not assume the visible chips are the complete set.
- `LibraryScreen` filter rail — All / Scams / Suspicious / Safe (+ counts)
- `ChatScreen` suggested-question rail
- `WelcomeScreen` language rail — but this one has exactly 3 chips and must fit
  without scrolling

## Cuts that make the fit work — do not re-add this content
Four screens were over budget and were trimmed per the "overflow → cut content"
rule. If you re-add any of these, the screen breaks its frame again.

| Screen | Removed |
|---|---|
| `HomeScreen` (03) | The two "quick action" tiles (SMS Check / Voice Se Bolein) — Scan and Voice are already tab-bar destinations |
| `FamilyScreen` (09) | The "Haliya Khabarein" recent-alerts card (Home already shows recent activity) and one member row — roster is now **3**: header chip "3 members", hero "2 of 3 mehfooz hain", 3 avatars with no overflow bubble, 3 list rows. All four numbers must stay in sync. |
| `VerdictScreen` safe state (07) | The Urdu restatement under "Yeh message theek lagta hai" (the verdict pill above already carries Urdu); score ring 140 → 124. The green gradient band is `height: 415` — it MUST extend below the confidence-chip row, because those chips are styled as on-gradient glass (white text on `#FFFFFF1F`). If you move content in this screen, re-check the band still covers the chips. |
| `ModelPerfScreen` (15) | The "Accuracy" metric tile (duplicated the 94.2% hero) and the Urdu sublabels in the metric grid; grid is now 3-up, one row |

If you need to add content to a full screen, remove something first and say what
you removed and why.
