// src/app/(tabs)/profile.tsx
// Profil Mahasiswa, Info Sesi Supabase & Tombol Keluar (Sign Out)

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
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
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NT';
  return parts
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface InfoFieldProps {
  label: string;
  value: string;
  draftValue: string;
  editMode: boolean;
  onChangeText: (text: string) => void;
}

function InfoField({
  label,
  value,
  draftValue,
  editMode,
  onChangeText,
}: InfoFieldProps) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editMode ? (
        <TextInput
          style={styles.fieldInput}
          value={draftValue}
          onChangeText={onChangeText}
          placeholderTextColor="#6F788B"
        />
      ) : (
        <Text style={styles.fieldValue}>{value || '-'}</Text>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { tasks, clearTasks } = useTaskStore();
  const { alarms } = useAlarmStore();

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Profile>(DEFAULT_PROFILE);
  const [savingProfile, setSavingProfile] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const meta = user?.user_metadata;
    if (meta && (meta.full_name || meta.nim)) {
      const fromCloud: Profile = {
        name: String(meta.full_name || user?.email?.split('@')[0] || DEFAULT_PROFILE.name),
        nim: String(meta.nim || DEFAULT_PROFILE.nim),
        prodi: String(meta.prodi || DEFAULT_PROFILE.prodi),
        semester: String(meta.semester || DEFAULT_PROFILE.semester),
        university: String(meta.university || DEFAULT_PROFILE.university),
      };
      setProfile(fromCloud);
      setDraft(fromCloud);
      return;
    }

    AsyncStorage.getItem(PROFILE_KEY).then((val) => {
      if (val) {
        const p = JSON.parse(val) as Profile;
        setProfile(p);
        setDraft(p);
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (savingProfile) return;
    if (!draft.name.trim() || !draft.nim.trim()) {
      Alert.alert('Lengkapi Data', 'Nama dan NIM wajib diisi.');
      return;
    }

    setSavingProfile(true);
    try {
      const cleaned: Profile = {
        name: draft.name.trim(),
        nim: draft.nim.trim(),
        prodi: draft.prodi.trim() || DEFAULT_PROFILE.prodi,
        semester: draft.semester.trim() || DEFAULT_PROFILE.semester,
        university: draft.university.trim() || DEFAULT_PROFILE.university,
      };

      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(cleaned));

      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: cleaned.name,
            nim: cleaned.nim,
            prodi: cleaned.prodi,
            semester: cleaned.semester,
            university: cleaned.university,
          },
        });
        if (error) {
          Alert.alert('Info Sinkronisasi', `Tersimpan lokal, gagal update cloud: ${error.message}`);
        }
      }

      setProfile(cleaned);
      setDraft(cleaned);
      setEditMode(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditMode(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Keluar dari Akun',
      'Sesi JWT di SecureStore akan dihapus dan aplikasi akan terkunci kembali.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              clearTasks();
              await signOut();
            } catch (err: unknown) {
              const msg =
                err instanceof Error ? err.message : 'Gagal keluar dari akun.';
              Alert.alert('Error', msg);
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.completed).length;
  const activeAlarms = alarms.filter((a) => a.enabled).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Avatar & Name */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
        </View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileSub}>
          {profile.prodi} • Semester {profile.semester}
        </Text>
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
          <Text style={[styles.statNum, { color: '#F59E0B' }]}>
            {totalTasks - doneTasks}
          </Text>
          <Text style={styles.statLbl}>Belum Selesai</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#FF5500' }]}>{activeAlarms}</Text>
          <Text style={styles.statLbl}>Alarm Aktif</Text>
        </View>
      </View>

      {/* Active Supabase Session Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>AKUN CLOUD & SESI AMAN</Text>
          <View style={styles.sessionBadge}>
            <View style={styles.sessionDot} />
            <Text style={styles.sessionBadgeText}>TERAUTENTIKASI</Text>
          </View>
        </View>

        <View style={styles.infoList}>
          <View style={styles.infoListRow}>
            <Text style={styles.infoListLabel}>Email</Text>
            <Text style={styles.infoListValue} numberOfLines={1}>
              {user?.email ?? '-'}
            </Text>
          </View>
          <View style={styles.infoListRow}>
            <Text style={styles.infoListLabel}>User UID</Text>
            <Text style={styles.infoListValueMono} numberOfLines={1}>
              {user?.id ? `${user.id.slice(0, 18)}...` : '-'}
            </Text>
          </View>
          <View style={styles.infoListRow}>
            <Text style={styles.infoListLabel}>Penyimpanan Token</Text>
            <Text style={styles.infoListValue}>Expo SecureStore (JWT)</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.signOutBtn, signingOut && styles.signOutBtnDisabled]}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Keluar dari akun"
        >
          {signingOut ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
              <Text style={styles.signOutBtnText}>Keluar & Kunci Akun</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>DATA MAHASISWA</Text>
          {!editMode ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelEditBtn}
                onPress={handleCancel}
                disabled={savingProfile}
              >
                <Text style={styles.cancelEditText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveEditBtn}
                onPress={handleSave}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveEditText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
        <InfoField
          label="Nama Lengkap"
          value={profile.name}
          draftValue={draft.name}
          editMode={editMode}
          onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
        />
        <InfoField
          label="NIM"
          value={profile.nim}
          draftValue={draft.nim}
          editMode={editMode}
          onChangeText={(v) => setDraft((d) => ({ ...d, nim: v }))}
        />
        <InfoField
          label="Program Studi"
          value={profile.prodi}
          draftValue={draft.prodi}
          editMode={editMode}
          onChangeText={(v) => setDraft((d) => ({ ...d, prodi: v }))}
        />
        <InfoField
          label="Semester"
          value={profile.semester}
          draftValue={draft.semester}
          editMode={editMode}
          onChangeText={(v) => setDraft((d) => ({ ...d, semester: v }))}
        />
        <InfoField
          label="Universitas"
          value={profile.university}
          draftValue={draft.university}
          editMode={editMode}
          onChangeText={(v) => setDraft((d) => ({ ...d, university: v }))}
        />
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF5500',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  avatarText: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  profileName: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  profileSub: { color: '#FF5500', fontSize: 12, fontWeight: '700', marginTop: 4 },
  profileUni: { color: '#8E97A8', fontSize: 11, fontWeight: '500', marginTop: 2 },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '900' },
  statLbl: { color: '#8E97A8', fontSize: 10, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: '#1E2330', marginHorizontal: 4 },
  card: {
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: { color: '#FF5500', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sessionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  sessionBadgeText: { color: '#10B981', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 16,
  },
  signOutBtnDisabled: { opacity: 0.65 },
  signOutBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  editBtn: {
    backgroundColor: 'rgba(255,85,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,85,0,0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editBtnText: { color: '#FF5500', fontSize: 11, fontWeight: '800' },
  editActions: { flexDirection: 'row', gap: 8 },
  cancelEditBtn: {
    backgroundColor: '#0F1118',
    borderWidth: 1,
    borderColor: '#232733',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cancelEditText: { color: '#8E97A8', fontSize: 11, fontWeight: '700' },
  saveEditBtn: {
    backgroundColor: '#FF5500',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    minWidth: 56,
    alignItems: 'center',
  },
  saveEditText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  fieldRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1A1D27' },
  fieldLabel: { color: '#6F788B', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  fieldValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  fieldInput: {
    backgroundColor: '#0F1118',
    borderWidth: 1,
    borderColor: '#3B4255',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
  },
  infoList: { gap: 10 },
  infoListRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  infoListLabel: { color: '#6F788B', fontSize: 12, fontWeight: '600' },
  infoListValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  infoListValueMono: {
    color: '#8E97A8',
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1D27',
  },
  footerName: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  footerNim: { color: '#FF5500', fontSize: 11, fontWeight: '700', marginTop: 2 },
});
