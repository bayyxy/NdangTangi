// src/app/(tabs)/profile.tsx
// Profil Mahasiswa & Pengaturan Aplikasi

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTaskStore } from '../../store/taskStore';
import { useAlarmStore } from '../../store/alarmStore';

const PROFILE_KEY = '@ndangtangi_profile_v1';

interface Profile {
  name: string;
  nim: string;
  prodi: string;
  semester: string;
  university: string;
}

const DEFAULT_PROFILE: Profile = {
  name: 'Bayu Adi Nugroho',
  nim: '202410370110193',
  prodi: 'Teknik Informatika',
  semester: '5',
  university: 'Universitas Muhammadiyah Malang',
};

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Profile>(DEFAULT_PROFILE);
  const { tasks } = useTaskStore();
  const { alarms } = useAlarmStore();

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY).then((val) => {
      if (val) {
        const p = JSON.parse(val) as Profile;
        setProfile(p);
        setDraft(p);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.nim.trim()) {
      Alert.alert('Lengkapi Data', 'Nama dan NIM wajib diisi.');
      return;
    }
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(draft));
    setProfile(draft);
    setEditMode(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditMode(false);
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.completed).length;
  const activeAlarms = alarms.filter((a) => a.enabled).length;

  const InfoField = ({ label, field }: { label: string; field: keyof Profile }) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editMode ? (
        <TextInput
          style={styles.fieldInput}
          value={draft[field]}
          onChangeText={(v) => setDraft((d) => ({ ...d, [field]: v }))}
          placeholderTextColor="#6F788B"
        />
      ) : (
        <Text style={styles.fieldValue}>{profile[field] || '-'}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Avatar & Name */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
        </View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileSub}>{profile.prodi} • Semester {profile.semester}</Text>
        <Text style={styles.profileUni}>{profile.university}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#10B981' }]}>{doneTasks}</Text>
          <Text style={styles.statLbl}>Tugas Selesai</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#F59E0B' }]}>{totalTasks - doneTasks}</Text>
          <Text style={styles.statLbl}>Belum Selesai</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#FF5500' }]}>{activeAlarms}</Text>
          <Text style={styles.statLbl}>Alarm Aktif</Text>
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>DATA MAHASISWA</Text>
          {!editMode ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
              <Text style={styles.editBtnText}>✏ Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelEditBtn} onPress={handleCancel}>
                <Text style={styles.cancelEditText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveEditBtn} onPress={handleSave}>
                <Text style={styles.saveEditText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <InfoField label="Nama Lengkap" field="name" />
        <InfoField label="NIM" field="nim" />
        <InfoField label="Program Studi" field="prodi" />
        <InfoField label="Semester" field="semester" />
        <InfoField label="Universitas" field="university" />
      </View>

      {/* App Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>TENTANG APLIKASI</Text>
        <View style={styles.appInfoRow}>
          <View style={styles.appIcon}><Text style={styles.appIconText}>⏰</Text></View>
          <View>
            <Text style={styles.appName}>Ndang Tangi</Text>
            <Text style={styles.appDesc}>Student Planner & Smart Alarm</Text>
          </View>
        </View>
        <View style={styles.infoList}>
          <View style={styles.infoListRow}>
            <Text style={styles.infoListLabel}>Versi</Text>
            <Text style={styles.infoListValue}>1.0.0</Text>
          </View>
          <View style={styles.infoListRow}>
            <Text style={styles.infoListLabel}>SDK</Text>
            <Text style={styles.infoListValue}>Expo SDK 58</Text>
          </View>
          <View style={styles.infoListRow}>
            <Text style={styles.infoListLabel}>Framework</Text>
            <Text style={styles.infoListValue}>React Native 0.88</Text>
          </View>
          <View style={styles.infoListRow}>
            <Text style={styles.infoListLabel}>Mata Kuliah</Text>
            <Text style={styles.infoListValue}>Pemrograman Mobile</Text>
          </View>
        </View>
      </View>

      {/* NIM Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerName}>{profile.name}</Text>
        <Text style={styles.footerNim}>NIM: {profile.nim}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0C10' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF5500', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF', marginBottom: 12 },
  avatarText: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  profileName: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  profileSub: { color: '#FF5500', fontSize: 12, fontWeight: '700', marginTop: 4 },
  profileUni: { color: '#8E97A8', fontSize: 11, fontWeight: '500', marginTop: 2 },
  quickStats: { flexDirection: 'row', backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 16, padding: 16, marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '900' },
  statLbl: { color: '#8E97A8', fontSize: 10, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: '#1E2330', marginHorizontal: 4 },
  card: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { color: '#FF5500', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  editBtn: { backgroundColor: 'rgba(255,85,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,85,0,0.3)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  editBtnText: { color: '#FF5500', fontSize: 11, fontWeight: '800' },
  editActions: { flexDirection: 'row', gap: 8 },
  cancelEditBtn: { backgroundColor: '#0F1118', borderWidth: 1, borderColor: '#232733', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  cancelEditText: { color: '#8E97A8', fontSize: 11, fontWeight: '700' },
  saveEditBtn: { backgroundColor: '#FF5500', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  saveEditText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  fieldRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1A1D27' },
  fieldLabel: { color: '#6F788B', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  fieldValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  fieldInput: { backgroundColor: '#0F1118', borderWidth: 1, borderColor: '#3B4255', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: '#FFFFFF', fontSize: 14 },
  appInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  appIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FF5500', alignItems: 'center', justifyContent: 'center' },
  appIconText: { fontSize: 24 },
  appName: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  appDesc: { color: '#8E97A8', fontSize: 11, marginTop: 2 },
  infoList: { gap: 10 },
  infoListRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoListLabel: { color: '#6F788B', fontSize: 12, fontWeight: '600' },
  infoListValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  footer: { alignItems: 'center', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1A1D27' },
  footerName: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  footerNim: { color: '#FF5500', fontSize: 11, fontWeight: '700', marginTop: 2 },
});

