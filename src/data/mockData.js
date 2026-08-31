/**
 * mockData — demo dataset used until real history/notifications land.
 * LibraryScreen consumes MOCK_SCAN_HISTORY through the LocalDBService fallback.
 */

// 8 recent scans — shape matches LocalDBService records:
// { tone: 'danger'|'warn'|'safe', type, msg, time, score }
export const MOCK_RECENT_SCANS = [
  { id: 's1', tone: 'danger', type: 'BISP 8171 Fraud',    msg: 'Mubarak ho! Apko 25,000 mile hain. OTP bhejein foran...', time: '2m',  score: 96 },
  { id: 's2', tone: 'danger', type: 'JazzCash Fake App',  msg: 'Aapka JazzCash account block ho gaya. Verify karein...', time: '18m', score: 92 },
  { id: 's3', tone: 'warn',   type: 'Unknown Link',       msg: 'Dear customer, your account will be blocked within...', time: '1h',  score: 64 },
  { id: 's4', tone: 'safe',   type: 'JazzCash Official',  msg: 'Your JazzCash statement for August shows a credit...',  time: '3h',  score: 8  },
  { id: 's5', tone: 'danger', type: 'CNIC Phishing',      msg: 'Apna CNIC number foran bhejein warna SIM band...',      time: '5h',  score: 89 },
  { id: 's6', tone: 'warn',   type: 'Prize Call Scam',    msg: 'Aapne 5 lakh ka Eidi inaam jeeta hai. Call 0300...',    time: '8h',  score: 58 },
  { id: 's7', tone: 'safe',   type: 'Easypaisa Receipt',  msg: 'Rs 2,000 received from Ali Raza. Balance Rs 4,120.',    time: '1d',  score: 6  },
  { id: 's8', tone: 'warn',   type: 'Fake Helpline',      msg: 'Bank verification ke liye is number par call karein...', time: '2d',  score: 52 },
];

// Alias for LibraryScreen (its rows come straight from scan history).
export const MOCK_SCAN_HISTORY = MOCK_RECENT_SCANS;

export const MOCK_FAMILY = [
  { id: 'f1', name: 'Saima Khan',  role: 'Ammi',  status: 'safe', lastProtected: '2 min ago' },
  { id: 'f2', name: 'Bilal Ahmed', role: 'Abu',   status: 'safe', lastProtected: '12 min ago' },
  { id: 'f3', name: 'Hina Khan',   role: 'Behan', status: 'safe', lastProtected: '1 hour ago' },
  { id: 'f4', name: 'Usman Khan',  role: 'Bhai',  status: 'off',  lastProtected: 'Yesterday' },
  { id: 'f5', name: 'Nani Ammi',   role: 'Nani',  status: 'off',  lastProtected: '3 days ago' },
];

// One-tap demo messages — one per verdict class, calibrated so the on-device
// rule engine reproduces each class deterministically (works with no network):
//   scam → 96, suspicious → 53, safe → 0.
export const PRESET_SMS = {
  scam: 'Mubarak ho! Apko 25,000 mile hain. OTP bhejein foran warna account band ho jayega.',
  safe: 'Your JazzCash statement for August shows a credit of Rs 5,000. No action required.',
  suspicious: 'Dear customer, apka account verify karna zaroori hai. Apna CNIC update karein warna service band ho jayegi.',
};

// LibraryScreen imports LocalDBService from this module — re-export keeps a single import path.
export { LocalDBService } from '@/services/LocalDBService';
