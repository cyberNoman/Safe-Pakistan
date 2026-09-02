import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { DemoBadge } from '@/components/Indicators';

const SUGGESTIONS = [
  'Kya JazzCash SMS safe hai?',
  'BISP 8171 verify karo',
  'OTP kab dena chahiye?',
];

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
      { id: now + 1, from: 'bot', enText: reply.en, urText: reply.ur, warn: reply.warn },
    ]);
    setText('');
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
          {[...messages].reverse().map(m => m.from === 'bot' ? <BotMsg key={m.id} m={m} /> : <UserMsg key={m.id} text={m.text} />)}
          <View style={styles.datePill}>
            <Text style={typo.labelEn}>AAJ · TODAY</Text>
          </View>
        </ScrollView>

        {/* Suggestions — horizontal rail, swipeable; tap to ask */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ backgroundColor: COLORS.bg }}
          contentContainerStyle={styles.suggestionRail}>
          {SUGGESTIONS.map((s, i) => (
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

function BotMsg({ m }) {
  return (
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
