# VISION.md — Safe Pakistan V2

Demo build simulates family delivery; production bus is sprint one.
Demo push relay = Expo dev push; production = Alibaba Cloud Mobile Push + FCM (sprint one).

The hackathon APK is a credible, self-contained demo: the cascade (L0→L3) is real,
scan analytics are real (persisted on-device), and the surfaces that are still
simulated are labelled `DEMO · SIMULATED` in-app. V2 replaces the simulated
plumbing with production infrastructure — **Alibaba Cloud end to end** (no
Supabase, no Firebase).

---

## V2 sprint plan (ordered)

### Sprint 1 — Auth + the production family bus
- **Trilingual UI:** the app is intentionally trilingual (English · Roman Urdu ·
  اردو) so every reader in the household is served. Today the Welcome language
  chips drive the Guardian chat + TTS voice only; the full per-language UI switch
  — every screen rendering in the selected language — lands here in Sprint 1.
- **Auth:** Alibaba Cloud **SMS OTP** sign-in (phone-first, no password). Real
  identity replaces the demo profile in `ProfileScreen`; the `Log out` stub becomes
  a real session sign-out.
- **Family push:** Alibaba Cloud **Mobile Push** delivers the guardian alert that
  the demo currently simulates in `VerdictScreen` / `PushService`. This is the
  production bus — the `DEMO · SIMULATED` badge comes off the guardian receipt the
  day it lands.
- **Why first:** every later feature (cloud sync, shared family state, RAG
  personalisation) needs a real authenticated user and a real delivery channel.

### Sprint 2 — Real analytics cloud sync
- The on-device scan store (`LocalDBService`, AsyncStorage) syncs to an Alibaba
  Cloud backend (API + database), so stats survive reinstalls and roll up across
  a household.
- Home / Report / Library keep reading the same store shape — sync is additive,
  the screens do not change.

### Sprint 3 — RAG chat
- The Guardian chat (`ChatScreen`) graduates from the scoped, pre-verified KB to a
  **retrieval-augmented** assistant over a curated Pakistan-scam knowledge base,
  served via Alibaba Cloud Model Studio.
- Hard rule carried over: every retrieved answer stays grounded in vetted sources;
  the NCCIA 1799 fallback remains for anything out of scope.

### Sprint 4 — Profile & household settings
- Full profile management (real name, verified phone, household role), notification
  preferences, and per-member privacy controls (what is shared vs never shared —
  the `FamilyConsentScreen` contract made real).

---

## Guardrails carried into V2
- **Alibaba Cloud only** for auth, push, sync, and model serving — no Supabase,
  no Firebase.
- **No fabricated numbers.** Cloud sync extends the real store; it never seeds it.
- **Simulation is labelled.** Any surface still simulated keeps its
  `DEMO · SIMULATED` badge until the production path is live.
- **Design law is frozen.** Tokens, Urdu/RTL rules, and the 15 artboards still win.
