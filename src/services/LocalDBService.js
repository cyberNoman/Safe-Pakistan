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
const KEY_NOTIF = '@safe_pakistan_notif';
const KEY_AUTODELETE = '@safe_pakistan_autodelete';
const KEY_FAMILY = '@safe_pakistan_family';
const KEY_NOTIFY_COUNT = '@safe_pakistan_notify_count';
const KEY_CHAT_FEEDBACK = '@safe_pakistan_chat_feedback';
const KEY_CHAT_REPORT = '@safe_pakistan_chat_report';
const HISTORY_CAP = 50;
const LOG_CAP = 200;
const DAY_MS = 86400000;

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

// ── AsyncStorage JSON helpers (best-effort; never throw to callers) ──
async function readJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
async function writeJSON(key, value) {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* best-effort */ }
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

  /** Real scan history, auto-delete pruned. Empty → []. NEVER mock/back-fill. */
  async getScanHistory() {
    let rows = await readJSON(KEY_SCANS, []);
    if (!Array.isArray(rows)) rows = [];
    // Auto-delete: drop scans older than the user's chosen window (0 = never).
    const days = await LocalDBService.getAutoDelete();
    if (days > 0) {
      const cutoff = Date.now() - days * DAY_MS;
      const kept = rows.filter(s => Number(s?.ts || 0) >= cutoff);
      if (kept.length !== rows.length) {
        await writeJSON(KEY_SCANS, kept);
        return kept;
      }
    }
    return rows;
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

  // ── Notification preferences (which verdicts alert the user) ──
  // Defaults: scam + suspicious on, safe off. Forward-looking — honoured by V2 push.
  async getNotifPrefs() {
    const p = await readJSON(KEY_NOTIF, null);
    return { scam: true, suspicious: true, safe: false, ...(p && typeof p === 'object' ? p : {}) };
  },
  async setNotifPrefs(prefs) {
    await writeJSON(KEY_NOTIF, {
      scam: !!prefs?.scam, suspicious: !!prefs?.suspicious, safe: !!prefs?.safe,
    });
  },

  // ── Auto-delete window (days; 0 = never). Applied in getScanHistory. ──
  async getAutoDelete() {
    const v = await readJSON(KEY_AUTODELETE, 0);
    return Number.isFinite(v) ? Number(v) : 0;
  },
  async setAutoDelete(days) {
    await writeJSON(KEY_AUTODELETE, Number(days) || 0);
  },

  // ── Family roster (real, user-added; NEVER mock-seeded) ──
  async getFamilyMembers() {
    const m = await readJSON(KEY_FAMILY, []);
    return Array.isArray(m) ? m : [];
  },
  async addFamilyMember({ name, phone, role } = {}) {
    const members = await LocalDBService.getFamilyMembers();
    const member = {
      id: String(Date.now()),
      name: String(name || '').trim(),
      phone: String(phone || '').trim(),
      role: role || 'Other',
      ts: Date.now(),
    };
    const next = [...members, member];
    await writeJSON(KEY_FAMILY, next);
    return next;
  },
  async removeFamilyMember(id) {
    const members = await LocalDBService.getFamilyMembers();
    const next = members.filter(m => m.id !== id);
    await writeJSON(KEY_FAMILY, next);
    return next;
  },

  // ── Demo "Notify family" counter (local only; real push is V2) ──
  async getNotifyCount() {
    const v = await readJSON(KEY_NOTIFY_COUNT, 0);
    return Number.isFinite(v) ? Number(v) : 0;
  },
  async bumpNotifyCount() {
    const n = (await LocalDBService.getNotifyCount()) + 1;
    await writeJSON(KEY_NOTIFY_COUNT, n);
    return n;
  },

  // ── Chat feedback + reports (local logs; v2 training data) ──
  async logChatFeedback(entry = {}) {
    const log = await readJSON(KEY_CHAT_FEEDBACK, []);
    const next = [{ ts: Date.now(), ...entry }, ...(Array.isArray(log) ? log : [])].slice(0, LOG_CAP);
    await writeJSON(KEY_CHAT_FEEDBACK, next);
    return next;
  },
  async getChatFeedback() {
    const l = await readJSON(KEY_CHAT_FEEDBACK, []);
    return Array.isArray(l) ? l : [];
  },
  async logChatReport(entry = {}) {
    const log = await readJSON(KEY_CHAT_REPORT, []);
    const next = [{ ts: Date.now(), ...entry }, ...(Array.isArray(log) ? log : [])].slice(0, LOG_CAP);
    await writeJSON(KEY_CHAT_REPORT, next);
    return next;
  },
  async getChatReports() {
    const l = await readJSON(KEY_CHAT_REPORT, []);
    return Array.isArray(l) ? l : [];
  },
};
