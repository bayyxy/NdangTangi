import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Alarm, AlarmChallenge, ChallengeType, RepeatDay } from '../types/alarm';
import { useAlarmStore } from '../store/alarmStore';
import { generateId, getTimeUntil } from '../utils/helpers';

const DAYS: { key: RepeatDay; label: string }[] = [
  { key: 'sun', label: 'Min' },
  { key: 'mon', label: 'Sen' },
  { key: 'tue', label: 'Sel' },
  { key: 'wed', label: 'Rab' },
  { key: 'thu', label: 'Kam' },
  { key: 'fri', label: 'Jum' },
  { key: 'sat', label: 'Sab' },
];

const CHALLENGES: {
  type: ChallengeType;
  label: string;
  tagline: string;
  desc: string;
}[] = [
  {
    type: 'tap',
    label: 'Ketuk Acak',
    tagline: 'FOKUS & AKURASI',
    desc: 'Ketuk target angka acak berurutan di layar tanpa melakukan kesalahan.',
  },
  {
    type: 'swipe',
    label: 'Geser Pola',
    tagline: 'REFLEKS MOTORIK',
    desc: 'Geser layar mengikuti urutan kombinasi arah panah yang ditentukan.',
  },
  {
    type: 'shake',
    label: 'Guncang HP',
    tagline: 'AKTIVITAS FISIK',
    desc: 'Guncangkan perangkat secara konstan hingga durasi timer selesai.',
  },
];

const DIFFICULTIES: {
  key: 'easy' | 'medium' | 'hard';
  label: string;
  desc: string;
  color: string;
  bg: string;
}[] = [
  {
    key: 'easy',
    label: 'Mudah',
    desc: 'Bangun santai (target sedikit)',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    key: 'medium',
    label: 'Sedang',
    desc: 'Standar disiplin (rekomendasi)',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  {
    key: 'hard',
    label: 'Sulit',
    desc: 'Anti kesiangan akut',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.12)',
  },
];

export default function AddAlarmScreen() {
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();
  const { alarms, addAlarm, updateAlarm } = useAlarmStore();

  const existing = alarmId ? alarms.find((a) => a.id === alarmId) : undefined;

  const [hour, setHour] = useState(existing?.hour ?? 6);
  const [minute, setMinute] = useState(existing?.minute ?? 0);
  const [label, setLabel] = useState(existing?.label ?? '');
  const [repeatDays, setRepeatDays] = useState<RepeatDay[]>(existing?.repeatDays ?? []);
  const [challenge, setChallenge] = useState<AlarmChallenge>(
    existing?.challenge ?? { type: 'tap', difficulty: 'medium' }
  );
  const [snoozeEnabled, setSnoozeEnabled] = useState(existing?.snoozeEnabled ?? false);

  useEffect(() => {
    if (existing) {
      setHour(existing.hour);
      setMinute(existing.minute);
      setLabel(existing.label ?? '');
      setRepeatDays(existing.repeatDays);
      setChallenge(existing.challenge);
      setSnoozeEnabled(existing.snoozeEnabled);
    }
  }, [alarmId, existing]);

  const toggleDay = (day: RepeatDay) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const setWeekdayPreset = () => {
    setRepeatDays(['mon', 'tue', 'wed', 'thu', 'fri']);
  };

  const setEverydayPreset = () => {
    setRepeatDays(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
  };

  const clearDaysPreset = () => {
    setRepeatDays([]);
  };

  const adjustHour = (delta: number) => setHour((h) => (h + delta + 24) % 24);
  const adjustMinute = (delta: number) => setMinute((m) => (m + delta + 60) % 60);

  const handleSave = async () => {
    const alarm: Alarm = {
      id: existing?.id ?? generateId(),
      hour,
      minute,
      label: label.trim(),
      enabled: true,
      repeatDays,
      challenge,
      snoozeEnabled,
      snoozeCount: 0,
      maxSnooze: snoozeEnabled ? 3 : 0,
      createdAt: existing?.createdAt ?? Date.now(),
    };

    if (existing) {
      await updateAlarm(alarm);
    } else {
      await addAlarm(alarm);
    }

    router.back();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>{existing ? 'Ubah Konfigurasi Alarm' : 'Pasang Alarm Baru'}</Text>
        <Text style={styles.pageSubtitle}>Tentukan waktu dan misi penghenti alarm</Text>
      </View>

      {/* ─── Bagian 1: Waktu Alarm ─── */}
      <View style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>WAKTU ALARM</Text>
          <Text style={styles.relativeNotice}>
            Berdering dalam {getTimeUntil(hour, minute)}
          </Text>
        </View>

        <View style={styles.pickerContainer}>
          {/* Kolom Jam */}
          <View style={styles.timeUnitBlock}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => adjustHour(1)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Tambah satu jam"
            >
              <Text style={styles.stepperIcon}>+</Text>
            </TouchableOpacity>

            <View style={styles.timeDisplayBox}>
              <Text style={styles.digitText}>{String(hour).padStart(2, '0')}</Text>
              <Text style={styles.unitSubText}>JAM</Text>
            </View>

            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => adjustHour(-1)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Kurangi satu jam"
            >
              <Text style={styles.stepperIcon}>-</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.timeColon}>:</Text>

          {/* Kolom Menit */}
          <View style={styles.timeUnitBlock}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => adjustMinute(1)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Tambah satu menit"
            >
              <Text style={styles.stepperIcon}>+</Text>
            </TouchableOpacity>

            <View style={styles.timeDisplayBox}>
              <Text style={styles.digitText}>{String(minute).padStart(2, '0')}</Text>
              <Text style={styles.unitSubText}>MENIT</Text>
            </View>

            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => adjustMinute(-1)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Kurangi satu menit"
            >
              <Text style={styles.stepperIcon}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tombol Cepat Penyesuaian Menit */}
        <View style={styles.quickPresetRow}>
          <TouchableOpacity
            style={styles.quickPresetBtn}
            onPress={() => {
              setHour(6);
              setMinute(0);
            }}
          >
            <Text style={styles.quickPresetText}>06:00 Pagi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPresetBtn}
            onPress={() => {
              setHour(7);
              setMinute(0);
            }}
          >
            <Text style={styles.quickPresetText}>07:00 Pagi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPresetBtn}
            onPress={() => adjustMinute(15)}
          >
            <Text style={styles.quickPresetText}>+15 Menit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Bagian 2: Label / Deskripsi Alarm ─── */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>LABEL & CATATAN</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Contoh: Bangun Kuliah Pagi, Olahraga, Salat Subuh"
          placeholderTextColor="#5C6578"
          value={label}
          onChangeText={setLabel}
          maxLength={40}
        />
      </View>

      {/* ─── Bagian 3: Jadwal Pengulangan ─── */}
      <View style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>HARI AKTIF</Text>
          <View style={styles.presetGroup}>
            <TouchableOpacity onPress={setWeekdayPreset} style={styles.presetTextBtn}>
              <Text style={styles.presetText}>Kerja</Text>
            </TouchableOpacity>
            <Text style={styles.presetDivider}>|</Text>
            <TouchableOpacity onPress={setEverydayPreset} style={styles.presetTextBtn}>
              <Text style={styles.presetText}>Semua</Text>
            </TouchableOpacity>
            <Text style={styles.presetDivider}>|</Text>
            <TouchableOpacity onPress={clearDaysPreset} style={styles.presetTextBtn}>
              <Text style={styles.presetText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.daysRow}>
          {DAYS.map(({ key, label: dayLabel }) => {
            const active = repeatDays.includes(key);
            return (
              <TouchableOpacity
                key={key}
                style={[styles.dayButton, active && styles.dayButtonActive]}
                onPress={() => toggleDay(key)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Hari ${dayLabel}, status ${active ? 'aktif' : 'tidak aktif'}`}
              >
                <Text style={[styles.dayButtonText, active && styles.dayButtonTextActive]}>
                  {dayLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.repeatSummaryText}>
          {repeatDays.length === 0
            ? 'Alarm hanya akan berdering satu kali saat waktu tiba.'
            : `Berulang setiap: ${repeatDays.map((d) => DAYS.find((x) => x.key === d)?.label).join(', ')}`}
        </Text>
      </View>

      {/* ─── Bagian 4: Misi Bangun (Tantangan) ─── */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>METODE TANTANGAN BANGUN</Text>
        <Text style={styles.sectionSubDesc}>
          Alarm tidak dapat dimatikan sebelum kamu menyelesaikan tantangan ini.
        </Text>

        <View style={styles.challengeGrid}>
          {CHALLENGES.map((c) => {
            const isSelected = challenge.type === c.type;
            return (
              <TouchableOpacity
                key={c.type}
                style={[styles.challengeCard, isSelected && styles.challengeCardActive]}
                onPress={() => setChallenge({ ...challenge, type: c.type })}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.challengeCardTop}>
                  <Text style={[styles.challengeBadge, isSelected && styles.challengeBadgeActive]}>
                    {c.tagline}
                  </Text>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
                <Text style={[styles.challengeCardTitle, isSelected && styles.challengeTitleActive]}>
                  {c.label}
                </Text>
                <Text style={styles.challengeCardDesc}>{c.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ─── Bagian 5: Tingkat Kesulitan Misi ─── */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>INTENSITAS KESULITAN</Text>
        <View style={styles.difficultyContainer}>
          {DIFFICULTIES.map((d) => {
            const isSelected = challenge.difficulty === d.key;
            return (
              <TouchableOpacity
                key={d.key}
                style={[
                  styles.difficultyOption,
                  isSelected && { borderColor: d.color, backgroundColor: d.bg },
                ]}
                onPress={() => setChallenge({ ...challenge, difficulty: d.key })}
                activeOpacity={0.8}
              >
                <View style={styles.diffHeader}>
                  <Text style={[styles.diffName, isSelected && { color: d.color }]}>
                    {d.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.diffDot, { backgroundColor: d.color }]} />
                  )}
                </View>
                <Text style={styles.diffDescText}>{d.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ─── Bagian 6: Snooze ─── */}
      <View style={[styles.card, styles.snoozeRow]}>
        <View style={styles.snoozeInfo}>
          <Text style={styles.sectionLabel}>IZINKAN TUNDA (SNOOZE)</Text>
          <Text style={styles.snoozeSub}>
            Maksimal 3 kali tunda dengan interval 5 menit per tunda.
          </Text>
        </View>
        <Switch
          value={snoozeEnabled}
          onValueChange={setSnoozeEnabled}
          trackColor={{ false: '#262A36', true: '#FF5500' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* ─── Tombol Simpan ─── */}
      <TouchableOpacity
        style={styles.saveActionButton}
        onPress={handleSave}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Simpan dan aktifkan alarm"
      >
        <Text style={styles.saveActionText}>
          {existing ? 'PERBARUI ALARM' : 'SIMPAN DAN AKTIFKAN'}
        </Text>
      </TouchableOpacity>

      {/* Metadata Mahasiswa */}
      <Text style={styles.studentFooter}>
        Bayu Adi Nugroho (NIM: 202410370110193)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0C10',
  },
  content: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 48,
  },
  topHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#8E97A8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#15171E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#232733',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E97A8',
    letterSpacing: 1.2,
  },
  sectionSubDesc: {
    fontSize: 12,
    color: '#6F788B',
    marginBottom: 14,
    marginTop: 2,
    lineHeight: 17,
  },
  relativeNotice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5500',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  timeUnitBlock: {
    alignItems: 'center',
    gap: 8,
  },
  stepperButton: {
    width: 60,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#1F2430',
    borderWidth: 1,
    borderColor: '#2D3444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  timeDisplayBox: {
    width: 90,
    height: 84,
    backgroundColor: '#0F1117',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    includeFontPadding: false,
  },
  unitSubText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6F788B',
    letterSpacing: 1.5,
    marginTop: -2,
  },
  timeColon: {
    fontSize: 44,
    fontWeight: '900',
    color: '#495266',
    marginTop: -12,
  },
  quickPresetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2430',
  },
  quickPresetBtn: {
    backgroundColor: '#1A1E27',
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#282F3E',
  },
  quickPresetText: {
    color: '#B0B8C8',
    fontSize: 11,
    fontWeight: '700',
  },
  inputField: {
    backgroundColor: '#0F1117',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#262C3A',
    marginTop: 4,
  },
  presetGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetTextBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  presetText: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '700',
  },
  presetDivider: {
    color: '#3A4254',
    fontSize: 10,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 4,
  },
  dayButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#1A1E27',
    borderWidth: 1,
    borderColor: '#282F3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#FF5500',
    borderColor: '#FF5500',
  },
  dayButtonText: {
    color: '#7B8496',
    fontSize: 12,
    fontWeight: '800',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  repeatSummaryText: {
    color: '#6F788B',
    fontSize: 12,
    marginTop: 12,
    lineHeight: 16,
  },
  challengeGrid: {
    gap: 10,
  },
  challengeCard: {
    backgroundColor: '#0F1117',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#232938',
  },
  challengeCardActive: {
    borderColor: '#FF5500',
    backgroundColor: 'rgba(255, 85, 0, 0.05)',
  },
  challengeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  challengeBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6F788B',
    letterSpacing: 1,
  },
  challengeBadgeActive: {
    color: '#FF5500',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#384154',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#FF5500',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5500',
  },
  challengeCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DCE2EE',
  },
  challengeTitleActive: {
    color: '#FFFFFF',
  },
  challengeCardDesc: {
    fontSize: 12,
    color: '#7D879C',
    marginTop: 4,
    lineHeight: 16,
  },
  difficultyContainer: {
    gap: 8,
    marginTop: 4,
  },
  difficultyOption: {
    backgroundColor: '#0F1117',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#232938',
  },
  diffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diffName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#CBD3E1',
  },
  diffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  diffDescText: {
    fontSize: 11,
    color: '#6F788B',
    marginTop: 3,
  },
  snoozeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  snoozeInfo: {
    flex: 1,
    paddingRight: 12,
  },
  snoozeSub: {
    fontSize: 12,
    color: '#6F788B',
    marginTop: 4,
    lineHeight: 16,
  },
  saveActionButton: {
    backgroundColor: '#FF5500',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF5500',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  saveActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  studentFooter: {
    color: '#4B5569',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
