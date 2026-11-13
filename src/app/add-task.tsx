// src/app/add-task.tsx
// Formulir Tambah/Edit Daily Task & Agenda Mahasiswa

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { TaskCategory, TaskPriority, PRIORITY_CONFIG, CATEGORY_LABELS } from '../types/task';
import { useTaskStore } from '../store/taskStore';

const CATEGORIES: TaskCategory[] = ['kuliah', 'praktikum', 'tugas', 'pribadi'];
const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];
const TIME_PRESETS = ['07:00', '08:40', '10:00', '13:00', '15:30', '19:00'];

export default function AddTaskScreen() {
  const { addTask } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:40');
  const [category, setCategory] = useState<TaskCategory>('kuliah');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('Perhatian', 'Harap isi judul agenda atau nama mata kuliah.');
      return;
    }

    await addTask({
      title: trimmed,
      description: description.trim() || undefined,
      startTime,
      endTime: endTime.trim() || undefined,
      category,
      priority,
      completed: false,
      reminderEnabled,
    });

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Form */}
      <View style={styles.header}>
        <Text style={styles.formTag}>AGENDA BARU</Text>
        <Text style={styles.pageTitle}>TAMBAH TUGAS HARIAN</Text>
        <Text style={styles.subtitle}>
          Atur jadwal kuliah, praktikum, atau kegiatan pribadi Anda
        </Text>
      </View>

      {/* 1. Judul Tugas */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>JUDUL AGENDA / MATA KULIAH *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Contoh: Praktikum Pemrograman Mobile"
          placeholderTextColor="#4E576B"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* 2. Deskripsi */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>CATATAN / RUANGAN / TO-DO</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Contoh: Lab Informatika 3, bawa modul dan tugas pekan lalu"
          placeholderTextColor="#4E576B"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* 3. Kategori */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>KATEGORI KEGIATAN</Text>
        <View style={styles.pillsRow}>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Waktu Mulai & Selesai */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>WAKTU JADWAL (MULAI & SELESAI)</Text>
        <View style={styles.timeInputsRow}>
          <View style={styles.timeBox}>
            <Text style={styles.timeSubLabel}>JAM MULAI</Text>
            <TextInput
              style={styles.timeInput}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="07:00"
              placeholderTextColor="#4E576B"
              maxLength={5}
            />
          </View>
          <Text style={styles.timeDash}>sampai</Text>
          <View style={styles.timeBox}>
            <Text style={styles.timeSubLabel}>JAM SELESAI</Text>
            <TextInput
              style={styles.timeInput}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="08:40"
              placeholderTextColor="#4E576B"
              maxLength={5}
            />
          </View>
        </View>

        {/* Pilihan Cepat Jam Kuliah */}
        <Text style={styles.quickPresetTitle}>PILIHAN CEPAT JAM KAMPUS</Text>
        <View style={styles.presetsRow}>
          {TIME_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[styles.presetChip, startTime === preset && styles.presetChipActive]}
              onPress={() => setStartTime(preset)}
              activeOpacity={0.75}
            >
              <Text style={[styles.presetText, startTime === preset && styles.presetTextActive]}>
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 5. Tingkat Prioritas */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>TINGKAT PRIORITAS</Text>
        <View style={styles.prioritiesRow}>
          {PRIORITIES.map((p) => {
            const meta = PRIORITY_CONFIG[p];
            const isSelected = priority === p;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityCard,
                  isSelected && {
                    borderColor: meta.color,
                    backgroundColor: meta.bg,
                  },
                ]}
                onPress={() => setPriority(p)}
                activeOpacity={0.8}
              >
                <View style={[styles.priorityDot, { backgroundColor: meta.color }]} />
                <Text
                  style={[
                    styles.priorityLabel,
                    isSelected ? { color: meta.color } : { color: '#8E97A8' },
                  ]}
                >
                  {meta.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 6. Pengingat Notifikasi */}
      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchTitle}>Notifikasi Pengingat</Text>
          <Text style={styles.switchSubtitle}>Beri tanda pemberitahuan saat jadwal tiba</Text>
        </View>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ false: '#1E2330', true: '#FF5500' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Tombol Aksi */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>BATAL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveText}>SIMPAN AGENDA</Text>
        </TouchableOpacity>
      </View>

      {/* Identitas Mahasiswa */}
      <View style={styles.footer}>
        <Text style={styles.footerAuthor}>Bayu Adi Nugroho</Text>
        <Text style={styles.footerNim}>NIM: 202410370110193</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C10',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  formTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF5500',
    letterSpacing: 1.5,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E97A8',
    marginTop: 4,
  },
  fieldSection: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8E97A8',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pillActive: {
    backgroundColor: 'rgba(255, 85, 0, 0.15)',
    borderColor: '#FF5500',
  },
  pillText: {
    color: '#8E97A8',
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#FF5500',
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeBox: {
    flex: 1,
  },
  timeSubLabel: {
    color: '#6F788B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  timeInput: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  timeDash: {
    color: '#6F788B',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 14,
  },
  quickPresetTitle: {
    color: '#6F788B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  presetChipActive: {
    borderColor: '#FF5500',
    backgroundColor: 'rgba(255, 85, 0, 0.15)',
  },
  presetText: {
    color: '#8E97A8',
    fontSize: 11,
    fontWeight: '700',
  },
  presetTextActive: {
    color: '#FF5500',
  },
  prioritiesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityCard: {
    flex: 1,
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityLabel: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  switchTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  switchSubtitle: {
    color: '#8E97A8',
    fontSize: 11,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: '#8E97A8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#FF5500',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1D27',
  },
  footerAuthor: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  footerNim: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
