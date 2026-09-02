# DEMO_CHECKLIST.md — Safe Pakistan stage-day runbook

> Run every item in order. Do not walk on stage until section 0 is green.
> Companion docs: `SECURITY.md` (secrets policy) · `backend/verify-cascade.js`
> (failure-path harness).

## 0 — Pre-demo prerequisites (the night before)

- [ ] **Qwen API key ROTATED** (incident: the 2026-08-31 EAS archive included
      `backend/.env` — see SECURITY.md). The **new** key lives ONLY in
      `backend/.env`. Confirm no stale credentials anywhere:
      `.env.example` placeholders only, no key in code/decks/logs.
- [ ] **Phone hotspot ON.** The laptop connects to the PHONE's hotspot —
      this is the exact demo topology and it must be rehearsed, not improvised.
- [ ] **Find the laptop's LAN IP** on the hotspot:
      ```powershell
      ipconfig   # note the IPv4 address on the hotspot adapter
      ```
- [ ] **Update `API_BASE`** in `src/services/api.js` to the laptop's LAN IP:
      ```js
      const API_BASE = 'http://<LAN-IP>:3000'; // DEMO-BUILD
      ```
      (Not the Cloud Run URL, not `10.0.2.2` — the phone must reach the
      laptop directly on the hotspot.)
- [ ] **Cleartext HTTP is on — DEMO-BUILD only.** Android 9+ blocks `http://`
      in **release** builds, so `app.json` carries
      `expo-build-properties → android.usesCleartextTraffic: true`. Without it
      the APK silently falls back to the on-device floor and *looks* like it
      works while never reaching the laptop. **Production serves https
      (Cloud Run) — remove the plugin entry and the LAN `API_BASE` together.**
- [ ] **Any `API_BASE` or native-config change means rebuilding the APK** — §6.
- [ ] **Firewall rule:** port **3000 inbound allowed** on the laptop for the
      hotspot (private) network profile. Windows:
      ```powershell
      New-NetFirewallRule -DisplayName "Safe Pakistan demo :3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
      ```
- [ ] **Verification step:** the phone's browser successfully opens
      `http://<LAN-IP>:3000/health` and shows a 200 JSON response. If it
      spins: re-check the firewall rule and that both devices are on the same
      hotspot SSID.
- [ ] **HF link check:** `huggingface.co/Noman33/hifazat-edge` loads in a
      browser — model card visible, weights downloadable. The README badge and
      PitchDeck QR both point here; a dead link on stage is unacceptable.

## 1 — Cascade readiness (90 minutes before stage)

- [ ] Start Ollama with a long keep-alive so the model is never evicted
      mid-demo: `OLLAMA_KEEP_ALIVE=24h ollama serve`
- [ ] Start the backend: `node backend/index.js` — expect the warm-up scan
      log line (`scam/99`) before any demo traffic
- [ ] Run the harness: `node backend/verify-cascade.js` — require **4/4 PASS**
- [ ] Warm-up scan through the real endpoint; L1 must answer in < 4s
      (cold first-call latency is the known risk — never let the judges see it)

## 2 — On-device readiness

- [ ] **Rebuild the APK** whenever `API_BASE`, `app.json` or any native config
      changed since the last build:
      ```powershell
      npx expo prebuild --platform android --clean
      eas build --platform android --profile preview --non-interactive
      ```
      After prebuild, confirm
      `android/app/src/main/AndroidManifest.xml` contains
      `android:usesCleartextTraffic="true"` — that is what lets the release
      APK talk to `http://<LAN-IP>:3000`.
- [ ] EAS preview APK installed on the demo phone **and** on the second
      (receiver) phone — the **same** build on both, see §4
- [ ] **Backup APK location confirmed** (drive link + copy on a second
      device) — if the demo phone fails, the swap must take under 2 minutes
- [ ] Airplane-mode rehearsal: scan the demo preset with radios off — verdict
      must still land (L3 floor, 0ms)

## 3 — The demo messages (pre-loaded, in order)

1. The "25,000 OTP" scam SMS — must return SCAM (Guardrail A probe text)
2. A real JazzCash "Rs received" alert — must return SAFE (verified sender)
3. Airplane-mode repeat of #1 — the "cannot break" moment

## 4 — Two-phone family-alert choreography (rehearse, then record)

Both phones on the **same hotspot** as the laptop, backend live on `:3000`,
**same APK on both**. Phone B = receiver (family member) · Phone A = sender
(guardian).

| # | Phone B — receiver | Phone A — sender |
|---|---|---|
| 1 | Fresh install → confirm **honest empty states** (no mock analytics, no seeded scans) | Fresh install |
| 2 | Family Shield → add member: name, role, **phone number** (required) → saved on device | — |
| 3 | **"Is device ko push-ready banayein"** → allow notifications → chip becomes **"Push linked"** / *Yeh device push-ready hai*. If it reads **"SMS only"** the note must say *"Push is build mein available nahi — SMS alert use karein"* — **never fake it** | — |
| 4 | — | Scan → the **"25,000 OTP"** preset → verdict **SCAM · score 96 · red ring** |
| 5 | — | **Family Ko Batain** → member → **PRIMARY "Send via SMS / WhatsApp"** → native app opens **pre-filled** (`03XX…` normalized to `923XX…`). *Mandatory pass — needs no backend.* |
| 6 | — | **SECONDARY "Push Alert"** → **"Push sent · real"** (live only with a registered token) |
| 7 | Foreground → **in-app banner** (verdict + risk, auto-dismiss). Backgrounded → **system notification** | On `sent: 0` → toast **"Push fail hua — SMS use karein"**, SMS stays highlighted |
| 8 | — | Airplane-mode repeat of step 4 → verdict still lands (L3 floor, 0ms) |

Stop conditions — if any of these fail, do **not** walk on stage:

- Step 5 fails → the deep link is broken. Fix it before anything else; it is
  the guarantee.
- Step 6 returns `sent: 0` → open `http://<LAN-IP>:3000/health` in the
  phone's browser, then either fix reachability or demo step 5 and **say out
  loud** that push needs a redeployed backend. Push is a bonus; SMS is the
  contract.

## 5 — Backup recording

- [ ] Record **`backup-demo-family-alert.mp4`** covering steps 1–7 on both
      phones (split-screen, or two clean takes). Store it on the laptop **and**
      a second device / drive link.
- [ ] Play it back end to end once — in focus, audible, no hand blocking the
      screen. If the hotspot, the backend or a phone dies on stage, **this
      video is the demo.**

## 6 — If the hotspot IP changes

The APK hard-codes `API_BASE`, so an IP change breaks the backend link
**silently** — verdicts still appear from the on-device floor, which makes the
failure easy to miss.

1. `ipconfig` → note the new IPv4 on the hotspot/Wi-Fi adapter.
2. Update `API_BASE` in `src/services/api.js` (keep the `// DEMO-BUILD` marker).
3. **Rebuild** (§2) and reinstall on **both** phones — a JS reload is not
   enough for a native build.
4. **No time to rebuild → Expo Go fallback:** `npx expo start`, open the
   project in Expo Go on both phones. Expo Go is a **debug** build, so
   cleartext HTTP is already permitted and the new IP is picked up instantly.
5. Re-verify from the phone browser: `http://<NEW-IP>:3000/health` → 200 JSON.
