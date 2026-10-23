import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Alarm, AlarmChallenge, ChallengeType, RepeatDay } from '../types/alarm';
import { useAlarmStore } from '../store/alarmStore';
import { generateId, formatTime } from '../utils/helpers';

const DAYS: { key: RepeatDay; label: string }[] = [
  { key: 'sun', label: 'Min' },
  { key: 'mon', label: 'Sen' },
  { key: 'tue', label: 'Sel' },
  { key: 'wed', label: 'Rab' },
  { key: 'thu', label: 'Kam' },
  { key: 'fri', label: 'Jum' },
  { key: 'sat', label: 'Sab' },
];

const CHALLENGES: { type: ChallengeType; emoji: string; label: string; desc: string }[] = [
  { type: 'tap', emoji: '🎯', label: 'Ketuk Acak', desc: 'Ketuk target yang muncul secara acak' },
  { type: 'swipe', emoji: '👆', label: 'Geser Pola', desc: 'Geser sesuai urutan arah panah' },
  { type: 'shake', emoji: '📳', label: 'Guncang HP', desc: 'Guncang HP selama beberapa detik' },
];

const DIFFICULTIES = [
  { key: 'easy' as const, label: 'Mudah', color: '#16a34a' },
  { key: 'medium' as const, label: 'Sedang', color: '#f59e0b' },
  { key: 'hard' as const, label: 'Sulit', color: '#dc2626' },
  { key: 'hard' as const, label: 'Sangat Sulit', color: '#dc2626' },
];

export default function AddAlarmScreen() {
  // useLocalSearchParams() — fungsi expo-router untuk membaca parameter rute
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();
  const { alarms, addAlarm, updateAlarm } = useAlarmStore();

  const existing = alarmId ? alarms.find((a) => a.id === alarmId) : undefined;

  // ─── useState: state form alarm ─────────────────────────────────────────────
  const [hour, setHour] = useState(existing?.hour ?? 7);
  const [minute, setMinute] = useState(existing?.minute ?? 0);
  const [label, setLabel] = useState(existing?.label ?? '');
  const [repeatDays, setRepeatDays] = useState<RepeatDay[]>(existing?.repeatDays ?? []);
  const [challenge, setChallenge] = useState<AlarmChallenge>(
    existing?.challenge ?? { type: 'tap', difficulty: 'medium' }
  );
  const [snoozeEnabled, setSnoozeEnabled] = useState(existing?.snoozeEnabled ?? false);

  // useEffect: sinkronisasi state saat alarmId berubah (misal navigasi ulang)
  useEffect(() => {
    if (existing) {
      setHour(existing.hour);
      setMinute(existing.minute);
      setLabel(existing.label ?? '');
      setRepeatDays(existing.repeatDays);
      setChallenge(existing.challenge);
      setSnoozeEnabled(existing.snoozeEnabled);
    }
  }, [alarmId]);

  const toggleDay = (day: RepeatDay) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const adjustHour = (delta: number) => setHour((h) => (h + delta + 24) % 24);
  const adjustMinute = (delta: number) => setMinute((m) => (m + delta + 60) % 60);

  const handleSave = async () => {
    const alarm: Alarm = {
      id: existing?.id ?? generateId(),
      hour,
      minute,
      label,
      enabled: true,
      repeatDays,
      challenge,
      snoozeEnabled,
      snoozeCount: 0,
      maxSnooze: snoozeEnabled ? 3 : 0,
      createdAt: existing?.createdAt ?? Date.now(),
    };

    if (existing) await updateAlarm(alarm);
    else await addAlarm(alarm);

    // router.back() — kembali ke halaman sebelumnya (Home)
    router.back();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{existing ? 'Edit Alarm' : 'Alarm Baru'}</Text>

      {/* Time Picker */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>⏰ Waktu</Text>
        <View style={styles.timePicker}>
          <View style={styles.timeColumn}>
            <TouchableOpacity style={styles.timeBtn} onPress={() => adjustHour(1)}>
              <Text style={styles.timeBtnText}>▲</Text>
            </TouchableOpacity>
            <Text style={styles.timeValue}>{String(hour).padStart(2, '0')}</Text>
            <TouchableOpacity style={styles.timeBtn} onPress={() => adjustHour(-1)}>
              <Text style={styles.timeBtnText}>▼</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.timeSep}>:</Text>
          <View style={styles.timeColumn}>
            <TouchableOpacity style={styles.timeBtn} onPress={() => adjustMinute(1)}>
              <Text style={styles.timeBtnText}>▲</Text>
            </TouchableOpacity>
            <Text style={styles.timeValue}>{String(minute).padStart(2, '0')}</Text>
            <TouchableOpacity style={styles.timeBtn} onPress={() => adjustMinute(-1)}>
              <Text style={styles.timeBtnText}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Label */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>🏷️ Label</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama alarm (opsional)"
          placeholderTextColor="#555"
          value={label}
          onChangeText={setLabel}
        />
      </View>

      {/* Repeat Days */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>📅 Ulangi</Text>
        <View style={styles.daysRow}>
          {DAYS.map(({ key, label: dayLabel }) => (
            <TouchableOpacity
              key={key}
              style={[styles.dayBtn, repeatDays.includes(key) && styles.dayBtnActive]}
              onPress={() => toggleDay(key)}
            >
              <Text style={[styles.dayText, repeatDays.includes(key) && styles.dayTextActive]}>
                {dayLabel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.repeatHint}>
          {repeatDays.length === 0 ? 'Satu kali saja' : 'Setiap ' + repeatDays.join(', ')}
        </Text>
      </View>

      {/* Challenge Selector */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>🎮 Jenis Tantangan</Text>
        {CHALLENGES.map((c) => (
          <TouchableOpacity
            key={c.type}
            style={[styles.challengeOption, challenge.type === c.type && styles.challengeActive]}
            onPress={() => setChallenge({ ...challenge, type: c.type })}
          >
            <Text style={styles.challengeEmoji}>{c.emoji}</Text>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeLabel}>{c.label}</Text>
              <Text style={styles.challengeDesc}>{c.desc}</Text>
            </View>
            {challenge.type === c.type && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Difficulty */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>💪 Kesulitan</Text>
        <View style={styles.diffRow}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d.label}
              style={[
                styles.diffBtn,
                challenge.difficulty === d.key && { backgroundColor: d.color },
              ]}
              onPress={() => setChallenge({ ...challenge, difficulty: d.key })}
            >
              <Text
                style={[
                  styles.diffText,
                  challenge.difficulty === d.key && styles.diffTextActive,
                ]}
              >
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Snooze */}
      <View style={[styles.card, styles.row]}>
        <View>
          <Text style={styles.sectionLabel}>😴 Snooze</Text>
          <Text style={styles.snoozeHint}>Maks 3x snooze 5 menit</Text>
        </View>
        <Switch
          value={snoozeEnabled}
          onValueChange={setSnoozeEnabled}
          trackColor={{ false: '#1e1e2e', true: '#ff6b35' }}
          thumbColor="#fff"
        />
      </View>

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>💾 Simpan Alarm</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        {existing ? 'Edit Alarm' : 'Nama: Bayu Adi Nugroho  NIM: 202410370110193'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#31f40aff' },
  content: { padding: 20, paddingBottom: 40 },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#2b2be0ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  timeColumn: { alignItems: 'center', gap: 8 },
  timeBtn: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    width: 56,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBtnText: { color: '#fff', fontSize: 18 },
  timeValue: { color: '#fff', fontSize: 52, fontWeight: '900', width: 80, textAlign: 'center' },
  timeSep: { color: '#fff', fontSize: 52, fontWeight: '900', marginBottom: 8 },
  input: {
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  daysRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  dayBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnActive: { backgroundColor: '#ff6b35' },
  dayText: { color: '#666', fontSize: 13, fontWeight: '700' },
  dayTextActive: { color: '#fff' },
  repeatHint: { color: '#555', fontSize: 12, marginTop: 8 },
  challengeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  challengeActive: { borderColor: '#ff6b35' },
  challengeEmoji: { fontSize: 28, marginRight: 12 },
  challengeInfo: { flex: 1 },
  challengeLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
  challengeDesc: { color: '#555', fontSize: 12, marginTop: 2 },
  checkmark: { color: '#ff6b35', fontSize: 20, fontWeight: '900' },
  diffRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  diffBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    minWidth: 70,
  },
  diffText: { color: '#666', fontWeight: '700' },
  diffTextActive: { color: '#fff' },
  snoozeHint: { color: '#555', fontSize: 12, marginTop: 2 },
  saveBtn: {
    backgroundColor: '#ff6b35',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#ff6b35',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  footer: { color: '#ffffff88', textAlign: 'center', marginTop: 16, fontSize: 12 },
});
