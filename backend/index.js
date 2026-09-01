const express = require('express');
const cors = require('cors');
// Load backend/.env explicitly so the server works from ANY cwd — running
// `node backend/index.js` from the repo root must still pick up Qwen creds.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// L3 verdict logic lives in rules-classifier.js — the SAME module the
// hold-out eval uses for its baseline column (provably one implementation).
const { classify } = require('./rules-classifier');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Pre-stage health probe (DEMO_CHECKLIST step 0): the phone browser opens
// http://<LAN-IP>:<PORT>/health to prove the hotspot -> laptop path works.
// Must stay dependency-free — a health check that can itself fail defeats it.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: FT_MODEL, layer: 'cascade', ts: Date.now() });
});

const BASE = process.env.QWEN_BASE_URL;
const KEY  = process.env.QWEN_API_KEY;
// Layer 1: local fine-tuned edge model served by Ollama (OpenAI-compatible).
const FT_MODEL    = process.env.FT_MODEL || 'hifazat-edge';
// Pinned to 127.0.0.1 (not localhost) so an IPv6 [::] listener can never shadow Ollama.
const FT_BASE_URL = process.env.FT_BASE_URL || 'http://127.0.0.1:11434/v1';
const MAX_MODEL = process.env.MAX_MODEL || 'qwen-max';

// --------------------------- L0 sender prior -------------------------------
// Whitelisted sender IDs for genuine operator/bank shortcodes. L0 is a PRIOR,
// never a bypass: a whitelisted sender with an anomalous body is treated as
// impersonation and forced to the cloud layer.
// NOTE: 8171/BISP/Ehsaas deliberately excluded — it is our headline scam.
const SENDER_WHITELIST = {
  '4444': 'JazzCash', '3737': 'Easypaisa', '8257': 'UBL',
  '345': 'Telenor', '111': 'Jazz', '310': 'Zong', '333': 'Ufone'
};

const LEGIT_TEMPLATE = new RegExp(
  '(rs\\.?\\s?[\\d,]+\\s?(received|credited|added|sent)|' +
  'balance updated|new balance|recharge successful|recharged|statement ready|' +
  'payment success|load successful|salary credited|bill paid)', 'i'
);

const NEVER_SHARE = new RegExp(
  '(do not share|never share|kisi ko na|kisi se share na|' +
  'mat batayein|na batayein|don\'t share|keep secret)', 'i'
);

const URL_PATTERN = new RegExp(
  '(https?:\\/\\/|\\bwww\\.|\\b[a-z0-9-]+\\.(?:com|net|pk|xyz|top|link)\\b)', 'i'
);

const OTP_ANOMALY = new RegExp(
  '(otp|code|pin|password).*(bhej|send|share|enter|likh|maang|give)', 'i'
);

const OTHER_ANOMALY = new RegExp(
  '(click|' + URL_PATTERN.source + '|' +
  'call now|foran|fauri|fouri|urgent|\\bwon\\b|prize|mile hain|' +
  'verify.*(account|identity|kyc|cnic)|band ho|block ho|suspicious activity|' +
  'update.*(details|info|account)|claim.*(amount|prize|rs))', 'i'
);

// Real OTP-delivery signature: a code in the message, not a request for one.
const OTP_TEMPLATE = new RegExp(
  '(otp\\s+(is|hai)\\s*:?\\s*\\d{4,8}|' +
  'verification code\\s*:?\\s*\\d{4,8}|' +
  '\\d{4,8}\\s+(is your|aapka|apka)\\s+(otp|code))', 'i');

// Unsuppressable ask-for-the-code guard (NEVER_SHARE does NOT suppress this).
const OTP_ASK = new RegExp(
  '(otp|code|pin).*(bhej|send|enter|likh|maang|tell us)', 'i');



const SYSTEM_PROMPT = 'You are Hifazat AI, Pakistan scam detection expert for Safe Pakistan. Detect JazzCash, Easypaisa, BISP 8171, OTP, fake receipt, fake call, SMS phishing scams. Return ONLY valid JSON: {"verdict":"scam|suspicious|safe","risk_score":0-100,"confidence":0-100,"scam_type":"","evidence_spans":[],"explanation_en":"","explanation_roman_ur":"","explanation_urdu":""}. Rules: OTP/PIN/CNIC request => risk_score>=85. Urgency (foran, account band, block) => >=75. BISP/JazzCash prize asking money or code => scam. Official transactional without secrets => safe. Unsure => suspicious. Sender: {sender}. Message to classify: {text}';

const fillPrompt = (text, sender) =>
  SYSTEM_PROMPT.replace('{text}', text).replace('{sender}', sender || '');

// Layer 1 uses a MINIMAL contract: {verdict, confidence} only, generated with
// constrained JSON decoding. redFlags are built server-side from the rule
// engine on the input text; the risk score is derived from confidence. Fewer
// output tokens = faster CPU generation and far fewer format collapses.
const FT_PROMPT = 'You are Hifazat AI, Pakistan scam detection expert for Safe Pakistan. Detect JazzCash, Easypaisa, BISP 8171, OTP, fake receipt, fake call, SMS phishing scams. Return ONLY JSON: {"verdict":"scam|suspicious|safe","confidence":0-100}. Rules: OTP/PIN/CNIC request => scam. Urgency (foran, account band, block) => scam. BISP/JazzCash prize asking money or code => scam. Official transactional without secrets => safe. Unsure => suspicious. Sender: {sender}. Message to classify: {text}';

// Impersonation alert prepended to the L1 prompt when a whitelisted sender ID
// arrives with an anomalous body — sender IDs are spoofable.
const IMPERSONATION_ALERT = '[ALERT: Sender ID is spoofable. Treat this sender as unverified regardless of claimed identity. Impersonation of a trusted shortcode is an aggravating signal.] ';

const fillFtPrompt = (text, sender, impersonation) =>
  (impersonation ? IMPERSONATION_ALERT : '') +
  FT_PROMPT.replace('{text}', text).replace('{sender}', sender || '');

// Verdict-aware default explanations for when the edge model omits them.
const FT_DEFAULTS = {
  scam: ['Yeh message scam lagta hai. OTP ya CNIC kisi ko na dein.',
         'یہ پیغام جعلی ہے۔ او ٹی پی یا سی این آئی سی کسے نہ دیں۔'],
  suspicious: ['Yeh message mashkook hai. Ehtiyat zaroori hai.',
               'یہ پیغام مشکوک ہے۔ احتیاط ضرور کریں۔'],
  safe: ['Yeh message mehfooz lagta hai.',
         'یہ پیغام محفوظ نظر آتا ہے۔'],
};

// Layer 1 — local fine-tuned model (Ollama). Minimal JSON contract with
// constrained decoding, no auth header, hard 25s cap; any failure throws so
// the cascade falls through silently. `impersonation` flags a spoofable
// sender: the alert is prepended to the prompt and the effective confidence
// is capped at 50 afterwards (route side) to force gate escalation to L2.
async function ftAnalyze(text, sender, impersonation) {
  const controller = new AbortController();
  // 25s cap: bounded CPU generation. The app's own 3s client race still
  // protects UX; this only bounds direct backend calls.
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(FT_BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: FT_MODEL,
        messages: [{ role: 'user', content: fillFtPrompt(text, sender, impersonation) }],
        temperature: 0.1,
        max_tokens: 220,
        format: 'json',
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json();
    const t = j?.choices?.[0]?.message?.content || '';
    const m = t.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('no JSON in output');
    const o = JSON.parse(m[0]);
    if (typeof o.verdict !== 'string' || typeof o.confidence !== 'number')
      throw new Error('bad JSON shape');
    let v = o.verdict.toLowerCase();
    v = v.includes('scam') ? 'scam' : v.includes('safe') ? 'safe' : 'suspicious';
    const confidence = Math.max(0, Math.min(100, Math.round(o.confidence)));
    const d = FT_DEFAULTS[v];
    // redFlags always come from the on-device rule engine on the raw text;
    // the risk score is derived from model confidence (safe = low risk).
    const flags = localRules(text).redFlags;
    return {
      verdict: v,
      score: v === 'safe' ? 100 - confidence : confidence,
      confidence,
      type: 'BISP 8171 Fraud',
      redFlags: flags.slice(0, 3),
      explanation_en: '',
      explanation_roman_ur: d[0],
      explanation_urdu: d[1],
    };
  } finally { clearTimeout(timer); }
}

async function callQwen(model, text, sender) {
  const res = await fetch(BASE + '/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: fillPrompt(text, sender) },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
    }),
  });
  // Generic error only — never surface provider error bodies (may echo request headers).
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const j = await res.json();
  const t = j?.choices?.[0]?.message?.content || '';
  const m = t.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('no JSON in output');
  const o = JSON.parse(m[0]);
  // Shape contract: verdict string, score number 0-100, confidence number,
  // type string, redFlags array. Anything else cascades to the next layer.
  if (typeof o.verdict !== 'string' || typeof o.risk_score !== 'number'
    || typeof o.confidence !== 'number' || typeof o.scam_type !== 'string'
    || !Array.isArray(o.evidence_spans)) throw new Error('bad JSON shape');
  let v = o.verdict.toLowerCase();
  v = v.includes('scam') ? 'scam' : v.includes('safe') ? 'safe' : 'suspicious';
  return {
    verdict: v,
    score: Math.max(0, Math.min(100, o.risk_score)),
    confidence: o.confidence,
    type: o.scam_type,
    redFlags: o.evidence_spans.slice(0, 3),
    explanation_en: o.explanation_en || '',
    explanation_roman_ur: o.explanation_roman_ur || '',
    explanation_urdu: o.explanation_urdu || '',
  };
}

// Layer 3 — on-device floor. Verdict + confidence come from the shared regex
// classifier (rules-classifier.js); type, redFlags and the curated
// explanations are filled server-side, keeping the response contract identical.
function localRules(text) {
  const c = classify(text);
  // Evidence flags: weighted scanner over the raw text (display chips only —
  // the verdict decision belongs to classify()).
  const S = [
    [/\b(OTP|code|PIN|password|CVV)\b/i, 'OTP'],
    [/(account\s*(band|block)|block ho (gaya|jayega))/i, 'account band'],
    [/(foran|turant|abhi|warna)/i, 'foran'],
    [/(25,?000|prize|lottery|Eidi|bonus|kupon)/i, 'prize'],
    [/(CNIC|shanakht)/i, 'CNIC'],
    [/(verify|update|click|http|link)/i, 'link'],
  ];
  const flags = [];
  for (const [re, f] of S) if (re.test(text)) flags.push(f);
  const d = FT_DEFAULTS[c.verdict];
  return { verdict: c.verdict, score: c.verdict === 'scam' ? 96 : 0, confidence: c.confidence,
    type: 'BISP 8171 Fraud', redFlags: flags.slice(0, 3),
    explanation_en: 'On-device rule engine.', explanation_roman_ur: d[0],
    explanation_urdu: d[1] };
}

// Layer1 must be this confident to short-circuit the cascade; otherwise
// the request falls through to Layer2 (qwen-max).
const CONFIDENCE_GATE = 70;

app.post('/analyze/text', async (req, res) => {
  const text = req.body.text || '';
  const sender = req.body.sender || '';

  // Layer 0: sender prior — never a bypass. Whitelist + clean transaction
  // template => verified safe. Whitelist + anomaly => impersonation: L1 runs
  // with its confidence capped so the gate forces escalation to Layer 2.
  const senderName = SENDER_WHITELIST[sender?.trim()];
  let l0Decision = 'skipped';
  let impersonationDetected = false;

  if (senderName) {
    const hasTemplate = LEGIT_TEMPLATE.test(text);
    const hasNeverShare = NEVER_SHARE.test(text);
    // OTP anomaly suppressed by NEVER_SHARE; URL/prize/urgency NEVER suppressed
    const hasOtpAnomaly = !hasNeverShare && OTP_ANOMALY.test(text);
    const hasOtherAnomaly = OTHER_ANOMALY.test(text);
    const hasAnomaly = hasOtpAnomaly || hasOtherAnomaly;

    if (hasTemplate && !hasAnomaly) {
      // VERIFIED LEGITIMATE — whitelist + template + no red flags
      l0Decision = `verified_safe sender=${senderName}`;
      console.log(`[L0] ${l0Decision}`);
      return res.json({
        verdict: 'safe', score: 100, confidence: 99,
        type: 'verified_sender',
        redFlags: [],
        explanation_en: `Message from verified ${senderName} — transaction pattern matches.`,
        explanation_roman_ur: `Yeh ${senderName} ka verified message hai.`,
        explanation_urdu: `یہ ${senderName} کا تصدیق شدہ پیغام ہے۔`,
        model_used: 'L0_VERIFIED', sender_verified: true
      });
    } else if (OTP_TEMPLATE.test(text) && NEVER_SHARE.test(text)
      && !OTHER_ANOMALY.test(text) && !OTP_ASK.test(text)) {
      // VERIFIED OTP DELIVERY — code-delivery format + "do not share" +
      // verified sender. Scammers ask FOR the code, they never deliver one.
      l0Decision = `verified_otp sender=${senderName}`;
      console.log(`[L0] ${l0Decision}`);
      return res.json({
        verdict: 'safe', score: 100, confidence: 99,
        type: 'verified_sender',
        redFlags: [],
        explanation_en: `Message from verified ${senderName} — OTP delivery pattern matches.`,
        explanation_roman_ur: `Yeh ${senderName} ka verified OTP message hai.`,
        explanation_urdu: `یہ ${senderName} کا تصدیق شدہ او ٹی پی پیغام ہے۔`,
        model_used: 'L0_VERIFIED', sender_verified: true
      });
    } else if (hasAnomaly) {
      // IMPERSONATION PATH — whitelist + anomaly = aggravating
      l0Decision = `impersonation sender=${senderName} anomaly_match=true`;
      console.log(`[L0] ${l0Decision} — forcing L2 escalation`);
      impersonationDetected = true;
      // Do NOT return. Continue to L1 with capped confidence.
    } else {
      l0Decision = `unmatched sender=${senderName} template=${hasTemplate}`;
      console.log(`[L0] ${l0Decision} — normal cascade`);
    }
  }

  // Layer 1: local fine-tuned edge model (Ollama). Any failure — down, slow,
  // bad shape, low confidence — falls through silently to Layer 2.
  try {
    const r = await ftAnalyze(text, sender, impersonationDetected);
    // Impersonation cap: force the gate open so L2 double-checks spoofed senders.
    if (impersonationDetected && r) r.confidence = Math.min(r.confidence, 50);
    if (r && typeof r.confidence === 'number' && r.confidence >= CONFIDENCE_GATE) {
      if (impersonationDetected && r.verdict === 'scam') r.redFlags.push('spoofed_sender_claim');
      return res.json({ ...r, model_used: 'FT_MODEL' });
    }
  } catch (e) { /* silent: cascade must never break */
    // Eval sensor only — counts L1 JSON parse failures so format collapse is
    // visible instead of being silently absorbed into L2 escalations.
    console.log('[L1-parse-fail]', e.message);
  }
  try {
    const q = await callQwen(MAX_MODEL, text, sender);
    if (impersonationDetected && q.verdict === 'scam') q.redFlags.push('spoofed_sender_claim');
    return res.json({ ...q, model_used: 'QWEN_MAX' });
  } catch (e) { console.log('[Layer2 qwen-max]', e.message); }
  const f = localRules(text);
  if (impersonationDetected && f.verdict === 'scam') f.redFlags.push('spoofed_sender_claim');
  return res.json({ ...f, model_used: 'RULES' });
});

app.post('/family/pair', (req, res) => {
  res.json({ pairing_code: String(Math.floor(100000 + Math.random() * 900000)),
             expires_at: new Date(Date.now() + 3600000).toISOString() });
});

app.post('/alerts/guardian', (req, res) => {
  console.log('[PUSH]', req.body);
  res.json({ sent: true, push_id: 'push_' + Date.now() });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('Hifazat backend on http://localhost:' + PORT);
    // One background warm-up so the FT model is loaded into memory before
    // the first real scan (cold load is ~8s on CPU). Non-blocking: if Ollama
    // is not up yet, the first scan simply falls through the cascade.
    ftAnalyze('warmup ping', '')
      .then(() => console.log('[startup] FT model warm'))
      .catch(() => {});
  });
}

// Exported for the offline evaluation harness (backend/eval.js).
module.exports = { ruleEngine: localRules };