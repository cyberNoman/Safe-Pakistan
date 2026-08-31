import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZE, RADIUS, SPACE, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';

const SUGGESTIONS = [
  'Kya JazzCash SMS safe hai?',
  'BISP 8171 verify karo',
  'OTP kab dena chahiye?',
];

export default function ChatScreen({ navigation }) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    { id:'1', from:'bot',  enText:'Assalam o Alaikum Ahmed!', urText:'السلام علیکم! میں آپ کا گارڈین ہوں۔' },
    { id:'2', from:'user', text:'Kya yeh number theek hai? 0312-1234567' },
    { id:'3', from:'bot',  enText:'Yeh JazzCash ka official number nahi hai. JazzCash sirf 4444 se SMS bhejta hai.', warn:'Iss number ne 3 logon ko scam kiya hai.' },
    { id:'4', from:'user', text:'BISP 8171 kya hota hai?' },
    { id:'5', from:'bot',  urText:'بے نظیر انکم سپورٹ پروگرام صرف 8171 سے پیغام بھیجتا ہے' },
  ]);

  const send = () => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setText('');
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        from: 'bot',
        enText: 'Main aapki madad karne ke liye tayar hoon.',
        urText: 'میں آپ کی مدد کرنے کے لیے تیار ہوں۔',
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
          style={[styles.botAvatar, SHADOW.card]}
        >
          <Ionicons name="shield-checkmark" size={SIZE.xl} color={COLORS.white} />
          <View style={styles.onlineDot} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: SIZE.base, color: COLORS.text }}>Guardian</Text>
            <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View>
          </View>
          <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.xs, color: COLORS.accent, marginTop: SPACE.xs }}>
            ● Online · Replies in Urdu / English
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Message list — inverted so the newest message is always anchored at the bottom */}
        <ScrollView inverted style={styles.msgList} contentContainerStyle={styles.msgListContent}
          keyboardShouldPersistTaps="handled">
          {[...messages].reverse().map(m => m.from === 'bot' ? <BotMsg key={m.id} m={m} /> : <UserMsg key={m.id} text={m.text} />)}
          <View style={styles.datePill}>
            <Text style={typo.labelEn}>AAJ · TODAY</Text>
          </View>
        </ScrollView>

        {/* Suggestions — horizontal rail, swipeable */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ backgroundColor: COLORS.bg }}
          contentContainerStyle={styles.suggestionRail}>
          {SUGGESTIONS.map((s, i) => (
            <Pressable key={i} style={styles.suggestion}>
              <Text style={{ fontFamily: FONTS.enSemibold, fontSize: SIZE.sm, color: COLORS.primary }}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputBar}>
          <View style={[styles.inputWrap, SHADOW.soft]}>
            <TextInput
              value={text} onChangeText={setText}
              placeholder="Type karein..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
            />
            <Ionicons name="mic" size={SIZE.lg} color={COLORS.textMuted} />
          </View>
          <Pressable onPress={send} style={[styles.sendBtn, SHADOW.elevated]}>
            <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="send" size={SIZE.lg} color={COLORS.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BotMsg({ m }) {
  return (
    <View style={styles.botRow}>
      <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
        style={styles.botMini}
      >
        <Ionicons name="shield-checkmark" size={SIZE.sm} color={COLORS.white} />
      </LinearGradient>
      <View style={styles.botBubble}>
        {m.enText && <Text style={styles.botText}>{m.enText}</Text>}
        {m.urText && <Text style={[typo.bodyUr, { marginTop: m.enText ? SPACE.xs : 0 }]}>{m.urText}</Text>}
        {m.warn && (
          <View style={styles.warn}>
            <View style={styles.warnLabelRow}>
              <Ionicons name="alert-circle" size={SIZE.xs} color={COLORS.danger} />
              <Text style={[typo.labelEn, { color: COLORS.danger }]}>SUSPICIOUS NUMBER</Text>
            </View>
            <Text style={styles.botText}>{m.warn}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function UserMsg({ text }) {
  return (
    <View style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
      <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
        style={styles.userBubble}
      >
        <Text style={{ fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.white }}>{text}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    paddingHorizontal: SPACE.lg, paddingTop: SPACE.sm, paddingBottom: SPACE.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  botAvatar: {
    width: 44, height: 44, borderRadius: RADIUS.chip,
    alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 12, height: 12, borderRadius: RADIUS.chip, backgroundColor: COLORS.accent,
    borderWidth: 2, borderColor: COLORS.white,
  },
  aiBadge: { backgroundColor: COLORS.primary, paddingHorizontal: SPACE.xs, paddingVertical: SPACE.xs, borderRadius: RADIUS.chip },
  aiBadgeText: { fontFamily: FONTS.enBold, fontSize: SIZE.xs, color: COLORS.white, letterSpacing: 0.3 },
  msgList: { flex: 1, backgroundColor: COLORS.bg },
  msgListContent: { padding: SPACE.md, gap: SPACE.sm },
  datePill: {
    alignSelf: 'center', paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.chip,
    borderWidth: 1, borderColor: COLORS.border, marginVertical: SPACE.xs,
  },
  botRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACE.sm, maxWidth: '85%' },
  botMini: { width: 28, height: 28, borderRadius: RADIUS.chip, alignItems: 'center', justifyContent: 'center' },
  botBubble: {
    backgroundColor: COLORS.surface2, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    borderRadius: RADIUS.btn, borderTopLeftRadius: RADIUS.sm, flexShrink: 1,
  },
  botText: { fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.text, lineHeight: SIZE.sm * 1.5 },
  userBubble: {
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    borderRadius: RADIUS.btn, borderBottomRightRadius: RADIUS.sm,
    ...SHADOW.card,
  },
  warn: {
    marginTop: SPACE.sm, padding: SPACE.sm, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerBg,
  },
  warnLabelRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.xs, marginBottom: SPACE.xs },
  suggestionRail: { paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, gap: SPACE.sm },
  suggestion: {
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, borderRadius: RADIUS.chip,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    minHeight: 44, justifyContent: 'center',
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    backgroundColor: COLORS.bg,
  },
  inputWrap: {
    flex: 1, height: 46, borderRadius: RADIUS.chip, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACE.md, flexDirection: 'row', alignItems: 'center', gap: SPACE.sm,
  },
  input: { flex: 1, fontFamily: FONTS.enMedium, fontSize: SIZE.sm, color: COLORS.text },
  sendBtn: {
    width: 46, height: 46, borderRadius: RADIUS.chip, flexShrink: 0,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
});
