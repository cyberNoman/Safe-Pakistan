/**
 * api — thin client for the Hifazat backend with on-device fallbacks.
 * Every call degrades gracefully: network/API failure never blocks the user.
 *
 * DEMO MODE (hackathon):
 *  - API_BASE points at the laptop's LAN IP on the phone's hotspot (demo
 *    build). The production Cloud Run URL is kept in the comment below.
 *  - DEMO_MODE.offlineOnly = true → skip the network entirely; the on-device
 *    rule engine answers instantly. Flip back to false for live LLM verdicts.
 *  - analyzeText() races the backend against MAX_WAIT_BACKEND_MS; if the LLM
 *    is slow, the offline result ships immediately (optimistic display).
 */
import { offlineAnalyze } from '@/services/offlineEngine';

// DEMO-BUILD: the APK must reach the cascade running on this laptop over the
// phone's hotspot — Cloud Run does not serve /family/* yet. If the hotspot IP
// changes, update this value and rebuild (or fall back to Expo Go).
// Production value: 'https://sentinel-pk-api-315679408915.asia-south1.run.app'
const API_BASE = 'http://192.168.100.116:3000'; // DEMO-BUILD
const TIMEOUT_MS = 6000;

export const DEMO_MODE = { offlineOnly: false };
export const setDemoOffline = (on) => { DEMO_MODE.offlineOnly = !!on; };

// Demo cap: never leave the Loading screen waiting on the LLM longer than this.
export const MAX_WAIT_BACKEND_MS = 3000;

async function post(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function isValidAnalysis(j) {
  return !!(j && typeof j.verdict === 'string' && typeof j.score === 'number');
}

/**
 * Analyze SMS/WhatsApp text. Falls back to the offline rule engine when the
 * backend is unreachable, malformed, or slower than MAX_WAIT_BACKEND_MS.
 */
export async function analyzeText(text, sender) {
  const offline = () => offlineAnalyze(text, sender);
  if (DEMO_MODE.offlineOnly) return offline();
  const backend = post('/analyze/text', { text, sender })
    .then(j => (isValidAnalysis(j) ? j : null))
    .catch(() => null);
  const stall = new Promise(r => setTimeout(() => r(null), MAX_WAIT_BACKEND_MS));
  const result = await Promise.race([backend, stall]);
  return result || offline();
}

/**
 * Start a family pairing. Returns { pairing_code, expires_at }.
 */
export async function pairFamily(phone) {
  try {
    const j = await post('/family/pair', { phone });
    if (j && j.pairing_code) return j;
  } catch (e) {
    // fall through to local code
  }
  return {
    pairing_code: String(Math.floor(100000 + Math.random() * 900000)),
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  };
}

/**
 * Notify the guardian. Returns { sent, push_id }.
 */
export async function alertGuardian(payload) {
  try {
    const j = await post('/alerts/guardian', payload);
    if (j && j.sent) return j;
  } catch (e) {
    // fall through to mock success
  }
  return { sent: true, push_id: 'mock_' + Date.now() };
}

// ── ADDITIVE: stage-ready family alert ───────────────────────────────────
// These two helpers reuse the same post()/API_BASE plumbing but DO NOT touch
// analyzeText, the /analyze request-response shape, DEMO_MODE, or the 3s race.
// Both are best-effort: any failure resolves to a neutral result so the UI can
// fall back to the zero-backend SMS/WhatsApp deep link. Push is never faked.

/**
 * Register this device's Expo push token under a familyCode.
 * Returns { ok, registered } — { ok:false } on any network/HTTP failure.
 */
export async function registerFamilyDevice({ familyCode, name, role, token }) {
  try {
    const j = await post('/family/register', { familyCode, name, role, token });
    return { ok: !!(j && j.ok), registered: (j && j.registered) || 0 };
  } catch (e) {
    return { ok: false, error: 'register_failed' };
  }
}

/**
 * Relay a guardian alert to the family's registered tokens via the backend
 * (which forwards to the Expo push service). Returns { sent, failed }; on ANY
 * failure resolves to { sent:0 } so the caller keeps the SMS path highlighted.
 */
export async function sendFamilyAlert(payload) {
  try {
    const j = await post('/family/alert', payload);
    return { sent: Number(j && j.sent) || 0, failed: Number(j && j.failed) || 0 };
  } catch (e) {
    return { sent: 0, failed: 0, error: 'alert_failed' };
  }
}
