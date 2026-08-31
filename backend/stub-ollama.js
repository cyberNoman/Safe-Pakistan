// Rehearsal stand-in for the local Ollama edge model (Layer 1).
// Simulates Ollama's OpenAI-compatible /v1/chat/completions endpoint so the
// cascade can be exercised before the real fine-tuned model is registered.
//   node backend/stub-ollama.js            → confidence 95 (FT_MODEL answers)
//   STUB_CONF=50 node backend/stub-ollama.js → confidence 50 (gate escalates to L2/L3)
// Delete this file once the real `ollama run hifazat-edge` is in place.
const http = require('http');
const conf = Number(process.env.STUB_CONF || 95);
http.createServer((req, res) => {
  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    const content = JSON.stringify({
      verdict: 'scam', risk_score: 96, confidence: conf,
      scam_type: 'BISP 8171 Fraud',
      evidence_spans: ['OTP', 'foran', 'account band'],
      explanation_en: 'OTP demand with prize bait',
    });
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ choices: [{ message: { content } }] }));
  });
}).listen(Number(process.env.STUB_PORT || 11434),
  () => console.log('stub Ollama on :' + (process.env.STUB_PORT || 11434) + ' conf=' + conf));
