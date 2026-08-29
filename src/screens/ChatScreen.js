import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOW, gradients } from '@/theme/tokens';
import { typo } from '@/theme/typography';

const SUGGESTIONS = [
  'Kya JazzCash SMS safe hai?',
  'BISP 8171 verify karo',
  'OTP kab dena chahiye?',
];

export default function ChatScreen({ navigation }) {
  const [text, setText] = useState('');
  const [messages] = useState([
    { id:'1', from:'bot',  enText:'Assalam o Alaikum Ahmed!', urText:'السلام علیکم! میں آپ کا گارڈین ہوں۔' },
    { id:'2', from:'user', text:'Kya yeh number theek hai? 0312-1234567' },
    { id:'3', from:'bot',  enText:'Yeh JazzCash ka official number nahi hai. JazzCash sirf 4444 se SMS bhejta hai.', warn:'Iss number ne 3 logon ko scam kiya hai.' },
    { id:'4', from:'user', text:'BISP 8171 kya hota hai?' },
    { id:'5', from:'bot',  urText:'بے نظیر انکم سپورٹ پروگرام صرف 8171 سے پیغام بھیجتا ہے' },
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
          style={styles.botAvatar}
        >
          <Ionicons name="shield-checkmark" size={22} color="#fff" />
          <View style={styles.onlineDot} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontFamily: FONTS.enExtra, fontSize: 15, color: COLORS.text }}>Guardian</Text>
            <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View>
          </View>
          <Text style={{ fontFamily: FONTS.enMedium, fontSize: 12, color: COLORS.accent, marginTop: 2 }}>
            ● Online · Replies in Urdu / English
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }}
          contentContainerStyle={{ padding: 16, gap: 10 }}>
          <View style={styles.datePill}>
            <Text style={styles.datePillText}>AAJ · TODAY</Text>
          </View>
          {messages.map(m => m.from === 'bot' ? <BotMsg key={m.id} m={m} /> : <UserMsg key={m.id} text={m.text} />)}
        </ScrollView>

        {/* Suggestions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ backgroundColor: COLORS.bg }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 6 }}>
          {SUGGESTIONS.map((s, i) => (
            <Pressable key={i} style={styles.suggestion}>
              <Text style={{ fontFamily: FONTS.enSemibold, fontSize: 12, color: COLORS.primary }}>{s}</Text>
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
            <Ionicons name="mic" size={18} color={COLORS.textMuted} />
          </View>
          <Pressable style={[styles.sendBtn, SHADOW.elevated]}>
            <LinearGradient colors={gradients.hero.colors} start={gradients.hero.start} end={gradients.hero.end}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="send" size={18} color="#fff" />
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
        <Ionicons name="shield-checkmark" size={14} color="#fff" />
      </LinearGradient>
      <View style={styles.botBubble}>
        {m.enText && <Text style={{ fontFamily: FONTS.enMedium, fontSize: 13, color: COLORS.text, lineHeight: 20 }}>{m.enText}</Text>}
        {m.urText && <Text style={[typo.bodyUr, { marginTop: m.enText ? 6 : 0 }]}>{m.urText}</Text>}
        {m.warn && (
          <View style={styles.warn}>
            <Text style={styles.warnLabel}>⚠ SUSPICIOUS NUMBER</Text>
            <Text style={{ fontFamily: FONTS.enMedium, fontSize: 12, color: COLORS.text, marginTop: 4 }}>{m.warn}</Text>
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
        <Text style={{ fontFamily: FONTS.enMedium, fontSize: 13, color: '#fff' }}>{text}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  botAvatar: {
    width: 44, height: 44, borderRadius: 99,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  onlineDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 12, height: 12, borderRadius: 99, backgroundColor: COLORS.accent,
    borderWidth: 2, borderColor: '#fff',
  },
  aiBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  aiBadgeText: { fontFamily: FONTS.enBold, fontSize: 10, color: '#fff', letterSpacing: 0.3 },
  datePill: {
    alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: COLORS.surface, borderRadius: 99,
    borderWidth: 1, borderColor: COLORS.border, marginVertical: 4,
  },
  datePillText: { fontFamily: FONTS.enBold, fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.8 },
  botRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
  botMini: { width: 28, height: 28, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  botBubble: {
    backgroundColor: COLORS.surface2, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 16, borderTopLeftRadius: 4, flexShrink: 1,
  },
  userBubble: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 16, borderBottomRightRadius: 4,
    shadowColor: COLORS.primary, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset:{width:0,height:4},
  },
  warn: {
    marginTop: 8, padding: 10, borderRadius: 10,
    backgroundColor: COLORS.dangerBg, borderLeftWidth: 3, borderLeftColor: COLORS.danger,
  },
  warnLabel: { fontFamily: FONTS.enExtra, fontSize: 11, color: COLORS.danger, letterSpacing: 0.6 },
  suggestion: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, paddingBottom: 14,
    backgroundColor: COLORS.bg,
  },
  inputWrap: {
    flex: 1, height: 46, borderRadius: 99, backgroundColor: '#fff',
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  input: { flex: 1, fontFamily: FONTS.enMedium, fontSize: 14, color: COLORS.text },
  sendBtn: {
    width: 46, height: 46, borderRadius: 99,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
});
