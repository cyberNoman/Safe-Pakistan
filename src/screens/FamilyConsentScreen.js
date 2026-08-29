/**
 * FamilyConsentScreen — shown on the INVITED member's own device.
 * Deep-linked from the invite (e.g. safepakistan://invite/:token).
 * Two clearly separated lists: what IS shared vs what is NEVER shared.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, RADIUS, SPACE, SHADOW, gradients } from '@/theme/tokens';
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
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
        {/* Inviter identity */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <Avatar name={inviter} color={COLORS.primary} size={52} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1 }}>
              INVITATION
            </Text>
            <Text style={{ fontFamily: FONTS.enSemibold, fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>
              {phone}
            </Text>
          </View>
        </View>

        {/* Header */}
        <Text style={styles.title}>
          {inviter} aap ko Apna Gharana mein add karna chahte hain
        </Text>
        <Text style={[typo.bodyUr, { color: COLORS.textMuted, marginTop: 8 }]}>
          علی رضا آپ کو اپنے گھرانے میں شامل کرنا چاہتے ہیں
        </Text>

        {/* WILL be shared */}
        <View style={[styles.card, { borderColor: COLORS.accent + '45' }, SHADOW.card]}>
          <View style={[styles.cardHead, { backgroundColor: COLORS.safeBg, borderBottomColor: COLORS.accent + '30' }]}>
            <View style={[styles.headIcon, { backgroundColor: COLORS.accentDk }]}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
            <View>
              <Text style={{ fontFamily: FONTS.enExtra, fontSize: 14, color: '#065F46' }}>Yeh share hoga</Text>
              <Text style={[typo.labelUr, { color: '#047857' }]}>یہ شیئر ہوگا</Text>
            </View>
          </View>
          <View style={{ padding: 6 }}>
            {SHARED.map((x, i) => (
              <View key={x.t} style={[styles.sharedRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
                <View style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: COLORS.accent }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontFamily: FONTS.enBold, fontSize: 15, color: COLORS.text }}>{x.t}</Text>
                  <Text style={{ fontFamily: FONTS.enMedium, fontSize: 12, color: COLORS.textMuted, marginTop: 1 }}>
                    {x.d}
                  </Text>
                </View>
                <Text style={typo.labelUr}>{x.ur}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* NEVER shared */}
        <View style={[styles.card, { borderColor: COLORS.danger + '35', marginTop: 12 }, SHADOW.card]}>
          <View style={[styles.cardHead, { backgroundColor: COLORS.dangerBg, borderBottomColor: COLORS.danger + '25' }]}>
            <View style={[styles.headIcon, { backgroundColor: COLORS.danger }]}>
              <Ionicons name="close" size={14} color="#fff" />
            </View>
            <View>
              <Text style={{ fontFamily: FONTS.enExtra, fontSize: 14, color: '#B91C1C' }}>
                Yeh kabhi share nahi hoga
              </Text>
              <Text style={[typo.labelUr, { color: '#B91C1C' }]}>یہ کبھی شیئر نہیں ہوگا</Text>
            </View>
          </View>
          <View style={{ padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {NEVER.map(n => (
              <View key={n} style={styles.neverChip}>
                <Ionicons name="close" size={12} color={COLORS.danger} />
                <Text style={{ fontFamily: FONTS.enBold, fontSize: 14, color: COLORS.text }}>{n}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={accept} style={{ flex: 1.4 }}>
            <LinearGradient
              colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
              style={styles.acceptBtn}
            >
              <Text style={{ fontFamily: FONTS.enExtra, fontSize: 17, color: '#fff' }}>Qabool Karein</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={decline} style={[styles.declineBtn, { flex: 1 }]}>
            <Text style={{ fontFamily: FONTS.enBold, fontSize: 17, color: COLORS.text }}>Inkar Karein</Text>
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
    fontFamily: FONTS.enExtra, fontSize: 21, color: COLORS.text,
    lineHeight: 28, marginTop: 16,
  },
  card: {
    marginTop: 20, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card, borderWidth: 1, overflow: 'hidden',
  },
  cardHead: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
  },
  headIcon: {
    width: 24, height: 24, borderRadius: 99,
    alignItems: 'center', justifyContent: 'center',
  },
  sharedRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 10,
  },
  neverChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border,
  },
  acceptBtn: {
    height: 54, borderRadius: RADIUS.btn,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset:{width:0,height:8},
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 8,
  },
  declineBtn: {
    height: 54, borderRadius: RADIUS.btn, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  footer: {
    fontFamily: FONTS.enMedium, fontSize: 13, color: COLORS.textMuted,
    textAlign: 'center', lineHeight: 19,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    alignItems: 'center', justifyContent: 'center',
  },
  loadingText: {
    fontFamily: FONTS.enSemibold, fontSize: 14, color: COLORS.surface,
    marginTop: SPACE.sm,
  },
});
