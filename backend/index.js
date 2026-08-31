const express = require('express');
const cors = require('cors');
// Load backend/.env explicitly so the server works from ANY cwd — running
// `node backend/index.js` from the repo root must still pick up Qwen creds.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const BASE = process.env.QWEN_BASE_URL;
const KEY  = process.env.QWEN_API_KEY;
// Layer 1: local fine-tuned edge model served by Ollama (OpenAI-compatible).
const FT_MODEL    = process.env.FT_MODEL || 'hifazat-edge';
// Pinned to 127.0.0.1 (not localhost) so an IPv6 [::] listener can never shadow Ollama.
const FT_BASE_URL = process.env.FT_BASE_URL || 'http://127.0.0.1:11434/v1';
const MAX_MODEL = process.env.MAX_MODEL || 'qwen-max';

const SYSTEM_PROMPT = 'You are Hifazat AI, Pakistan scam detection expert for Safe Pakistan. Detect JazzCash, Easypaisa, BISP 8171, OTP, fake receipt, fake call, SMS phishing scams. Return ONLY valid JSON: {"verdict":"scam|suspicious|safe","risk_score":0-100,"confidence":0-100,"scam_type":"","evidence_spans":[],"explanation_en":"","explanation_roman_ur":"","explanation_urdu":""}. Rules: OTP/PIN/CNIC request => risk_score>=85. Urgency (foran, account band, block) => >=75. BISP/JazzCash prize asking money or code => scam. Official transactional without secrets => safe. Unsure => suspicious. Sender: {sender}. Message to classify: {text}';

const fillPrompt = (text, sender) =>
  SYSTEM_PROMPT.replace('{text}', text).replace('{sender}', sender || '');

// Layer 1 uses a COMPACT contract: verdict + numbers only, no explanations.
// This cuts output tokens dramatically on CPU; explanations are filled
// server-side from FT_DEFAULTS below.
const FT_PROMPT = 'You are Hifazat AI, Pakistan scam detection expert for Safe Pakistan. Detect JazzCash, Easypaisa, BISP 8171, OTP, fake receipt, fake call, SMS phishing scams. Return ONLY compact JSON, no explanations: {"verdict":"scam|suspicious|safe","score":0-100,"confidence":0-100,"type":"","redFlags":[]}. Rules: OTP/PIN/CNIC request => score>=85. Urgency (foran, account band, block) => >=75. BISP/JazzCash prize asking money or code => scam. Official transactional without secrets => safe. Unsure => suspicious. Sender: {sender}. Message to classify: {text}';

const fillFtPrompt = (text, sender) =>
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

// Layer 1 — local fine-tuned model (Ollama). Compact JSON contract, no auth
// header, hard 25s cap; any failure throws so the cascade falls through
// silently.
async function ftAnalyze(text, sender) {
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
        messages: [{ role: 'user', content: fillFtPrompt(text, sender) }],
        temperature: 0.1,
        max_tokens: 220,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json();
    const t = j?.choices?.[0]?.message?.content || '';
    const m = t.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('no JSON in output');
    const o = JSON.parse(m[0]);
    if (typeof o.verdict !== 'string' || typeof o.score !== 'number'
      || typeof o.confidence !== 'number' || typeof o.type !== 'string'
      || !Array.isArray(o.redFlags)) throw new Error('bad JSON shape');
    let v = o.verdict.toLowerCase();
    v = v.includes('scam') ? 'scam' : v.includes('safe') ? 'safe' : 'suspicious';
    const d = FT_DEFAULTS[v];
    // Sanitize edge-model flags: keep only non-empty strings, else borrow the
    // rule engine's human-readable flags. Explanations are always the curated
    // defaults — the compact prompt asks the model not to generate them.
    const spans = o.redFlags.filter(s => typeof s === 'string' && s.trim());
    const flags = spans.length ? spans : localRules(text).redFlags;
    return {
      verdict: v,
      score: Math.max(0, Math.min(100, o.score)),
      confidence: o.confidence,
      type: o.type,
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

function localRules(text) {
  const S = [
    [/\b(OTP|code|PIN|password|CVV)\b/i, 40, 'OTP'],
    [/(account\s*(band|block)|block ho (gaya|jayega))/i, 22, 'account band'],
    [/(foran|turant|abhi|warna)/i, 18, 'foran'],
    [/(25,?000|prize|lottery|Eidi|bonus|kupon)/i, 16, 'prize'],
    [/(CNIC|shanakht)/i, 25, 'CNIC'],
    [/(verify|update|click|http|link)/i, 10, 'link'],
  ];
  let score = 0; const flags = [];
  for (const [re, w, f] of S) if (re.test(text)) { score += w; flags.push(f); }
  score = Math.min(100, score);
  const verdict = score >= 75 ? 'scam' : score >= 40 ? 'suspicious' : 'safe';
  return { verdict, score, confidence: 88, type: 'BISP 8171 Fraud', redFlags: flags.slice(0, 3),
    explanation_en: 'On-device rule engine.', explanation_roman_ur: 'Yeh message scam hai. OTP ya code kabhi na bhejein.',
    explanation_urdu: 'یہ پیغام جعلی ہے۔' };
}

// Layer1 must be this confident to short-circuit the cascade; otherwise
// the request falls through to Layer2 (qwen-max).
const CONFIDENCE_GATE = 70;

app.post('/analyze/text', async (req, res) => {
  const text = req.body.text || '';
  const sender = req.body.sender || '';
  // Layer 1: local fine-tuned edge model (Ollama). Any failure — down, slow,
  // bad shape, low confidence — falls through silently to Layer 2.
  try {
    const r = await ftAnalyze(text, sender);
    if (r && typeof r.confidence === 'number' && r.confidence >= CONFIDENCE_GATE) {
      return res.json({ ...r, model_used: 'FT_MODEL' });
    }
  } catch (e) { /* silent: cascade must never break */ }
  try { return res.json({ ...(await callQwen(MAX_MODEL, text, sender)), model_used: 'QWEN_MAX' }); }
  catch (e) { console.log('[Layer2 qwen-max]', e.message); }
  return res.json({ ...localRules(text), model_used: 'RULES' });
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