/**
 * Reusable card components: StatCard, FamilyMemberCard, ActivityFeedItem,
 * SectionHeader, Avatar, EmptyState, LanguageChip.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, I18nManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZE, RADIUS, SHADOW, SPACE } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { VerdictBadge, StatusPill } from './Indicators';

// ── Avatar (initials) ────────────────────────────────────────
export function Avatar({ name = '', color = COLORS.primary, size = 44 }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: size/2,
      backgroundColor: color, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{
        fontFamily: FONTS.enExtra, color: '#fff',
        fontSize: size * 0.36, letterSpacing: 0.5, includeFontPadding: false,
      }}>{initials}</Text>
    </View>
  );
}

// ── SectionHeader ────────────────────────────────────────────
export function SectionHeader({ title, urduTitle, action, onActionPress }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={typo.h2En}>{title}</Text>
        {urduTitle ? <Text style={[typo.bodyUrSm, { marginTop: 2 }]}>{urduTitle}</Text> : null}
      </View>
      {action ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <Text style={{ fontFamily: FONTS.enSemibold, fontSize: SIZE.sm, color: COLORS.primary }}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ── StatCard ─────────────────────────────────────────────────
export function StatCard({ value, label, urduLabel, color = COLORS.primary, icon }) {
  return (
    <View style={[styles.statCard, SHADOW.card]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon || 'shield-checkmark'} size={16} color={color} />
      </View>
      <Text style={[typo.numberEn, { fontSize: 22, lineHeight: 24, marginTop: 4 }]}>{value}</Text>
      <Text style={{ fontFamily: FONTS.enSemibold, fontSize: SIZE.xs, color: COLORS.textMuted }}>{label}</Text>
      {urduLabel ? <Text style={[typo.labelUr, { marginTop: 2 }]}>{urduLabel}</Text> : null}
    </View>
  );
}

// ── FamilyMemberCard ─────────────────────────────────────────
export function FamilyMemberCard({ member, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.familyCard, SHADOW.soft, pressed && { opacity: 0.85 }
    ]}>
      <Avatar name={member.name} color={member.color} />
      <View style={{ flex: 1, marginHorizontal: SPACE.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: FONTS.enBold, fontSize: 14, color: COLORS.text }}>
            {member.name}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{(member.role || '').toUpperCase()}</Text>
          </View>
        </View>
        <Text style={{ fontFamily: FONTS.enMedium, fontSize: 11, color: COLORS.textMuted, marginTop: 3 }}>
          Last protected: {member.lastProtected}
        </Text>
      </View>
      <StatusPill kind={member.status === 'safe' ? 'safe' : 'off'}>
        {member.status === 'safe' ? 'PROTECTED' : 'OFFLINE'}
      </StatusPill>
    </Pressable>
  );
}

// ── ActivityFeedItem ─────────────────────────────────────────
export function ActivityFeedItem({ tone = 'danger', type, message, time }) {
  const dotColor =
    tone === 'danger' ? COLORS.danger :
    tone === 'warn'   ? COLORS.warning :
                        COLORS.accent;
  const badge = tone === 'danger' ? 'scam' : tone === 'warn' ? 'susp' : 'safe';
  return (
    <View style={[styles.activity, SHADOW.soft]}>
      <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: dotColor }} />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={{ fontFamily: FONTS.enBold, fontSize: 13, color: COLORS.text }}>{type}</Text>
        <Text numberOfLines={1} style={{
          fontFamily: FONTS.enMedium, fontSize: 12, color: COLORS.textMuted, marginTop: 2,
        }}>{message}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <VerdictBadge kind={badge} size="sm" />
        <Text style={{ fontFamily: FONTS.enMedium, fontSize: 11, color: COLORS.textMuted }}>{time}</Text>
      </View>
    </View>
  );
}

// ── LanguageChip ─────────────────────────────────────────────
export function LanguageChip({ flag, label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[
      styles.langChip,
      { backgroundColor: active ? '#fff' : 'rgba(255,255,255,0.1)',
        borderColor: active ? 'transparent' : 'rgba(255,255,255,0.3)' }
    ]}>
      <Text style={{ fontSize: 13 }}>{flag}</Text>
      <Text style={{
        fontFamily: FONTS.enBold, fontSize: 13,
        color: active ? COLORS.primary : '#fff',
      }}>{label}</Text>
    </Pressable>
  );
}

// ── EmptyState ───────────────────────────────────────────────
export function EmptyState({ icon = 'shield-outline', title, urduTitle, cta, onCtaPress }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={36} color={COLORS.primary} />
      </View>
      <Text style={[typo.h2En, { textAlign: 'center', marginTop: 18 }]}>{title}</Text>
      {urduTitle ? <Text style={[typo.bodyUr, { textAlign: 'center', marginTop: 6 }]}>{urduTitle}</Text> : null}
      {cta ? (
        <Pressable onPress={onCtaPress} style={styles.emptyCta}>
          <Text style={{ fontFamily: FONTS.enBold, fontSize: 14, color: '#fff' }}>{cta}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', marginBottom: 12,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  statIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  familyCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  roleBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: COLORS.surface2, borderRadius: 6,
  },
  roleBadgeText: {
    fontFamily: FONTS.enExtra, fontSize: 10,
    color: COLORS.textMuted, letterSpacing: 0.4,
  },
  activity: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: RADIUS.chip, borderWidth: 1,
  },
  empty: { alignItems: 'center', padding: 32 },
  emptyIcon: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center',
  },
  emptyCta: {
    marginTop: 18, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: RADIUS.btn, backgroundColor: COLORS.primary,
  },
});
