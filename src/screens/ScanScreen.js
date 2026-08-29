/**
 * ScanScreen — paste/type SMS, take screenshot, voice input → analyze.
 * Wire `onAnalyze` to your backend (see README).
 */
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, RADIUS, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { ActivityFeedItem, SectionHeader } from '@/components/Cards';

// Mock findings shown on the screenshot result screen until vision analysis lands.
const ISSUES = [
  { t:'Wrong sender shortcode', d:'"8177" bheja — asli BISP 8171 hai' },
  { t:'Mismatched timestamp',   d:'Message time aur SMS log match nahi' },
  { t:'Layout not official',    d:'Font aur button JazzCash app se alag' },
];

// Quick-select preset SMS for one-tap demos of each verdict class.
const PRESETS = [
  { key:'scam',  label:'Scam Sample',
    text:'Mubarak ho! Apko 25,000 mile hain. OTP bhejein foran warna account band ho jayega.' },
  { key:'safe',  label:'Safe Sample',
    text:'Your JazzCash statement for August shows a credit of Rs 5,000. No action required.' },
  { key:'susp',  label:'Suspicious Sample',
    text:'Dear customer, your account will be blocked within 2 hours. Verify now by clicking the link.' },
];

export default function ScanScreen({ navigation }) {
  const [text, setText] = useState('');
  const [preset, setPreset] = useState(null); // key of the selected preset chip

  const applyPreset = p => {
    setText(p.text);
    setPreset(p.key);
  };

  const analyze = async () => {
    // navigation.navigate('Loading');
    // const result = await ScanService.analyze(text);
    // navigation.replace('Verdict', { verdict: result.verdict, score: result.score, ... });
    navigation?.navigate?.('Verdict', { verdict: 'scam' });
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 24, color: COLORS.text }}>SMS Jaanchein</Text>
            <Text style={[typo.bodyUrSm, { marginTop: 2 }]}>پیغام کی جانچ کریں</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="scan" size={20} color={COLORS.primary} />
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
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Chip icon="camera-outline" label="Screenshot" onPress={pickScreenshot} />
            <Chip icon="mic-outline"    label="Awaaz" onPress={() => navigation?.navigate?.('Voice')} />
            <Chip icon="share-outline"  label="Share" />
          </View>
        </View>

        {/* Preset SMS quick-select */}
        <View style={{ marginTop: 16 }}>
          <SectionHeader title="Preset SMS" urduTitle="نمونہ پیغام" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {PRESETS.map(p => (
              <PresetChip key={p.key} label={p.label} active={preset === p.key}
                onPress={() => applyPreset(p)} />
            ))}
          </View>
        </View>

        {/* CTA */}
        <Pressable onPress={analyze} style={({ pressed }) => [
          { marginTop: 16 }, pressed && { transform: [{ scale: 0.98 }] }
        ]}>
          <LinearGradient
            colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
            style={styles.cta}
          >
            <Ionicons name="shield-checkmark" size={22} color="#fff" />
            <Text style={styles.ctaText}>JAANCH KAREIN</Text>
          </LinearGradient>
        </Pressable>

        {/* Tip */}
        <View style={styles.tip}>
          <View style={styles.tipIcon}>
            <Ionicons name="shield-checkmark" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.enBold, fontSize: 13, color: COLORS.text }}>Shuru karne ke liye</Text>
            <Text style={{ fontFamily: FONTS.enMedium, fontSize: 12, color: COLORS.textMuted, marginTop: 3, lineHeight: 18 }}>
              Apne phone se kisi shak wala SMS ya WhatsApp message yahan paste karein.
              4 agents milkar usay jaanchenge.
            </Text>
          </View>
        </View>

        {/* Recent */}
        <View style={{ marginTop: 20 }}>
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
    <Pressable onPress={onPress} style={styles.chip}>
      <Ionicons name={icon} size={16} color={COLORS.primary} />
      <Text style={{ fontFamily: FONTS.enBold, fontSize: 13, color: COLORS.primary }}>{label}</Text>
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
        fontFamily: FONTS.enBold, fontSize: 13,
        color: active ? COLORS.surface : COLORS.primary,
      }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  inputCard: {
    marginTop: 18, backgroundColor: COLORS.surface, borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  inputLabel: { fontFamily: FONTS.enBold, fontSize: 12, color: COLORS.textMuted, letterSpacing: 0.8 },
  input: {
    marginTop: 10, minHeight: 120, padding: 12, borderRadius: 12,
    backgroundColor: COLORS.surface2,
    borderWidth: 1, borderColor: COLORS.primary + '33', borderStyle: 'dashed',
    fontFamily: FONTS.enMedium, fontSize: 14, color: COLORS.text, lineHeight: 20,
    textAlignVertical: 'top',
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99,
    backgroundColor: COLORS.surface2,
    borderWidth: 1, borderColor: COLORS.primary + '25',
  },
  presetChip: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface2,
    borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  cta: {
    height: 58, borderRadius: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: COLORS.primary, shadowOffset:{width:0,height:12},
    shadowOpacity: 0.35, shadowRadius: 32, elevation: 12,
  },
  ctaText: { fontFamily: FONTS.enExtra, fontSize: 16, color: '#fff', letterSpacing: 0.5 },
  tip: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    marginTop: 18, padding: 14, borderRadius: 16,
    backgroundColor: COLORS.surface2,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  tipIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
});
