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
        fontFamily: FONTS.enExtra, color: COLORS.white,
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
        {urduTitle ? <Text style={[typo.bodyUrSm, { marginTop: SPACE.xs }]}>{urduTitle}</Text> : null}
      </View>
      {action ? (
        <Pressable onPress={onActionPress} hitSlop={SIZE.lg}>
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
        <Ionicons name={icon || 'shield-checkmark'} size={SIZE.base} color={color} />
      </View>
      <Text style={[typo.numberEn, { fontSize: SIZE.xl, lineHeight: SIZE.xl * 1.1, marginTop: SPACE.xs }]}>{value}</Text>
      <Text style={{ fontFamily: FONTS.enSemibold, fontSize: SIZE.xs, color: COLORS.textMuted }}>{label}</Text>
      {urduLabel ? <Text style={[typo.labelUr, { marginTop: SPACE.xs }]}>{urduLabel}</Text> : null}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
          <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.text }}>
            {member.name}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{(member.role || '').toUpperCase()}</Text>
          </View>
        </View>
        <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.textMuted, marginTop: SPACE.xs }}>
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
      <View style={styles.activityDot(dotColor)} />
      <View style={styles.activityMiddle}>
        <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: COLORS.text }}>{type}</Text>
        <Text numberOfLines={1} style={{
          fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.textMuted, marginTop: SPACE.xs,
        }}>{message}</Text>
      </View>
      <View style={styles.activityRight}>
        <VerdictBadge kind={badge} size="sm" />
        <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.textMuted }}>{time}</Text>
      </View>
    </View>
  );
}

// ── LanguageChip ─────────────────────────────────────────────
export function LanguageChip({ flag, label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[
      styles.langChip,
      { backgroundColor: active ? COLORS.white : COLORS.white + '1A',
        borderColor: active ? 'transparent' : COLORS.white + '4D' }
    ]}>
      <Text style={{ fontSize: SIZE.sm }}>{flag}</Text>
      <Text style={{
        fontFamily: FONTS.enBold, fontSize: SIZE.sm,
        color: active ? COLORS.primary : COLORS.white,
      }}>{label}</Text>
    </Pressable>
  );
}

// ── EmptyState ───────────────────────────────────────────────
export function EmptyState({ icon = 'shield-outline', title, urduTitle, cta, onCtaPress }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={SIZE.xxl} color={COLORS.primary} />
      </View>
      <Text style={[typo.h2En, { textAlign: 'center', marginTop: SPACE.md }]}>{title}</Text>
      {urduTitle ? <Text style={[typo.bodyUr, { textAlign: 'center', marginTop: SPACE.xs }]}>{urduTitle}</Text> : null}
      {cta ? (
        <Pressable onPress={onCtaPress} style={styles.emptyCta}>
          <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.white }}>{cta}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', marginBottom: SPACE.sm,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: SPACE.md, borderWidth: 1, borderColor: COLORS.border,
  },
  statIcon: {
    width: 28, height: 28, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  familyCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.btn, padding: SPACE.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  roleBadge: {
    paddingHorizontal: SPACE.xs, paddingVertical: SPACE.xs / 2,
    backgroundColor: COLORS.surface2, borderRadius: RADIUS.sm,
  },
  roleBadgeText: {
    fontFamily: FONTS.enExtra, fontSize: SIZE.xs,
    color: COLORS.textMuted, letterSpacing: 0.4,
  },
  activity: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.btn, padding: SPACE.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  activityDot: (c) => ({ width: SPACE.sm, height: SPACE.sm, borderRadius: RADIUS.chip, backgroundColor: c }),
  activityMiddle: { flex: 1, marginHorizontal: SPACE.sm },
  activityRight: { alignItems: 'flex-end', gap: SPACE.xs },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, minHeight: 44,
    paddingHorizontal: SPACE.sm, paddingVertical: SPACE.sm,
    borderRadius: RADIUS.chip, borderWidth: 1,
  },
  empty: { alignItems: 'center', padding: SPACE.xl },
  emptyIcon: {
    width: 88, height: 88, borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center',
  },
  emptyCta: {
    marginTop: SPACE.md, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm,
    minHeight: 44, justifyContent: 'center',
    borderRadius: RADIUS.btn, backgroundColor: COLORS.primary,
  },
});
