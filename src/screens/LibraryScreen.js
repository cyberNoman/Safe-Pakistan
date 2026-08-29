import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOW } from '@/theme/tokens';
import { typo } from '@/theme/typography';
import { LocalDBService, MOCK_SCAN_HISTORY } from '@/data/mockData';

// Map a history record to the LibraryRow shape (score defaulted by tone).
function toRow(item, idx) {
  const tone = item.tone;
  return {
    id: item.id ?? String(idx),
    tone,
    type: item.type,
    msg: item.msg ?? item.message,
    time: item.time,
    score: item.score ?? (tone === 'danger' ? 92 : tone === 'warn' ? 64 : 8),
  };
}

const FILTERS = [
  { key:'all',    label:'All',         count: 47 },
  { key:'scam',   label:'Scams',       count: 18, tone: COLORS.danger },
  { key:'susp',   label:'Suspicious',  count:  9, tone: COLORS.warning },
  { key:'safe',   label:'Safe',        count: 20, tone: COLORS.accent },
];

export default function LibraryScreen({ navigation }) {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);

  // Load scan history from LocalDBService; fall back to mock data on empty/throw.
  useEffect(() => {
    let alive = true;
    (async () => {
      let rows = [];
      try {
        rows = (await LocalDBService.getScanHistory()) || [];
      } catch (e) {
        rows = [];
      }
      if (!rows.length) rows = MOCK_SCAN_HISTORY;
      if (alive) setItems(rows.map(toRow));
    })();
    return () => { alive = false; };
  }, []);

  const visible = filter === 'all' ? items : items.filter(i =>
    filter === 'scam' ? i.tone === 'danger' : filter === 'susp' ? i.tone === 'warn' : i.tone === 'safe');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: FONTS.enExtra, fontSize: 24, color: COLORS.text }}>Threat Library</Text>
        <Text style={[typo.bodyUrSm, { marginTop: 2 }]}>تمام جانچ کا ریکارڈ</Text>

        <View style={[styles.search, SHADOW.soft]}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <Text style={{ fontFamily: FONTS.enMedium, fontSize: 14, color: COLORS.textMuted }}>
            SMS, sender ya scam type dhundein...
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, marginTop: 14 }}>
          {FILTERS.map(f => {
            const on = filter === f.key;
            return (
              <Pressable key={f.key} onPress={() => setFilter(f.key)} style={[
                styles.filter,
                on ? { backgroundColor: COLORS.primary } : { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }
              ]}>
                {f.tone && !on && <View style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: f.tone }} />}
                <Text style={{ fontFamily: FONTS.enBold, fontSize: 13, color: on ? '#fff' : COLORS.text }}>{f.label}</Text>
                <Text style={{ fontFamily: FONTS.enBold, fontSize: 11, color: on ? 'rgba(255,255,255,0.7)' : COLORS.textMuted }}>{f.count}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ marginTop: 14, gap: 8 }}>
          {visible.map(item => <LibraryRow key={item.id} item={item} />)}
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
      <View style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: c, marginLeft: 4 }} />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontFamily: FONTS.enExtra, fontSize: 13, color: COLORS.text }}>{item.type}</Text>
          <Text style={{ fontFamily: FONTS.enMedium, fontSize: 11, color: COLORS.textMuted }}>{item.time}</Text>
        </View>
        <Text numberOfLines={2} style={{ fontFamily: FONTS.enMedium, fontSize: 12, color: COLORS.textMuted, marginTop: 3, lineHeight: 17 }}>
          {item.msg}
        </Text>
      </View>
      <View style={[styles.score, { borderColor: c }]}>
        <Text style={{ fontFamily: FONTS.enBlack, fontSize: 12, color: c, fontVariant:['tabular-nums'] }}>{item.score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    marginTop: 14, height: 46, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  filter: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  rowBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  score: {
    width: 40, height: 40, borderRadius: 99,
    backgroundColor: '#fff', borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
});
