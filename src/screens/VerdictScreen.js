/**
 * VerdictScreen — handles SCAM, SUSPICIOUS and SAFE verdicts via `verdict` prop.
 * Uses Reanimated entrance for the danger band + ring fill.
 * Fits one 390×844 viewport: band + details scroll, action sheet pinned in flow.
 *
 * Demo behaviors (hackathon):
 *  - Urdu voice narration speaks the verdict after the reveal (expo-speech).
 *  - Scam verdicts auto-fire the Family Shield guardian alert sheet.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import ThreatRing from '@/components/ThreatRing';
import { ScamTypeChip } from '@/components/Indicators';
import { BottomSheet } from '@/components/Overlays';
import { Avatar, EmptyState } from '@/components/Cards';
import { sendFamilyAlert } from '@/services/api';
import { LocalDBService } from '@/services/LocalDBService';
// ScamTypeChip is available for the Library/Screenshot screens; the scam verdict
// deliberately uses only the evidence chips to keep the card inside one screen.

// Avatar colours cycle through brand tokens only (no hardcoded hex).
const PALETTE = [COLORS.primary, COLORS.accentDk, COLORS.warning, COLORS.primaryLt, COLORS.accent];

// ── Family-alert deep-link helpers (pure, zero backend) ──
// Normalize a Pakistani number to intl form for wa.me / sms: (03XX… → 923XX…).
function toIntl(raw) {
  let n = String(raw || '').replace(/\D/g, '');
  if (n.startsWith('0092')) n = '92' + n.slice(4);
  else if (n.startsWith('0')) n = '92' + n.slice(1);
  else if (n && !n.startsWith('92')) n = '92' + n;
  return n;
}
// The alert body sent verbatim over SMS / WhatsApp.
function buildAlertMessage(scamType, risk, flags) {
  const f = Array.isArray(flags) ? flags.join(', ') : String(flags || '');
  return `HIFAZAT ALERT: ${scamType} scam SMS detected. Risk ${risk}/100. Red flags: ${f}. Do not reply. - Hifazat App`;
}

export default function VerdictScreen({ route, navigation }) {
  const verdict = route?.params?.verdict ?? 'scam'; // 'scam' | 'suspicious' | 'safe'
  const score   = route?.params?.score   ?? (verdict === 'scam' ? 96 : 12);
  const confidence = route?.params?.confidence ?? (verdict === 'scam' ? 95 : 99);
  const type    = route?.params?.type ?? (verdict === 'scam' ? 'BISP 8171 Fraud' : 'JazzCash Official');
  const redFlags = route?.params?.redFlags ?? ['OTP', 'foran', 'account band'];
  const explanationRoman = route?.params?.explanation_roman_ur ?? '';
  const explanationUrdu  = route?.params?.explanation_urdu ?? '';
  const insets = useSafeAreaInsets();

  const isScam = verdict === 'scam';
  const isSusp = verdict === 'suspicious';
  const gradient = isScam ? gradients.danger : isSusp ? gradients.warn : gradients.safe;
  const [alertVisible, setAlertVisible] = useState(false);
  const [members, setMembers] = useState([]);
  const [familyCode, setFamilyCode] = useState('');
  const [pushState, setPushState] = useState({});  // { [id]: 'sending'|'sent'|'fail' }
  const [smsHot, setSmsHot] = useState({});         // { [id]: true } after a push failure
  const [toast, setToast] = useState(null);

  // Slide-down entrance for the verdict band
  const bandY = useSharedValue(-40);
  useEffect(() => {
    bandY.value = withDelay(80, withSpring(0, { damping: 14, stiffness: 110 }));
  }, []);
  const bandStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bandY.value }] }));

  // Urdu voice narration — speaks the verdict after the reveal.
  const speakVerdict = () => {
    const line = isScam
      ? (explanationUrdu || 'یہ پیغام جعلی ہے۔ او ٹی پی کبھی شیئر نہ کریں۔')
      : isSusp
        ? 'یہ پیغام مشکوک ہے۔ احتیاط ضرور کریں۔'
        : 'یہ پیغام محفوظ ہے۔';
    Speech.stop();
    Speech.speak(line, { language: 'ur-PK', rate: 0.9, pitch: 1 });
  };
  useEffect(() => {
    let t;
    (async () => {
      // Respect the Profile → voice-narration preference (persisted, default on).
      const voiceOn = await LocalDBService.getVoicePref();
      if (voiceOn) t = setTimeout(speakVerdict, 1000);
    })();
    return () => { if (t) clearTimeout(t); Speech.stop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load the real family roster + shared familyCode for the alert sheet.
  useEffect(() => {
    (async () => {
      setMembers(await LocalDBService.getFamilyMembers());
      setFamilyCode(await LocalDBService.getFamilyCode());
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

  const alertMsg = buildAlertMessage(type, score, redFlags);

  // PRIMARY — zero backend: open the native SMS app / WhatsApp with a pre-filled
  // alert. This is the reliable path and the mandatory demo pass.
  const openChannel = async (m, channel) => {
    const num = toIntl(m.phone);
    if (!num) { setToast('Phone number nahi hai'); return; }
    const url = channel === 'sms'
      ? `sms:${num}?body=${encodeURIComponent(alertMsg)}`
      : `https://wa.me/${num}?text=${encodeURIComponent(alertMsg)}`;
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
              <Text style={styles.bandLabel}>SCAN COMPLETE</Text>
              <Pressable onPress={speakVerdict} style={styles.iconBtn} accessibilityLabel="Verdict dohraein">
                <Ionicons name="volume-high" size={SIZE.xl} color={COLORS.white} />
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
          {isScam ? <MoneySaved amount={50000} /> : null}
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
            <Pressable style={[styles.btn, { backgroundColor: COLORS.danger }]}>
              <Ionicons name="close-circle" size={SIZE.lg} color={COLORS.white} />
              <Text style={styles.btnText}>Sender Block Karein</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: SPACE.sm }}>
              <Pressable
                onPress={() => setAlertVisible(true)}
                style={[styles.btn, styles.btnSm, { backgroundColor: COLORS.primary, flex: 1 }]}
              >
                <Text style={[styles.btnText, { fontSize: SIZE.sm }]}>Family Ko Batain</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnSm, styles.btnOutline, { flex: 1 }]}>
                <Text style={[styles.btnText, { color: COLORS.text, fontSize: SIZE.sm }]}>NCCIA Shikayat</Text>
              </Pressable>
            </View>
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

function MoneySaved({ amount }) {
  return (
    <LinearGradient colors={gradients.safeBg.colors} start={gradients.safeBg.start} end={gradients.safeBg.end}
      style={[styles.card, { borderColor: COLORS.accent + '40', padding: SPACE.md, flexDirection:'row', alignItems:'center', gap: SPACE.sm }]}>
      <View style={styles.moneyIcon}>
        <Ionicons name="cash" size={SIZE.lg} color={COLORS.white} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.xs, color: COLORS.safeText, letterSpacing: 0.6 }}>
          BACHAYA / SAVED
        </Text>
        <Text style={{ fontFamily: FONTS.enBlack, fontSize: SIZE.xl, color: COLORS.accentDk,
          marginTop: SPACE.xs, fontVariant: ['tabular-nums'] }}>
          Rs. {amount.toLocaleString('en-PK')} bachaya
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
