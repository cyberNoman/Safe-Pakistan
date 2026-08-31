/**
 * ScreenshotResultScreen — result view for the "Scan Screenshot" action.
 * Pass the picked image URI via route.params.imageUri (expo-image-picker).
 * Fits one 390×844 viewport (no vertical scroll by design).
 */
import React from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { VerdictBadge } from '@/components/Indicators';
import { SectionHeader } from '@/components/Cards';

const ISSUES = [
  { t:'Wrong sender shortcode', d:'"8177" bheja — asli BISP 8171 hai' },
  { t:'Mismatched timestamp',   d:'Message time aur SMS log match nahi' },
  { t:'Layout not official',    d:'Font aur button JazzCash app se alag' },
];

export default function ScreenshotResultScreen({ route, navigation }) {
  const imageUri = route?.params?.imageUri;
  const score    = route?.params?.score ?? 91;
  const issues   = route?.params?.issues ?? ISSUES;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
          <Pressable onPress={() => navigation?.goBack?.()} style={[styles.iconBtn, SHADOW.soft]}>
            <Ionicons name="chevron-back" size={SIZE.lg} color={COLORS.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.text }}>Screenshot Result</Text>
            <Text style={[typo.labelUr, { marginTop: SPACE.xs }]}>اسکرین شاٹ کا نتیجہ</Text>
          </View>
        </View>

        {/* Thumbnail + verdict */}
        <View style={[styles.card, SHADOW.card, { flexDirection: 'row', gap: SPACE.md, marginTop: SPACE.md }]}>
          <Pressable style={styles.thumb}>
            {imageUri
              ? <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              : <View style={styles.thumbPlaceholder}>
                  <Ionicons name="image-outline" size={SIZE.xxl} color={COLORS.textMuted} />
                </View>}
            <View style={styles.zoomBadge}>
              <Ionicons name="search" size={SIZE.sm} color={COLORS.white} />
            </View>
          </Pressable>

          <View style={{ flex: 1, gap: SPACE.sm }}>
            <VerdictBadge kind="scam" />
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.lg, color: COLORS.text, lineHeight: SIZE.lg * 1.4 }}>
              Yeh screenshot jaali hai
            </Text>
            <Text style={typo.bodyUrSm}>یہ اسکرین شاٹ جعلی ہے</Text>
            <View style={{ flexDirection: 'row', gap: SPACE.sm, flexWrap: 'wrap' }}>
              <View style={[styles.metaChip, { backgroundColor: COLORS.dangerBg }]}>
                <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.sm, color: COLORS.danger }}>
                  Threat {score}
                </Text>
              </View>
              <View style={[styles.metaChip, { backgroundColor: COLORS.surface2 }]}>
                <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.primary }}>
                  {issues.length} issues
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Detected issues */}
        <View style={{ marginTop: SPACE.md }}>
          <SectionHeader title="Detected Issues" urduTitle="پکڑی گئی خرابیاں" />
          <View style={{ gap: SPACE.sm }}>
            {issues.map((x, i) => (
              <View key={x.t} style={[styles.issueRow, SHADOW.soft]}>
                <View style={styles.issueNum}>
                  <Text style={{ fontFamily: FONTS.enBlack, fontSize: SIZE.sm, color: COLORS.danger }}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: SPACE.sm }}>
                  <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.lg, color: COLORS.text, lineHeight: SIZE.lg * 1.3 }}>
                    {x.t}
                  </Text>
                  <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.textMuted, marginTop: SPACE.xs, lineHeight: SIZE.sm * 1.5 }}>
                    {x.d}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={{ marginTop: SPACE.md, gap: SPACE.sm }}>
          <Pressable style={[styles.btn, { backgroundColor: COLORS.danger }]}>
            <Ionicons name="close-circle" size={SIZE.lg} color={COLORS.white} />
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.white }}>Sender Block Karein</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnOutline]}>
            <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.text }}>Dobara Scan Karein</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACE.lg, paddingBottom: SPACE.xl },
  iconBtn: {
    width: 44, height: 44, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: SPACE.md, borderWidth: 1, borderColor: COLORS.border,
  },
  thumb: {
    width: 86, height: 118, borderRadius: RADIUS.icon, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface2,
  },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  zoomBadge: {
    position: 'absolute', bottom: SPACE.sm, right: SPACE.sm,
    width: 22, height: 22, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.overlay,
    alignItems: 'center', justifyContent: 'center',
  },
  metaChip: { paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs, borderRadius: RADIUS.chip },
  issueRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.btn, padding: SPACE.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  issueNum: {
    width: 24, height: 24, borderRadius: RADIUS.chip, backgroundColor: COLORS.dangerBg,
    alignItems: 'center', justifyContent: 'center',
  },
  btn: {
    height: 52, borderRadius: RADIUS.btn, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: SPACE.sm,
  },
  btnOutline: {
    height: 46, backgroundColor: COLORS.surface,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
});
