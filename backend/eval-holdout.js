// Hold-out evaluation: 155 UNSEEN messages (95 scam incl. 5 sender-spoofed,
// 30 suspicious, 30 safe with verified shortcodes) through the LIVE cascade
// (L0 sender prior -> L1 fine-tuned edge -> L2 qwen-max -> L3 rules), plus a
// regex baseline. Zero new dependencies. Run: node backend/eval-holdout.js
const { spawn } = require('child_process');
const path = require('path');
// L3 and the BASELINE column are provably one implementation: both call the
// same classify() from rules-classifier.js.
const { classify } = require('./rules-classifier');

// ---------------------------------------------------------------- HOLDOUT --
// 95 scam (15 categories x 6 fresh phrasings + 5 sender-spoofed)
// 30 suspicious · 30 safe (verified shortcodes + real transaction templates).
const HOLDOUT = [
  // --- SCAM: NADRA CNIC block
  { label: 'scam', text: 'NADRA: Apka CNIC block ho gaya hai. Foran 0300-1234567 par call karke verify karein warna SIM band.' },
  { label: 'scam', text: 'Your NADRA CNIC has been suspended due to duplicate record. Click nadra-verify.pk to restore.' },
  { label: 'scam', text: 'NADRA alert: CNIC verification zaroori hai. Apna OTP bhejein warna CNIC cancel.' },
  { label: 'scam', text: 'فوری خبر: آپ کا شناختی کارڈ بلاک ہے۔ بحالی کے لیے ابھی کال کریں 051-111222333' },
  { label: 'scam', text: 'NADRA notice: apke naam 3 fake SIM nikle hain. Clear karne ke liye CNIC number aur OTP share karein.' },
  { label: 'scam', text: 'CNIC expiry alert! Renewal fee Rs 500 pay karein is link par: nadra-renewal.com warna card block.' },
  // --- SCAM: bank KYC re-verify
  { label: 'scam', text: 'HBL: Your account KYC is incomplete. Update within 24 hours at hbl-kyc-update.com warna account freeze.' },
  { label: 'scam', text: 'MCB alert: re-verify your CNIC today or your account will be closed. Link: mcb-verify.net' },
  { label: 'scam', text: 'UBL important: apki KYC expire ho gayi hai. Foran link par click karke CNIC photo upload karein: ubl-kyc.pk' },
  { label: 'scam', text: 'Meezan Bank: account verification pending. OTP share karein warna funds hold.' },
  { label: 'scam', text: 'Bank Alfalah: your KYC documents rejected. Pay Rs 200 re-verification fee via this link.' },
  { label: 'scam', text: 'ABL notice: apka account suspend ho jayega agar aaj KYC update na ki. Visit ablkyc-portal.com' },
  // --- SCAM: customs parcel fee
  { label: 'scam', text: 'Pakistan Customs: apke naam parcel ruk gaya hai. Rs 2,500 customs fee pay karein delivery ke liye.' },
  { label: 'scam', text: 'Customs clearance required: pay Rs 4,999 at pk-customs.gov.pk to release your shipment.' },
  { label: 'scam', text: 'FedEx Pakistan: apka parcel customs mein hai. Fee na di to parcel return hoga. Pay link: fedex-pk-clear.com' },
  { label: 'scam', text: 'Customs notice: foreign parcel blocked. OTP bhejein aur fee transfer karein warna zabt.' },
  { label: 'scam', text: 'Your international parcel is held by customs. Transfer Rs 3,000 to release within 48 hours.' },
  { label: 'scam', text: 'Customs dept: apke parcel par fine laga hai. Foran payment karein is number par 0301-9998887.' },
  // --- SCAM: Ehsaas re-verify OTP
  { label: 'scam', text: 'Ehsaas: apki nayi qist Rs 12,000 ready hai. Confirm ke liye apna OTP 8171 par bhejein.' },
  { label: 'scam', text: 'Ehsaas program re-verification: apna CNIC aur OTP share karein warna zimmat band.' },
  { label: 'scam', text: '8171: Ehsaas grant approved. Release ke liye Rs 500 processing fee pay karein.' },
  { label: 'scam', text: 'Ehsaas alert: apka naam list se nikal jayega. Foran re-verify karein: ehsaas-reverify.pk' },
  { label: 'scam', text: 'BISP Ehsaas: nayi installment ke liye apna JazzCash OTP confirm karein abhi.' },
  { label: 'scam', text: 'Ehsaas Kafalat: apki payment stuck hai. OTP bhejein 0345-7776665 par warna zimmat cancel.' },
  // --- SCAM: FBR refund trap
  { label: 'scam', text: 'FBR: apko Rs 18,000 tax refund mila hai. Claim karne ke liye card details enter karein: fbr-refund.pk' },
  { label: 'scam', text: 'FBR refund approved. Bank account aur OTP verify karein warna refund cancel.' },
  { label: 'scam', text: 'Federal Board of Revenue: your refund of Rs 25,000 is pending. Pay Rs 300 token fee to release.' },
  { label: 'scam', text: 'FBR notice: tax refund claim expire ho raha hai. Foran link par CNIC aur account number dein.' },
  { label: 'scam', text: 'Apka FBR refund ready hai. Confirm ke liye apna bank OTP isi number par bhejein.' },
  { label: 'scam', text: 'FBR e-refund: click fbr-claim.com and enter your debit card PIN to receive Rs 15,000.' },
  // --- SCAM: fake job offer fee
  { label: 'scam', text: 'Congrats! Aap Army welfare job ke liye select ho gaye hain. Rs 5,000 registration fee pay karein.' },
  { label: 'scam', text: 'Dubai job offer: visa ready. Rs 25,000 processing fee transfer karein aaj shaam tak.' },
  { label: 'scam', text: 'You are hired! Government job confirmation ke liye Rs 8,000 fee jama karein is account mein.' },
  { label: 'scam', text: 'Naya Pakistan job scheme: apni slot confirm karne ke liye foran fee bhejein warna offer cancel.' },
  { label: 'scam', text: 'Overseas employment: apka file approve ho gaya. Fee Rs 15,000 pay karein warna naam kat jayega.' },
  { label: 'scam', text: 'Job interview pass! Laptop aur training ke liye Rs 3,500 security deposit transfer karein.' },
  // --- SCAM: crypto doubling
  { label: 'scam', text: 'Crypto offer: Rs 10,000 bhejein, 24 ghante mein Rs 20,000 wapas. Guaranteed double.' },
  { label: 'scam', text: 'Bitcoin doubling scheme: send any amount, receive double in 2 hours. Limited slots.' },
  { label: 'scam', text: 'Apka crypto wallet selected hai. Rs 5,000 invest karein, kal Rs 10,000 milega. 100% guarantee.' },
  { label: 'scam', text: 'USDT double bonus: transfer now and get 2x back tonight. Sirf aaj ke liye.' },
  { label: 'scam', text: 'Crypto expert: main apke Rs 20,000 ko Rs 100,000 bana sakta hoon. Pehle fee bhejein.' },
  { label: 'scam', text: 'Double your money! Send Rs 15,000 to this Binance ID and withdraw Rs 30,000 tomorrow.' },
  // --- SCAM: embassy visa lottery
  { label: 'scam', text: 'US Embassy: aap green card lottery mein jeet gaye hain. Rs 40,000 visa fee pay karein.' },
  { label: 'scam', text: 'UK visa lottery winner! Processing fee Rs 30,000 transfer karein warna seat cancel.' },
  { label: 'scam', text: 'Canada immigration: apki PR file approve. Fee bhejein warna naam list se nikal jayega.' },
  { label: 'scam', text: 'Congratulations! You won the Dubai visa lottery. Pay AED 500 processing fee via link.' },
  { label: 'scam', text: 'Australia lottery visa: apka naam shortlist hua hai. Foran Rs 25,000 bhejein.' },
  { label: 'scam', text: 'Embassy notice: lottery visa expire ho raha hai. OTP aur fee share karein abhi.' },
  // --- SCAM: fake PTA block notice
  { label: 'scam', text: 'PTA: apka SIM illegal activity ki wajah se band ho jayega. Verify karein: pta-verify.pk' },
  { label: 'scam', text: 'PTA notice: apke number par fine Rs 10,000 hai. Pay karein warna SIM block.' },
  { label: 'scam', text: 'Your SIM will be blocked in 2 hours by PTA. Re-verify CNIC at pta-sim-check.com' },
  { label: 'scam', text: 'PTA alert: apka number fraud mein use hua hai. Clear karne ke liye OTP bhejein.' },
  { label: 'scam', text: 'SIM band hone se bachne ke liye PTA fee Rs 500 abhi pay karein.' },
  { label: 'scam', text: 'PTA: illegal call detected. SIM restore karne ke liye is number par CNIC code bhejein.' },
  // --- SCAM: fake NADRA verification fee
  { label: 'scam', text: 'NADRA verification agent: ghar baithe CNIC verify karwayen. Service fee Rs 1,500 + OTP.' },
  { label: 'scam', text: 'NADRA e-verify: apki family details confirm karein. Link par CNIC scan upload karein.' },
  { label: 'scam', text: 'Apka NADRA record update zaroori hai. Rs 700 fee pay karein warna record freeze.' },
  { label: 'scam', text: 'NADRA helpline: CNIC verification ke liye apna secret code share karein.' },
  { label: 'scam', text: 'NADRA: apke CNIC par 5 SIM hain. Sirf 2 rakhni hain to OTP bhejein warna sab band.' },
  { label: 'scam', text: 'Online NADRA token: verification slot ke liye Rs 300 advance bhejein.' },
  // --- SCAM: fake banking court warrant
  { label: 'scam', text: 'Court notice: apke khilaf bank recovery warrant issue hua hai. Settle karne ke liye Rs 50,000 bhejein.' },
  { label: 'scam', text: 'Your bank loan case: arrest warrant issued. Avoid by paying Rs 30,000 today via link.' },
  { label: 'scam', text: 'Adalat ka notice: apka account court order se freeze hoga. Verify OTP warna case darj.' },
  { label: 'scam', text: 'Bank legal cell: apke naam warrant nikla hai. Rs 20,000 settlement fee foran transfer karein.' },
  { label: 'scam', text: 'Court order: apki property attach hogi. Bachne ke liye is account mein payment karein.' },
  { label: 'scam', text: 'Recovery warrant against your CNIC. Pay Rs 15,000 penalty now to close the case.' },
  // --- SCAM: JazzCash agent fraud
  { label: 'scam', text: 'JazzCash agent: apka account upgrade karwa deta hoon. Rs 500 fee aur OTP bhejein.' },
  { label: 'scam', text: 'JazzCash helpline (agent): apki KYC main kar deta hoon. Apna code 8171 par forward karein.' },
  { label: 'scam', text: 'Agent service: JazzCash limit barhane ke liye Rs 1,000 + OTP chahiye. Aaj ka offer.' },
  { label: 'scam', text: 'JazzCash customer care agent: apka wallet block hai. Khulwane ke liye PIN share karein.' },
  { label: 'scam', text: 'Main JazzCash agent hoon. Apka cashback release karne ke liye OTP bhejein.' },
  { label: 'scam', text: 'JazzCash upgrade offer: agent fee Rs 300 bhejein, account instant verify ho jayega.' },
  // --- SCAM: fake Easypaisa merchant refund
  { label: 'scam', text: 'Easypaisa merchant: apki ghalat payment wapas karne ke liye apka OTP chahiye.' },
  { label: 'scam', text: 'Easypaisa refund: Rs 4,000 wapas chahiye to apna login code share karein.' },
  { label: 'scam', text: 'Merchant support: apki transaction reverse karne ke liye PIN aur OTP bhejein.' },
  { label: 'scam', text: 'Easypaisa refund desk: apki double katot wapas hogi. Verify link par card details dein.' },
  { label: 'scam', text: 'Apki Easypaisa payment fail thi. Refund ke liye agent ko OTP forward karein.' },
  { label: 'scam', text: 'Easypaisa merchant care: refund process ke liye Rs 200 fee aur OTP zaroori hai.' },
  // --- SCAM: fake SBP directive
  { label: 'scam', text: 'SBP order: apke sab bank accounts verify honge. OTP bhejein warna freeze.' },
  { label: 'scam', text: 'State Bank directive: apka account suspicious hai. Clear karne ke liye Rs 10,000 deposit karein.' },
  { label: 'scam', text: 'SBP notice: new rule ke mutabiq apka CNIC aur OTP update karein aaj.' },
  { label: 'scam', text: 'State Bank of Pakistan: apke naam fake account khula hai. Band karne ke liye PIN share karein.' },
  { label: 'scam', text: 'SBP compliance: apki transaction hold hai. Release ke liye verification fee Rs 500.' },
  { label: 'scam', text: 'SBP alert: apka account report hua hai. Bachne ke liye foran is link par login karein.' },
  // --- SCAM: fake Benazir re-registration
  { label: 'scam', text: 'Benazir program: apka naam nikal gaya hai. Dobara register karne ke liye OTP 8171 par bhejein.' },
  { label: 'scam', text: 'BISP re-registration: Rs 300 fee pay karein warna apki qist hamesha ke liye band.' },
  { label: 'scam', text: 'Benazir Income Support: nayi list mein naam lane ke liye agent ko OTP dein.' },
  { label: 'scam', text: 'BISP survey: apki re-verification ke liye CNIC photo aur OTP share karein.' },
  { label: 'scam', text: 'Benazir card renew: Rs 200 fee bhejein warna apka card block ho jayega.' },
  { label: 'scam', text: 'BISP 8171: apki eligibility khatam. Bahal karne ke liye foran fee aur OTP bhejein.' },
  // --- SCAM: sender-spoofed (whitelisted shortcode + anomalous body => L0 impersonation)
  { label: 'scam', sender: '8171', text: 'Ehsaas prize Rs 25,000 mila hai! Claim ke liye apna OTP isi number par bhejein aur Rs 500 fee pay karein.' },
  { label: 'scam', sender: '4444', text: 'JazzCash security alert: apka account verify karna zaroori hai. Click here to verify JazzCash: jazzcash-verify.com' },
  { label: 'scam', sender: '3737', text: 'Easypaisa: apka account block hai. Reactivate karne ke liye apna OTP send karein.' },
  { label: 'scam', sender: '8257', text: 'UBL: suspicious activity detected. Account secure karne ke liye foran login karein: ubl-secure.com' },
  { label: 'scam', sender: '345', text: 'Telenor: aap ne prize jeet liya hai! Rs 10,000 claim ke liye Rs 500 fee abhi bhejein.' },
  // --- SUSPICIOUS: ambiguous, no clear ask
  { label: 'suspicious', text: 'Apko hamari taraf se special offer mila hai. Details ke liye link dekhein: bit.ly/3xKp' },
  { label: 'suspicious', text: 'Congratulations! Aap selected ho sakte hain. Mazeed maloomat ke liye reply karein.' },
  { label: 'suspicious', text: 'Assalam o alaikum, kya aap ne meri request dekhi? Zaroori kaam tha.' },
  { label: 'suspicious', text: 'Unknown number: aap ka document ready hai. Link par check karein.' },
  { label: 'suspicious', text: 'Aap ko yaad dilaya ja raha hai ke apki request under process hai.' },
  { label: 'suspicious', text: 'Hamari nayi scheme mein apka naam shamil ho sakta hai. Rabta karein.' },
  { label: 'suspicious', text: 'Your package update: status changed. View at shortlink.pk/ab12' },
  { label: 'suspicious', text: 'Salam, main apke purane number se rabta kar raha hoon. Pehchan liya?' },
  { label: 'suspicious', text: 'Apka account review mein hai. Jald update milega.' },
  { label: 'suspicious', text: 'Aaj ka special: sirf selected customers ke liye. Mazeed ke liye site visit karein.' },
  { label: 'suspicious', text: 'Reminder: apki application mil gayi hai. Agla step jald bataya jayega.' },
  { label: 'suspicious', text: 'Khushkhabri ho sakti hai! Apka naam shortlist mein hai. Confirm ke liye call karein.' },
  { label: 'suspicious', text: 'New message from unknown sender: apki file branch mein hai. Visit karein.' },
  { label: 'suspicious', text: 'Apko refer kiya gaya hai. Details ke liye is number par rabta karein.' },
  { label: 'suspicious', text: 'Your request has been received. Further action may be required.' },
  { label: 'suspicious', text: 'Salam, apka kaam ho gaya hai. Receipt link par hai: tinyurl.com/x9' },
  { label: 'suspicious', text: 'Apka survey complete ho sakta hai. Reward ki tafseel jald.' },
  { label: 'suspicious', text: 'Notice: apki membership renew ho sakti hai. Sharait dekhein.' },
  { label: 'suspicious', text: 'Aap hamare winner ho sakte hain. Terms apply.' },
  { label: 'suspicious', text: 'Apka form jama ho gaya hai. Verification ka intezar karein.' },
  { label: 'suspicious', text: 'Hello, is this the same number? I have an important proposal.' },
  { label: 'suspicious', text: 'Apka account upgrade ke liye eligible ho sakta hai.' },
  { label: 'suspicious', text: 'Special invitation: apko event mein shirkat ki darkhwast hai.' },
  { label: 'suspicious', text: 'Your submission is under review. Results will be announced.' },
  { label: 'suspicious', text: 'Salam, apka message parha. Kal tak jawab milega.' },
  { label: 'suspicious', text: 'Apka naam list mein aa sakta hai. Update ke liye page dekhein.' },
  { label: 'suspicious', text: 'Reminder: apki appointment confirm honi baqi hai.' },
  { label: 'suspicious', text: 'Apko ek naya offer bheja gaya hai. Kholne ke liye app dekhein.' },
  { label: 'suspicious', text: 'Your profile was viewed. Connect back for details.' },
  { label: 'suspicious', text: 'Apki request par kaam shuru ho gaya hai. Mazeed info jald.' },
  // --- SAFE: legit alerts carrying trigger words on purpose; every entry has
  // a verified shortcode sender + a real transaction template body (L0 path).
  { label: 'safe', sender: '4444', text: 'Rs 2,500 received from 0300-1234567. New balance Rs 12,450.' },
  { label: 'safe', sender: '4444', text: 'Rs 5,000 sent to 0345-6667778. Fee Rs 0. Balance updated.' },
  { label: 'safe', sender: '4444', text: 'Payment success: Rs 1,850 bill paid to K-Electric. New balance Rs 340.' },
  { label: 'safe', sender: '4444', text: 'Your account statement is ready. View it in the JazzCash app.' },
  { label: 'safe', sender: '4444', text: 'Your OTP is 482913. Do not share it with anyone. You requested this code.' },
  { label: 'safe', sender: '4444', text: 'Rs 120 cashback added for your last payment. New balance Rs 890.' },
  { label: 'safe', sender: '3737', text: 'Rs 1,000 received from 0345-8887776. New balance Rs 5,610.' },
  { label: 'safe', sender: '3737', text: 'Salary credited: Rs 45,000. Available balance Rs 48,200.' },
  { label: 'safe', sender: '3737', text: 'Payment success: Rs 2,300 to Islamabad Electric. Receipt saved.' },
  { label: 'safe', sender: '3737', text: 'Your login OTP is 771204. Never share it. You requested this login.' },
  { label: 'safe', sender: '3737', text: 'Rs 850 received from 0333-1212121. Balance updated to Rs 2,400.' },
  { label: 'safe', sender: '3737', text: 'Your requested PIN reset is complete. Set a new PIN in the app.' },
  { label: 'safe', sender: '345', text: 'Recharge successful: Rs 500. Weekly 15GB bundle subscribed.' },
  { label: 'safe', sender: '345', text: 'Load successful. Rs 300 added. New balance Rs 315.' },
  { label: 'safe', sender: '345', text: 'Rs 100 received from 0345-1112223. New balance Rs 410.' },
  { label: 'safe', sender: '345', text: 'Payment success: SNGPL bill paid Rs 3,240. Thank you.' },
  { label: 'safe', sender: '345', text: 'Your bundle expires tomorrow. Recharge to keep using it.' },
  { label: 'safe', sender: '345', text: 'Your OTP is 339921. Do not share it with anyone.' },
  { label: 'safe', sender: '111', text: 'Recharge successful: Rs 1,000. Monthly package activated.' },
  { label: 'safe', sender: '111', text: 'Rs 500 received from 0301-9876543. New balance Rs 720.' },
  { label: 'safe', sender: '111', text: 'Bill paid: Rs 2,100 to PTCL. Payment success.' },
  { label: 'safe', sender: '111', text: 'Your number will move to biometric verification at the nearest franchise.' },
  { label: 'safe', sender: '111', text: 'Your OTP is 808077. Keep secret. You requested it.' },
  { label: 'safe', sender: '111', text: 'Load successful. Rs 200 added. Balance updated.' },
  { label: 'safe', sender: '8257', text: 'Your e-statement for August is ready. View it in the UBL app.' },
  { label: 'safe', sender: '8257', text: 'ATM withdrawal Rs 10,000. New balance Rs 92,340.' },
  { label: 'safe', sender: '8257', text: 'Salary credited Rs 85,000. Available balance Rs 120,400.' },
  { label: 'safe', sender: '8257', text: 'Your debit card expires next month. Request renewal in the app.' },
  { label: 'safe', sender: '8257', text: 'Bill payment of Rs 4,200 to K-Electric successful. Receipt saved.' },
  { label: 'safe', sender: '8257', text: 'Your OTP for funds transfer is 771204. Never share it. Valid 5 minutes.' },
];

// ------------------------------------------------------------- INFERENCE --
async function waitReady(port) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + port + '/family/pair', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      });
      if (r.ok) return true;
    } catch (e) { /* not up yet */ }
    await new Promise(s => setTimeout(s, 500));
  }
  return false;
}

async function cascadePredict(entry, port) {
  const controller = new AbortController();
  // L1 (25s cap) + possible L2 (~10s) + network headroom.
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    const body = { text: entry.text };
    if (entry.sender) body.sender = entry.sender;
    const r = await fetch('http://127.0.0.1:' + port + '/analyze/text', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: controller.signal,
    });
    if (!r.ok) return { verdict: 'error', model_used: '' };
    const j = await r.json();
    return { verdict: j.verdict || 'error', model_used: j.model_used || '' };
  } catch (e) { return { verdict: 'error', model_used: '' }; }
  finally { clearTimeout(timer); }
}

// Baseline = the SAME classify() the backend uses as its L3 floor.
const baselinePredict = text => classify(text).verdict;

// GUARDRAIL A — the two demo presets must classify correctly before any
// 155-message run is trusted.
const PROBE_SCAM = 'Mubarak ho! Apko 25,000 mile hain. OTP bhejein foran warna account band ho jayega.';
const PROBE_SAFE = 'Your JazzCash statement for August shows a credit of Rs 5,000. No action required.';

function guardrailA() {
  console.log('\nGUARDRAIL A — classify() probes on the two demo presets');
  const scam = classify(PROBE_SCAM);
  const safe = classify(PROBE_SAFE);
  console.log('demo scam SMS (25,000 OTP)   -> ' + JSON.stringify(scam));
  console.log('demo JazzCash Rs-received    -> ' + JSON.stringify(safe));
  if (scam.verdict !== 'scam') throw new Error('GUARDRAIL A FAILED: demo scam preset must return scam');
  if (safe.verdict !== 'safe') throw new Error('GUARDRAIL A FAILED: demo safe preset must return safe');
  console.log('GUARDRAIL A PASS');
}

// --------------------------------------------------------------- METRICS --
const CLASSES = ['scam', 'suspicious', 'safe'];

function compute(truth, pred) {
  let correct = 0;
  const per = {};
  CLASSES.forEach(c => { per[c] = { tp: 0, fp: 0, fn: 0 }; });
  truth.forEach((t, i) => {
    const p = pred[i];
    if (p === t) correct++;
    CLASSES.forEach(c => {
      if (p === c && t === c) per[c].tp++;
      if (p === c && t !== c) per[c].fp++;
      if (p !== c && t === c) per[c].fn++;
    });
  });
  const rows = {};
  let f1sum = 0;
  CLASSES.forEach(c => {
    const { tp, fp, fn } = per[c];
    const p = tp + fp ? tp / (tp + fp) : 0;
    const r = tp + fn ? tp / (tp + fn) : 0;
    const f1 = p + r ? (2 * p * r) / (p + r) : 0;
    rows[c] = { p, r, f1 };
    f1sum += f1;
  });
  const safeN = truth.filter(t => t === 'safe').length;
  const safeAsScam = truth.filter((t, i) => t === 'safe' && pred[i] === 'scam').length;
  return {
    acc: correct / truth.length,
    rows,
    macroF1: f1sum / CLASSES.length,
    safeFpr: safeN ? safeAsScam / safeN : 0,
  };
}

const pct = x => (100 * x).toFixed(1) + '%';
const cell = (s, w) => String(s).padEnd(w);

// ------------------------------------------------------------------ MAIN --
// mode: 'online' = full cascade (L0->L1->L2->L3)
//       'offline' = L2 disabled via env (cascade = L0+L1+L3)
async function runEval(mode, port) {
  const env = mode === 'offline'
    ? { ...process.env, PORT: String(port), QWEN_BASE_URL: 'disabled', QWEN_API_KEY: 'disabled' }
    : { ...process.env, PORT: String(port) };
  const server = spawn(process.execPath, [path.join(__dirname, 'index.js')], {
    env, stdio: ['ignore', 'pipe', 'inherit'],
  });
  let serverLog = '';
  server.stdout.on('data', d => { serverLog += d.toString(); });

  try {
    if (!(await waitReady(port))) throw new Error('backend did not come up on port ' + port);
    // Let the startup warm-up scan finish ahead of the eval flood.
    await new Promise(s => setTimeout(s, 4000));
    console.log('backend ready on :' + port + ' — running cascade inference...');

    const preds = []; const usedBy = [];
    for (let i = 0; i < HOLDOUT.length; i++) {
      const r = await cascadePredict(HOLDOUT[i], port);
      preds.push(r.verdict);
      usedBy.push(r.model_used || 'NONE');
      if ((i + 1) % 10 === 0) process.stdout.write(' ' + (i + 1) + '/' + HOLDOUT.length + '\n');
      else process.stdout.write('.');
    }
    return { preds, usedBy, log: serverLog };
  } finally {
    server.kill();
  }
}

function printResults(label, truth, res) {
  const verifiedSafe = (res.log.match(/\[L0\] verified_safe/g) || []).length;
  const verifiedOtp = (res.log.match(/\[L0\] verified_otp/g) || []).length;
  const imperson = (res.log.match(/\[L0\] impersonation/g) || []).length;
  const unmatched = (res.log.match(/\[L0\] unmatched/g) || []).length;
  const parseFails = (res.log.match(/\[L1-parse-fail\]/g) || []).length;

  console.log('\nL0 VERIFIED_SAFE: ' + verifiedSafe);
  console.log('L0 VERIFIED_OTP: ' + verifiedOtp);
  console.log('L0 IMPERSONATION_FORCED_L2: ' + imperson);
  console.log('L0 SKIPPED: ' + (HOLDOUT.length - verifiedSafe - verifiedOtp - imperson));
  console.log('   (includes ' + unmatched + ' whitelisted-but-unmatched, counted as skipped)');
  console.log('L1 PARSE FAILURES: ' + parseFails);

  // Per-layer attribution: predictions / correct / accuracy.
  console.log('\n' + label + ' per-layer attribution');
  console.log(cell('LAYER', 12) + '| ' + cell('PREDICTIONS', 12) + '| ' + cell('CORRECT', 8) + '| ACCURACY');
  console.log('------------|--------------|----------|---------');
  ['L0_VERIFIED', 'FT_MODEL', 'QWEN_MAX', 'RULES'].forEach(layer => {
    const idx = res.usedBy.map((u, i) => u === layer ? i : -1).filter(i => i >= 0);
    const correct = idx.filter(i => res.preds[i] === truth[i]).length;
    const acc = idx.length ? (100 * correct / idx.length).toFixed(1) + '%' : '—';
    console.log(cell(layer, 12) + '| ' + cell(idx.length, 12) + '| ' + cell(correct, 8) + '| ' + acc);
  });
  const errs = res.preds.filter(p => p === 'error').length;
  if (errs) console.log('network errors (counted as wrong): ' + errs);

  const M = compute(truth, res.preds);
  const B = compute(truth, HOLDOUT.map(h => baselinePredict(h.text)));
  console.log('\n' + cell('METRIC', 16) + '| ' + cell('MODEL', 8) + '| BASELINE');
  console.log('----------------|---------|---------');
  console.log(cell('Accuracy', 16) + '| ' + cell(pct(M.acc), 8) + '| ' + pct(B.acc));
  console.log(cell('Scam recall', 16) + '| ' + cell(pct(M.rows.scam.r), 8) + '| ' + pct(B.rows.scam.r));
  console.log(cell('Safe precision', 16) + '| ' + cell(pct(M.rows.safe.p), 8) + '| ' + pct(B.rows.safe.p));
  console.log(cell('Safe FPR', 16) + '| ' + cell(pct(M.safeFpr), 8) + '| ' + pct(B.safeFpr) + '   <-- KEY NUMBER');
  console.log(cell('Macro F1', 16) + '| ' + cell(pct(M.macroF1), 8) + '| ' + pct(B.macroF1));
}

(async () => {
  const offline = process.argv.includes('--offline');
  const truth = HOLDOUT.map(h => h.label);
  console.log('HOLDOUT EVAL — ' + HOLDOUT.length + ' unseen messages' +
    (offline ? ' — OFFLINE mode (L2 disabled, cascade = L0+L1+L3)' : ' — ONLINE mode (full cascade L0->L1->L2->L3)'));
  console.log('class mix: scam=' + truth.filter(t => t === 'scam').length +
    ' suspicious=' + truth.filter(t => t === 'suspicious').length +
    ' safe=' + truth.filter(t => t === 'safe').length);

  guardrailA();

  if (offline) {
    const res = await runEval('offline', 3020);
    console.log('\ncascade done. computing tables...');
    printResults('OFFLINE', truth, res);
  } else {
    const on = await runEval('online', 3020);
    console.log('\nonline cascade done. computing tables...');
    printResults('ONLINE', truth, on);

    const off = await runEval('offline', 3021);
    console.log('\noffline cascade done. computing tables...');
    printResults('OFFLINE', truth, off);
  }
})().catch(e => { console.error('EVAL FAIL:', e.message); process.exit(1); });
