---
description: Urdu/RTL typography and verdict copywriting rules. Applies to any file containing user-facing text.
globs: src/screens/**,src/components/**
---

# Urdu / RTL — non-negotiable

1. `fontFamily: FONTS.urdu` (Noto Nastaliq Urdu).
2. Size = English equivalent **+2** → `urduSize(SIZE.base)`.
3. `lineHeight = fontSize * 1.8`. Nastaliq needs the room; less clips descenders.
4. `writingDirection: 'rtl'`, `textAlign: 'right'`.
5. **Never put Urdu and English in the same `<Text>`.** Two separate components,
   always — mixed runs break shaping and alignment.
6. Numerals stay Western Arabic (1234), not Eastern (١٢٣٤).
7. Roman Urdu uses `FONTS.enMedium` and LTR — it is **not** Urdu script.

Prefer the ready-made presets: `typo.bodyUr`, `typo.titleUr`, `typo.labelUr`,
`typo.bodyUrInv`. They already encode rules 1–4.

```jsx
// correct
<Text style={typo.bodyEn}>This message is a scam.</Text>
<Text style={typo.bodyUr}>یہ پیغام فراڈ ہے۔</Text>

// wrong — mixed run
<Text>This message is a scam — یہ پیغام فراڈ ہے۔</Text>
```

# Copy rules

- Verdict explanation: **max 11 words per line.** Split into two `<Text>` lines
  rather than letting one wrap to three.
- Plain language. "Yeh scam hai" beats "Potentially fraudulent communication detected".
- Never "AI thinks" or "probably" in a scam verdict. Be decisive.
- Buttons are verbs: "Block Karo", "NCCIA Shikayat", "Family Ko Batao".
- No exclamation marks in system copy. No ALL-CAPS except status pills.
- Trigger-word chips (`OTP`, `foran`, `code bhejo`) sit under a single inline
  **WORDS FOUND** label, red-tinted, **one row** — never a wrapping two-row block.
- Every user-facing string must exist in all three languages before merge.
