// src/app/(tabs)/schedule.tsx
// Jadwal Kuliah Mingguan

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useScheduleStore } from '../../store/scheduleStore';
import { DAY_KEYS, DAY_LABELS, DayKey } from '../../types/schedule';

export default function ScheduleScreen() {
  const { courses, isLoaded, loadSchedule, addCourse, removeCourse } = useScheduleStore();
  const [activeDay, setActiveDay] = useState<DayKey>(() => {
    const days: DayKey[] = ['sen', 'sel', 'rab', 'kam', 'jum', 'sab'];
    const jsDay = new Date().getDay(); // 0=Sun
    return days[jsDay === 0 ? 0 : jsDay - 1] ?? 'sen';
  });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ courseName: '', room: '', lecturer: '', startTime: '', endTime: '', day: activeDay as DayKey });

  useEffect(() => { loadSchedule(); }, [loadSchedule]);

  const todayCourses = courses.filter((c) => c.day === activeDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAdd = async () => {
    if (!form.courseName.trim() || !form.startTime.trim() || !form.endTime.trim()) {
      Alert.alert('Lengkapi Form', 'Nama mata kuliah, jam mulai, dan jam selesai wajib diisi.');
      return;
    }
    await addCourse({ ...form, day: form.day });
    setShowModal(false);
    setForm({ courseName: '', room: '', lecturer: '', startTime: '', endTime: '', day: activeDay });
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Hapus Jadwal', `Hapus "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => removeCourse(id) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTag}>INFORMATIKA UMM • SEMESTER 5</Text>
        <Text style={styles.pageTitle}>Jadwal Kuliah</Text>

        {/* Day Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabsScroll}>
          <View style={styles.dayTabs}>
            {DAY_KEYS.map((day) => {
              const count = courses.filter((c) => c.day === day).length;
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayTab, activeDay === day && styles.dayTabActive]}
                  onPress={() => setActiveDay(day)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayTabText, activeDay === day && styles.dayTabTextActive]}>
                    {DAY_LABELS[day]}
                  </Text>
                  {count > 0 && (
                    <View style={[styles.dayBadge, activeDay === day && styles.dayBadgeActive]}>
                      <Text style={[styles.dayBadgeText, activeDay === day && styles.dayBadgeTextActive]}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Course List */}
        <View style={styles.courseList}>
          {todayCourses.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Tidak Ada Kuliah</Text>
              <Text style={styles.emptySub}>Tambah jadwal kuliah untuk {DAY_LABELS[activeDay]} dengan tombol di bawah.</Text>
            </View>
          ) : (
            todayCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={[styles.courseCard, { borderLeftColor: course.color }]}
                onLongPress={() => handleDelete(course.id, course.courseName)}
                activeOpacity={0.85}
              >
                <View style={styles.courseTimeCol}>
                  <Text style={styles.courseStart}>{course.startTime}</Text>
                  <Text style={styles.courseEnd}>{course.endTime}</Text>
                </View>
                <View style={styles.courseDivider} />
                <View style={styles.courseInfo}>
                  <View style={[styles.courseColorDot, { backgroundColor: course.color }]} />
                  <Text style={styles.courseName} numberOfLines={1}>{course.courseName}</Text>
                  {course.room ? <Text style={styles.courseMeta}>📍 {course.room}</Text> : null}
                  {course.lecturer ? <Text style={styles.courseMeta}>👤 {course.lecturer}</Text> : null}
                  {course.credits ? (
                    <View style={styles.creditBadge}>
                      <Text style={styles.creditText}>{course.credits} SKS</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { setForm((f) => ({ ...f, day: activeDay })); setShowModal(true); }}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+ Tambah</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Tambah Jadwal Kuliah</Text>

            {/* Day Selector inside modal */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {DAY_KEYS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.miniDayTab, form.day === d && styles.miniDayTabActive]}
                    onPress={() => setForm((f) => ({ ...f, day: d }))}
                  >
                    <Text style={[styles.miniDayText, form.day === d && { color: '#FF5500' }]}>{DAY_LABELS[d]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TextInput style={styles.input} placeholder="Nama Mata Kuliah *" placeholderTextColor="#6F788B" value={form.courseName} onChangeText={(v) => setForm((f) => ({ ...f, courseName: v }))} />
            <TextInput style={styles.input} placeholder="Ruangan (misal: GKB 1-204)" placeholderTextColor="#6F788B" value={form.room} onChangeText={(v) => setForm((f) => ({ ...f, room: v }))} />
            <TextInput style={styles.input} placeholder="Nama Dosen" placeholderTextColor="#6F788B" value={form.lecturer} onChangeText={(v) => setForm((f) => ({ ...f, lecturer: v }))} />
            <View style={styles.timeRow}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Mulai (07:00) *" placeholderTextColor="#6F788B" value={form.startTime} onChangeText={(v) => setForm((f) => ({ ...f, startTime: v }))} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Selesai (08:40) *" placeholderTextColor="#6F788B" value={form.endTime} onChangeText={(v) => setForm((f) => ({ ...f, endTime: v }))} />
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0C10' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 100 },
  pageTag: { color: '#FF5500', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
  pageTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', marginBottom: 20 },
  dayTabsScroll: { marginBottom: 20 },
  dayTabs: { flexDirection: 'row', gap: 8 },
  dayTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayTabActive: { backgroundColor: '#FF5500', borderColor: '#FF5500' },
  dayTabText: { color: '#8E97A8', fontSize: 12, fontWeight: '700' },
  dayTabTextActive: { color: '#FFFFFF' },
  dayBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#1E2330', alignItems: 'center', justifyContent: 'center' },
  dayBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  dayBadgeText: { color: '#8E97A8', fontSize: 9, fontWeight: '900' },
  dayBadgeTextActive: { color: '#FFFFFF' },
  courseList: { gap: 12 },
  emptyBox: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 16, padding: 24, alignItems: 'center' },
  emptyTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  emptySub: { color: '#8E97A8', fontSize: 12, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  courseCard: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 14, padding: 14, flexDirection: 'row', borderLeftWidth: 4 },
  courseTimeCol: { width: 52, alignItems: 'flex-start' },
  courseStart: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  courseEnd: { color: '#6F788B', fontSize: 10, fontWeight: '700', marginTop: 2 },
  courseDivider: { width: 1, backgroundColor: '#1E2330', marginHorizontal: 12 },
  courseInfo: { flex: 1 },
  courseColorDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 4 },
  courseName: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  courseMeta: { color: '#8E97A8', fontSize: 11, fontWeight: '500', marginTop: 2 },
  creditBadge: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,85,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,85,0,0.3)', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2 },
  creditText: { color: '#FF5500', fontSize: 9, fontWeight: '900' },
  fab: { position: 'absolute', bottom: 24, right: 20, backgroundColor: '#FF5500', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 13, shadowColor: '#FF5500', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  fabText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: { backgroundColor: '#15171E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginBottom: 16 },
  input: { backgroundColor: '#0F1118', borderWidth: 1, borderColor: '#232733', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#FFFFFF', fontSize: 14, marginBottom: 10 },
  timeRow: { flexDirection: 'row', gap: 10 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: '#0F1118', borderWidth: 1, borderColor: '#232733', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  cancelBtnText: { color: '#8E97A8', fontSize: 14, fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: '#FF5500', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  miniDayTab: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#0F1118', borderWidth: 1, borderColor: '#232733' },
  miniDayTabActive: { borderColor: '#FF5500' },
  miniDayText: { color: '#8E97A8', fontSize: 11, fontWeight: '700' },
});

