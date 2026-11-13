// src/app/(tabs)/stats.tsx
// Statistik & Ringkasan Produktivitas Harian

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTaskStore } from '../../store/taskStore';
import { useAlarmStore } from '../../store/alarmStore';
import { CATEGORY_LABELS, TaskCategory } from '../../types/task';

function StatDonut({ percent, color }: { percent: number; color: string }) {
  const SIZE = 80;
  const STROKE = 7;
  const INNER = SIZE - STROKE * 2;
  const rightRotation = -180 + (Math.min(percent, 50) / 50) * 180;
  const leftRotation = (Math.max(0, percent - 50) / 50) * 180;
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: STROKE, borderColor: '#1E2330' }} />
      <View style={{ position: 'absolute', right: 0, width: SIZE / 2, height: SIZE, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: 0, width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: STROKE, borderColor: color, transform: [{ rotate: `${rightRotation}deg` }] }} />
      </View>
      {percent > 50 && (
        <View style={{ position: 'absolute', left: 0, width: SIZE / 2, height: SIZE, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', left: 0, width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: STROKE, borderColor: color, transform: [{ rotate: `${leftRotation}deg` }] }} />
        </View>
      )}
      <View style={{ position: 'absolute', top: STROKE, left: STROKE, width: INNER, height: INNER, borderRadius: INNER / 2, backgroundColor: '#0F1118', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '900' }}>{percent}%</Text>
      </View>
    </View>
  );
}

function BarRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label} numberOfLines={1}>{label}</Text>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={barStyles.count}>{count}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  label: { color: '#8E97A8', fontSize: 11, fontWeight: '600', width: 90 },
  track: { flex: 1, height: 8, backgroundColor: '#1E2330', borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  count: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', width: 24, textAlign: 'right' },
});

export default function StatsScreen() {
  const { tasks, loadTasks } = useTaskStore();
  const { alarms, loadAlarms } = useAlarmStore();

  useEffect(() => {
    loadTasks();
    loadAlarms();
  }, [loadTasks, loadAlarms]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pending = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const byCategory = (['kuliah', 'praktikum', 'tugas', 'pribadi'] as TaskCategory[]).map((cat) => ({
    cat,
    label: CATEGORY_LABELS[cat],
    count: tasks.filter((t) => t.category === cat).length,
  }));

  const catColors: Record<TaskCategory, string> = {
    kuliah: '#3B82F6',
    praktikum: '#10B981',
    tugas: '#F59E0B',
    pribadi: '#8B5CF6',
  };

  const high = tasks.filter((t) => t.priority === 'high').length;
  const medium = tasks.filter((t) => t.priority === 'medium').length;
  const low = tasks.filter((t) => t.priority === 'low').length;

  const enabledAlarms = alarms.filter((a) => a.enabled).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTag}>RINGKASAN AKTIVITAS</Text>
      <Text style={styles.pageTitle}>Statistik</Text>

      {/* Overview Cards */}
      <View style={styles.overviewRow}>
        <View style={[styles.overviewCard, { borderColor: '#10B981' }]}>
          <Text style={[styles.overviewValue, { color: '#10B981' }]}>{done}</Text>
          <Text style={styles.overviewLabel}>Selesai</Text>
        </View>
        <View style={[styles.overviewCard, { borderColor: '#F59E0B' }]}>
          <Text style={[styles.overviewValue, { color: '#F59E0B' }]}>{pending}</Text>
          <Text style={styles.overviewLabel}>Belum</Text>
        </View>
        <View style={[styles.overviewCard, { borderColor: '#FF5500' }]}>
          <Text style={[styles.overviewValue, { color: '#FF5500' }]}>{total}</Text>
          <Text style={styles.overviewLabel}>Total</Text>
        </View>
        <View style={[styles.overviewCard, { borderColor: '#3B82F6' }]}>
          <Text style={[styles.overviewValue, { color: '#3B82F6' }]}>{enabledAlarms}</Text>
          <Text style={styles.overviewLabel}>Alarm Aktif</Text>
        </View>
      </View>

      {/* Completion Donut */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TINGKAT PENYELESAIAN</Text>
        <View style={styles.donutRow}>
          <StatDonut percent={pct} color="#10B981" />
          <View style={styles.donutInfo}>
            <Text style={styles.donutBig}>{pct}%</Text>
            <Text style={styles.donutSub}>tugas hari ini selesai</Text>
            <Text style={styles.donutDetail}>{done} dari {total} agenda dikerjakan</Text>
          </View>
        </View>
      </View>

      {/* By Category */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PER KATEGORI</Text>
        {byCategory.map(({ cat, label, count }) => (
          <BarRow key={cat} label={label} count={count} total={total} color={catColors[cat]} />
        ))}
      </View>

      {/* By Priority */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PER PRIORITAS</Text>
        <BarRow label="Tinggi" count={high} total={total} color="#EF4444" />
        <BarRow label="Sedang" count={medium} total={total} color="#F59E0B" />
        <BarRow label="Rendah" count={low} total={total} color="#10B981" />
      </View>

      {/* Alarm Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ALARM BANGUN PAGI</Text>
        <View style={styles.alarmStatsRow}>
          <View style={styles.alarmStatCard}>
            <Text style={[styles.alarmStatValue, { color: '#FF5500' }]}>{alarms.length}</Text>
            <Text style={styles.alarmStatLabel}>Total Alarm</Text>
          </View>
          <View style={styles.alarmStatCard}>
            <Text style={[styles.alarmStatValue, { color: '#10B981' }]}>{enabledAlarms}</Text>
            <Text style={styles.alarmStatLabel}>Aktif</Text>
          </View>
          <View style={styles.alarmStatCard}>
            <Text style={[styles.alarmStatValue, { color: '#6F788B' }]}>{alarms.length - enabledAlarms}</Text>
            <Text style={styles.alarmStatLabel}>Nonaktif</Text>
          </View>
        </View>
      </View>

      {/* Motivasi */}
      <View style={styles.motivCard}>
        <Text style={styles.motivEmoji}>🔥</Text>
        <Text style={styles.motivText}>
          {pct >= 80 ? 'Luar biasa! Produktivitasmu hari ini sangat tinggi.' :
            pct >= 50 ? 'Setengah jalan sudah! Terus semangat kerjakan sisanya.' :
              pct > 0 ? 'Sudah mulai! Konsistensi adalah kunci kesuksesan.' :
                'Yuk mulai! Satu tugas kecil sudah cukup untuk memulai.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0C10' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  pageTag: { color: '#FF5500', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
  pageTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', marginBottom: 20 },
  overviewRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  overviewCard: { flex: 1, backgroundColor: '#15171E', borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  overviewValue: { fontSize: 22, fontWeight: '900' },
  overviewLabel: { color: '#8E97A8', fontSize: 10, fontWeight: '600', marginTop: 2 },
  section: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 16, padding: 16, marginBottom: 14 },
  sectionTitle: { color: '#FF5500', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 14 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  donutInfo: { flex: 1 },
  donutBig: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },
  donutSub: { color: '#10B981', fontSize: 12, fontWeight: '700', marginTop: 2 },
  donutDetail: { color: '#8E97A8', fontSize: 11, marginTop: 4 },
  alarmStatsRow: { flexDirection: 'row', gap: 10 },
  alarmStatCard: { flex: 1, backgroundColor: '#0F1118', borderRadius: 10, padding: 12, alignItems: 'center' },
  alarmStatValue: { fontSize: 24, fontWeight: '900' },
  alarmStatLabel: { color: '#8E97A8', fontSize: 10, fontWeight: '600', marginTop: 4 },
  motivCard: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  motivEmoji: { fontSize: 28 },
  motivText: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '600', lineHeight: 20 },
});

