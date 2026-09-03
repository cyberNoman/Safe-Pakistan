/**
 * ScanScreen — paste/type SMS, take screenshot, voice input → analyze.
 * Fits one 390×844 viewport (no vertical scroll by design).
 * Wire `onAnalyze` to your backend (see README).
 */
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Share, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { ActivityFeedItem, SectionHeader } from '@/components/Cards';
import { PRESET_SMS } from '@/data/mockData';
import { analyzeText } from '@/services/api';

// Mock findings shown on the screenshot result screen until vision analysis lands.
const ISSUES = [
  { t:'Wrong sender shortcode', d:'"8177" bheja — asli BISP 8171 hai' },
  { t:'Mismatched timestamp',   d:'Message time aur SMS log match nahi' },
  { t:'Layout not official',    d:'Font aur button JazzCash app se alag' },
];

// Quick-select preset SMS for one-tap demos of each verdict class.
const PRESETS = [
  { key:'scam', label:'SCAM Demo', text: PRESET_SMS.scam },
  { key:'safe', label:'SAFE Demo', text: PRESET_SMS.safe },
  { key:'susp', label:'SUSP Demo', text: PRESET_SMS.suspicious },
];

export default function ScanScreen({ navigation }) {
  const [text, setText] = useState('');
  const [preset, setPreset] = useState(null); // key of the selected preset chip

  const applyPreset = p => {
    setText(p.text);
    setPreset(p.key);
  };

  const analyze = async () => {
    if (!text.trim()) return;
    // LoadingScreen runs analyzeText() (backend → offline fallback) and
    // replaces itself with the Verdict screen.
    navigation?.navigate?.('Loading', { text });
  };

  // Screenshot chip → pick from gallery → mock-analyzed result screen.
  const pickScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    navigation?.navigate?.('ScreenshotResult', {
      imageUri: result.assets[0].uri,
      score: 91,
      issues: ISSUES,
    });
  };

  // Share chip → native share sheet. Contextual: if a message is pasted, share
  // that warning (the reason you are on this screen); otherwise share the app
  // invite. Never a dead tap, and never invents a verdict we did not compute.
  const shareCurrent = async () => {
    const body = text.trim()
      ? `HIFAZAT WARNING — yeh SMS jaanch ke liye bheja ja raha hai:\n\n"${text.trim()}"\n\nIska jawab na dein. Hifazat App se jaanchein.`
      : 'Hifazat App — Apne Ghar Ki Hifazat.\nShak wala SMS, WhatsApp ya screenshot jaanchein aur SCAM / SUSPICIOUS / SAFE ka faisla paayein.';
    try {
      await Share.share({ message: body, title: 'Hifazat — Safe Pakistan' });
    } catch (e) {
      // Dismissed sheet or no share target — not an error worth surfacing.
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.text }}>SMS Jaanchein</Text>
            <Text style={[typo.bodyUrSm, { marginTop: SPACE.xs }]}>پیغام کی جانچ کریں</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="scan" size={SIZE.xl} color={COLORS.primary} />
          </View>
        </View>

        {/* Input card */}
        <View style={[styles.inputCard, SHADOW.card]}>
          <Text style={styles.inputLabel}>PASTE OR TYPE</Text>
          <TextInput
            value={text}
            onChangeText={t => { setText(t); setPreset(null); }}
            placeholder="Yahan SMS paste karein ya screenshot upload karein..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            style={styles.input}
          />
          <View style={{ flexDirection: 'row', gap: SPACE.sm, marginTop: SPACE.sm }}>
            <Chip icon="camera-outline" label="Screenshot" onPress={pickScreenshot} />
            <Chip icon="mic-outline"    label="Awaaz" onPress={() => navigation?.navigate?.('Voice')} />
            <Chip icon="share-outline"  label="Share" onPress={shareCurrent} />
          </View>
        </View>

        {/* Preset SMS quick-select */}
        <View style={{ marginTop: SPACE.md }}>
          <SectionHeader title="Preset SMS" urduTitle="نمونہ پیغام" />
          <View style={{ flexDirection: 'row', gap: SPACE.sm }}>
            {PRESETS.map(p => (
              <PresetChip key={p.key} label={p.label} active={preset === p.key}
                onPress={() => applyPreset(p)} />
            ))}
          </View>
        </View>

        {/* CTA */}
        <Pressable onPress={analyze} style={({ pressed }) => [
          { marginTop: SPACE.md }, pressed && { transform: [{ scale: 0.98 }] }
        ]}>
          <LinearGradient
            colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
            style={[styles.cta, SHADOW.elevated]}
          >
            <Ionicons name="shield-checkmark" size={SIZE.xl} color={COLORS.white} />
            <Text style={styles.ctaText}>JAANCH KAREIN</Text>
          </LinearGradient>
        </Pressable>

        {/* Tip */}
        <View style={styles.tip}>
          <View style={styles.tipIcon}>
            <Ionicons name="shield-checkmark" size={SIZE.lg} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.text }}>Shuru karne ke liye</Text>
            <Text style={styles.tipText}>
              Apne phone se kisi shak wala SMS ya WhatsApp message yahan paste karein.
              4 agents milkar usay jaanchenge.
            </Text>
          </View>
        </View>

        {/* Recent */}
        <View style={{ marginTop: SPACE.md }}>
          <SectionHeader title="Aakhri Jaanch" urduTitle="آخری جانچ" />
          <ActivityFeedItem
            tone="danger" type="BISP 8171 Fraud"
            message="Mubarak ho! Apko 25,000 mile hain..." time="2m"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [styles.chip, pressed && { transform: [{ scale: 0.98 }] }]}>
      <Ionicons name={icon} size={SIZE.base} color={COLORS.primary} />
      <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.primary }}>{label}</Text>
    </Pressable>
  );
}

function PresetChip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.presetChip,
      active && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
      pressed && { transform: [{ scale: 0.98 }] },
    ]}>
      <Text style={{
        fontFamily: FONTS.enBold, fontSize: SIZE.sm,
        color: active ? COLORS.surface : COLORS.primary,
      }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACE.lg, paddingBottom: SPACE.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerIcon: {
    width: 44, height: 44, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  inputCard: {
    marginTop: SPACE.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: SPACE.md, borderWidth: 1, borderColor: COLORS.border,
  },
  inputLabel: { fontFamily: FONTS.enBold, fontSize: SIZE.xs, color: COLORS.textMuted, letterSpacing: 0.8 },
  input: {
    marginTop: SPACE.sm, minHeight: 120, padding: SPACE.sm, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.surface2,
    borderWidth: 1, borderColor: COLORS.primary + '33', borderStyle: 'dashed',
    fontFamily: FONTS.enMedium, fontSize: SIZE.base, color: COLORS.text, lineHeight: SIZE.base * 1.5,
    textAlignVertical: 'top',
  },
  // Chip rail budget: three chips must fit the input card's inner width on a
  // 360dp device (~280px) as well as 390 (~310px). SPACE.md padding overran both;
  // SPACE.sm lands at ~273px so nothing clips or wraps.
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    paddingHorizontal: SPACE.sm, paddingVertical: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface2,
    borderWidth: 1, borderColor: COLORS.primary + '25',
    minHeight: 44, justifyContent: 'center',
  },
  presetChip: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface2,
    borderWidth: 1, borderColor: COLORS.primary + '40',
    minHeight: 44,
  },
  cta: {
    height: 58, borderRadius: RADIUS.btn, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: SPACE.sm,
  },
  ctaText: { fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.white, letterSpacing: 0.5 },
  tip: {
    flexDirection: 'row', gap: SPACE.sm, alignItems: 'flex-start',
    marginTop: SPACE.md, padding: SPACE.md, borderRadius: RADIUS.btn,
    backgroundColor: COLORS.surface2,
  },
  tipText: {
    fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.textMuted,
    marginTop: SPACE.xs, lineHeight: SIZE.sm * 1.5,
  },
  tipIcon: {
    width: 32, height: 32, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
});
