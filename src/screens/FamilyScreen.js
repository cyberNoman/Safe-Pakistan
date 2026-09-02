/**
 * FamilyScreen — Family Shield roster (real, user-managed).
 *
 * Members live in AsyncStorage via LocalDBService — NEVER mock-seeded, so an
 * empty roster shows a clean empty state. Every displayed number (header chip,
 * hero, avatars, list) derives from the SAME real array, so they stay in sync.
 *
 * "Notify Family" is a DEMO action: an in-screen toast ("Notification sent
 * (DEMO)") + a local counter. Real push is V2 (Alibaba Cloud Mobile Push) — see
 * VISION.md; no push permission or notification service is wired here.
 *
 * The roster is unbounded (add/remove), so the screen scrolls to fit any count.
 * Remove is a NEUTRAL trash button — red is reserved for the scam verdict only.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { Avatar, SectionHeader, FamilyMemberCard, EmptyState } from '@/components/Cards';
import { BottomSheet } from '@/components/Overlays';
import { LocalDBService } from '@/services/LocalDBService';

// Avatar colours cycle through brand tokens only (no hardcoded hex).
const PALETTE = [COLORS.primary, COLORS.accentDk, COLORS.warning, COLORS.primaryLt, COLORS.accent];
const ROLES = ['Parent', 'Sibling', 'Child', 'Other'];
const MAX_HERO_AVATARS = 5;

export default function FamilyScreen() {
  const [members, setMembers] = useState([]);
  const [notifyCount, setNotifyCount] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Add-member form state.
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Parent');

  const load = useCallback(async () => {
    setMembers(await LocalDBService.getFamilyMembers());
    setNotifyCount(await LocalDBService.getNotifyCount());
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-hide the toast.
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const openAdd = () => { setName(''); setPhone(''); setRole('Parent'); setSheetOpen(true); };

  const saveMember = async () => {
    if (!name.trim()) {
      Alert.alert('Naam zaroori hai', 'Member ka naam likhein.');
      return;
    }
    const next = await LocalDBService.addFamilyMember({ name, phone, role });
    setMembers(next);
    setSheetOpen(false);
    setToast('Member add ho gaya');
  };

  const removeMember = (m) => {
    Alert.alert('Remove member', `${m.name} ko gharane se hata dein?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        onPress: async () => {
          const next = await LocalDBService.removeFamilyMember(m.id);
          setMembers(next);
          setToast('Member hata diya gaya');
        },
      },
    ]);
  };

  // DEMO notify — no real push. Toast + persisted local counter.
  const notifyFamily = async () => {
    if (!members.length) {
      Alert.alert('Koi member nahi', 'Pehle ek family member add karein.');
      return;
    }
    const n = await LocalDBService.bumpNotifyCount();
    setNotifyCount(n);
    setToast('Notification sent (DEMO)');
  };

  const heroTitle = members.length
    ? `${members.length} member${members.length === 1 ? '' : 's'} gharane mein`
    : 'Apna gharana jodein';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>Apna Gharana</Text>
            <Text style={[typo.bodyUrSm, { marginTop: SPACE.xs }]}>اپنا گھرانہ</Text>
          </View>
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        {/* Hero */}
        <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
          style={[styles.hero, SHADOW.elevated]}>
          <Text style={styles.heroLabel}>FAMILY SHIELD</Text>
          <Text style={styles.heroTitle}>{heroTitle}</Text>
          <Text style={[typo.bodyUrInv, { marginTop: SPACE.xs }]}>
            {members.length ? 'آپ کے گھر کے ارکان' : 'اپنے گھر کے ارکان شامل کریں'}
          </Text>

          {members.length > 0 && (
            <View style={{ flexDirection: 'row', marginTop: SPACE.md }}>
              {members.slice(0, MAX_HERO_AVATARS).map((m, i) => (
                <View key={m.id} style={{ marginLeft: i ? -SPACE.sm : 0,
                  borderWidth: 2, borderColor: COLORS.white, borderRadius: RADIUS.chip }}>
                  <Avatar name={m.name} color={PALETTE[i % PALETTE.length]} size={32} />
                </View>
              ))}
              {members.length > MAX_HERO_AVATARS && (
                <View style={[styles.moreBubble, { marginLeft: -SPACE.sm }]}>
                  <Text style={styles.moreBubbleText}>+{members.length - MAX_HERO_AVATARS}</Text>
                </View>
              )}
            </View>
          )}

          {notifyCount > 0 && (
            <View style={styles.notifyCountRow}>
              <Ionicons name="notifications-outline" size={SIZE.sm} color={COLORS.white} />
              <Text style={styles.notifyCountText}>
                {notifyCount} DEMO alert{notifyCount === 1 ? '' : 's'} sent
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Notify family — DEMO */}
        <Pressable onPress={notifyFamily}
          style={({ pressed }) => [styles.notifyBtn, SHADOW.card, pressed && { transform: [{ scale: 0.98 }] }]}>
          <Ionicons name="megaphone-outline" size={SIZE.lg} color={COLORS.white} />
          <Text style={styles.notifyBtnText}>Notify Family</Text>
        </Pressable>

        {/* Members */}
        <View style={{ marginTop: SPACE.md }}>
          <SectionHeader title="Members" urduTitle="ارکان" action="Add" onActionPress={openAdd} />
          {members.length ? (
            <View style={{ gap: SPACE.sm }}>
              {members.map((m, i) => (
                <FamilyMemberCard
                  key={m.id}
                  member={{ id: m.id, name: m.name, role: m.role, phone: m.phone, color: PALETTE[i % PALETTE.length] }}
                  onRemove={() => removeMember(m)}
                />
              ))}
            </View>
          ) : (
            <EmptyState icon="people-outline" title="Abhi koi member nahi"
              urduTitle="ابھی کوئی رکن نہیں" cta="Member Add Karein" onCtaPress={openAdd} />
          )}
        </View>
      </ScrollView>

      {/* Add-member sheet */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Ghar Wala Jodein">
        <Text style={[typo.bodyUrSm, { marginBottom: SPACE.sm }]}>گھر والے کو شامل کریں</Text>

        <Text style={styles.fieldLabel}>Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="e.g. Ammi"
          placeholderTextColor={COLORS.textMuted} style={styles.input} />

        <Text style={styles.fieldLabel}>Phone</Text>
        <TextInput value={phone} onChangeText={setPhone} placeholder="+92 300 0000000"
          placeholderTextColor={COLORS.textMuted} keyboardType="phone-pad" style={styles.input} />

        <Text style={styles.fieldLabel}>Role</Text>
        <View style={styles.roleRow}>
          {ROLES.map(r => {
            const on = role === r;
            return (
              <Pressable key={r} onPress={() => setRole(r)} style={[styles.roleChip, on && styles.roleChipOn]}>
                <Text style={[styles.roleChipText, on && { color: COLORS.white }]}>{r}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={saveMember}
          style={({ pressed }) => [styles.saveBtn, pressed && { transform: [{ scale: 0.98 }] }]}>
          <Text style={styles.saveBtnText}>Save Member</Text>
        </Pressable>
      </BottomSheet>

      {/* Toast */}
      {toast ? (
        <Animated.View entering={FadeInUp.duration(200)} exiting={FadeOutDown.duration(200)} style={[styles.toast, SHADOW.elevated]}>
          <Ionicons name="checkmark-circle" size={SIZE.base} color={COLORS.white} />
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACE.lg, paddingBottom: SPACE.xl },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenTitle: { fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.text },
  countChip: {
    paddingHorizontal: SPACE.sm, paddingVertical: SPACE.sm,
    borderRadius: RADIUS.chip, backgroundColor: COLORS.surface2,
  },
  countChipText: { fontFamily: FONTS.enExtra, fontSize: SIZE.sm, color: COLORS.primary },
  hero: { borderRadius: RADIUS.card, padding: SPACE.md, marginTop: SPACE.md, overflow: 'hidden' },
  heroLabel: { fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.white + 'B3', letterSpacing: 1.2 },
  heroTitle: { fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.white, marginTop: SPACE.xs },
  moreBubble: {
    width: 32, height: 32, borderRadius: RADIUS.chip, backgroundColor: COLORS.white20,
    borderWidth: 2, borderColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
  },
  moreBubbleText: { fontFamily: FONTS.enExtra, fontSize: SIZE.xs, color: COLORS.white },
  notifyCountRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.xs, marginTop: SPACE.sm },
  notifyCountText: { fontFamily: FONTS.enSemibold, fontSize: SIZE.xs, color: COLORS.white80 },
  notifyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.sm,
    marginTop: SPACE.md, minHeight: 52, borderRadius: RADIUS.btn, backgroundColor: COLORS.primary,
  },
  notifyBtnText: { fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.white },
  fieldLabel: {
    fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.textMuted,
    marginTop: SPACE.sm, marginBottom: SPACE.xs,
  },
  input: {
    backgroundColor: COLORS.surface2, borderRadius: RADIUS.btn, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACE.md, minHeight: 48, fontFamily: FONTS.enMedium, fontSize: SIZE.base, color: COLORS.text,
  },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm },
  roleChip: {
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border,
    minHeight: 44, alignItems: 'center', justifyContent: 'center',
  },
  roleChipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleChipText: { fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.primary },
  saveBtn: {
    marginTop: SPACE.lg, minHeight: 52, borderRadius: RADIUS.btn,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.white },
  toast: {
    position: 'absolute', bottom: SPACE.xl, alignSelf: 'center', maxWidth: '90%',
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    backgroundColor: COLORS.text, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    borderRadius: RADIUS.chip,
  },
  toastText: { fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.white },
});
