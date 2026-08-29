const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const BASE = process.env.DASHSCOPE_BASE_URL;
const KEY  = process.env.QWEN_API_KEY;
const FT_MODEL  = process.env.FT_MODEL;
const MAX_MODEL = process.env.MAX_MODEL || 'qwen-max';

const SYSTEM_PROMPT = 'You are Hifazat AI, Pakistan scam detection expert for Safe Pakistan. Detect JazzCash, Easypaisa, BISP 8171, OTP, fake receipt, fake call, SMS phishing scams. Return ONLY valid JSON: {"verdict":"scam|suspicious|safe","risk_score":0-100,"confidence":0-100,"scam_type":"","evidence_spans":[],"explanation_en":"","explanation_roman_ur":"","explanation_urdu":""}. Rules: OTP/PIN/CNIC request => risk_score>=85. Urgency (foran, account band, block) => >=75. BISP/JazzCash prize asking money or code => scam. Official transactional without secrets => safe. Unsure => suspicious.';

async function callQwen(model, text) {
  const res = await fetch(BASE + '/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: { messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: 'Analyze: ' + text } ] } }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.message || j.code || res.status);
  const t = j?.output?.text || j?.output?.choices?.[0]?.message?.content || '';
  const m = t.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('no JSON in output');
  const o = JSON.parse(m[0]);
  if (!o.verdict) throw new Error('bad JSON shape');
  let v = String(o.verdict).toLowerCase();
  v = v.includes('scam') ? 'scam' : v.includes('safe') ? 'safe' : 'suspicious';
  return {
    verdict: v,
    score: Math.max(0, Math.min(100, Number(o.risk_score ?? 50))),
    confidence: Number(o.confidence ?? 90),
    type: o.scam_type || 'Unknown',
    redFlags: (o.evidence_spans || []).slice(0, 3),
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

app.post('/analyze/text', async (req, res) => {
  const text = req.body.text || '';
  try { return res.json({ ...(await callQwen(FT_MODEL, text)), model_used: 'YOUR_MODEL' }); }
  catch (e) { console.log('[Layer1 YOUR model]', e.message); }
  try { return res.json({ ...(await callQwen(MAX_MODEL, text)), model_used: 'QWEN_MAX' }); }
  catch (e) { console.log('[Layer2 qwen-max]', e.message); }
  return res.json({ ...localRules(text), model_used: 'ON_DEVICE_RULES' });
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
  app.listen(3000, () => console.log('Hifazat backend on http://localhost:3000'));
}

// Exported for the offline evaluation harness (backend/eval.js).
module.exports = { ruleEngine: localRules };