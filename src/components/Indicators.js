/**
 * VerdictBadge, StatusPill, ScamTypeChip, AgentStatusDot
 * All small inline indicators — single file for convenience.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SIZE, SPACE } from '@/theme/tokens';

// ── VerdictBadge ─────────────────────────────────────────────
export function VerdictBadge({ kind = 'scam', size = 'md' }) {
  const map = {
    scam:  { label: 'SCAM',       bg: COLORS.danger,  icon: 'warning' },
    safe:  { label: 'SAFE',       bg: COLORS.accentDk,icon: 'checkmark-circle' },
    susp:  { label: 'SUSPICIOUS', bg: COLORS.warning, icon: 'alert-circle' },
  }[kind];
  const isSmall = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: map.bg,
      paddingVertical: SPACE.xs,
      paddingHorizontal: isSmall ? SPACE.sm : SPACE.md,
    }]}>
      <Ionicons name={map.icon} size={isSmall ? SIZE.sm : SIZE.base} color={COLORS.white} />
      <Text style={[styles.badgeLabel, { fontSize: SIZE.xs }]}>{map.label}</Text>
    </View>
  );
}

// ── StatusPill (with colored left border) ────────────────────
export function StatusPill({ kind = 'safe', children }) {
  const map = {
    safe:   { bd: COLORS.accent,    bg: COLORS.safeBg,   tx: COLORS.safeText },
    danger: { bd: COLORS.danger,    bg: COLORS.dangerBg, tx: COLORS.dangerText },
    warn:   { bd: COLORS.warning,   bg: COLORS.warnBg,   tx: COLORS.warnText },
    info:   { bd: COLORS.primary,   bg: COLORS.surface2, tx: COLORS.primary },
    off:    { bd: COLORS.textMuted, bg: COLORS.surface2, tx: COLORS.textMuted },
  }[kind];
  return (
    <View style={[styles.pill, { borderLeftColor: map.bd, backgroundColor: map.bg }]}>
      <Text style={[styles.pillText, { color: map.tx }]}>{children}</Text>
    </View>
  );
}

// ── ScamTypeChip ─────────────────────────────────────────────
export function ScamTypeChip({ icon = '!', label, tone = 'danger' }) {
  const palette = {
    danger: { bg: COLORS.dangerBg, fg: COLORS.danger },
    warn:   { bg: COLORS.warnBg,   fg: COLORS.warnText },
    info:   { bg: COLORS.surface2, fg: COLORS.primary },
  }[tone];
  return (
    <View style={[styles.chip, { backgroundColor: palette.bg }]}>
      <Text style={{ fontSize: SIZE.sm, color: palette.fg }}>{icon}</Text>
      <Text style={[styles.chipLabel, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

// ── AgentStatusDot ───────────────────────────────────────────
export function AgentStatusDot({ label, status = 'on' }) {
  const dot =
    status === 'on'   ? COLORS.accent  :
    status === 'busy' ? COLORS.warning :
                        COLORS.textMuted;
  return (
    <View style={styles.agentRow}>
      <View style={[
        styles.agentDot,
        { backgroundColor: dot },
        status === 'on' && {
          shadowColor: dot, shadowOpacity: 0.5, shadowRadius: SPACE.xs, shadowOffset: { width: 0, height: 0 },
        },
      ]} />
      <Text style={styles.agentLabel}>{label}</Text>
    </View>
  );
}

// ── DemoBadge — "DEMO · SIMULATED" label for simulated surfaces ──────
// Neutral chrome styling (no verdict color) so it never reads as scam/safe.
export function DemoBadge({ style }) {
  return (
    <View style={[styles.demoBadge, style]}>
      <Text style={styles.demoText}>DEMO · SIMULATED</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    borderRadius: RADIUS.chip, gap: SPACE.xs,
  },
  badgeLabel: { fontFamily: FONTS.enExtra, color: COLORS.white, letterSpacing: 0.6 },

  pill: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center',
    borderLeftWidth: 3, paddingVertical: SPACE.xs, paddingHorizontal: SPACE.sm,
    paddingLeft: SPACE.sm, borderRadius: RADIUS.sm,
  },
  pillText: { fontFamily: FONTS.enBold, fontSize: SIZE.xs, letterSpacing: 0.4 },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    paddingVertical: SPACE.sm, paddingHorizontal: SPACE.sm,
    borderRadius: RADIUS.chip, alignSelf: 'flex-start',
  },
  chipLabel: { fontFamily: FONTS.enBold, fontSize: SIZE.xs },

  agentRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  agentDot: { width: SPACE.sm, height: SPACE.sm, borderRadius: RADIUS.chip },
  // Rendered only on the HomeScreen blue hero gradient — white for contrast.
  // The status dot keeps its semantic colour (accent = on, warning = busy).
  agentLabel: {
    fontFamily: FONTS.enSemibold, fontSize: SIZE.xs,
    color: COLORS.white, letterSpacing: 0.2,
  },

  demoBadge: {
    alignSelf: 'flex-start', flexShrink: 0,
    paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs,
    borderRadius: RADIUS.chip, backgroundColor: COLORS.surface2,
    borderWidth: 1, borderColor: COLORS.border,
  },
  demoText: {
    fontFamily: FONTS.enBold, fontSize: SIZE.xs, color: COLORS.textMuted, letterSpacing: 0.4,
  },
});
