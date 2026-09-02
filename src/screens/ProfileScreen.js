/**
 * ProfileScreen — demo profile, preferences, and About.
 * Wired to the Home avatar (previously a dead button).
 *
 * New utility screen (not one of the 15 artboards) — follows DESIGN_RULES tokens.
 * Preferences: language, voice narration, family role, alert notifications,
 * auto-delete window, and scan-history export (RN Share → Android intent).
 * Dark mode is intentionally NOT here — no theme infra yet (V2 open-task #6).
 * Auth is a placeholder: name/phone are demo identity and logout is a stub.
 * See VISION.md — real sign-in (Alibaba Cloud SMS OTP) is V2 sprint one.
 * Scrolling preferences screen; the ScrollView fits short devices.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, Linking, Share, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZE, RADIUS, SHADOW, SPACE, urduSize } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { Avatar } from '@/components/Cards';
import { useLanguageContext } from '@/context/LanguageContext';
import { LocalDBService } from '@/services/LocalDBService';

const APP_VERSION = '1.1.0'; // matches app.json
const HF_URL = 'https://huggingface.co/Noman33/hifazat-edge';
const GITHUB_URL = 'https://github.com/Nomi33/hifazat-edge';

// Exactly 3 languages (design law): English · اردو · Roman Urdu.
const LANGS = [
  { code: 'en', label: 'English',    urdu: false },
  { code: 'ur', label: 'اردو',        urdu: true },
  { code: 'ru', label: 'Roman Urdu', urdu: false },
];

const ROLES = ['Self', 'Ammi', 'Abu', 'Beta', 'Behan'];

// Alert-me-for rows. Neutral styling on purpose: red + green must never share a
// card (design law) and red is reserved for the scam verdict — so these use the
// brand-blue switch and muted icons, not per-verdict colours.
const NOTIF_ROWS = [
  { key: 'scam',       label: 'Scam',       sub: 'Dhoke ka foran alert', icon: 'warning-outline' },
  { key: 'suspicious', label: 'Suspicious', sub: 'Shaki message',        icon: 'alert-circle-outline' },
  { key: 'safe',       label: 'Safe',       sub: 'Theek message',        icon: 'checkmark-circle-outline' },
];

// Auto-delete window (days). 0 = never. Real: LocalDBService prunes on read.
const AUTO_DELETE = [
  { days: 30, label: '30d' },
  { days: 60, label: '60d' },
  { days: 90, label: '90d' },
  { days: 0,  label: 'Never' },
];

export default function ProfileScreen({ navigation }) {
  const { language, setLang } = useLanguageContext();
  const [voice, setVoice] = useState(true);
  const [role, setRole] = useState('Self');
  const [notif, setNotif] = useState({ scam: true, suspicious: true, safe: false });
  const [autoDelete, setAutoDelete] = useState(0);

  useEffect(() => {
    (async () => {
      setVoice(await LocalDBService.getVoicePref());
      setNotif(await LocalDBService.getNotifPrefs());
      setAutoDelete(await LocalDBService.getAutoDelete());
    })();
  }, []);

  const toggleVoice = async (on) => {
    setVoice(on);
    await LocalDBService.setVoicePref(on);
  };

  const toggleNotif = async (key, on) => {
    const next = { ...notif, [key]: on };
    setNotif(next);
    await LocalDBService.setNotifPrefs(next);
  };

  const chooseAutoDelete = async (days) => {
    setAutoDelete(days);
    await LocalDBService.setAutoDelete(days);
  };

  const openLink = (url) => Linking.openURL(url).catch(() => {});

  // Export the real scan history as JSON via the native share sheet (Android
  // intent). No file-system / sharing dependency — RN's built-in Share only.
  const exportHistory = async () => {
    const scans = await LocalDBService.getScanHistory();
    if (!scans.length) {
      Alert.alert('Koi data nahi', 'Abhi export karne ke liye koi scan history nahi hai.');
      return;
    }
    const payload = {
      app: 'Safe Pakistan', version: APP_VERSION,
      exported_at: new Date().toISOString(), count: scans.length, scans,
    };
    try {
      await Share.share({
        title: 'Safe Pakistan — Scan History',
        message: JSON.stringify(payload, null, 2),
      });
    } catch (e) {
      // user dismissed the share sheet — nothing to do
    }
  };

  const logout = () => Alert.alert(
    'Sign-out',
    'Demo build — sign-in V2 sprint one mein aayega.',
    [{ text: 'Theek hai' }]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation?.goBack?.()} style={styles.backBtn} hitSlop={SIZE.sm}>
          <Ionicons name="chevron-back" size={SIZE.xl} color={COLORS.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Profile</Text>
          <Text style={[typo.bodyUrSm, { marginTop: SPACE.xs }]}>پروفائل</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Identity (demo — placeholder auth) */}
        <View style={[styles.idCard, SHADOW.card]}>
          <Avatar name="Ahmed Khan" color={COLORS.primary} size={56} />
          <View style={{ flex: 1, marginLeft: SPACE.md }}>
            <Text style={styles.name}>Ahmed Khan</Text>
            <Text style={styles.phone}>+92 300 ••• 4412</Text>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>{role.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <Text style={[typo.labelUr, { marginBottom: SPACE.sm }]}>ترجیحات</Text>

        <View style={[styles.card, SHADOW.soft]}>
          <Text style={styles.rowLabel}>Language</Text>
          <View style={styles.chipRow}>
            {LANGS.map(l => {
              const on = language === l.code;
              return (
                <Pressable key={l.code} onPress={() => setLang(l.code)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[l.urdu ? styles.chipTextUr : styles.chipText, on && { color: COLORS.white }]}>
                    {l.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Voice narration</Text>
              <Text style={styles.rowSub}>Verdict Urdu mein sunayein</Text>
            </View>
            <Switch
              value={voice} onValueChange={toggleVoice}
              trackColor={{ true: COLORS.primary, false: COLORS.border }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.rowLabel}>Family role</Text>
          <View style={styles.chipRow}>
            {ROLES.map(r => {
              const on = role === r;
              return (
                <Pressable key={r} onPress={() => setRole(r)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipText, on && { color: COLORS.white }]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Notifications — which verdicts alert the user (neutral styling) */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <Text style={[typo.labelUr, { marginBottom: SPACE.sm }]}>اطلاعات</Text>
        <View style={[styles.card, SHADOW.soft]}>
          <Text style={styles.rowSub}>Alert me for:</Text>
          {NOTIF_ROWS.map((r, i) => (
            <View key={r.key}>
              {i > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.row}>
                <Ionicons name={r.icon} size={SIZE.lg} color={COLORS.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{r.label}</Text>
                  <Text style={styles.rowSub}>{r.sub}</Text>
                </View>
                <Switch
                  value={!!notif[r.key]} onValueChange={(v) => toggleNotif(r.key, v)}
                  trackColor={{ true: COLORS.primary, false: COLORS.border }}
                  thumbColor={COLORS.white}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Privacy & data — auto-delete window + real JSON export */}
        <Text style={styles.sectionLabel}>{'PRIVACY & DATA'}</Text>
        <Text style={[typo.labelUr, { marginBottom: SPACE.sm }]}>رازداری اور ڈیٹا</Text>
        <View style={[styles.card, SHADOW.soft]}>
          <Text style={styles.rowLabel}>Auto-delete scans</Text>
          <Text style={styles.rowSub}>Purane scans khud-ba-khud mita dein</Text>
          <View style={styles.chipRow}>
            {AUTO_DELETE.map(opt => {
              const on = autoDelete === opt.days;
              return (
                <Pressable key={opt.label} onPress={() => chooseAutoDelete(opt.days)}
                  style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipText, on && { color: COLORS.white }]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.row} onPress={exportHistory}>
            <Ionicons name="download-outline" size={SIZE.lg} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Download my scan history</Text>
              <Text style={styles.rowSub}>JSON export · share sheet</Text>
            </View>
            <Ionicons name="share-social-outline" size={SIZE.lg} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <Text style={[typo.labelUr, { marginBottom: SPACE.sm }]}>تعارف</Text>
        <View style={[styles.card, SHADOW.soft]}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>{APP_VERSION}</Text>
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={() => openLink(HF_URL)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Model · Hugging Face</Text>
              <Text style={styles.rowSub} numberOfLines={1}>Noman33/hifazat-edge</Text>
            </View>
            <Ionicons name="open-outline" size={SIZE.lg} color={COLORS.textMuted} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={() => openLink(GITHUB_URL)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Source · GitHub</Text>
              <Text style={styles.rowSub} numberOfLines={1}>Nomi33/hifazat-edge</Text>
            </View>
            <Ionicons name="open-outline" size={SIZE.lg} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* Logout — placeholder (neutral, never red: red is scam-verdict only) */}
        <Pressable style={styles.logout} onPress={logout}>
          <Ionicons name="log-out-outline" size={SIZE.lg} color={COLORS.text} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
        <Text style={styles.footerNote}>Demo build · sign-in V2 sprint one mein</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    paddingHorizontal: SPACE.lg, paddingTop: SPACE.sm, paddingBottom: SPACE.sm,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.text },
  content: { padding: SPACE.lg, paddingTop: SPACE.sm, paddingBottom: SPACE.xl },
  idCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACE.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  name: { fontFamily: FONTS.enExtra, fontSize: SIZE.lg, color: COLORS.text },
  phone: { fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.textMuted, marginTop: SPACE.xs },
  roleChip: {
    alignSelf: 'flex-start', marginTop: SPACE.sm,
    paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs,
    borderRadius: RADIUS.chip, backgroundColor: COLORS.surface2,
  },
  roleChipText: { fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.primary, letterSpacing: 0.6 },
  sectionLabel: {
    fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.textMuted,
    letterSpacing: 1, marginTop: SPACE.lg, marginBottom: SPACE.xs,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACE.md,
    borderWidth: 1, borderColor: COLORS.border, gap: SPACE.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, minHeight: 44 },
  rowLabel: { fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.text },
  rowSub: { fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.textMuted, marginTop: SPACE.xs },
  rowValue: { fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.textMuted, fontVariant: ['tabular-nums'] },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACE.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm },
  chip: {
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.primary + '40',
    minHeight: 44, alignItems: 'center', justifyContent: 'center',
  },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.primary },
  chipTextUr: {
    fontFamily: FONTS.urdu, fontSize: urduSize(SIZE.sm), color: COLORS.primary,
    writingDirection: 'rtl', textAlign: 'center', lineHeight: urduSize(SIZE.sm) * 1.8,
  },
  logout: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.sm,
    minHeight: 52, borderRadius: RADIUS.btn, backgroundColor: COLORS.surface,
    borderWidth: 1.5, borderColor: COLORS.border, marginTop: SPACE.lg,
  },
  logoutText: { fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.text },
  footerNote: {
    fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.textMuted,
    textAlign: 'center', marginTop: SPACE.sm,
  },
});
