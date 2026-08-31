/**
 * LocalDBService — AsyncStorage-backed scan history + stats.
 * Every method falls back to mock data so screens never render empty on error.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_RECENT_SCANS } from '@/data/mockData';

const KEY_SCANS = '@safe_pakistan_scans';
const KEY_STATS = '@safe_pakistan_stats';

const DEFAULT_STATS = { scanCount: 312, blockedCount: 47, savedAmount: 120000, familyCount: 3 };

export const LocalDBService = {
  /** Prepend a scan record and cap the stored history at 50 rows. */
  async saveScan(scan) {
    try {
      const history = await LocalDBService.getScanHistory();
      const next = [scan, ...history].slice(0, 50);
      await AsyncStorage.setItem(KEY_SCANS, JSON.stringify(next));
      return next;
    } catch (e) {
      return MOCK_RECENT_SCANS;
    }
  },

  /** Full scan history; falls back to the mock feed. */
  async getScanHistory() {
    try {
      const raw = await AsyncStorage.getItem(KEY_SCANS);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) {
      // fall through to mock
    }
    return MOCK_RECENT_SCANS;
  },

  /** Aggregate stats; falls back to defaults. */
  async getStats() {
    try {
      const raw = await AsyncStorage.getItem(KEY_STATS);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') return { ...DEFAULT_STATS, ...parsed };
    } catch (e) {
      // fall through to defaults
    }
    return DEFAULT_STATS;
  },
};
