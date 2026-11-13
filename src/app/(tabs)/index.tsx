// src/app/(tabs)/index.tsx
// Dashboard Utama: Real-Time Clock, Alarm Bangun Pagi & Daily Task Timeline

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAlarmStore } from '../../store/alarmStore';
import { useTaskStore } from '../../store/taskStore';
import { Alarm } from '../../types/alarm';
import { DailyTask, PRIORITY_CONFIG, CATEGORY_LABELS } from '../../types/task';
import { formatTime, getTimeUntil, formatDaysSummary } from '../../utils/helpers';

type TaskFilter = 'all' | 'pending' | 'completed';

function CircularProgress({ percent }: { percent: number }) {
  const SIZE = 100;
  const STROKE = 9;
  const INNER = SIZE - STROKE * 2;
  const rightRotation = -180 + (Math.min(percent, 50) / 50) * 180;
  const leftRotation = (Math.max(0, percent - 50) / 50) * 180;

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: STROKE, borderColor: '#1E2330' }} />
      <View style={{ position: 'absolute', right: 0, width: SIZE / 2, height: SIZE, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: 0, width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: STROKE, borderColor: '#10B981', transform: [{ rotate: `${rightRotation}deg` }] }} />
      </View>
      {percent > 50 && (
        <View style={{ position: 'absolute', left: 0, width: SIZE / 2, height: SIZE, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', left: 0, width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: STROKE, borderColor: '#10B981', transform: [{ rotate: `${leftRotation}deg` }] }} />
        </View>
      )}
      <View style={{ position: 'absolute', top: STROKE, left: STROKE, width: INNER, height: INNER, borderRadius: INNER / 2, backgroundColor: '#0F1118', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 }}>{percent}%</Text>
        <Text style={{ color: '#10B981', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: 1 }}>SELESAI</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { alarms, activeAlarm, toggleAlarm, removeAlarm, loadAlarms } = useAlarmStore();
  const { tasks, toggleTask, loadTasks } = useTaskStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');

  useEffect(() => {
    loadAlarms();
    loadTasks();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [loadAlarms, loadTasks]);

  useEffect(() => {
    if (activeAlarm) router.push('/alarm-ringing');
  }, [activeAlarm]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === 'pending') return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    return true;
  });

  const activeAlarms = alarms.filter((a) => a.enabled);
  const nextAlarm: Alarm | null = activeAlarms.length > 0 ? activeAlarms[0] : null;

  const handleDeleteAlarm = (alarm: Alarm) => {
    Alert.alert('Hapus Alarm', `Yakin hapus alarm ${formatTime(alarm.hour, alarm.minute)}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => removeAlarm(alarm.id) },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.userProfile}>
          <View style={styles.avatarCircle}><Text style={styles.avatarGlyph}>BA</Text></View>
          <View>
            <Text style={styles.greetingTitle}>Halo, Bayu Adi Nugroho</Text>
            <Text style={styles.greetingSubtitle}>Informatika UMM • Semester 5</Text>
          </View>
        </View>
      </View>

      {/* Clock */}
      <View style={styles.clockCard}>
        <View style={styles.clockHeaderRow}>
          <View style={styles.statusLive}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>WAKTU NYATA</Text>
          </View>
          <Text style={styles.locationTag}>KAMPUS III UMM MALANG</Text>
        </View>
        <View style={styles.digitalClockRow}>
          <Text style={styles.clockNumbers}>
            {formatTime(currentTime.getHours(), currentTime.getMinutes())}
            <Text style={styles.clockSeconds}>:{String(currentTime.getSeconds()).padStart(2, '0')}</Text>
          </Text>
          <Text style={styles.timezoneLabel}>WIB</Text>
        </View>
        <Text style={styles.dateLabel}>
          {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Progress Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>PROGRES HARI INI</Text>
          <Text style={styles.heroSub}>{completedTasks} dari {totalTasks} selesai</Text>
        </View>
        <View style={styles.heroBody}>
          <CircularProgress percent={progressPercent} />
          <View style={styles.statsColumn}>
            <View style={styles.statMetricRow}>
              <View style={[styles.statDot, { backgroundColor: '#FF5500' }]} />
              <View><Text style={styles.statValue}>{totalTasks}</Text><Text style={styles.statCaption}>Total Agenda</Text></View>
            </View>
            <View style={styles.statMetricRow}>
              <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
              <View><Text style={styles.statValue}>{completedTasks}</Text><Text style={styles.statCaption}>Sudah Selesai</Text></View>
            </View>
            <View style={styles.statMetricRow}>
              <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
              <View><Text style={styles.statValue}>{pendingTasks}</Text><Text style={styles.statCaption}>Menunggu Aksi</Text></View>
            </View>
          </View>
        </View>
      </View>

      {/* Alarm Section */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionCategory}>NDANG TANGI ENGINE</Text>
          <Text style={styles.sectionMainTitle}>Alarm Bangun Pagi</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/add-alarm')} activeOpacity={0.8} style={styles.sectionActionBtn}>
          <Text style={styles.sectionActionText}>+ ATUR ALARM</Text>
        </TouchableOpacity>
      </View>

      {nextAlarm ? (
        <View style={[styles.alarmCard, nextAlarm.enabled && styles.alarmCardActive]}>
          <TouchableOpacity style={styles.alarmCardBody} onPress={() => router.push({ pathname: '/add-alarm', params: { alarmId: nextAlarm.id } })} onLongPress={() => handleDeleteAlarm(nextAlarm)} activeOpacity={0.8}>
            <View style={styles.alarmLeft}>
              <View style={styles.alarmTimeRow}>
                <Text style={styles.alarmBigTime}>{formatTime(nextAlarm.hour, nextAlarm.minute)}</Text>
                <Text style={styles.alarmCountdown}>{getTimeUntil(nextAlarm.hour, nextAlarm.minute)}</Text>
              </View>
              <Text style={styles.alarmLabelText}>{nextAlarm.label || 'Alarm Bangun Pagi Disiplin'}</Text>
              <View style={styles.alarmMetaRow}>
                <View style={styles.challengeBadge}>
                  <Text style={styles.challengeBadgeText}>MISI: {nextAlarm.challenge.type.toUpperCase()} ({nextAlarm.challenge.difficulty.toUpperCase()})</Text>
                </View>
                <Text style={styles.alarmDaysSummary}>{formatDaysSummary(nextAlarm.repeatDays)}</Text>
              </View>
            </View>
            <Switch value={nextAlarm.enabled} onValueChange={() => toggleAlarm(nextAlarm.id)} trackColor={{ false: '#1E2330', true: '#FF5500' }} thumbColor="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyAlarmBox}>
          <Text style={styles.emptyAlarmTitle}>Belum Ada Alarm Bangun Pagi</Text>
          <Text style={styles.emptyAlarmSub}>Pasang alarm dengan tantangan motorik agar tidak terlambat kuliah.</Text>
          <TouchableOpacity style={styles.emptyAlarmBtn} onPress={() => router.push('/add-alarm')} activeOpacity={0.8}>
            <Text style={styles.emptyAlarmBtnText}>+ Pasang Alarm Sekarang</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Briefing Banner */}
      <TouchableOpacity style={styles.briefingBanner} onPress={() => router.push('/briefing')} activeOpacity={0.8}>
        <View style={styles.briefingLeft}>
          <View style={styles.briefingDot} />
          <View>
            <Text style={styles.briefingTag}>MODUL 3: ASYNC & EXTERNAL API CALL</Text>
            <Text style={styles.briefingTitle}>Briefing Cuaca Satelit & Quote Motivasi</Text>
          </View>
        </View>
        <Text style={styles.briefingArrow}>BUKA →</Text>
      </TouchableOpacity>

      {/* Task Section */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionCategory}>AGENDA JAM DEMI JAM</Text>
          <Text style={styles.sectionMainTitle}>Jadwal Tugas Hari Ini</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/add-task')} activeOpacity={0.8} style={styles.sectionActionBtn}>
          <Text style={styles.sectionActionText}>+ TULIS TUGAS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabsRow}>
        {(['all', 'pending', 'completed'] as TaskFilter[]).map((f) => (
          <TouchableOpacity key={f} style={[styles.filterTab, activeFilter === f && styles.filterTabActive]} onPress={() => setActiveFilter(f)} activeOpacity={0.8}>
            <Text style={[styles.filterTabText, activeFilter === f && styles.filterTabTextActive]}>
              {f === 'all' ? `Semua (${totalTasks})` : f === 'pending' ? `Dikerjakan (${pendingTasks})` : `Selesai (${completedTasks})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyTaskBox}>
          <Text style={styles.emptyTaskTitle}>Tidak Ada Tugas di Kategori Ini</Text>
          <Text style={styles.emptyTaskSub}>Tekan + Tulis Tugas untuk menambahkan agenda.</Text>
        </View>
      ) : (
        <View style={styles.tasksList}>
          {filteredTasks.map((task: DailyTask) => {
            const p = PRIORITY_CONFIG[task.priority];
            return (
              <TouchableOpacity key={task.id} style={[styles.taskCard, task.completed && styles.taskCardCompleted]} onPress={() => router.push(`/task/${task.id}`)} activeOpacity={0.8}>
                <View style={styles.taskTimeCol}>
                  <Text style={[styles.taskStartTime, task.completed && styles.textDimmed]}>{task.startTime}</Text>
                  {task.endTime && <Text style={styles.taskEndTime}>{task.endTime}</Text>}
                </View>
                <View style={styles.taskDivider} />
                <View style={styles.taskMainCol}>
                  <View style={styles.taskBadgeRow}>
                    <View style={[styles.taskPriorityTag, { backgroundColor: p.bg, borderColor: p.border }]}>
                      <Text style={[styles.taskPriorityText, { color: p.color }]}>{p.label.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.taskCategoryText}>{CATEGORY_LABELS[task.category].toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.taskTitleText, task.completed && styles.taskTitleCompleted]} numberOfLines={1}>{task.title}</Text>
                  {task.description ? <Text style={styles.taskDescText} numberOfLines={1}>{task.description}</Text> : null}
                </View>
                <TouchableOpacity style={[styles.checkboxBtn, task.completed && styles.checkboxBtnDone]} onPress={() => toggleTask(task.id)} activeOpacity={0.7}>
                  <Text style={styles.checkboxGlyph}>{task.completed ? '✓' : ''}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerAuthor}>Bayu Adi Nugroho</Text>
        <Text style={styles.footerNim}>NIM: 202410370110193</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0C10' },
  content: { padding: 18, paddingTop: 54, paddingBottom: 40 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  userProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF5500', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  avatarGlyph: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  greetingTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  greetingSubtitle: { color: '#8E97A8', fontSize: 11, fontWeight: '600', marginTop: 1 },
  clockCard: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 18, padding: 16, marginBottom: 16 },
  clockHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusLive: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,85,0,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,85,0,0.3)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF5500' },
  liveText: { color: '#FF5500', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  locationTag: { color: '#6F788B', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  digitalClockRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  clockNumbers: { fontSize: 44, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  clockSeconds: { fontSize: 22, fontWeight: '700', color: '#8E97A8' },
  timezoneLabel: { color: '#FF5500', fontSize: 13, fontWeight: '900' },
  dateLabel: { color: '#8E97A8', fontSize: 12, fontWeight: '600', marginTop: 2, textTransform: 'capitalize' },
  heroCard: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 20, padding: 18, marginBottom: 18 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  heroTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  heroSub: { color: '#8E97A8', fontSize: 11, fontWeight: '600' },
  heroBody: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  statsColumn: { flex: 1, gap: 8 },
  statMetricRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', lineHeight: 18 },
  statCaption: { color: '#8E97A8', fontSize: 11, fontWeight: '500' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4, marginBottom: 10 },
  sectionCategory: { color: '#FF5500', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  sectionMainTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginTop: 2 },
  sectionActionBtn: { backgroundColor: 'rgba(255,85,0,0.15)', borderWidth: 1, borderColor: 'rgba(255,85,0,0.5)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  sectionActionText: { color: '#FF5500', fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  alarmCard: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 16, padding: 16, marginBottom: 16 },
  alarmCardActive: { borderLeftWidth: 4, borderLeftColor: '#FF5500' },
  alarmCardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alarmLeft: { flex: 1 },
  alarmTimeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  alarmBigTime: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  alarmCountdown: { color: '#FF5500', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  alarmLabelText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginTop: 2 },
  alarmMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  challengeBadge: { backgroundColor: 'rgba(255,85,0,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  challengeBadgeText: { color: '#FF5500', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  alarmDaysSummary: { color: '#8E97A8', fontSize: 11, fontWeight: '600' },
  emptyAlarmBox: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 16 },
  emptyAlarmTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  emptyAlarmSub: { color: '#8E97A8', fontSize: 11, textAlign: 'center', marginTop: 4, marginBottom: 12 },
  emptyAlarmBtn: { backgroundColor: 'rgba(255,85,0,0.15)', borderWidth: 1, borderColor: '#FF5500', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  emptyAlarmBtnText: { color: '#FF5500', fontSize: 11, fontWeight: '800' },
  briefingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20 },
  briefingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  briefingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5500' },
  briefingTag: { color: '#FF5500', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  briefingTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginTop: 2 },
  briefingArrow: { color: '#FF5500', fontSize: 12, fontWeight: '900' },
  filterTabsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterTab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733' },
  filterTabActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  filterTabText: { color: '#8E97A8', fontSize: 11, fontWeight: '800' },
  filterTabTextActive: { color: '#0B0C10' },
  emptyTaskBox: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 16, padding: 24, alignItems: 'center' },
  emptyTaskTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  emptyTaskSub: { color: '#8E97A8', fontSize: 12, textAlign: 'center', marginTop: 6, lineHeight: 17 },
  tasksList: { gap: 10 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 14, padding: 14 },
  taskCardCompleted: { opacity: 0.6 },
  taskTimeCol: { width: 60, alignItems: 'flex-start' },
  taskStartTime: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  taskEndTime: { color: '#6F788B', fontSize: 10, fontWeight: '700', marginTop: 2 },
  textDimmed: { color: '#6F788B' },
  taskDivider: { width: 1, height: '80%', backgroundColor: '#1E2330', marginHorizontal: 12 },
  taskMainCol: { flex: 1 },
  taskBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  taskPriorityTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  taskPriorityText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  taskCategoryText: { color: '#6F788B', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  taskTitleText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: '#8E97A8' },
  taskDescText: { color: '#8E97A8', fontSize: 11, marginTop: 2 },
  checkboxBtn: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: '#4E576B', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  checkboxBtnDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  checkboxGlyph: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  footer: { alignItems: 'center', marginTop: 28, paddingTop: 18, borderTopWidth: 1, borderTopColor: '#1A1D27' },
  footerAuthor: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  footerNim: { color: '#FF5500', fontSize: 11, fontWeight: '700', marginTop: 2 },
});

