// Self-cleaning cascade verification harness.
// Spawns backend children against: (1) the real Ollama hifazat-edge model,
// (2) a low-confidence stub (gate must escalate to L2 Qwen), (3) a dead L1
// endpoint (fall-through to L2), (4) full blackout — L1 dead AND L2 disabled
// (must land on L3 rules). Run: node backend/verify-cascade.js
const { spawn } = require('child_process');
const path = require('path');

const PRESET = 'Mubarak ho! Apko 25,000 mile hain. OTP bhejein foran warna account band ho jayega.';
const wait = ms => new Promise(r => setTimeout(r, ms));

async function analyze(port) {
  const res = await fetch('http://localhost:' + port + '/analyze/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: PRESET }),
  });
  return res.json();
}

async function scenario(name, env, expect) {
  const child = spawn(process.execPath, [path.join(__dirname, 'index.js')],
    { env: { ...process.env, ...env }, stdio: 'ignore' });
  // 6s: the backend fires a startup warm-up; Ollama serializes requests, so
  // the scan must go out after the warm-up has finished or it queues behind it.
  await wait(6000);
  let j;
  try { j = await analyze(env.PORT); } catch (e) { j = { error: e.message }; }
  const pass = j.model_used === expect && j.verdict === 'scam';
  console.log((pass ? 'PASS' : 'FAIL') + ' | ' + name + ' | model_used=' + j.model_used +
    ' verdict=' + j.verdict + ' score=' + j.score + ' conf=' + j.confidence);
  if (!pass) console.log(JSON.stringify(j, null, 2));
  child.kill();
}

(async () => {
  const stub = spawn(process.execPath, [path.join(__dirname, 'stub-ollama.js')],
    { env: { ...process.env, STUB_PORT: '11499', STUB_CONF: '50' }, stdio: 'ignore' });
  await wait(500);
  await scenario('real Ollama hifazat-edge', { PORT: '3002', FT_BASE_URL: 'http://127.0.0.1:11434/v1' }, 'FT_MODEL');
  await scenario('gate: conf 50 escalates to L2', { PORT: '3001', FT_BASE_URL: 'http://localhost:11499/v1' }, 'QWEN_MAX');
  await scenario('L1 down: falls to L2', { PORT: '3003', FT_BASE_URL: 'http://127.0.0.1:11999/v1' }, 'QWEN_MAX');
  // Full blackout: dead L1 + unparseable L2 URL => on-device rules floor.
  await scenario('blackout: L3 RULES floor', { PORT: '3004', FT_BASE_URL: 'http://127.0.0.1:11999/v1',
    QWEN_BASE_URL: 'disabled', QWEN_API_KEY: 'disabled' }, 'RULES');
  stub.kill();
  process.exit(0);
})().catch(e => { console.error('HARNESS FAIL:', e.message); process.exit(1); });
