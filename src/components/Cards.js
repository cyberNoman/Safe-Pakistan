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
// `member`: { name, color, role } + either simulated { status, lastProtected }
// or a real roster member { phone }. `onRemove` renders a neutral trash button
// (never red — red is the scam verdict only). `pushStatus` ('linked'|'sms')
// renders a channel chip; when 'sms' and `onPushAction` is set the chip is a
// 44pt target that links this device's push token. Backward-compatible.
export function FamilyMemberCard({ member, onPress, onRemove, pushStatus, onPushAction }) {
  const subtitle = member.subtitle
    || (member.lastProtected ? `Last protected: ${member.lastProtected}` : (member.phone || ''));
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.familyCard, SHADOW.soft, pressed && { opacity: 0.85 }
    ]}>
      <Avatar name={member.name} color={member.color} size={40} />
      {/* 360dp rows are width-starved: avatar + channel chip + trash leave the
          name only ~56px, so "Haleema" ellipsized. Margins/gaps are tightened to
          the smallest legal tokens and the name takes all remaining space. */}
      <View style={{ flex: 1, marginHorizontal: SPACE.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.xs }}>
          <Text numberOfLines={1} style={{ fontFamily: FONTS.enBold, fontSize: SIZE.base, color: COLORS.text, flex: 1 }}>
            {member.name}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{(member.role || '').toUpperCase()}</Text>
          </View>
        </View>
        {subtitle ? (
          <Text numberOfLines={1} style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.textMuted, marginTop: SPACE.xs }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {pushStatus ? (
        <Pressable
          onPress={pushStatus === 'sms' ? onPushAction : undefined}
          disabled={pushStatus !== 'sms' || !onPushAction}
          style={[styles.pushChip, pushStatus === 'linked' && styles.pushChipLinked]}>
          <Ionicons
            name={pushStatus === 'linked' ? 'notifications' : 'chatbox-ellipses-outline'}
            size={SIZE.xs}
            color={pushStatus === 'linked' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.pushChipText,
            { color: pushStatus === 'linked' ? COLORS.primary : COLORS.textMuted }]}>
            {pushStatus === 'linked' ? 'PUSH LINKED' : 'SMS ONLY'}
          </Text>
        </Pressable>
      ) : null}
      {member.status ? (
        <StatusPill kind={member.status === 'safe' ? 'safe' : 'off'}>
          {member.status === 'safe' ? 'PROTECTED' : 'OFFLINE'}
        </StatusPill>
      ) : null}
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={SIZE.sm} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={SIZE.lg} color={COLORS.textMuted} />
        </Pressable>
      ) : null}
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
      {flag ? <Text style={{ fontSize: SIZE.sm }}>{flag}</Text> : null}
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
  // 36 visual + hitSlop 8 each side = a 52×44 effective target (law: ≥44×44),
  // while giving the name 8px more room on width-starved 360dp rows.
  removeBtn: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  pushChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.xs, minHeight: 44,
    paddingHorizontal: SPACE.xs, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border,
  },
  pushChipLinked: { backgroundColor: COLORS.primary + '14', borderColor: COLORS.primary + '33' },
  pushChipText: { fontFamily: FONTS.enExtra, fontSize: SIZE.xs, letterSpacing: 0.4 },
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
