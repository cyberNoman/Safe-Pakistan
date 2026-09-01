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
      const API_BASE = 'http://<LAN-IP>:3000';
      ```
      (Not the Cloud Run URL, not `10.0.2.2` — the phone must reach the
      laptop directly on the hotspot.)
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

- [ ] EAS preview APK installed on the demo phone
- [ ] **Backup APK location confirmed** (drive link + copy on a second
      device) — if the demo phone fails, the swap must take under 2 minutes
- [ ] Airplane-mode rehearsal: scan the demo preset with radios off — verdict
      must still land (L3 floor, 0ms)

## 3 — The demo messages (pre-loaded, in order)

1. The "25,000 OTP" scam SMS — must return SCAM (Guardrail A probe text)
2. A real JazzCash "Rs received" alert — must return SAFE (verified sender)
3. Airplane-mode repeat of #1 — the "cannot break" moment
