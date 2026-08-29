/**
 * ScreenshotResultScreen — result view for the "Scan Screenshot" action.
 * Pass the picked image URI via route.params.imageUri (expo-image-picker).
 */
import React from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, RADIUS, SHADOW } from '@/theme/tokens';
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
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => navigation?.goBack?.()} style={[styles.iconBtn, SHADOW.soft]}>
            <Ionicons name="chevron-back" size={18} color={COLORS.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 20, color: COLORS.text }}>Screenshot Result</Text>
            <Text style={[typo.labelUr, { marginTop: 2 }]}>اسکرین شاٹ کا نتیجہ</Text>
          </View>
        </View>

        {/* Thumbnail + verdict */}
        <View style={[styles.card, SHADOW.card, { flexDirection: 'row', gap: 14, marginTop: 16 }]}>
          <Pressable style={styles.thumb}>
            {imageUri
              ? <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              : <View style={styles.thumbPlaceholder}>
                  <Ionicons name="image-outline" size={28} color={COLORS.textMuted} />
                </View>}
            <View style={styles.zoomBadge}>
              <Ionicons name="search" size={12} color="#fff" />
            </View>
          </Pressable>

          <View style={{ flex: 1, gap: 8 }}>
            <VerdictBadge kind="scam" />
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 17, color: COLORS.text, lineHeight: 23 }}>
              Yeh screenshot jaali hai
            </Text>
            <Text style={typo.bodyUrSm}>یہ اسکرین شاٹ جعلی ہے</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              <View style={[styles.metaChip, { backgroundColor: COLORS.dangerBg }]}>
                <Text style={{ fontFamily: FONTS.enExtra, fontSize: 12, color: COLORS.danger }}>
                  Threat {score}
                </Text>
              </View>
              <View style={[styles.metaChip, { backgroundColor: COLORS.surface2 }]}>
                <Text style={{ fontFamily: FONTS.enBold, fontSize: 12, color: COLORS.primary }}>
                  {issues.length} issues
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Detected issues */}
        <View style={{ marginTop: 20 }}>
          <SectionHeader title="Detected Issues" urduTitle="پکڑی گئی خرابیاں" />
          <View style={{ gap: 8 }}>
            {issues.map((x, i) => (
              <View key={x.t} style={[styles.issueRow, SHADOW.soft]}>
                <View style={styles.issueNum}>
                  <Text style={{ fontFamily: FONTS.enBlack, fontSize: 12, color: COLORS.danger }}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontFamily: FONTS.enBold, fontSize: 17, color: COLORS.text, lineHeight: 22 }}>
                    {x.t}
                  </Text>
                  <Text style={{ fontFamily: FONTS.enMedium, fontSize: 13, color: COLORS.textMuted, marginTop: 3, lineHeight: 19 }}>
                    {x.d}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={{ marginTop: 18, gap: 8 }}>
          <Pressable style={[styles.btn, { backgroundColor: COLORS.danger }]}>
            <Ionicons name="close-circle" size={18} color="#fff" />
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 16, color: '#fff' }}>Sender Block Karein</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnOutline]}>
            <Text style={{ fontFamily: FONTS.enBold, fontSize: 14, color: COLORS.text }}>Dobara Scan Karein</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  iconBtn: {
    width: 40, height: 40, borderRadius: RADIUS.icon,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  thumb: {
    width: 86, height: 118, borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#F1F5F9',
  },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  zoomBadge: {
    position: 'absolute', bottom: 6, right: 6,
    width: 22, height: 22, borderRadius: 6,
    backgroundColor: 'rgba(15,23,42,0.8)',
    alignItems: 'center', justifyContent: 'center',
  },
  metaChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  issueRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 13,
    borderWidth: 1, borderColor: COLORS.border,
  },
  issueNum: {
    width: 24, height: 24, borderRadius: 99, backgroundColor: COLORS.dangerBg,
    alignItems: 'center', justifyContent: 'center',
  },
  btn: {
    height: 52, borderRadius: RADIUS.btn, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  btnOutline: {
    height: 46, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: COLORS.border,
  },
});
