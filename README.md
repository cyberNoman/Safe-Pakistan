<div align="center">

# HIFAZAT حفاظت — Safe Pakistan

## Pakistan's first offline-first, family-aware AI scam shield

Paste any SMS, WhatsApp message, screenshot or live call and get a clear
verdict — **SCAM · SUSPICIOUS · SAFE** — in 3 seconds, in English, Roman Urdu
and اردو (Nastaliq), plus **one tap to warn your family**.

*Apne Ghar Ki Hifazat — Protect Your Home*

<br>

![Built with Qoder](https://img.shields.io/badge/Built%20with-Qoder%20AI-1B4FD8?style=for-the-badge)
![Expo SDK 54](https://img.shields.io/badge/Expo%20SDK-54-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Model hifazat-edge](https://img.shields.io/badge/%F0%9F%A4%97%20Model-hifazat--edge-FF9D00?style=for-the-badge)
![Cascade verified](https://img.shields.io/badge/Cascade-4%2F4%20PASS-00C896?style=for-the-badge)
![Hold-out](https://img.shields.io/badge/Hold--out-74.8%E2%80%9377.4%25%20vs%2046.5%25%20baseline-3B6BE0?style=for-the-badge)
![Offline floor](https://img.shields.io/badge/Offline%20floor-Rs%200%20per%20scan-047857?style=for-the-badge)

</div>

---
## 60-Second Summary (for non-technical judges)

- **What:** an app that reads any SMS and tells you in 3 seconds — in your
  own language — if it is a scam, then warns your family in one tap.
- **For whom:** mothers and elders on slow or zero internet.
- **Why it wins:** works offline, costs Rs 0 per scan, and never hides its
  mistakes — every limitation is printed in the app and on this page.
- **Proof:** 76% accuracy vs 47% for a simple keyword filter on 155 messages
  it never saw; a live harness that breaks each layer on purpose and still
  returns an answer.

## At a glance

| | |
|---|---|
| **What it is** | Offline-first scam detector for Pakistan — SMS, calls, screenshots |
| **Verdict speed** | 3 s client race · L1 answers in 2.3 s · L3 floor in 0 ms |
| **Cost per scan** | **Rs 0** on-device · ≈ Rs 0.85 cloud (quota-shielded) |
| **Hold-out accuracy** | **74.8–77.4%** (mean 76.3%) vs 46.5% regex baseline — 155 unseen messages |
| **Resilience** | 4/4 failure-path harness PASS — every outage still returns a verdict |
| **Family-aware** | Real-time alert to guardians, naming the recipient: SMS/WhatsApp deep link **or** Expo push |
| **Languages** | English · Roman Urdu · اردو (Nastaliq) — chat accepts Urdu script; voice read-out in `ur-PK` with an `en-US` fallback |
| **Report path** | One tap to a pre-filled **NCCIA** complaint (`helpdesk@nccia.gov.pk`) or the native share sheet |
| **Our model** | [hifazat-edge](https://huggingface.co/Noman33/hifazat-edge) — Qwen2.5-1.5B + LoRA, on Hugging Face |

---

## 2 · The problem

Pakistan loses an estimated **$9.3B (≈ Rs 2.6 trillion) a year** to digital
fraud — *Global State of Scams Report 2025*, Global Anti-Scam Alliance &
Feedzai. NCCIA logged **171,600 complaints** in 2024 (**+12.7% YoY**), with
**financial fraud at 47% — the single most-reported cybercrime** — official
statistics from [nccia.gov.pk](https://nccia.gov.pk); the State Bank of
Pakistan reports digital-fraud complaints up **+62%**. The fastest-growing
victim group is **45+, low digital literacy, rural, often on zero or slow
internet**.

> *"Mubarak ho! Apko 25,000 mile hain. OTP bhejein foran warna account band
> ho jayega."* — to a mother it reads like luck. To hifazat-edge it is a
> textbook OTP scam.

Existing tools fail her three times: **cloud-only** (dies offline),
**English-only** (misses the most targeted users), **one model** (one point of
failure). And even a correct verdict arrives too late if she is the only one
who sees it — the person who can stop her is usually her son, in another city.
So we inverted the architecture **and** made the verdict shareable in one tap.

## Prior art in Pakistan

Plenty of tools touch this problem; none of them cover the whole path. Each
stops short exactly where Hifazat begins:

| Solution | What it does | Gap Hifazat fills |
|---|---|---|
| **Truecaller / Whoscall** | Caller-ID & spam-blocking apps | Need internet + account signup, weak on Urdu SMS, no family protection |
| **PTA DNC 9090** | Do-Not-Complain registry | Reactive only — cannot read or analyze an SMS |
| **NCCIA 1799 / complaint portal** | Cybercrime reporting line & portal | Post-loss reporting — acts after the money is gone |
| **Official shortcodes 4444 / 3737 / 8171** | Bank & service verification channels | Require a literate, already-suspicious user |
| **Google / Samsung built-in spam filtering** | On-device message filtering | English-first, no Pakistan scam taxonomy (BISP / Eidi / JazzCash-style bait) |

**Hifazat prevents and protects; NCCIA prosecutes.** It runs offline-first,
reads Urdu, Roman Urdu and English, and alerts the family before the money moves.

## 3 · How it works — a cascade that cannot break

```mermaid
flowchart TD
  A["USER INPUT<br/>SMS · WhatsApp · screenshot · live call"] --> L0{"L0 SENDER PRIOR<br/>verified shortcode + OTP template?"}
  L0 -- "match · 0ms · Rs 0" --> V0["SAFE<br/>L0_VERIFIED"]
  L0 -- "spoofed → confidence capped at 50" --> L1
  L0 -- "unknown sender" --> L1{"L1 hifazat-edge<br/>local Qwen2.5-1.5B · 2.3s · Rs 0"}
  L1 --> G{"CONFIDENCE GATE<br/>≥ 70 ?"}
  G -- "yes" --> V1["VERDICT · FT_MODEL"]
  G -- "unsure · parse fail · down" --> L2{"L2 QWEN-MAX<br/>Alibaba Model Studio · ~9s"}
  L2 -- "ok" --> V2["VERDICT · QWEN_MAX"]
  L2 -- "down · no quota" --> L3["L3 RULES CLASSIFIER<br/>on-device · 0ms · Rs 0"]
  L3 --> V3["VERDICT · RULES"]
  V0 --> F["FAMILY ALERT<br/>SMS/WhatsApp deep link · Expo push"]
  V1 --> F
  V2 --> F
  V3 --> F
  F --> T["Threat Library + feedback loop"]
```

| Layer | Brain | Speed | Cost per scan |
|---|---|---|---|
| **L0** | Sender prior — whitelisted shortcodes + transaction/OTP templates; spoof detection forces escalation | **0ms** | **Rs 0** |
| **L1** | `hifazat-edge` — our fine-tuned Qwen2.5-1.5B, Ollama on the laptop/edge | **2.3s** | **Rs 0** |
| **gate** | Confidence ≥ 70 answers; below it, silently escalates — never guesses | — | — |
| **L2** | Qwen-Max (Alibaba Cloud Model Studio) — the teacher for unsure cases | ~9s | ≈ Rs 0.85 (quota-shielded) |
| **L3** | On-device weighted rule engine — the unbreakable floor | **0ms** | **Rs 0** |

Confidence gate ≥ 70 · silent escalation · quota shield (cache + daily budget)
· **every failure path still returns a verdict.** The demo cannot break — it
just changes which brain answers.

### Resilience ladder — what the user sees when things fail

| Failure | What the user sees | Brain that answers |
|---|---|---|
| Fine-tuned model cold / down | Verdict in seconds, no error | L2 Qwen-Max |
| Cloud unreachable (real 503 incident) | Verdict in seconds, no error | L3 rules, 0ms |
| Airplane mode, rural network | Verdict instantly on-device | L3 rules, 0ms |
| Model unsure (conf < 70) | Escalated, never guessed | gate → L2 |
| Push token unavailable (Expo Go / no dev build) | Honest "SMS only" chip — never a fake "sent" | SMS / WhatsApp deep link |

The client races the backend against a 3-second on-device timer — a verdict
always lands instantly; the smartest available answer upgrades it silently.

**Stack:** Expo SDK 54 · React Native 0.81.5 · React 19.1 · Reanimated ·
react-native-svg · React Navigation v6 · Node/Express backend · Ollama local
inference · Alibaba Cloud Model Studio (Qwen-Max) · EAS Build (APK) ·
expo-notifications + Expo push relay · expo-speech TTS (`ur-PK` → `en-US`
fallback) · expo-clipboard · expo-image-picker · React Native `Share`.

## 4 · WHAT'S NEW — this demo build

Everything below is real, wired code. Nothing is a mock that pretends to be a
network call, and nothing claims a delivery it did not make.

| New | What it actually does |
|---|---|
| **Awaz — verdict read aloud** | `expo-speech` speaks the verdict in Urdu (`ur-PK`). If the device has no Urdu voice it **immediately falls back to Roman Urdu in `en-US`**; if the phone has **no TTS engine at all** it toasts *"Awaz engine phone par nahi — Settings → Text-to-speech"* instead of faking a speaking state, and a 10 s watchdog reverts a stuck button. While speaking it pulses (Reanimated `withRepeat`), swaps to `volume-high`, gains an accent ring, and the band label flips to **"AWAZ CHAL RAHI HAI"**. A generation guard keeps a double-tap from leaving it stuck on "playing". |
| **Sender Block Karein** | Copies the sender with `expo-clipboard`, toasts *"Number copy ho gaya"*, opens the native SMS app at that number, and says plainly: *"Apne phone ki SMS settings mein is number ko block karein."* Android exposes no third-party block API — the app states that instead of pretending. When no sender is present it says so and points at the NCCIA complaint. |
| **NCCIA Shikayat** | Opens a pre-filled `mailto:` to **helpdesk@nccia.gov.pk** carrying a legal-style complaint: sender, the verbatim message, verdict + risk score, red flags, layer attribution (L0 + L1 hifazat-edge + L2 Qwen-Max), victim context, the action requested, and the verified NCCIA channels — online portal `https://complaint.nccia.gov.pk` + helpline **1799**. |
| **Report Share Karein** | The same report as clean plain text through the native `Share.share()` sheet — WhatsApp, SMS or any installed target. |
| **Share on Home and Scan** | Home shares a plain-text summary of the **real** scan store; Scan shares the message you pasted as a warning. Zero scans reads "No scans yet" rather than inventing figures. |
| **اردو chat coverage** | The Guardian KB was Latin-keyed only, so every Urdu-script question fell through to "I don't know" — in a 3-language app aimed at Urdu readers. A 22-row synonym table now maps Urdu-script terms onto existing KB keys, plus Eastern-Arabic digit normalisation for the shortcode check. **Answers are unchanged; only the question side widened.** Verified: 14/14 Urdu queries hit the correct entry and off-topic Urdu still falls back honestly. |
| **Named family alerts** | The SMS/WhatsApp payload is victim-centric and names the recipient — *"HIFAZAT ALERT: Ammi ko yeh message mila hai — SCAM (Risk 96/100) … Ammi ko OTP/paisa bhejne se rokein. Unhein foran call karein."* — so a forwarded warning tells the family who to protect and what to do. |
| **Real-time Family Alert** | Per member, two paths: **PRIMARY** "Send via SMS / WhatsApp" — a zero-backend deep link (`sms:` / `wa.me`) that opens the native app **pre-filled**, with `03XX…` normalized to `923XX…`; **SECONDARY** "Push Alert" — enabled only when that member registered a real Expo push token, relayed by the backend to `exp.host`. On `sent: 0` it toasts *"Push fail hua — SMS use karein"* and keeps SMS highlighted. |
| **Push-ready device enrolment** | On the guardian device: *"Is device ko push-ready banayein"* → notification permission → `getExpoPushTokenAsync()` → `POST /family/register`. If the token call throws (Expo Go, no dev build), the app says so plainly — *"Push is build mein available nahi — SMS alert use karein"* — and marks the member **SMS only**. Push is never faked. |
| **Receiving side** | Foreground → in-app banner with verdict + risk, auto-dismissing. Background → real system notification via Expo/FCM. |
| **Profile settings** | Notification preferences, scan-history auto-delete, and **JSON export** of your own data. |
| **Scoped Guardian chat** | Answers only from verified facts. Out of scope it says *"I don't know"* and routes to **NCCIA 1799** instead of inventing legal advice. No open-ended LLM call is made from chat, and **no API key ships in the client** — every model call is proxied by the backend. |
| **Real analytics** | Charts are driven by actual stored scans — no seeded mock data, and honest empty states on a fresh install. |
| **No dead taps** | Every control does something or explains itself. The onboarding *"I already have an account"* button and both mic buttons answer honestly instead of doing nothing. |
| **DEMO · SIMULATED badges** | Surfaces standing in for a production integration are labelled **on-screen, next to the numbers they qualify** — the Guardian chat header and the Screenshot Result score/findings. |

## 5 · Measured, not promised — 155-message hold-out

`backend/eval-holdout.js` runs 155 UNSEEN messages (95 scam incl. 5
sender-spoofed · 30 suspicious · 30 safe with trigger words like OTP/Rs)
through the live cascade in online **and** offline modes. `backend/eval-runs.js`
repeats it three times; every number below is a **range across those 3 runs**,
not a cherry-picked best.

| Metric | RUN 1 | RUN 2 | RUN 3 | MIN–MAX | MEAN | Regex baseline |
|---|---|---|---|---|---|---|
| Accuracy (online) | 74.8% | 76.8% | 77.4% | **74.8–77.4%** | 76.3% | 46.5% |
| Scam recall | 85.3% | 88.4% | 87.4% | **85.3–88.4%** | 87.0% | 49.5% |
| Safe precision | 95.8% | 92.6% | 89.3% | **89.3–95.8%** | 92.6% | — |
| Safe FPR — legit alerts flagged scam | 16.7% | 13.3% | 13.3% | **13.3–16.7%** | 14.4% | 16.7% |
| Macro F1 | 69.5% | 69.9% | 71.4% | **69.5–71.4%** | 70.3% | — |
| L1 parse fails | 80 | 76 | 78 | **76–80** | 78.0 | — |
| **Accuracy (offline, L2 down)** | — | — | — | **58.7–61.9%** | — | 46.5% |

### Per-layer attribution (representative online run)

| Layer | Predictions | Correct | Accuracy |
|---|---|---|---|
| **L0_VERIFIED** (sender prior) | 22 | 22 | **100.0%** |
| **FT_MODEL** (hifazat-edge) | 52–60 | — | **56–68%** |
| **QWEN_MAX** (cloud teacher) | 73–81 | — | **~76%** |
| **RULES** (regex floor) | 0 online | — | — |

L0 whitelist/template decisions are perfect by construction; L1 is the
fast-and-cheap middle; the cloud layer cleans up its misses. **Offline floor:
58.7–61.9% at Rs 0** — still above the 46.5% baseline with no network at all.

The L3 floor and the eval baseline import the SAME
`backend/rules-classifier.js` — the floor can never drift from what is
measured. Spoofed-sender messages are capped at confidence 50 and
force-escalated to L2: impersonation is an aggravating signal, never a
shortcut.

### We broke our own model on purpose

| | |
|---|---|
| **Run 1** | 30% accuracy, 40% false alarms — **lost to a regex baseline** |
| **Diagnosis** | JSON serialization failure + no sender verification |
| **Fix** | L0 sender prior (never a bypass) + OTP delivery branch + shared rules classifier as the offline floor |
| **Run 2** | **76.3% mean accuracy · 87% scam recall · FPR 14.4%** — baseline 46.5% |
| **Offline** | 58.7–61.9% — still above baseline, at Rs 0 |

> Most teams show a loss curve. We show a stress test.

## 6 · Honesty Doctrine

*We audited ourselves harder than you will.* These limitations are stated
plainly, in the README, the model card and the app itself:

- **L1 JSON parse failure ≈ 55%** on out-of-distribution input (76–80 of ~140
  non-L0 messages per run). Every failure escalates silently to the next layer
  — the user never sees it, but it is why L1 cannot stand alone.
- **Offline safe precision 35–40%**: without the cloud layer the regex floor
  is deliberately conservative and over-flags legit alerts that contain
  trigger words. A cautious wrong-SUSPICIOUS beats a confident wrong-SAFE.
- Run-to-run variance: ±3% accuracy, up to ±7% on safe precision (89.3–95.8% across 3 runs).
- **Suspicious-class recall is weak** — the smallest training slice (336 of
  1,500 examples); v2 needs more ambiguous examples.
- Confidence scores are model outputs, not calibrated probabilities.
- **"Offline" means the on-device rules floor (L3) and the local L1 model on
  the laptop** — L1 needs the hotspot; only L3 is truly network-free.
- **Demo-build networking:** `API_BASE` points at the laptop's LAN IP over the
  phone hotspot, which requires cleartext HTTP
  (`expo-build-properties → android.usesCleartextTraffic`). **That flag is
  DEMO-BUILD only — production serves https (Cloud Run) and the flag comes
  out.** Marked in `src/services/api.js` and `app.json`.
- **Cloud Run does not yet serve `/family/*`.** Until the backend is
  redeployed, push enrolment returns `{sent: 0}` and the app falls back to the
  SMS/WhatsApp deep link — which needs no backend at all.
- **Screenshot analysis is not real.** The image is picked for real, but the
  threat score (91) and the three findings are canned — no vision model runs.
  That screen now carries a **DEMO · SIMULATED** badge beside those numbers.
  Text/SMS analysis through L0–L3 *is* real.
- **There is no speech-to-text.** `expo-speech` is text-to-speech only; it cannot
  listen. Real STT needs `@react-native-voice/voice` plus a dev build and
  `RECORD_AUDIO` (AGENTS.md open task #2). Voice Guardian therefore boots into an
  honest idle state, renders no audio waveform, and routes users to hint chips
  that pre-fill the Guardian chat — which does answer.
- **The sender is never guessed.** ScanScreen captures the message body only, so
  a sender exists only if the user pasted one. Extraction accepts an unambiguous
  Pakistani mobile pattern or a shortcode at the very head of the paste; a bare
  4–5 digit run mid-sentence is far more often an amount (*"Rs 25000"*) than a
  shortcode. Naming an amount as the sender in an NCCIA complaint would be a
  fabricated accusation, so the app says "sender not present" instead.
- **Android exposes no third-party SMS-block API.** "Sender Block Karein" copies
  the number and opens the SMS app; the block itself is a manual step in the
  user's own settings, and the screen states that rather than implying success.
- **The hero "PROTECTED 98" ring is a fixed design value, not a measurement.**
  The saved-amount figure is now computed, not canned: VerdictScreen reads the
  amount out of the scanned message (*"Rs 5,000"*, *"25,000"*, *"10k"*, Urdu
  digits) and shows *"Rs <amt> bachaya"*; when no amount is present it falls back
  to a per-scam-type estimate badged **"ESTIMATED"**. The Analytics **TOTAL
  BACHAYA** is the sum of the per-scan amounts actually stored (real where found,
  else the per-type estimate for legacy rows). The scan counters, verdicts,
  scores, red flags, layer attribution and analytics are all real.
- A false SAFE is more harmful than a false SCAM, so the cascade prefers
  escalation over guessing. Verdicts are not legal advice; reporting goes to
  **NCCIA Shikayat** (helpline **1799**).

## Roadmap & business model

| Phase | Scope |
|---|---|
| **P0** | Supabase auth + scan history (trust infrastructure) |
| **P1** | Family Shield at production scale — Alibaba Cloud Mobile Push + FCM |
| **P2** | Telco / bank white-label integrations |
| **Flywheel** | Every user correction becomes v2 training data |

**Business model:** free forever for vulnerable users. B2B white-label cascade
API for banks & telcos — fraud liability down, support cost down. Edge-first
means near-zero marginal cost per scan (Rs 0 on-device vs ≈ Rs 0.85 cloud).
**Users never pay. Institutions do.**

## Production Rollout Plan

- **Phase 1 (0–3 mo):** auth + Alibaba Cloud Mobile Push (VISION.md sprint
  one); pilot with 500 households via Alkhidmat / Bano Qabil network.
- **Phase 2 (3–9 mo):** telco white-label — spam-SMS feed at the operator,
  L1 at the edge; bank fraud-desk API.
- **Phase 3 (9–18 mo):** provincial rollout with NCCIA awareness drives;
  user corrections become v2 training data (the flywheel).
- **Phase 4 (18+ mo) — Agentic Guardian:** fully agentic app. Autonomous
  AI agents act on the user's behalf: auto-filing NCCIA complaints,
  auto-alerting family, auto-updating the threat library, and coordinating
  with bank/telco agents over Alibaba Cloud Model Studio.
  **Humans approve; agents execute.**

## 7 · Quickstart

### 7.1 Backend (the cascade)

```bash
cd backend && npm install
cp .env.example .env                 # add your Qwen key — never commit .env

OLLAMA_KEEP_ALIVE=24h ollama serve   # long keep-alive: never evict L1 mid-demo
ollama pull hifazat-edge             # or load the local GGUF as hifazat-edge

node index.js                        # cascade on :3000 (warms L1 at boot)
```

Expect the warm-up scan log line (`scam/99`) before any demo traffic. Cold
first-call latency (~8s) is the main operational risk — warm it, then keep it
warm.

Verify:

```bash
node verify-cascade.js               # 4-scenario failure-path harness → 4/4 PASS
node eval-holdout.js                 # 155-message hold-out, online + offline
node eval-runs.js                    # 3-run variance
```

> **Harness gotcha:** kill leftover backend processes first (`Get-Process node`)
> and pin the model with a `keep_alive: 24h` warm-up call. Stale servers
> contend for Ollama and make scenario 1 escalate to L2 — an environment
> artifact, not a cascade defect.

### 7.2 App

```bash
npm install
npx expo start                       # Expo Go: LAN http works (debug build)
```

`API_BASE` in `src/services/api.js` must be the laptop's LAN IP on the phone's
hotspot — `ipconfig`, then `http://<LAN-IP>:3000` (marked `// DEMO-BUILD`).
Open port 3000 inbound and confirm from the **phone's browser**:
`http://<LAN-IP>:3000/health`.

### 7.3 APK install (both phones)

```bash
npx expo prebuild --platform android --clean   # bakes usesCleartextTraffic into the manifest
eas build --platform android --profile preview # → APK download URL
```

Install the same APK on **both** phones (Chrome → open the URL → install;
allow "unknown sources"). Android 9+ blocks cleartext HTTP in **release**
builds unless that plugin is present — without it the app silently falls back
to the on-device floor and looks like it is working while never reaching the
laptop.

### 7.4 Two-phone family-alert choreography

Both phones on the **same hotspot**, laptop backend running on `:3000`.

| # | Phone B — the *receiver* (family member) | Phone A — the *sender* (guardian) |
|---|---|---|
| 1 | Install APK, fresh launch → **honest empty states**, no mock data | Install APK |
| 2 | Family Shield → **add member**: name, role, **phone number** (required) → saved to device | — |
| 3 | Tap **"Is device ko push-ready banayein"** → allow notifications → token registers → chip reads **"Push linked"**. In Expo Go it honestly reads **"SMS only"** | — |
| 4 | — | Scan → the **"25,000 OTP"** preset → verdict **SCAM, 96 red** |
| 5 | — | **Awaz** → the verdict is read aloud (Urdu, or Roman Urdu on `en-US` if the device has no Urdu voice). The button pulses and the band flips to **AWAZ CHAL RAHI HAI** |
| 6 | — | **NCCIA Shikayat** → the mail app opens with a complete legal complaint · **Report Share Karein** → native share sheet · **Sender Block** → number copied + SMS app opened |
| 7 | — | **Family Ko Batain** → pick the member → **PRIMARY "Send via SMS / WhatsApp"** → native SMS opens **pre-filled and addressed**: *"HIFAZAT ALERT: Ammi ko yeh message mila hai — SCAM (Risk 96/100) … Ammi ko OTP/paisa bhejne se rokein."* |
| 8 | — | **SECONDARY "Push Alert"** (live only with a real token) → **"Push sent · real"** |
| 9 | Foreground → **in-app banner** with verdict + risk. Backgrounded → **system notification** | On `sent: 0` → toast *"Push fail hua — SMS use karein"*, SMS stays highlighted |

Airplane-mode repeat of step 4 on Phone A: the verdict must still land
(L3 floor, 0ms) — the "cannot break" moment.

## 8 · Links

<div align="center">

| | |
|---|---|
| **Model card + weights** | [huggingface.co/Noman33/hifazat-edge](https://huggingface.co/Noman33/hifazat-edge) |
| **Product vision** | [`VISION.md`](VISION.md) |
| **Security & secrets policy** | [`SECURITY.md`](SECURITY.md) |
| **Stage-day runbook** | [`DEMO_CHECKLIST.md`](DEMO_CHECKLIST.md) |
| **Model card (repo copy)** | [`MODEL_CARD.md`](MODEL_CARD.md) |
| **Judge deck** | `PitchDeck.html` (arrow keys to present) |

<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https%3A%2F%2Fhuggingface.co%2FNoman33%2Fhifazat-edge" width="140" alt="QR — hifazat-edge on Hugging Face" />
<br><sub>Scan for the model card</sub>

</div>

<details>
<summary><b>Repository structure</b></summary>

```
├── App.js                     # entry — fonts, navigator, family-alert banner
├── backend/
│   ├── index.js               # cascade orchestrator (L0→L1→gate→L2→L3) + /health
│   │                          #   + /family/register, /family/alert (Expo push relay)
│   ├── rules-classifier.js    # L3 floor = eval baseline (one implementation)
│   ├── eval-holdout.js        # 155-message hold-out eval, online + offline
│   ├── eval-runs.js           # 3-run variance harness (run-to-run spread)
│   ├── verify-cascade.js      # automated failure-path harness (4 scenarios)
│   ├── stub-ollama.js         # low-confidence Ollama stub for tests
│   └── .env.example           # credentials template (never commit .env)
├── src/
│   ├── theme/                 # tokens.js + typography.js — single visual source
│   ├── components/            # ThreatRing · Indicators · Cards · Overlays
│   ├── services/              # api.js (3s race) · offlineEngine · LocalDB · Family
│   ├── screens/               # 14 screens incl. LoadingScreen + ProfileScreen
│   └── navigation/            # stack + 5-tab bar
├── app.json                   # DEMO-BUILD: usesCleartextTraffic for LAN http
├── eas.json                   # preview profile → internal APK
├── PitchDeck.html             # judge deck
├── SystemDesign.html          # full system design artboards
├── Safe Pakistan.html         # 15-screen design specification canvas
├── DEMO_CHECKLIST.md          # stage-day runbook (hotspot, firewall, /health)
├── SECURITY.md                # secrets policy & pre-push checklist
└── VISION.md                  # product vision & sprint plan
```

</details>

Design law: one brand blue `#1B4FD8`, red **only** for scam, blue-tinted
shadows, verdict body text ≥ 17pt, 44pt hit targets, WCAG AA contrast.
Languages: exactly three — English · اردو · Roman Urdu.

---

<div align="center">

**Built with Qoder, at AI speed** — app (14 screens) + backend cascade +
training pipeline co-built in days, not months. Automated verification:
**4/4 cascade harness PASS** plus a documentation-integrity audit.

> *Humans made every product decision. AI executed them at speed.*

*Three layers. Two models. One shield. Shukriya.*

</div>
