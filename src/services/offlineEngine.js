/**
 * offlineEngine — on-device weighted rule engine. Mirrors the backend's
 * localRules cascade so verdicts stay consistent when the API is unreachable.
 *
 * CommonJS on purpose: the export gate proof runs it with plain Node
 * (`require('./src/services/offlineEngine')`) — no Metro/Babel involved.
 * Metro imports this file fine via interop.
 */

// [regex, weight, redFlag label]
const RULES = [
  [/\b(OTP|code|PIN|password|CVV)\b/i, 40, 'OTP'],
  [/(account\s*(band|block)|block ho (gaya|jayega))/i, 22, 'account band'],
  [/(foran|turant|abhi|warna)/i, 18, 'foran'],
  [/(25,?000|prize|lottery|Eidi|bonus|kupon)/i, 16, 'prize'],
  [/(CNIC|shanakht)/i, 25, 'CNIC'],
  [/(verify|update|click|http|link)/i, 10, 'link'],
];

// Official transactional senders strongly reduce the score.
const TRUSTED_SENDERS = ['8171', '4444', 'JAZZCASH', 'EASYPAISA'];
const TRUSTED_ADJUSTMENT = -40;

function offlineAnalyze(text, sender) {
  const body = String(text || '');
  let score = 0;
  const flags = [];

  for (const [re, weight, flag] of RULES) {
    if (re.test(body)) {
      score += weight;
      flags.push(flag);
    }
  }

  const from = String(sender || '').toUpperCase();
  if (from && TRUSTED_SENDERS.some(s => from.includes(s))) {
    score += TRUSTED_ADJUSTMENT;
  }

  score = Math.max(0, Math.min(100, score));
  const verdict = score >= 75 ? 'scam' : score >= 40 ? 'suspicious' : 'safe';

  return {
    verdict,
    score,
    confidence: 88,
    type: verdict === 'scam' ? 'BISP 8171 Fraud' : verdict === 'suspicious' ? 'Unknown Link' : 'Safe Message',
    redFlags: flags.slice(0, 3),
    explanation_en: 'On-device rule engine checked this message.',
    explanation_roman_ur: 'Yeh message scam hai. OTP ya code kabhi na bhejein.',
    explanation_urdu: 'یہ پیغام جعلی ہے۔ او ٹی پی کبھی شیئر نہ کریں۔',
    model_used: 'offline-rules',
  };
}

module.exports = { offlineAnalyze, RULES, TRUSTED_SENDERS };
