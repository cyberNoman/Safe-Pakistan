/**
 * backend/eval.js — evaluation harness for the offline regex rule engine.
 * Runs ruleEngine (same scoring as index.js localRules) against 10 labeled
 * Pakistani scam-pattern messages and prints a confusion table plus
 * per-class precision / recall / F1, overall accuracy, and avg latency.
 *
 * Usage: node backend/eval.js
 */
const { ruleEngine } = require('./index.js');

// 10 labeled messages: 3 scam, 3 suspicious, 4 safe.
const CASES = [
  // ── SCAM ──────────────────────────────────────────────────────────
  { label: 'scam',
    msg: 'Mubarak ho! Apko BISP 8171 se 25,000 mile hain. Hasil karne ke liye apna OTP bhejein.' },
  { label: 'scam',
    msg: 'JazzCash: Aapke account mein Rs 10,000 credit ho gaye. PIN confirm karne ke liye code 8171 par bhejein.' },
  { label: 'scam',
    msg: 'Easypaisa lottery! Aap jeet gaye. Apna CNIC number aur PIN foran reply karein warna prize cancel.' },
  // ── SUSPICIOUS ────────────────────────────────────────────────────
  { label: 'suspicious',
    msg: 'Dear customer, your account will be blocked within 2 hours. Verify now by clicking the link.' },
  { label: 'suspicious',
    msg: 'Aapka account update karna zaroori hai. Foran neeche diye gaye link par click karein.' },
  { label: 'suspicious',
    msg: 'Special offer! Apke liye exclusive discount kupon. Abhi link kholen aur apna inaam hasil karein.' },
  // ── SAFE ──────────────────────────────────────────────────────────
  { label: 'safe',
    msg: 'Your JazzCash statement for August shows a credit of Rs 5,000. No action required.' },
  { label: 'safe',
    msg: 'Dear customer, your monthly statement is now available in the app. Thank you for banking with us.' },
  { label: 'safe',
    msg: 'Eid Mubarak! May this Eid bring joy and prosperity to you and your family.' },
  { label: 'safe',
    msg: 'Reminder: Your appointment at the clinic is scheduled for tomorrow at 11:00 AM.' },
];

const CLASSES = ['scam', 'suspicious', 'safe'];
const trunc = (s, n = 50) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// ── Run ─────────────────────────────────────────────────────────────
const rows = [];
const t0 = process.hrtime.bigint();
for (let i = 0; i < CASES.length; i++) {
  const c = CASES[i];
  const r = ruleEngine(c.msg);
  rows.push({ i: i + 1, msg: c.msg, truth: c.label, pred: r.verdict, score: r.score });
}
const t1 = process.hrtime.bigint();
const avgLatencyMs = Number(t1 - t0) / 1e6 / CASES.length;

// ── Table ───────────────────────────────────────────────────────────
const header = ['#', 'Message', 'True', 'Predicted', 'Score', 'Correct?'];
const body = rows.map(r => [
  String(r.i), trunc(r.msg), r.truth, r.pred, String(r.score),
  r.truth === r.pred ? 'YES' : 'NO',
]);
const widths = header.map((h, c) =>
  Math.max(h.length, ...body.map(row => row[c].length)));
const line = cells => '| ' + cells.map((cell, c) => cell.padEnd(widths[c])).join(' | ') + ' |';
const sep = '|' + widths.map(w => '-'.repeat(w + 2)).join('|') + '|';

console.log(line(header));
console.log(sep);
body.forEach(row => console.log(line(row)));

// ── Metrics ─────────────────────────────────────────────────────────
const metrics = CLASSES.map(cls => {
  const tp = rows.filter(r => r.truth === cls && r.pred === cls).length;
  const fp = rows.filter(r => r.truth !== cls && r.pred === cls).length;
  const fn = rows.filter(r => r.truth === cls && r.pred !== cls).length;
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  return { cls, precision, recall, f1 };
});

const correct = rows.filter(r => r.truth === r.pred).length;
const accuracy = (correct / rows.length) * 100;

console.log('');
console.log('Per-class metrics:');
metrics.forEach(m => {
  console.log(`  ${m.cls.padEnd(10)} precision=${(m.precision * 100).toFixed(1)}%`
    + `  recall=${(m.recall * 100).toFixed(1)}%  F1=${(m.f1 * 100).toFixed(1)}%`);
});
console.log(`Overall accuracy: ${accuracy.toFixed(1)}% (${correct}/${rows.length})`);
console.log(`Average latency:  ${avgLatencyMs.toFixed(3)} ms/message`);
