import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZE, RADIUS, SHADOW, SPACE } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { EmptyState } from '@/components/Cards';
import { useAppContext } from '@/context/AppContext';
import { deriveTone, relTime } from '@/services/LocalDBService';

// Map a real scan record → LibraryRow shape.
function toRow(s, idx) {
  return {
    id: String(s.ts ?? idx),
    tone: deriveTone(s.verdict),
    type: s.scam_type || 'Scan',
    msg: s.msg || '',
    time: relTime(s.ts),
    score: s.score ?? 0,
  };
}

export default function LibraryScreen({ navigation }) {
  const [filter, setFilter] = useState('all');
  // Real scans only — an empty store stays empty (no mock, no back-fill).
  const { scans = [] } = useAppContext();
  const items = scans.map(toRow);

  const counts = {
    all:  items.length,
    scam: items.filter(i => i.tone === 'danger').length,
    susp: items.filter(i => i.tone === 'warn').length,
    safe: items.filter(i => i.tone === 'safe').length,
  };

  // Filter counts are computed from the real store, never hardcoded.
  const FILTERS = [
    { key:'all',  label:'All',        count: counts.all },
    { key:'scam', label:'Scams',      count: counts.scam, tone: COLORS.danger },
    { key:'susp', label:'Suspicious', count: counts.susp, tone: COLORS.warning },
    { key:'safe', label:'Safe',       count: counts.safe, tone: COLORS.accent },
  ];

  const visible = filter === 'all' ? items : items.filter(i =>
    filter === 'scam' ? i.tone === 'danger' : filter === 'susp' ? i.tone === 'warn' : i.tone === 'safe');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      {/* Designated scroller (artboard 10) — vertical scroll is intended */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Threat Library</Text>
        <Text style={[typo.bodyUrSm, { marginTop: SPACE.xs }]}>تمام جانچ کا ریکارڈ</Text>

        <View style={[styles.search, SHADOW.soft]}>
          <Ionicons name="search" size={SIZE.lg} color={COLORS.textMuted} />
          <Text style={styles.searchText}>
            SMS, sender ya scam type dhundein...
          </Text>
        </View>

        {/* Horizontal chip rail — intentionally overflowable (more chips off-screen) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}>
          {FILTERS.map(f => {
            const on = filter === f.key;
            return (
              <Pressable key={f.key} onPress={() => setFilter(f.key)} style={[
                styles.filter,
                on
                  ? { backgroundColor: COLORS.primary }
                  : { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }
              ]}>
                {f.tone && !on && <View style={styles.filterDot(f.tone)} />}
                <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.sm, color: on ? COLORS.white : COLORS.text }}>{f.label}</Text>
                <Text style={{ fontFamily: FONTS.enBold, fontSize: SIZE.xs, color: on ? COLORS.white + 'B3' : COLORS.textMuted }}>{f.count}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.rows}>
          {items.length === 0 ? (
            <EmptyState
              icon="library-outline"
              title="Abhi koi scan nahi"
              urduTitle="ابھی کوئی اسکین نہیں"
              cta="SMS Jaanchein"
              onCtaPress={() => navigation?.navigate?.('Scan')}
            />
          ) : visible.length === 0 ? (
            <Text style={styles.emptyNote}>Is filter mein koi scan nahi.</Text>
          ) : (
            visible.map(item => <LibraryRow key={item.id} item={item} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LibraryRow({ item }) {
  const c = item.tone === 'danger' ? COLORS.danger : item.tone === 'warn' ? COLORS.warning : COLORS.accent;
  return (
    <View style={[styles.row, SHADOW.soft]}>
      <View style={[styles.rowBar, { backgroundColor: c }]} />
      <View style={styles.rowDot(c)} />
      <View style={styles.rowMiddle}>
        <View style={styles.rowHead}>
          <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.sm, color: COLORS.text }}>{item.type}</Text>
          <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.textMuted }}>{item.time}</Text>
        </View>
        <Text numberOfLines={2} style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.textMuted, marginTop: SPACE.xs, lineHeight: SIZE.sm * 1.3 }}>
          {item.msg}
        </Text>
      </View>
      <View style={[styles.score, { borderColor: c }]}>
        <Text style={{ fontFamily: FONTS.enBlack, fontSize: SIZE.sm, color: c, fontVariant: ['tabular-nums'] }}>{item.score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACE.lg, paddingBottom: SPACE.xl },
  title: { fontFamily: FONTS.enExtra, fontSize: SIZE.xl, color: COLORS.text },
  search: {
    marginTop: SPACE.md, height: 46, borderRadius: RADIUS.btn,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACE.md, flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
  },
  searchText: { fontFamily: FONTS.enMedium, fontSize: SIZE.base, color: COLORS.textMuted },
  rail: { gap: SPACE.sm, marginTop: SPACE.md },
  filter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACE.sm, minHeight: 44,
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, borderRadius: RADIUS.chip,
  },
  filterDot: (c) => ({ width: SPACE.sm, height: SPACE.sm, borderRadius: RADIUS.chip, backgroundColor: c }),
  rows: { marginTop: SPACE.md, gap: SPACE.sm },
  emptyNote: {
    fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.textMuted,
    textAlign: 'center', paddingVertical: SPACE.lg,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.btn, padding: SPACE.sm,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  rowBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  rowDot: (c) => ({
    width: SPACE.sm, height: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: c, marginLeft: SPACE.xs,
  }),
  rowMiddle: { flex: 1, marginHorizontal: SPACE.sm },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  score: {
    width: 40, height: 40, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
});
