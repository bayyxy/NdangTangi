// src/app/task/[id].tsx
// Layar Detail Daily Task (Modul 2: Dynamic Route [id].tsx)

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTaskStore } from '../../store/taskStore';
import { PRIORITY_CONFIG, CATEGORY_LABELS } from '../../types/task';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, toggleTask, removeTask } = useTaskStore();

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>Agenda Tidak Ditemukan</Text>
        <Text style={styles.notFoundDesc}>
          {`Jadwal tugas dengan ID "${id}" mungkin telah dihapus.`}
        </Text>
        <TouchableOpacity
          style={styles.backPill}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backPillText}>← KEMBALI KE BERANDA</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const priorityMeta = PRIORITY_CONFIG[task.priority];

  const handleDelete = () => {
    Alert.alert(
      'Hapus Agenda',
      `Yakin ingin menghapus agenda "${task.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await removeTask(task.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleToggle = async () => {
    await toggleTask(task.id);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Navigasi Balik */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backPill}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backPillText}>← KEMBALI</Text>
        </TouchableOpacity>
        <Text style={styles.paramTag}>RUTE: /task/{task.id}</Text>
      </View>

      {/* Kartu Utama Detail Task */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityMeta.bg, borderColor: priorityMeta.border },
            ]}
          >
            <View style={[styles.priorityDot, { backgroundColor: priorityMeta.color }]} />
            <Text style={[styles.priorityText, { color: priorityMeta.color }]}>
              {priorityMeta.label.toUpperCase()}
            </Text>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {CATEGORY_LABELS[task.category].toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{task.title}</Text>

        {/* Waktu Jadwal */}
        <View style={styles.timeBox}>
          <Text style={styles.timeLabel}>WAKTU PELAKSANAAN</Text>
          <Text style={styles.timeValue}>
            {task.startTime} {task.endTime ? `sampai ${task.endTime}` : ''} WIB
          </Text>
        </View>

        {/* Deskripsi */}
        {task.description && (
          <View style={styles.descBox}>
            <Text style={styles.descLabel}>CATATAN & DETAIL</Text>
            <Text style={styles.descText}>{task.description}</Text>
          </View>
        )}

        {/* Status Penyelesaian */}
        <TouchableOpacity
          style={[styles.statusToggleBox, task.completed ? styles.statusDone : styles.statusPending]}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <View style={[styles.checkboxIndicator, task.completed && styles.checkboxDone]}>
            <Text style={styles.checkGlyph}>{task.completed ? '✓' : ''}</Text>
          </View>
          <View style={styles.statusTextBox}>
            <Text style={styles.statusTitle}>
              {task.completed ? 'STATUS: SELESAI' : 'STATUS: PERLU DIKERJAKAN'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {task.completed
                ? 'Ketuk untuk menandai sebagai belum selesai'
                : 'Ketuk untuk menandai tugas sudah selesai'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Tombol Hapus */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteText}>HAPUS AGENDA INI</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Mahasiswa */}
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
    padding: 16,
    paddingBottom: 40,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#0B0C10',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  notFoundDesc: {
    color: '#8E97A8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backPill: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backPillText: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  paramTag: {
    color: '#6F788B',
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  categoryBadge: {
    backgroundColor: '#1E2330',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2D3446',
  },
  categoryText: {
    color: '#8E97A8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 16,
  },
  timeBox: {
    backgroundColor: '#0F1118',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5500',
  },
  timeLabel: {
    color: '#6F788B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  timeValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  descBox: {
    backgroundColor: '#0F1118',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  descLabel: {
    color: '#6F788B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  descText: {
    color: '#8E97A8',
    fontSize: 13,
    lineHeight: 19,
  },
  statusToggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  statusPending: {
    backgroundColor: '#1C1F2A',
    borderColor: '#2A3042',
  },
  checkboxIndicator: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4E576B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkGlyph: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  statusTextBox: {
    flex: 1,
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusSubtitle: {
    color: '#8E97A8',
    fontSize: 11,
    marginTop: 2,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
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
