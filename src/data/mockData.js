/**
 * mockData — placeholder data until real backend/DB wiring lands.
 * Contract (AGENTS.md): LocalDBService.getScanHistory(), getStats().
 * Shapes match the existing UI: ActivityFeedItem({ tone, type, message, time }).
 */

// tone: 'danger' (scam) | 'warn' (suspicious) | 'safe'
export const MOCK_SCAN_HISTORY = [
  { id: 's1', tone: 'danger', type: 'SMS',     message: 'Congrats! You won Rs 50 lakh prize…', time: '2h ago' },
  { id: 's2', tone: 'warn',   type: 'WhatsApp', message: 'Dear customer, your account will…',   time: '5h ago' },
  { id: 's3', tone: 'safe',   type: 'SMS',     message: 'Your JazzCash statement for August…',  time: 'Yesterday' },
];

export const MOCK_STATS = {
  scanCount: 312,
  blockedCount: 47,
  familyCount: 3,
};

export const LocalDBService = {
  // Stubbed async — swap for AsyncStorage/SQLite later without changing callers.
  getScanHistory: async () => MOCK_SCAN_HISTORY,
  getStats: async () => MOCK_STATS,
};
