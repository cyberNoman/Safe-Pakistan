import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { DemoBadge } from '@/components/Indicators';
import { LocalDBService } from '@/services/LocalDBService';

const DEFAULT_SUGGESTIONS = [
  'Kya JazzCash SMS safe hai?',
  'BISP 8171 verify karo',
  'OTP kab dena chahiye?',
];

// Contextual quick-replies — 3 chips picked from what the user last asked.
// Each chip is itself a KB-resolvable question, so a tap always gets an answer.
function suggestFor(lastUserText) {
  const t = String(lastUserText || '').toLowerCase();
  if (!t) return DEFAULT_SUGGESTIONS;
  if (/(sbp|state bank|bank|ubl|account|atm|debit|credit card|unblock)/.test(t))
    return ['State Bank ka number?', 'Bank call par account unblock bole to?', 'OTP kab dena chahiye?'];
  if (/(fbr|tax|filer|income tax)/.test(t))
    return ['FBR tax ka number?', 'Tax ke naam par fraud?', 'NCCIA 1799 par report kaise karun?'];
  if (/(pta|spam|unsolicited|9000)/.test(t))
    return ['Spam SMS kahan bhejein?', 'PTA complaint portal kya hai?', 'NCCIA 1799 kya hai?'];
  if (/(job|naukri|visa|gulf|overseas)/.test(t))
    return ['Job fee scam kya hai?', 'Visa ke liye advance fees?', 'NCCIA report kaise karun?'];
  if (/(lottery|prize|winner|jeet|inaam|claim|lucky draw)/.test(t))
    return ['You have won SMS aaya?', 'Lottery claim fee scam?', 'NCCIA 1799 par report?'];
  if (/(romance|girlfriend|boyfriend|pyar|mohabbat|shaadi|online rishta)/.test(t))
    return ['Romance scam kya hai?', 'Pyar ke naam par fraud?', 'NCCIA report kaise karun?'];
  if (/(parcel|customs|courier|package|delivery)/.test(t))
    return ['Parcel customs fee scam?', 'Courier fraud se kaise bachein?', 'NCCIA 1799 par report?'];
  if (/(qr|scan code)/.test(t))
    return ['QR scan karna safe hai?', 'QR se paise milte hain?', 'Easypaisa fraud alert?'];
  if (/(nadra|cnic|shanakht|identity card)/.test(t))
    return ['NADRA ka block SMS aaya?', 'CNIC share karna safe hai?', 'NCCIA report kaise karun?'];
  if (/(jazzcash|jazz cash|easypaisa|easy paisa|4444|3737)/.test(t))
    return ['JazzCash official sender kya hai?', 'Easypaisa fraud alert?', 'OTP kab dena chahiye?'];
  if (/(bisp|ehsaas|8171|eligibility)/.test(t))
    return ['BISP 8171 verify karo', 'Ehsaas eligibility kaise check karun?', 'BISP fees maange to?'];
  if (/(otp|code|pin|cvv|password)/.test(t))
    return ['OTP kab dena chahiye?', 'Bank OTP maange to?', 'CNIC share karna safe hai?'];
  if (/(nccia|cybercrime|cyber crime|1799|shikayat)/.test(t))
    return ['NCCIA 1799 kya hai?', 'Shikayat kaise darj karun?', 'PTA complaint portal kya hai?'];
  return DEFAULT_SUGGESTIONS;
}

// ── Scoped knowledge base ────────────────────────────────────────────────
// Pre-verified facts ONLY. No open-ended LLM calls from chat. Each fact carries
// its source as a comment. Anything outside this KB → the NCCIA 1799 fallback.

// Official senders / shortcodes for the number-check rule.
const SHORTCODES = {
  '4444': { en: 'JazzCash',          ur: 'جاز کیش' },                    // jazzcash.com.pk
  '3737': { en: 'Easypaisa',         ur: 'ایزی پیسہ' },                  // easypaisa fraud alert
  '8257': { en: 'UBL',               ur: 'یو بی ایل' },                  // ubldigital.com
  '8171': { en: 'BISP / Ehsaas',     ur: 'بے نظیر / احساس' },            // 8171 portal
  '1799': { en: 'NCCIA Cybercrime',  ur: 'این سی سی اے سائبر کرائم' },   // nccia.gov.pk
  '111':  { en: 'Jazz helpline',     ur: 'جاز ہیلپ لائن' },              // telecom helplines
  '345':  { en: 'Telenor helpline',  ur: 'ٹیلی نار ہیلپ لائن' },
  '310':  { en: 'Zong helpline',     ur: 'زونگ ہیلپ لائن' },
  '333':  { en: 'Ufone helpline',    ur: 'یوفون ہیلپ لائن' },
};

const KB = [
  // source: jazzcash.com.pk
  { keys: ['jazzcash', 'jazz cash'],
    en: 'JazzCash official SMS sirf 4444 se bhejta hai.',
    ur: 'جاز کیش آفیشل پیغام صرف 4444 سے بھیجتا ہے۔' },
  // source: easypaisa fraud alert
  { keys: ['easypaisa', 'easy paisa'],
    en: 'Easypaisa ka official sender 3737 hai.',
    ur: 'ایزی پیسہ کا آفیشل سینڈر 3737 ہے۔' },
  // source: ubldigital.com
  { keys: ['ubl'],
    en: 'UBL ke alerts 8257 se aate hain.',
    ur: 'یو بی ایل کے الرٹس 8257 سے آتے ہیں۔' },
  // source: telecom helplines (Jazz / Telenor / Zong / Ufone)
  { keys: ['helpline', 'telenor', 'zong', 'ufone'],
    en: 'Helplines: Jazz 111, Telenor 345, Zong 310, Ufone 333.',
    ur: 'ہیلپ لائنز: جاز 111، ٹیلی نار 345، زونگ 310، یوفون 333۔' },
  // source: nccia.gov.pk
  { keys: ['nccia', 'cybercrime', 'cyber crime', 'shikayat', 'report'],
    en: 'NCCIA cybercrime helpline 1799 hai. Wahin report karein.',
    ur: 'این سی سی اے سائبر کرائم ہیلپ لائن 1799 ہے۔ وہیں رپورٹ کریں۔' },
  // source: BISP 8171 portal
  { keys: ['bisp', 'ehsaas', '8171', 'eligibility'],
    en: 'BISP/Ehsaas eligibility sirf 8171 portal se khud check karein. BISP kabhi OTP ya fees SMS par nahi maangta.',
    ur: 'بے نظیر / احساس اہلیت صرف 8171 پورٹل سے خود چیک کریں۔ بی آئی ایس پی کبھی او ٹی پی یا فیس نہیں مانگتا۔' },
  // source: OTP safety rule
  { keys: ['otp', 'code', 'pin', 'password', 'cvv'],
    en: 'Scammer OTP ya code maangte hain. Asli bank kehta hai code kabhi share na karein.',
    ur: 'اسکیمر او ٹی پی یا کوڈ مانگتے ہیں۔ اصلی بینک کہتا ہے کوڈ کبھی شیئر نہ کریں۔' },
  // ── one fact per threat-library scam type ──
  // source: threat library — CNIC Phishing
  { keys: ['cnic', 'shanakht', 'identity card'],
    en: 'CNIC number kisi SMS par na bhejein. Bank kabhi CNIC update SMS se nahi maangta.',
    ur: 'شناختی کارڈ نمبر کسی پیغام پر نہ بھیجیں۔ بینک کبھی سی این آئی سی نہیں مانگتا۔' },
  // source: threat library — Prize Call Scam
  { keys: ['prize', 'lottery', 'eidi', 'inaam', 'jeeta', 'lucky draw'],
    en: 'Aapko koi prize nahi mila. Inaam ke SMS scam hote hain.',
    ur: 'آپ کو کوئی انعام نہیں ملا۔ انعام کے پیغام دھوکہ ہوتے ہیں۔' },
  // source: threat library — Fake Helpline
  { keys: ['fake helpline', 'call karein', 'is number par call'],
    en: 'SMS mein diye gaye number par call na karein. Bank ki asli helpline official hoti hai.',
    ur: 'پیغام میں دیے گئے نمبر پر کال نہ کریں۔ بینک کی اصلی ہیلپ لائن آفیشل ہوتی ہے۔' },
  // source: threat library — Unknown Link
  { keys: ['link', 'url', 'click', 'http', 'website'],
    en: 'SMS ke link par click na karein. Yeh phishing ho sakti hai.',
    ur: 'پیغام کے لنک پر کلک نہ کریں۔ یہ فشنگ ہو سکتی ہے۔' },
  // source: threat library — Friend Impersonation
  { keys: ['friend', 'dost', 'impersonat', 'paise maang', 'paise bhejo'],
    en: 'Agar koi dost paise maange, pehle call kar ke tasdeeq karein.',
    ur: 'اگر کوئی دوست پیسے مانگے، پہلے کال کر کے تصدیق کریں۔' },

  // ── V2 KB expansion — verified national helplines + common scam patterns ──
  // source: sunwai.sbp.org.pk — SBP Consumer Protection Dept (banking complaints)
  { keys: ['state bank', 'sbp', 'central bank'],
    en: 'State Bank complaint helpline 021-111-727-273 hai.',
    ur: 'اسٹیٹ بینک شکایت ہیلپ لائن 021-111-727-273 ہے۔' },
  // source: fbr.gov.pk — FBR taxpayer helpline
  { keys: ['fbr', 'tax', 'income tax', 'filer'],
    en: 'FBR tax helpline 051-111-772-772 hai.',
    ur: 'ایف بی آر ٹیکس ہیلپ لائن 051-111-772-772 ہے۔' },
  // source: pta.gov.pk — spam short code 9000, complaint.pta.gov.pk, helpline 0800-55055
  { keys: ['pta', 'spam', 'unsolicited'],
    en: 'Fraud SMS PTA ko 9000 par bhejein. Portal: complaint.pta.gov.pk.',
    ur: 'دھوکہ کے پیغام پی ٹی اے کو 9000 پر بھیجیں۔' },
  // source: common scam pattern — advance-fee job / overseas-visa fraud
  { keys: ['job', 'naukri', 'visa', 'gulf', 'overseas', 'advance fee', 'registration fee'],
    en: 'Job ya visa ki advance fees scam hai. Kabhi na dein.',
    ur: 'نوکری یا ویزہ کی ایڈوانس فیس دھوکہ ہے۔ کبھی نہ دیں۔' },
  // source: common scam pattern — "you won" prize / lottery advance-fee
  { keys: ['winner', 'you have won', 'won a', 'claim', 'congratulations', 'foreign lottery'],
    en: '"You have won" SMS ek scam hai. Koi fees na dein.',
    ur: '"آپ جیت گئے" پیغام دھوکہ ہے۔ کوئی فیس نہ دیں۔' },
  // source: common scam pattern — romance / online-relationship fraud
  { keys: ['romance', 'girlfriend', 'boyfriend', 'pyar', 'mohabbat', 'online rishta', 'shaadi'],
    en: 'Online "romance" jo paise maange, woh scam hai. Kabhi na bhejein.',
    ur: 'آن لائن "رومانس" جو پیسے مانگے، وہ دھوکہ ہے۔ کبھی نہ بھیجیں۔' },
  // source: NADRA advisory — NADRA never asks to update/block CNIC by SMS
  { keys: ['nadra', 'cnic block', 'cnic update', 'cnic band'],
    en: 'NADRA kabhi SMS par CNIC block ya fees update nahi maangta.',
    ur: 'نادرا کبھی پیغام پر شناختی کارڈ بند یا فیس اپ ڈیٹ نہیں مانگتا۔' },
  // source: Easypaisa / JazzCash QR fraud advisory — a "receive" QR can send money
  { keys: ['qr', 'qr code', 'scan code'],
    en: 'QR scan se paise nahi milte — ulte chale jaate hain.',
    ur: 'کیو آر اسکین سے پیسے نہیں ملتے — الٹے چلے جاتے ہیں۔' },
  // source: banking fraud advisory — banks never call to "verify/unblock" an account
  { keys: ['account block', 'account band', 'verify account', 'account update', 'unblock'],
    en: 'Bank kabhi call par account unblock ya verify nahi karta.',
    ur: 'بینک کبھی کال پر اکاؤنٹ ان بلاک یا ویری فائی نہیں کرتا۔' },
  // source: common scam pattern — parcel / customs advance-fee fraud
  { keys: ['parcel', 'customs', 'courier', 'package', 'delivery fee'],
    en: '"Parcel customs mein phansa, fees bhejein" — yeh scam hai.',
    ur: '"پارسل کسٹم میں پھنسا، فیس بھیجیں" — یہ دھوکہ ہے۔' },
];

// Number-check rule (kept): a known shortcode confirms the official sender;
// an unknown phone-like number is flagged and pointed to NCCIA 1799.
function numberCheck(text) {
  const runs = String(text).match(/\d{3,}/g) || [];
  if (!runs.length) return null;
  for (const r of runs) {
    const hit = SHORTCODES[r];
    if (hit) {
      return { en: `${r} ${hit.en} ka official number hai.`, ur: `${r} ${hit.ur} کا آفیشل نمبر ہے۔` };
    }
  }
  const phone = runs.find(r => r.length >= 7);
  if (phone) {
    return {
      en: 'Yeh number humari knowledge mein nahi — koi official sender nahi.',
      ur: 'یہ نمبر ہماری معلومات میں نہیں — کوئی آفیشل سینڈر نہیں۔',
      warn: 'Shak ho to NCCIA 1799 par report karein.',
    };
  }
  return null;
}

function topicMatch(text) {
  const t = String(text).toLowerCase();
  for (const e of KB) {
    if (e.keys.some(k => t.includes(k))) return { en: e.en, ur: e.ur };
  }
  return null;
}

// Scoped lookup: number-check → KB topic → NCCIA fallback. Never open-ended.
function guardianReply(text) {
  return numberCheck(text) || topicMatch(text) || {
    en: 'Yeh meri knowledge mein nahi — NCCIA 1799.',
    ur: 'یہ میری معلومات میں نہیں — این سی سی اے 1799۔',
  };
}

export default function ChatScreen({ navigation }) {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  // Per-message feedback: { [botMsgId]: 'yes' | 'no' | 'reported' }.
  const [feedback, setFeedback] = useState({});
  // Clean greeting only — every subsequent reply comes from the scoped KB.
  const [messages, setMessages] = useState([
    { id: '1', from: 'bot',
      enText: 'Assalam o Alaikum! Main aapka Guardian hoon. Koi number, SMS ya scam type ke baare mein poochein.',
      urText: 'السلام علیکم! میں آپ کا گارڈین ہوں۔' },
  ]);

  const submit = (raw) => {
    const t = String(raw ?? text).trim();
    if (!t) return;
    const reply = guardianReply(t);
    const now = Date.now();
    setMessages(prev => [...prev,
      { id: now,     from: 'user', text: t },
      { id: now + 1, from: 'bot', enText: reply.en, urText: reply.ur, warn: reply.warn, q: t },
    ]);
    setSuggestions(suggestFor(t));
    setText('');
  };

  // Feedback lives under the newest bot answer only ("end of conversation").
  const lastId = messages[messages.length - 1]?.id;

  const markFeedback = (m, value) => {
    setFeedback(prev => ({ ...prev, [m.id]: value }));
    LocalDBService.logChatFeedback({ q: m.q, en: m.enText, ur: m.urText, value });
  };
  const reportAnswer = (m) => {
    setFeedback(prev => ({ ...prev, [m.id]: 'reported' }));
    LocalDBService.logChatReport({ q: m.q, en: m.enText, ur: m.urText });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
          style={[styles.botAvatar, SHADOW.card]}
        >
          <Ionicons name="shield-checkmark" size={SIZE.xl} color={COLORS.white} />
          <View style={styles.onlineDot} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
            <Text numberOfLines={1} style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.text, flexShrink: 1 }}>Guardian</Text>
            <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View>
            <DemoBadge style={{ alignSelf: 'center' }} />
          </View>
          <Text numberOfLines={1} style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.accent, marginTop: SPACE.xs }}>
            ● Online · Urdu / English
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Message list — inverted so the newest message is always anchored at the bottom */}
        <ScrollView inverted style={styles.msgList} contentContainerStyle={styles.msgListContent}
          keyboardShouldPersistTaps="handled">
          {[...messages].reverse().map(m => m.from === 'bot'
            ? <BotMsg key={m.id} m={m}
                showFeedback={m.id === lastId && !!m.q}
                feedback={feedback[m.id]}
                onFeedback={(v) => markFeedback(m, v)}
                onReport={() => reportAnswer(m)} />
            : <UserMsg key={m.id} text={m.text} />)}
          <View style={styles.datePill}>
            <Text style={typo.labelEn}>AAJ · TODAY</Text>
          </View>
        </ScrollView>

        {/* Suggestions — horizontal rail, swipeable; tap to ask */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ backgroundColor: COLORS.bg }}
          contentContainerStyle={styles.suggestionRail}>
          {suggestions.map((s, i) => (
            <Pressable key={i} style={styles.suggestion} onPress={() => submit(s)}>
              <Text style={{ fontFamily: FONTS.enSemibold, fontSize: SIZE.sm, color: COLORS.primary }}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputBar}>
          <View style={[styles.inputWrap, SHADOW.soft]}>
            <TextInput
              value={text} onChangeText={setText}
              onSubmitEditing={() => submit()}
              returnKeyType="send"
              placeholder="Type karein..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
            />
            <Ionicons name="mic" size={SIZE.lg} color={COLORS.textMuted} />
          </View>
          <Pressable onPress={() => submit()} style={[styles.sendBtn, SHADOW.elevated]}>
            <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="send" size={SIZE.lg} color={COLORS.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BotMsg({ m, showFeedback, feedback, onFeedback, onReport }) {
  return (
    <View style={styles.botWrap}>
      <View style={styles.botRow}>
        <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
          style={styles.botMini}
        >
          <Ionicons name="shield-checkmark" size={SIZE.sm} color={COLORS.white} />
        </LinearGradient>
        <View style={styles.botBubble}>
          {m.enText && <Text style={styles.botText}>{m.enText}</Text>}
          {m.urText && <Text style={[typo.bodyUr, { marginTop: m.enText ? SPACE.xs : 0 }]}>{m.urText}</Text>}
          {m.warn && (
            <View style={styles.warn}>
              <View style={styles.warnLabelRow}>
                <Ionicons name="alert-circle" size={SIZE.xs} color={COLORS.danger} />
                <Text style={[typo.labelEn, { color: COLORS.danger }]}>SUSPICIOUS NUMBER</Text>
              </View>
              <Text style={styles.botText}>{m.warn}</Text>
            </View>
          )}
        </View>
      </View>
      {showFeedback ? (
        <View style={styles.fbRow}>
          {feedback ? (
            <View style={styles.fbDone}>
              <Ionicons name="checkmark-circle" size={SIZE.sm} color={COLORS.primary} />
              <Text style={styles.fbDoneText}>
                {feedback === 'reported' ? 'Report ho gaya — shukriya.' : 'Shukriya! Feedback save ho gaya.'}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.fbLabel}>Was this helpful?</Text>
              <Pressable onPress={() => onFeedback('yes')} style={styles.fbBtn}>
                <Ionicons name="thumbs-up-outline" size={SIZE.base} color={COLORS.textMuted} />
              </Pressable>
              <Pressable onPress={() => onFeedback('no')} style={styles.fbBtn}>
                <Ionicons name="thumbs-down-outline" size={SIZE.base} color={COLORS.textMuted} />
              </Pressable>
              <Pressable onPress={onReport} style={styles.fbBtn}>
                <Ionicons name="flag-outline" size={SIZE.sm} color={COLORS.textMuted} />
                <Text style={styles.fbReportText}>Report</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

function UserMsg({ text }) {
  return (
    <View style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
      <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
        style={styles.userBubble}
      >
        <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.white }}>{text}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    paddingHorizontal: SPACE.lg, paddingTop: SPACE.sm, paddingBottom: SPACE.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  botAvatar: {
    width: 44, height: 44, borderRadius: RADIUS.chip,
    alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 12, height: 12, borderRadius: RADIUS.chip, backgroundColor: COLORS.accent,
    borderWidth: 2, borderColor: COLORS.white,
  },
  aiBadge: { backgroundColor: COLORS.primary, paddingHorizontal: SPACE.xs, paddingVertical: SPACE.xs, borderRadius: RADIUS.chip },
  aiBadgeText: { fontFamily: FONTS.enBold, fontSize: SIZE.xs, color: COLORS.white, letterSpacing: 0.3 },
  msgList: { flex: 1, backgroundColor: COLORS.bg },
  msgListContent: { padding: SPACE.md, gap: SPACE.sm },
  datePill: {
    alignSelf: 'center', paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.chip,
    borderWidth: 1, borderColor: COLORS.border, marginVertical: SPACE.xs,
  },
  botRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACE.sm, maxWidth: '85%' },
  botMini: { width: 28, height: 28, borderRadius: RADIUS.chip, alignItems: 'center', justifyContent: 'center' },
  botBubble: {
    backgroundColor: COLORS.surface2, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    borderRadius: RADIUS.btn, borderTopLeftRadius: RADIUS.sm, flexShrink: 1,
  },
  botText: { fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.text, lineHeight: SIZE.sm * 1.5 },
  botWrap: { alignItems: 'flex-start' },
  fbRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    marginTop: SPACE.xs, marginLeft: SPACE.xl,
  },
  fbLabel: { fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.textMuted },
  fbBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.xs,
    minWidth: 44, minHeight: 44,
  },
  fbReportText: { fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.textMuted },
  fbDone: { flexDirection: 'row', alignItems: 'center', gap: SPACE.xs, minHeight: 44 },
  fbDoneText: { fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.primary },
  userBubble: {
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    borderRadius: RADIUS.btn, borderBottomRightRadius: RADIUS.sm,
    ...SHADOW.card,
  },
  warn: {
    marginTop: SPACE.sm, padding: SPACE.sm, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  warnLabelRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.xs, marginBottom: SPACE.xs },
  suggestionRail: { paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, gap: SPACE.sm },
  suggestion: {
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    minHeight: 44, justifyContent: 'center',
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    backgroundColor: COLORS.bg,
  },
  inputWrap: {
    flex: 1, height: 46, borderRadius: RADIUS.chip, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACE.md, flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
  },
  input: { flex: 1, fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.text },
  sendBtn: {
    width: 46, height: 46, borderRadius: RADIUS.chip, flexShrink: 0,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
});
