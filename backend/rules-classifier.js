// L3 regex baseline classifier — single source of truth shared by:
//   1. backend/index.js        (L3 cascade floor via localRules)
//   2. backend/eval-holdout.js (BASELINE comparison column)
// Same module, same regex => L3 and the eval baseline are provably one
// implementation. Zero dependencies.
const BASELINE_RE = /(otp|prize|won|foran|fauri|band|click.*link|verify.*account|urgent|congratulations)/i;

function classify(text) {
  return BASELINE_RE.test(text || '')
    ? { verdict: 'scam', confidence: 88 }
    : { verdict: 'safe', confidence: 88 };
}

module.exports = { classify, BASELINE_RE };
