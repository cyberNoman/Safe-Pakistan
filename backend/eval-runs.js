// Variance harness — runs backend/eval-holdout.js THREE times in online mode
// and reports run-to-run spread for the headline metrics. Zero new deps.
// LLM decoding (temp 0.1, not 0) is non-deterministic; this quantifies it
// instead of pretending a single run is the truth.
// Run: node backend/eval-runs.js
const { spawn } = require('child_process');
const path = require('path');

const RUNS = 3;

function runOnce(n) {
  return new Promise(resolve => {
    const t0 = Date.now();
    // Heartbeat on stderr (NOT captured by the parser) keeps the event loop
    // scheduled even if the controlling terminal goes idle, and proves liveness.
    const beat = setInterval(() => {
      const mins = ((Date.now() - t0) / 60000).toFixed(1);
      console.error(`[heartbeat] RUN ${n}/${RUNS} alive at ${mins} min`);
    }, 30000);
    console.log(`\n===== RUN ${n}/${RUNS} starting (full online+offline eval; ONLINE table is collected) =====`);
    const child = spawn(process.execPath, [path.join(__dirname, 'eval-holdout.js')], {
      stdio: ['ignore', 'pipe', 'inherit'], // capture stdout, inherit stderr
    });
    let out = '';
    child.stdout.on('data', d => { out += d.toString(); });
    child.on('close', code => {
      clearInterval(beat);
      const mins = ((Date.now() - t0) / 60000).toFixed(1);
      console.log(`===== RUN ${n}/${RUNS} finished in ${mins} min (exit ${code}) =====`);
      resolve(out);
    });
  });
}

// First occurrence of each metric line = the ONLINE table (the offline
// phase prints a second, later block).
function collect(out) {
  const grab = re => { const m = out.match(re); return m ? parseFloat(m[1]) : null; };
  return {
    accuracy:       grab(/Accuracy\s*\|\s*([\d.]+)%/),
    scamRecall:     grab(/Scam recall\s*\|\s*([\d.]+)%/),
    safePrecision:  grab(/Safe precision\s*\|\s*([\d.]+)%/),
    safeFPR:        grab(/Safe FPR\s*\|\s*([\d.]+)%/),
    macroF1:        grab(/Macro F1\s*\|\s*([\d.]+)%/),
    parseFails:     grab(/L1 PARSE FAILURES:\s*(\d+)/),
  };
}

const fmt = v => (v === null ? '  —  ' : v.toFixed(1) + '%');
const pad = (s, w) => String(s).padEnd(w);

async function main() {
  const rows = [];
  for (let i = 1; i <= RUNS; i++) rows.push(collect(await runOnce(i)));

  const metrics = [
    ['Accuracy',       'accuracy'],
    ['Scam recall',    'scamRecall'],
    ['Safe precision', 'safePrecision'],
    ['Safe FPR',       'safeFPR'],
    ['Macro F1',       'macroF1'],
  ];

  console.log('\n================ VARIANCE REPORT — eval-holdout ONLINE mode =================');
  console.log(pad('METRIC', 16) + '| ' + pad('RUN 1', 8) + '| ' + pad('RUN 2', 8) + '| ' + pad('RUN 3', 8) + '| ' + pad('MIN–MAX', 14) + '| MEAN');
  console.log(pad('-', 16) + '|-' + pad('-', 8) + '|-' + pad('-', 8) + '|-' + pad('-', 8) + '|-' + pad('-', 14) + '|-----');
  for (const [label, key] of metrics) {
    const vs = rows.map(r => r[key]).filter(v => v !== null);
    const min = vs.length ? Math.min(...vs) : null;
    const max = vs.length ? Math.max(...vs) : null;
    const mean = vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null;
    const range = min === null ? '—' : `${min.toFixed(1)}–${max.toFixed(1)}%`;
    console.log(
      pad(label, 16) + '| ' + pad(fmt(rows[0][key]), 8) + '| ' + pad(fmt(rows[1][key]), 8) +
      '| ' + pad(fmt(rows[2][key]), 8) + '| ' + pad(range, 14) + '| ' + (mean === null ? '—' : mean.toFixed(1) + '%')
    );
  }
  const pf = rows.map(r => r.parseFails);
  const pfOk = pf.filter(v => v !== null);
  console.log(
    pad('L1 parse fails', 16) + '| ' + pad(pf[0] ?? '—', 8) + '| ' + pad(pf[1] ?? '—', 8) + '| ' +
    pad(pf[2] ?? '—', 8) + '| ' + pad(pfOk.length ? `${Math.min(...pfOk)}–${Math.max(...pfOk)}` : '—', 14) + '| ' +
    (pfOk.length ? (pfOk.reduce((a, b) => a + b, 0) / pfOk.length).toFixed(1) : '—')
  );
}

main();
