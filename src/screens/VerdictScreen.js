/**
 * VerdictScreen — handles SCAM, SUSPICIOUS and SAFE verdicts via `verdict` prop.
 * Uses Reanimated entrance for the danger band + ring fill.
 * Fits one 390×844 viewport: band + details scroll, action sheet pinned in flow.
 *
 * Demo behaviors (hackathon):
 *  - Urdu voice narration speaks the verdict after the reveal (expo-speech).
 *  - Scam verdicts auto-fire the Family Shield guardian alert sheet.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet, StatusBar, Share } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withRepeat, withSequence, withTiming, FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, MOTION, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import ThreatRing from '@/components/ThreatRing';
import { ScamTypeChip } from '@/components/Indicators';
import { BottomSheet } from '@/components/Overlays';
import { Avatar, EmptyState } from '@/components/Cards';
import { sendFamilyAlert } from '@/services/api';
import { LocalDBService, savedEstimateFor } from '@/services/LocalDBService';
import { useLanguageContext } from '@/context/LanguageContext';
// ScamTypeChip is available for the Library/Screenshot screens; the scam verdict
// deliberately uses only the evidence chips to keep the card inside one screen.

// Avatar colours cycle through brand tokens only (no hardcoded hex).
const PALETTE = [COLORS.primary, COLORS.accentDk, COLORS.warning, COLORS.primaryLt, COLORS.accent];

// Awaz (TTS) honesty strings. A silent button on stage must say WHY out loud,
// and point at the exact system setting — never pretend audio is playing.
const TOAST_NO_ENGINE = 'Awaz engine phone par nahi — Settings → Text-to-speech';
const TOAST_SPEAK_FAIL = 'Awaz nahi chali — Settings → Language & input → Text-to-speech';
const TOAST_VOLUME = 'Phone ka MEDIA volume up karein';
// Watchdog: some engines fire no onDone/onError/onStopped at all. The button
// must never pulse forever, so 10s of silence stops the audio and reverts UI.
const SPEAK_TIMEOUT_MS = 10000;
// The scanned message quoted inside a family alert, capped for SMS sanity.
const ALERT_TEXT_CAP = 140;
// NCCIA online complaint portal — used in the report body and as a fallback
// action when the mailto link cannot open (no email app installed).
const NCCIA_PORTAL_URL = 'https://complaint.nccia.gov.pk';

// ── Family-alert deep-link helpers (pure, zero backend) ──
// Normalize a Pakistani number to intl form for wa.me / sms: (03XX… → 923XX…).
function toIntl(raw) {
  let n = String(raw || '').replace(/\D/g, '');
  if (n.startsWith('0092')) n = '92' + n.slice(4);
  else if (n.startsWith('0')) n = '92' + n.slice(1);
  else if (n && !n.startsWith('92')) n = '92' + n;
  return n;
}
// The alert body sent verbatim over SMS / WhatsApp and inside the push relay.
// The SCANNER is the victim: a guardian must see WHO got the message and read
// the message itself — an elder forwarding a bare warning with no context is how
// scams still land. `name` is this phone's stored profile name ('' ⇒ "Ghar wale").
// `lang`: 'en' → English payload, anything else → Roman Urdu (the demo default).
function buildAlertMessage({ name = '', score = 0, text = '', lang = 'ru' } = {}) {
  const victim = String(name || '').trim();
  const risk = Number(score) || 0;
  const quote = String(text || '').replace(/\s+/g, ' ').trim().slice(0, ALERT_TEXT_CAP);
  // EN branch: spec-exact — deliberately omits the message quote (privacy).
  // Roman Urdu branch carries the quote so the guardian sees the actual message.
  if (lang === 'en') {
    return victim
      ? `HIFAZAT ALERT: ${victim} received this message — SCAM (Risk ${risk}/100). Stop ${victim} sending OTP/money. Call them now.`
      : `HIFAZAT ALERT: A family member received this message — SCAM (Risk ${risk}/100). Stop them sending OTP/money. Call them now.`;
  }
  const got = victim ? `${victim} ko yeh message mila hai` : 'Ghar wale ko yeh message mila hai';
  const stop = victim ? `${victim} ko OTP/paisa bhejne se rokein.` : 'Un ko OTP/paisa bhejne se rokein.';
  const body = quote ? ` Message: '${quote}'.` : '';
  return `HIFAZAT ALERT: ${got} — SCAM (Risk ${risk}/100).${body} ${stop} Unhein foran call karein.`;
}

// ── Amount extraction (pure, no backend) — exported for LoadingScreen ──
// A scam SMS almost always quotes a rupee figure, and that figure — not a
// guess — is what "bachaya" reports. Eastern Arabic digits (۰-۹) are normalized
// first because \d does not match them (same trick as ChatScreen's number check).
// FIRST match wins, in this order: currency-anchored → comma-grouped → k-suffix.
// Deliberately blind to phone numbers (03xx / 923xx), CNICs and bare shortcodes
// (8171 / 4444 / 3737): none of those carry an Rs anchor, comma grouping or a
// "k", so calling one an amount would invent a loss nobody ever quoted.
export function extractAmount(text) {
  const t = String(text || '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const value = (raw, kilo) => {
    const n = parseFloat(String(raw).replace(/,/g, ''));
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.round(kilo ? n * 1000 : n);
  };
  // (a) currency-anchored — "Rs 5,000", "Rs.25000", "PKR 1,25,000", "روپے 25000"
  // \b on the Latin branch prevents "members" matching trailing "rs";
  // Urdu branch needs no \b (JS \b is ASCII-only and "روپے" is always standalone).
  // k\b prevents "ko/ka/ki" from being swallowed as a kilo suffix.
  const cur = t.match(/(?:\b(?:Rs\.?|PKR)|روپے)\s*(\d[\d,]*(?:\.\d+)?)\s*(k\b)?/i);
  if (cur) {
    const amt = value(cur[1], cur[2]);
    if (amt) return { amount: amt, found: true };
  }
  // (b) comma-grouped thousands — "25,000", "1,25,000" (lakh grouping)
  const groups = t.match(/\d{1,3}(?:,\d{2,3})+/g);
  if (groups) {
    for (const g of groups) {
      const amt = value(g);
      if (amt) return { amount: amt, found: true };
    }
  }
  // (c) k-suffix — "10k" = 10000, "1.5k" = 1500 ("km" cannot match: \b after k)
  const kilo = t.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  if (kilo) {
    const amt = value(kilo[1], true);
    if (amt) return { amount: amt, found: true };
  }
  return { amount: 0, found: false };
}

// ── Sender extraction (pure, no backend) ──
// ScanScreen captures only the message body, so a sender exists only if the user
// pasted one. We never guess: a bare 4-5 digit number mid-sentence is far more
// often an amount ("Rs 25000") than a shortcode, and naming it in an NCCIA
// complaint would be a fabricated accusation. Empty string ⇒ the UI says so.
function extractSender(text) {
  const t = String(text || '').trim();
  // Pakistani mobile — unambiguous anywhere in the text. Tolerates the spaced
  // forms people paste ("+92 300 1234567", "0300-123 4567"); amounts never match
  // because the 03…/923… prefix is required.
  const mobile = t.match(/(?:\+?92[\s-]?|0)3\d{2}[\s-]?\d{3}[\s-]?\d{4}/);
  if (mobile) return mobile[0].replace(/\D/g, '');
  // Shortcode only when the paste STARTS with it ("8171: …"), i.e. a real SMS header.
  const head = t.match(/^(\d{4,5})\s*[:|-]\s*/);
  if (head) return head[1];
  return '';
}

// ── NCCIA complaint report (shared by the mailto link and the share sheet) ──
function buildNcciaReport({ sender, messageText, score, redFlags }) {
  const senderLine = sender || 'Not present in pasted message (sender hidden by SMS app)';
  const flags = Array.isArray(redFlags) && redFlags.length ? redFlags.join(', ') : 'None extracted';
  const subject = `Hifazat Scam Complaint — ${sender || 'Unknown sender'}`;
  const body =
`TO: National Cyber Crime Investigation Agency (NCCIA)
Date: ${new Date().toLocaleString()}

COMPLAINT DETAILS:
Suspected Fraudulent SMS Received
Sender: ${senderLine}
Message: "${messageText}"

HIFAZAT APP AI ANALYSIS:
Verdict: SCAM (Risk Score: ${score}/100)
Red Flags: ${flags}
Technical Detection: Layer 0 (Sender) + Layer 1 (hifazat-edge) + Layer 2 (Qwen-Max)

VICTIM CONTEXT:
Vulnerable Target: Elderly family member
Language: Urdu/Roman Urdu

ACTION REQUESTED:
Please investigate sender for financial fraud and targeting vulnerable populations.

Online Portal: ${NCCIA_PORTAL_URL} | Helpline: 1799

App Version: Hifazat v1.0 | Model Card: huggingface.co/Noman33/hifazat-edge`;
  return { subject, body };
}

export default function VerdictScreen({ route, navigation }) {
  const verdict = route?.params?.verdict ?? 'scam'; // 'scam' | 'suspicious' | 'safe'
  const score   = route?.params?.score   ?? (verdict === 'scam' ? 96 : 12);
  const confidence = route?.params?.confidence ?? (verdict === 'scam' ? 95 : 99);
  const type    = route?.params?.type ?? (verdict === 'scam' ? 'BISP 8171 Fraud' : 'JazzCash Official');
  const redFlags = route?.params?.redFlags ?? ['OTP', 'foran', 'account band'];
  const explanationRoman = route?.params?.explanation_roman_ur ?? '';
  const explanationUrdu  = route?.params?.explanation_urdu ?? '';
  const messageText      = route?.params?.messageText ?? '';
  const senderNumber     = extractSender(messageText);
  const insets = useSafeAreaInsets();
  // 'en' | 'ur' | 'ru' — the hook returns {} outside its provider, so default to
  // Roman Urdu (the demo default) rather than crashing on a missing language.
  const { language = 'ru' } = useLanguageContext() || {};
  const alertLang = language === 'en' ? 'en' : 'ru';

  // Money saved: the rupee figure the message itself quotes. When it quotes
  // none, the per-type estimate stands in and the card says "ESTIMATED" openly.
  const saved = useMemo(() => {
    const hit = extractAmount(messageText);
    return hit.found
      ? { amount: hit.amount, estimated: false }
      : { amount: savedEstimateFor(type), estimated: true };
  }, [messageText, type]);

  const isScam = verdict === 'scam';
  const isSusp = verdict === 'suspicious';
  const gradient = isScam ? gradients.danger : isSusp ? gradients.warn : gradients.safe;
  const [alertVisible, setAlertVisible] = useState(false);
  const [members, setMembers] = useState([]);
  const [familyCode, setFamilyCode] = useState('');
  const [pushState, setPushState] = useState({});  // { [id]: 'sending'|'sent'|'fail' }
  const [smsHot, setSmsHot] = useState({});         // { [id]: true } after a push failure
  const [victimName, setVictimName] = useState('');  // this phone's owner = the victim
  const [toast, setToast] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const speechId = useRef(0);   // utterance generation — see speakVerdict()
  const speakTimer = useRef(null); // 10s watchdog — see speakVerdict()
  const alive = useRef(true);   // FIX 3: liveness guard for async speakVerdict
  const clearSpeakTimer = () => {
    if (speakTimer.current) { clearTimeout(speakTimer.current); speakTimer.current = null; }
  };

  // Slide-down entrance for the verdict band
  const bandY = useSharedValue(-40);
  useEffect(() => {
    bandY.value = withDelay(80, withSpring(0, { damping: 14, stiffness: 110 }));
  }, []);
  const bandStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bandY.value }] }));

  // Urdu voice narration with an HONEST sound-or-say-why chain:
  //   no engine on the device → toast + STOP (no fake pulse, no silent lie)
  //   ur-PK Urdu  →  (error)  →  en-US Roman Urdu  →  (error)  →  toast.
  // Profile language 'en' skips Urdu and speaks the Roman line with en-US at once.
  // FIX 2: bounded 1500ms probe (Android hangs forever with no engine installed).
  // FIX 3: alive ref guards every continuation after an await.
  // FIX 4: resolves from onStart (real audio) not "speak didn't throw".
  // FIX 5: `silent` suppresses toasts for auto-speak (not user-initiated).
  const speakVerdict = async ({ silent = false } = {}) => {
    const urdu = isScam
      ? (explanationUrdu || 'یہ پیغام جعلی ہے۔ او ٹی پی کبھی شیئر نہ کریں۔')
      : isSusp
        ? 'یہ پیغام مشکوک ہے۔ احتیاط ضرور کریں۔'
        : 'یہ پیغام محفوظ ہے۔';
    const roman = isScam
      ? (explanationRoman || 'Yeh message jaali hai. OTP kabhi share na karein.')
      : isSusp
        ? 'Yeh message mashkook hai. Ehtiyat zaroor karein.'
        : 'Yeh message mehfooz hai.';

    // FIX 2: Engine probe bounded to 1500ms. On Android, getAvailableVoicesAsync
    // NEVER settles when no TTS engine is installed (promise queued until engine
    // init SUCCESS). A timeout falls through to the speak attempt where the
    // watchdog + onError chain handle failure honestly.
    let voices = null;
    try {
      voices = await Promise.race([
        Speech.getAvailableVoicesAsync(),
        new Promise((r) => setTimeout(() => r('timeout'), 1500)),
      ]);
    } catch (e) { voices = null; }
    if (!alive.current) return false;
    if (Array.isArray(voices) && voices.length === 0) {
      if (!silent) setToast(TOAST_NO_ENGINE);
      return false;
    }
    // null/'timeout'/non-empty → inconclusive or fine: ATTEMPT the speak;
    // onError chain + watchdog report honestly.

    // Generation guard: Speech.stop() fires onStopped for the PREVIOUS utterance.
    // Without this, a double-tap would clear the new "speaking" state and leave
    // the button looking idle while audio is still playing.
    const id = ++speechId.current;
    const reset = () => { if (speechId.current === id) { clearSpeakTimer(); setSpeaking(false); } };
    clearSpeakTimer();
    speakTimer.current = setTimeout(() => {
      speakTimer.current = null;
      if (!alive.current) return;
      if (speechId.current !== id) return;
      try { Speech.stop(); } catch (e) { /* ignore */ }
      setSpeaking(false);
    }, SPEAK_TIMEOUT_MS);
    Speech.stop();
    setSpeaking(true);

    // FIX 4: Resolve `started` from expo-speech's onStart callback — proves real
    // audio began. A 2500ms no-start timeout fires false if the engine never
    // begins playback (only the failure toast wins, never the volume hint).
    const started = await new Promise((resolve) => {
      let settled = false;
      const settle = (val) => { if (!settled) { settled = true; clearTimeout(noStart); resolve(val); } };
      const noStart = setTimeout(() => { settle(false); reset(); }, 2500);

      const speakRoman = () => {
        try {
          Speech.speak(roman, {
            language: 'en-US', rate: 0.95, pitch: 1,
            onStart: () => settle(true),
            onDone: reset, onStopped: reset,
            onError: () => { settle(false); reset(); if (!silent) setToast(TOAST_SPEAK_FAIL); },
          });
        } catch (e) {
          settle(false); reset(); if (!silent) setToast(TOAST_SPEAK_FAIL);
        }
      };

      try {
        if (language === 'en') {
          Speech.speak(roman, {
            language: 'en-US', rate: 0.95, pitch: 1,
            onStart: () => settle(true),
            onDone: reset, onStopped: reset,
            onError: () => { settle(false); reset(); if (!silent) setToast(TOAST_SPEAK_FAIL); },
          });
        } else {
          Speech.speak(urdu, {
            language: 'ur-PK', rate: 0.9, pitch: 1,
            onStart: () => settle(true),
            onDone: reset, onStopped: reset,
            onError: () => speakRoman(),
          });
        }
      } catch (e) {
        speakRoman();
      }
    });
    if (!alive.current) return false;
    return started;
  };

  // Awaz button. On the first tap EVER it also reminds about MEDIA volume —
  // persisted, so it never nags again — but only when audio really started.
  const onAwazPress = async () => {
    const started = await speakVerdict();
    if (!started) return;
    if (await LocalDBService.getVolumeHintShown()) return;
    await LocalDBService.setVolumeHintShown(true);
    setToast(TOAST_VOLUME);
  };

  // Speaking feedback — the icon pulses while audio plays, reverts on onDone.
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = speaking
      ? withRepeat(withSequence(
          withTiming(1.15, { duration: MOTION.base }),
          withTiming(1, { duration: MOTION.base }),
        ), -1, true)
      : 1;
  }, [speaking]); // eslint-disable-line react-hooks/exhaustive-deps
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  useEffect(() => {
    let t;
    (async () => {
      // Respect the Profile → voice-narration preference (persisted, default on).
      const voiceOn = await LocalDBService.getVoicePref();
      // FIX 5: silent=true suppresses toasts for auto-speak (not user-initiated).
      if (voiceOn && alive.current) t = setTimeout(() => speakVerdict({ silent: true }), 1000);
    })();
    // FIX 3: mark dead so any pending speakVerdict continuation bails out.
    return () => { alive.current = false; if (t) clearTimeout(t); clearSpeakTimer(); Speech.stop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load the real family roster + shared familyCode + this phone's owner name.
  useEffect(() => {
    (async () => {
      setMembers(await LocalDBService.getFamilyMembers());
      setFamilyCode(await LocalDBService.getFamilyCode());
      // Unset profile name → '' → buildAlertMessage uses "Ghar wale ko yeh message
      // mila hai" fallback. ProfileScreen's display default 'Ahmed Khan' is UI-only.
      setVictimName(await LocalDBService.getProfileName());
    })();
  }, []);

  // Auto-open the family sheet on a scam verdict (demo flow).
  useEffect(() => {
    if (!isScam) return;
    const t = setTimeout(() => setAlertVisible(true), 2600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-hide the toast.
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // PRIMARY — zero backend: open the native SMS app / WhatsApp with a pre-filled
  // alert. This is the reliable path and the mandatory demo pass.
  const openChannel = async (m, channel) => {
    const num = toIntl(m.phone);
    if (!num) { setToast('Phone number nahi hai'); return; }
    // Victim semantics: the alert names the person holding THIS phone and quotes
    // the message, so every guardian gets the same facts regardless of who they are.
    const body = buildAlertMessage({ name: victimName, score, text: messageText, lang: alertLang });
    const url = channel === 'sms'
      ? `sms:${num}?body=${encodeURIComponent(body)}`
      : `https://wa.me/${num}?text=${encodeURIComponent(body)}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      setToast(channel === 'sms' ? 'SMS app nahi khula' : 'WhatsApp nahi khula');
    }
  };

  const onPrimary = (m) => {
    Alert.alert('Alert bhejein', `${m.name} ko kis tarah bhejein?`, [
      { text: 'SMS', onPress: () => openChannel(m, 'sms') },
      { text: 'WhatsApp', onPress: () => openChannel(m, 'wa') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // SECONDARY — real push via the backend relay. Enabled only when this member
  // is push-linked. On sent=0 we say so honestly and keep SMS highlighted.
  const onPush = async (m) => {
    if (!m.token) return;
    setPushState(p => ({ ...p, [m.id]: 'sending' }));
    // SMS/WhatsApp carries the full victim payload (name + message quote).
    // Push body stays generic — the frozen relay destructures only these fields
    // and ignores extras; shipping raw SMS text would leak OTP/CNIC for zero gain.
    const res = await sendFamilyAlert({
      familyCode, from: 'Hifazat App', verdict: verdict.toUpperCase(), risk: score, flags: redFlags,
    });
    if (res.sent > 0) {
      setPushState(p => ({ ...p, [m.id]: 'sent' }));
    } else {
      setPushState(p => ({ ...p, [m.id]: 'fail' }));
      setSmsHot(p => ({ ...p, [m.id]: true }));
      setToast('Push fail hua — SMS use karein');
    }
  };

  // ── Real action buttons — no dead taps ─────────────────────────────────────
  const nccia = buildNcciaReport({
    sender: senderNumber,
    messageText: messageText || '(message text not captured for this scan)',
    score,
    redFlags,
  });

  // (a) Sender Block — copy the number, open the native SMS app, then say
  //     honestly that the block itself happens in the phone's own SMS settings.
  const onBlockSender = async () => {
    if (!senderNumber) {
      setToast('Is SMS mein sender number nahi mila — NCCIA Shikayat bhejein');
      return;
    }
    try {
      await Clipboard.setStringAsync(senderNumber);
      setToast('Number copy ho gaya');
    } catch (e) {
      setToast('Number copy nahi ho saka');
    }
    try {
      await Linking.openURL(`sms:${senderNumber}`);
    } catch (e) {
      setToast('SMS app nahi khula — number copy hai');
    }
  };

  // (b) NCCIA Shikayat — pre-filled complaint email to the cyber-crime agency.
  //     helpdesk@nccia.gov.pk is NCCIA's verified public intake address
  //     (nccia.gov.pk/faqs.php + /financial-frauds.php).
  const onNccia = async () => {
    const url = 'mailto:helpdesk@nccia.gov.pk'
      + `?subject=${encodeURIComponent(nccia.subject)}`
      + `&body=${encodeURIComponent(nccia.body)}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Email app nahi khula', 'NCCIA online portal par complaint darj karein.', [
        { text: 'Share', onPress: onShareReport },
        { text: 'Portal', onPress: () => Linking.openURL(NCCIA_PORTAL_URL).catch(() => setToast('Portal nahi khula')) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // (c) Report Share — the same report as plain text via the native sheet
  //     (WhatsApp / Email / any installed target).
  const onShareReport = async () => {
    try {
      await Share.share({
        message: `${nccia.subject}\n\n${nccia.body}`,
        title: nccia.subject,
      });
    } catch (e) {
      setToast('Share sheet nahi khuli');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top band */}
        <Animated.View style={[bandStyle]}>
          <LinearGradient
            colors={gradient.colors} start={gradient.start} end={gradient.end}
            style={styles.band}
          >
            <View style={styles.bandHeader}>
              <Pressable onPress={() => navigation?.goBack?.()} style={styles.iconBtn}>
                <Ionicons name="chevron-back" size={SIZE.xl} color={COLORS.white} />
              </Pressable>
              <Text style={styles.bandLabel}>{speaking ? 'AWAZ CHAL RAHI HAI' : 'SCAN COMPLETE'}</Text>
              <Pressable
                onPress={onAwazPress}
                style={[styles.iconBtn, speaking && styles.iconBtnLive]}
                accessibilityLabel={speaking ? 'Awaz chal rahi hai — playing' : 'Verdict dohraein'}
              >
                <Animated.View style={pulseStyle}>
                  <Ionicons
                    name={speaking ? 'volume-high' : 'volume-medium'}
                    size={SIZE.xl} color={COLORS.white} />
                </Animated.View>
              </Pressable>
            </View>

            <View style={styles.bandHero}>
              <View style={styles.verdictPill}>
                <Ionicons name={isScam ? 'warning' : isSusp ? 'alert-circle' : 'checkmark-circle'} size={SIZE.lg} color={COLORS.white} />
                <Text style={styles.verdictPillText}>
                  {isScam ? 'FRAUD / SCAM' : isSusp ? 'SHAK / SUSPICIOUS' : 'MEHFOOZ / SAFE'}
                </Text>
              </View>
              <Text style={[typo.bodyUrInv, { textAlign: 'center', marginTop: SPACE.sm }]}>
                {isScam ? 'دھوکہ! یہ پیغام جعلی ہے' : isSusp ? 'یہ پیغام مشکوک ہے۔ احتیاط ضرور کریں' : 'یہ پیغام محفوظ ہے'}
              </Text>

              <View style={styles.ringWrap}>
                <ThreatRing score={score} size={112} color={COLORS.white}
                  label={isScam ? 'THREAT SCORE' : isSusp ? 'CAUTION' : 'LOW RISK'} />
              </View>

              <View style={{ flexDirection: 'row', gap: SPACE.sm, marginTop: SPACE.sm }}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{confidence}% Yaqeen</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: COLORS.white }]}>
                  <Text style={[styles.chipText, {
                    color: isScam ? COLORS.danger : isSusp ? COLORS.warnText : COLORS.safeText,
                  }]}>
                    {type}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Details */}
        <View style={{ padding: SPACE.lg, gap: SPACE.sm }}>
          {isScam ? <MoneySaved amount={saved.amount} estimated={saved.estimated} /> : null}
          {isScam || isSusp
            ? <ScamDetails redFlags={redFlags} explanationRoman={explanationRoman} explanationUrdu={explanationUrdu} />
            : <SafeDetails />}
        </View>
      </ScrollView>

      {/* Action sheet */}
      <View style={[styles.actionSheet, { paddingBottom: insets.bottom + SPACE.md }]}>
        <View style={styles.sheetHandle} />
        {isScam ? (
          <>
            <Pressable
              onPress={onBlockSender}
              style={({ pressed }) => [styles.btn, { backgroundColor: COLORS.danger },
                pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <Ionicons name="close-circle" size={SIZE.lg} color={COLORS.white} />
              <Text style={styles.btnText}>Sender Block Karein</Text>
            </Pressable>
            {/* Honest 2-line note: Android exposes no API for one app to block a
                sender inside another app's SMS settings. We copy + open + say so. */}
            <Text style={styles.blockNote}>
              Apne phone ki SMS settings mein is number ko block karein.{'\n'}
              Hifazat az-khud block nahi kar sakti — yeh phone ki setting hai.
            </Text>
            <View style={{ flexDirection: 'row', gap: SPACE.sm }}>
              <Pressable
                onPress={() => setAlertVisible(true)}
                style={({ pressed }) => [styles.btn, styles.btnSm,
                  { backgroundColor: COLORS.primary, flex: 1 },
                  pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <Text style={[styles.btnText, { fontSize: SIZE.sm }]}>Family Ko Batain</Text>
              </Pressable>
              <Pressable
                onPress={onNccia}
                style={({ pressed }) => [styles.btn, styles.btnSm, styles.btnOutline, { flex: 1 },
                  pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <Text style={[styles.btnText, { color: COLORS.text, fontSize: SIZE.sm }]}>NCCIA Shikayat</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={onShareReport}
              style={({ pressed }) => [styles.btn, styles.btnSm, styles.btnOutline,
                pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <Ionicons name="share-outline" size={SIZE.base} color={COLORS.text} />
              <Text style={[styles.btnText, { color: COLORS.text, fontSize: SIZE.sm }]}>Report Share Karein</Text>
            </Pressable>
          </>
        ) : isSusp ? (
          <Pressable onPress={() => setAlertVisible(true)} style={[styles.btn, { backgroundColor: COLORS.warning }]}>
            <Ionicons name="notifications" size={SIZE.lg} color={COLORS.white} />
            <Text style={styles.btnText}>Ehtiyat — Family Ko Batain</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => navigation?.navigate?.('Home')} style={[styles.btn, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.btnText}>Home Par Wapas Jaaein</Text>
          </Pressable>
        )}
      </View>

      {/* Family Ko Batain — real SMS/WhatsApp deep links + best-effort push */}
      <BottomSheet visible={alertVisible} onClose={() => setAlertVisible(false)} title="Family Ko Batain">
        <Text style={[typo.bodyUrSm, { marginBottom: SPACE.sm }]}>خاندان کو بتائیں</Text>

        {members.length ? (
          <ScrollView style={styles.fmScroll} showsVerticalScrollIndicator={false}>
            <View style={{ gap: SPACE.md }}>
              {members.map((m, i) => {
                const ps = pushState[m.id];
                const disabled = !m.token || ps === 'sending';
                return (
                  <View key={m.id} style={styles.fmCard}>
                    <View style={styles.fmHead}>
                      <Avatar name={m.name} color={PALETTE[i % PALETTE.length]} size={36} />
                      <View style={{ flex: 1, marginHorizontal: SPACE.sm }}>
                        <Text style={styles.fmName} numberOfLines={1}>{m.name}</Text>
                        <Text style={styles.fmMeta} numberOfLines={1}>
                          {(m.role || '').toUpperCase()}{m.phone ? ` · ${m.phone}` : ''}
                        </Text>
                      </View>
                      {m.token ? (
                        <View style={styles.fmLinked}>
                          <Ionicons name="notifications" size={SIZE.xs} color={COLORS.primary} />
                          <Text style={styles.fmLinkedText}>PUSH</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* PRIMARY — zero backend SMS / WhatsApp deep link */}
                    <Pressable onPress={() => onPrimary(m)}
                      style={({ pressed }) => [styles.fmPrimary, smsHot[m.id] && styles.fmPrimaryHot,
                        pressed && { transform: [{ scale: 0.98 }] }]}>
                      <Ionicons name="chatbubbles" size={SIZE.base} color={COLORS.white} />
                      <Text style={styles.fmPrimaryText}>Send via SMS / WhatsApp</Text>
                    </Pressable>

                    {/* SECONDARY — real push, only when this member is linked */}
                    <Pressable onPress={() => onPush(m)} disabled={disabled}
                      style={[styles.fmSecondary, disabled && styles.fmSecondaryOff]}>
                      <Ionicons
                        name={ps === 'sent' ? 'checkmark-circle' : 'notifications-outline'}
                        size={SIZE.base}
                        color={!m.token ? COLORS.textMuted : ps === 'sent' ? COLORS.accentDk : COLORS.primary} />
                      <Text style={[styles.fmSecondaryText,
                        { color: !m.token ? COLORS.textMuted : ps === 'sent' ? COLORS.accentDk : COLORS.primary }]}>
                        {!m.token ? 'Push Alert · SMS only'
                          : ps === 'sending' ? 'Bhej rahe hain…'
                          : ps === 'sent' ? 'Push sent · real'
                          : ps === 'fail' ? 'Push fail · dobara'
                          : 'Push Alert'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          <EmptyState icon="people-outline" title="Koi member nahi" urduTitle="کوئی رکن نہیں"
            cta="Family screen se add karein"
            onCtaPress={() => { setAlertVisible(false); navigation?.navigate?.('Main', { screen: 'Family' }); }} />
        )}

        <Pressable onPress={() => setAlertVisible(false)} style={styles.okBtn}>
          <Text style={styles.btnText}>Band karein</Text>
        </Pressable>
      </BottomSheet>

      {/* Honest push-failure toast */}
      {toast ? (
        <Animated.View entering={FadeInUp.duration(200)} exiting={FadeOutDown.duration(200)}
          style={[styles.toast, SHADOW.elevated]}>
          <Ionicons name="information-circle" size={SIZE.base} color={COLORS.white} />
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

function ScamDetails({ redFlags, explanationRoman, explanationUrdu }) {
  return (
    <View style={[styles.card, SHADOW.elevated, { padding: SPACE.md }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.lg, color: COLORS.text }}>Kya galat hai?</Text>
        <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.textMuted, letterSpacing: 0.8 }}>
          WORDS FOUND
        </Text>
      </View>

      {/* Evidence chips — exact trigger words found in the message. Keep to 3 short
          words so the row never wraps; the design budget is one row. */}
      <View style={{ flexDirection: 'row', gap: SPACE.sm, marginTop: SPACE.sm }}>
        {redFlags.map(w => (
          <View key={w} style={styles.evidenceChip}>
            <Text style={styles.evidenceChipText}>{w}</Text>
          </View>
        ))}
      </View>

      <View style={styles.explain}>
        {explanationRoman ? (
          <>
            <Text style={styles.explainText}>{explanationRoman}</Text>
            {explanationUrdu ? (
              <Text style={[typo.bodyUrSm, { marginTop: SPACE.xs }]}>{explanationUrdu}</Text>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.explainText}>BISP sirf 8171 se SMS bhejta hai.</Text>
            <Text style={[styles.explainText, { marginTop: SPACE.xs }]}>Yeh number nakli hai. Paisa na bhejein.</Text>
          </>
        )}
      </View>
    </View>
  );
}

function SafeDetails() {
  return (
    <View style={[styles.card, SHADOW.card]}>
      <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.lg, color: COLORS.text }}>
        Yeh message theek lagta hai
      </Text>
      <View style={styles.explain}>
        <Text style={styles.explainText}>"Rs 5,000 Saima Khan ko bheja gaya."</Text>
      </View>
      {['Sender asli hai — JazzCash 4444','Koi shak wala link nahi','Aapke transaction se milta hai']
        .map((r, i) => (
        <View key={i} style={styles.reason}>
          <View style={styles.reasonCheck}>
            <Ionicons name="checkmark" size={SIZE.sm} color={COLORS.accent} />
          </View>
          <Text style={styles.reasonText}>{r}</Text>
        </View>
      ))}
    </View>
  );
}

function MoneySaved({ amount, estimated }) {
  return (
    <LinearGradient colors={gradients.safeBg.colors} start={gradients.safeBg.start} end={gradients.safeBg.end}
      style={[styles.card, { borderColor: COLORS.accent + '40', padding: SPACE.md, flexDirection:'row', alignItems:'center', gap: SPACE.sm }]}>
      <View style={styles.moneyIcon}>
        <Ionicons name="cash" size={SIZE.lg} color={COLORS.white} />
      </View>
      <View style={{ flex: 1 }}>
        {/* Honesty chip: the figure is the amount the message quoted, or — when it
            quoted none — the per-type estimate. Same idiom as Analytics' chip. */}
        <View style={styles.savedHead}>
          <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.xs, color: COLORS.safeText, letterSpacing: 0.6 }}>
            BACHAYA / SAVED
          </Text>
          {estimated ? (
            <View style={styles.estChip}>
              <Text style={styles.estChipText}>ESTIMATED</Text>
            </View>
          ) : null}
        </View>
        <Text style={{ fontFamily: FONTS.enBlack, fontSize: SIZE.xl, color: COLORS.accentDk,
          marginTop: SPACE.xs, fontVariant: ['tabular-nums'] }}>
          Rs {amount.toLocaleString('en-PK')} bachaya
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  band: { paddingBottom: SPACE.xl },
  bandHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACE.lg, paddingTop: SPACE.xs,
  },
  bandLabel: { fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.white + 'CC', letterSpacing: 1.2 },
  iconBtn: {
    width: 44, height: 44, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.white + '21',
    borderWidth: 1, borderColor: COLORS.white + '40',
    alignItems: 'center', justifyContent: 'center',
  },
  bandHero: { alignItems: 'center', marginTop: SPACE.sm, gap: SPACE.sm },
  verdictPill: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    backgroundColor: COLORS.white + '21',
    borderWidth: 1, borderColor: COLORS.white + '40',
    borderRadius: RADIUS.chip,
  },
  verdictPillText: { fontFamily: FONTS.enExtra, fontSize: SIZE.sm, color: COLORS.white, letterSpacing: 1.2 },
  ringWrap: {
    marginTop: SPACE.xs, padding: SPACE.xs, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.white + '14',
    borderWidth: 1, borderColor: COLORS.white + '2E',
  },
  chip: {
    paddingHorizontal: SPACE.sm, paddingVertical: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.white + '21',
    borderWidth: 1, borderColor: COLORS.white + '40',
  },
  chipText: { fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.white },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: SPACE.md, borderWidth: 1, borderColor: COLORS.border,
  },
  explain: {
    marginTop: SPACE.sm, padding: SPACE.md, backgroundColor: COLORS.surface2, borderRadius: RADIUS.icon,
  },
  explainText: {
    fontFamily: FONTS.enSemibold, fontSize: SIZE.lg, color: COLORS.text, lineHeight: SIZE.lg * 1.4,
  },
  evidenceChip: {
    paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: COLORS.danger + '33',
  },
  evidenceChipText: { fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.danger },
  reason: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, marginTop: SPACE.sm },
  reasonText: { fontFamily: FONTS.enSemibold, fontSize: SIZE.lg, color: COLORS.text, flex: 1 },
  reasonCheck: {
    width: 22, height: 22, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.safeBg, alignItems: 'center', justifyContent: 'center',
  },
  moneyIcon: {
    width: 36, height: 36, borderRadius: RADIUS.icon, flexShrink: 0,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  savedHead: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  estChip: {
    paddingHorizontal: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.accent + '55',
  },
  estChipText: { fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.safeText, letterSpacing: 0.4 },
  actionSheet: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.card, borderTopRightRadius: RADIUS.card,
    paddingHorizontal: SPACE.lg, paddingTop: SPACE.sm, gap: SPACE.sm,
    ...SHADOW.elevated,
  },
  sheetHandle: {
    alignSelf: 'center', width: SIZE.xxl, height: SPACE.xs, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.border, marginBottom: SPACE.sm,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.sm,
    height: 50, borderRadius: RADIUS.btn,
  },
  btnSm: { height: 44 },
  // Speaking state — accent ring + tint so the Awaz button reads "live" on stage.
  iconBtnLive: { backgroundColor: COLORS.accent + '33', borderColor: COLORS.accent },
  // Honest block note is advice text → verdict-screen floor (≥17pt) applies.
  blockNote: {
    fontFamily: FONTS.enMedium, fontSize: SIZE.lg, color: COLORS.textMuted,
    lineHeight: SIZE.lg * 1.35, textAlign: 'center',
  },
  btnOutline: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  btnText: { fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.white },
  // Family alert sheet — real SMS/WhatsApp + best-effort push
  fmScroll: { maxHeight: 380 },
  fmCard: {
    backgroundColor: COLORS.surface2, borderRadius: RADIUS.btn,
    padding: SPACE.sm, borderWidth: 1, borderColor: COLORS.border, gap: SPACE.sm,
  },
  fmHead: { flexDirection: 'row', alignItems: 'center' },
  fmName: { fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.text },
  fmMeta: {
    fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.textMuted,
    letterSpacing: 0.4, marginTop: SPACE.xs,
  },
  fmLinked: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.xs, paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs, borderRadius: RADIUS.chip, backgroundColor: COLORS.primary + '14',
  },
  fmLinkedText: { fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.primary, letterSpacing: 0.6 },
  fmPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.sm,
    minHeight: 48, borderRadius: RADIUS.btn, backgroundColor: COLORS.primary,
  },
  fmPrimaryHot: { borderWidth: 2, borderColor: COLORS.accent },
  fmPrimaryText: { fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.white },
  fmSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.sm,
    minHeight: 44, borderRadius: RADIUS.btn, backgroundColor: COLORS.surface,
    borderWidth: 1.5, borderColor: COLORS.primary + '55',
  },
  fmSecondaryOff: { borderColor: COLORS.border, backgroundColor: COLORS.surface },
  fmSecondaryText: { fontFamily: FONTS.enExtra, fontSize: SIZE.sm },
  toast: {
    position: 'absolute', bottom: SPACE.xl, alignSelf: 'center', maxWidth: '90%',
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    backgroundColor: COLORS.text, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    borderRadius: RADIUS.chip,
  },
  toastText: { fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.white },
  okBtn: {
    height: 50, borderRadius: RADIUS.btn, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACE.xs,
  },
});
