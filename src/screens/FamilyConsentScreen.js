/**
 * FamilyConsentScreen — shown on the INVITED member's own device.
 * Deep-linked from the invite (e.g. safepakistan://invite/:token).
 * Two clearly separated lists: what IS shared vs what is NEVER shared.
 * Fits one 390×844 viewport (no vertical scroll by design).
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { Avatar } from '@/components/Cards';

const SHARED = [
  { t:'Threat alerts',     ur:'خطرے کی اطلاع', d:'Jab koi scam block ho' },
  { t:'Risk scores',       ur:'خطرے کا نمبر',   d:'Sirf number, message nahi' },
  { t:'Protection status', ur:'حفاظت کی حالت', d:'App on hai ya off' },
];

const NEVER = ['Message text', 'Contacts', 'Photos', 'Location'];

export default function FamilyConsentScreen({ route, navigation }) {
  const inviter = route?.params?.inviterName ?? 'Ali Raza';
  const phone   = route?.params?.inviterPhone ?? '+92 300 ••• 4412';
  const token   = route?.params?.token ?? null; // deep link: safepakistan://invite/:token

  const [accepting, setAccepting] = useState(false);

  const accept = async () => {
    if (accepting) return;
    setAccepting(true);
    // await FamilyService.acceptInvite(token); // real backend call lands here
    await new Promise(res => setTimeout(res, 2000)); // brief feedback window
    navigation?.replace?.('Main');
  };
  const decline = () => {
    // await FamilyService.declineInvite(token); // invite dismissed locally
    navigation?.goBack?.();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top','bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: SPACE.lg, paddingBottom: SPACE.sm }} showsVerticalScrollIndicator={false}>
        {/* Inviter identity */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, marginTop: SPACE.sm }}>
          <Avatar name={inviter} color={COLORS.primary} size={52} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.textMuted, letterSpacing: 1 }}>
              INVITATION
            </Text>
            <Text style={{ fontFamily: FONTS.enSemibold, fontSize: SIZE.sm, color: COLORS.textMuted, marginTop: SPACE.xs }}>
              {phone}
            </Text>
          </View>
        </View>

        {/* Header */}
        <Text style={styles.title}>
          {inviter} aap ko Apna Gharana mein add karna chahte hain
        </Text>
        <Text style={[typo.bodyUr, { color: COLORS.textMuted, marginTop: SPACE.sm }]}>
          علی رضا آپ کو اپنے گھرانے میں شامل کرنا چاہتے ہیں
        </Text>

        {/* WILL be shared */}
        <View style={[styles.card, { borderColor: COLORS.accent + '45' }, SHADOW.card]}>
          <View style={[styles.cardHead, { backgroundColor: COLORS.safeBg, borderBottomColor: COLORS.accent + '30' }]}>
            <View style={[styles.headIcon, { backgroundColor: COLORS.accentDk }]}>
              <Ionicons name="checkmark" size={SIZE.sm} color={COLORS.white} />
            </View>
            <View>
              <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.accentDk }}>Yeh share hoga</Text>
              <Text style={[typo.labelUr, { color: COLORS.safeText }]}>یہ شیئر ہوگا</Text>
            </View>
          </View>
          <View style={{ padding: SPACE.sm }}>
            {SHARED.map((x, i) => (
              <View key={x.t} style={[styles.sharedRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
                <View style={{ width: 6, height: 6, borderRadius: RADIUS.chip, backgroundColor: COLORS.accent }} />
                <View style={{ flex: 1, marginLeft: SPACE.sm }}>
                  <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.text }}>{x.t}</Text>
                  <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.textMuted, marginTop: SPACE.xs }}>
                    {x.d}
                  </Text>
                </View>
                <Text style={typo.labelUr}>{x.ur}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* NEVER shared */}
        <View style={[styles.card, { borderColor: COLORS.danger + '35', marginTop: SPACE.sm }, SHADOW.card]}>
          <View style={[styles.cardHead, { backgroundColor: COLORS.dangerBg, borderBottomColor: COLORS.danger + '25' }]}>
            <View style={[styles.headIcon, { backgroundColor: COLORS.danger }]}>
              <Ionicons name="close" size={SIZE.sm} color={COLORS.white} />
            </View>
            <View>
              <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.dangerText }}>
                Yeh kabhi share nahi hoga
              </Text>
              <Text style={[typo.labelUr, { color: COLORS.dangerText }]}>یہ کبھی شیئر نہیں ہوگا</Text>
            </View>
          </View>
          <View style={{ padding: SPACE.sm, flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm }}>
            {NEVER.map(n => (
              <View key={n} style={styles.neverChip}>
                <Ionicons name="close" size={SIZE.sm} color={COLORS.danger} />
                <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.text }}>{n}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={{ paddingHorizontal: SPACE.lg, paddingBottom: SPACE.md, gap: SPACE.sm }}>
        <View style={{ flexDirection: 'row', gap: SPACE.sm }}>
          <Pressable onPress={accept} style={{ flex: 1.4 }}>
            <LinearGradient
              colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
              style={[styles.acceptBtn, SHADOW.elevated]}
            >
              <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.lg, color: COLORS.white }}>Qabool Karein</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={decline} style={[styles.declineBtn, { flex: 1 }]}>
            <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.lg, color: COLORS.text }}>Inkar Karein</Text>
          </Pressable>
        </View>
        <Text style={styles.footer}>Aap kabhi bhi khud nikal sakte hain.</Text>
      </View>

      {/* Accept feedback overlay */}
      {accepting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.surface} />
          <Text style={styles.loadingText}>Gharane mein shamil ho raha hai...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  title: {
    fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.text,
    lineHeight: SIZE.xl * 1.3, marginTop: SPACE.md,
  },
  card: {
    marginTop: SPACE.md, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card, borderWidth: 1, overflow: 'hidden',
  },
  cardHead: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, borderBottomWidth: 1,
  },
  headIcon: {
    width: 24, height: 24, borderRadius: RADIUS.chip,
    alignItems: 'center', justifyContent: 'center',
  },
  sharedRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACE.sm, paddingVertical: SPACE.sm,
  },
  neverChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    paddingHorizontal: SPACE.sm, paddingVertical: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border,
  },
  acceptBtn: {
    height: 54, borderRadius: RADIUS.btn,
    alignItems: 'center', justifyContent: 'center',
  },
  declineBtn: {
    height: 54, borderRadius: RADIUS.btn, backgroundColor: COLORS.surface,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  footer: {
    fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.textMuted,
    textAlign: 'center', lineHeight: SIZE.sm * 1.5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    alignItems: 'center', justifyContent: 'center',
  },
  loadingText: {
    fontFamily: FONTS.enSemibold, fontSize: SIZE.base, color: COLORS.surface,
    marginTop: SPACE.sm,
  },
});
