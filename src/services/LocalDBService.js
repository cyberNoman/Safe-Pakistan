/**
 * LocalDBService — AsyncStorage-backed scan history + derived stats.
 *
 * DEMO-CREDIBILITY RULE: this store is the ONLY source of the Home / Report /
 * Library numbers. It never falls back to mock data and never back-fills.
 * An empty store stays empty → zero scans → zero stats → clean empty state.
 *
 * Persisted scan record shape:
 *   { ts, verdict, score, scam_type, layer_used, msg }
 *     ts         epoch ms
 *     verdict    'scam' | 'suspicious' | 'safe'
 *     score      0–100 risk score
 *     scam_type  label from the engine (e.g. 'BISP 8171 Fraud')
 *     layer_used cascade layer that answered (e.g. 'FT_MODEL', 'offline-rules')
 *     msg        short preview of the scanned text (local only, never shared)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_SCANS = '@safe_pakistan_scans';
const KEY_VOICE = '@safe_pakistan_voice';
const HISTORY_CAP = 50;

// Per-scam-type savings estimate (PKR). Surfaced in the UI behind the visible
// label "estimated per scam type" — these are estimates, not measured losses.
const SAVED_ESTIMATE_BY_TYPE = {
  'BISP 8171 Fraud':      25000,
  'JazzCash Phishing':    15000,
  'JazzCash Fake App':    15000,
  'Easypaisa Fraud':      12000,
  'OTP Theft':            20000,
  'CNIC Phishing':        10000,
  'Friend Impersonation':  8000,
  'Prize Call Scam':      15000,
  'Fake Helpline':        10000,
  'Unknown Link':          8000,
};
const DEFAULT_SAVED_ESTIMATE = 10000;

/** PKR estimate for one blocked scan of this scam type. */
export function savedEstimateFor(scamType) {
  return SAVED_ESTIMATE_BY_TYPE[scamType] ?? DEFAULT_SAVED_ESTIMATE;
}

/** verdict → Library / feed tone. */
export function deriveTone(verdict) {
  return verdict === 'scam' ? 'danger' : verdict === 'suspicious' ? 'warn' : 'safe';
}

/** epoch ms → compact relative label ("now", "2m", "3h", "1d"). */
export function relTime(ts) {
  const diff = Math.max(0, Date.now() - Number(ts || 0));
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/**
 * Pure aggregation over the real history. Empty in → zeros out.
 * Money-saved = blocked (scam) scans × per-type estimate.
 */
export function computeStats(history) {
  const rows = Array.isArray(history) ? history : [];
  const blocked = rows.filter(s => s.verdict === 'scam');
  return {
    scanCount: rows.length,
    blockedCount: blocked.length,
    safeCount: rows.filter(s => s.verdict === 'safe').length,
    suspiciousCount: rows.filter(s => s.verdict === 'suspicious').length,
    savedAmount: blocked.reduce((sum, s) => sum + savedEstimateFor(s.scam_type), 0),
  };
}

export const LocalDBService = {
  /** Prepend a scan record, cap the history. Returns the new history array. */
  async saveScan(scan) {
    const history = await LocalDBService.getScanHistory();
    const next = [scan, ...history].slice(0, HISTORY_CAP);
    try {
      await AsyncStorage.setItem(KEY_SCANS, JSON.stringify(next));
    } catch (e) {
      // persist failed — still return `next` so the in-session UI stays consistent
    }
    return next;
  },

  /** Real scan history. Empty store → []. NEVER mock, NEVER back-fill. */
  async getScanHistory() {
    try {
      const raw = await AsyncStorage.getItem(KEY_SCANS);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // corrupt / missing → treat as empty
    }
    return [];
  },

  /** Stats derived ONLY from the real history. */
  async getStats() {
    return computeStats(await LocalDBService.getScanHistory());
  },

  /** Voice-narration preference (default on). Persisted across restarts. */
  async getVoicePref() {
    try {
      const raw = await AsyncStorage.getItem(KEY_VOICE);
      return raw === null ? true : raw === '1';
    } catch (e) {
      return true;
    }
  },

  async setVoicePref(on) {
    try {
      await AsyncStorage.setItem(KEY_VOICE, on ? '1' : '0');
    } catch (e) {
      // ignore — preference is best-effort
    }
  },
};
