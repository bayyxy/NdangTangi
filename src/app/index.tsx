import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Animated,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAlarmStore } from '../store/alarmStore';
import { Alarm } from '../types/alarm';
import { formatTime } from '../utils/helpers';

const CHALLENGE_ICON: Record<string, string> = {
  tap: '🎯',
  swipe: '👆',
  shake: '📳',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#16a34a',
  medium: '#f59e0b',
  hard: '#dc2626',
};

// ─── Komponen kartu alarm ─────────────────────────────────────────────────────
function AlarmCard({ alarm }: { alarm: Alarm }) {
  const { toggleAlarm, removeAlarm } = useAlarmStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // useEffect: animasi fade-in saat kartu muncul
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleDelete = () => {
    Alert.alert('Hapus Alarm', 'Yakin ingin menghapus alarm ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => removeAlarm(alarm.id) },
    ]);
  };

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }, !alarm.enabled && styles.cardDisabled]}>
      <TouchableOpacity
        style={styles.cardMain}
        // router.push() — buka halaman edit alarm dengan parameter
        onPress={() => router.push({ pathname: '/add-alarm', params: { alarmId: alarm.id } })}
        onLongPress={handleDelete}
        activeOpacity={0.8}
      >
        <View>
          <Text style={[styles.cardTime, !alarm.enabled && styles.dimText]}>
            {formatTime(alarm.hour, alarm.minute)}
          </Text>
          {alarm.label ? (
            <Text style={styles.cardLabel}>{alarm.label}</Text>
          ) : null}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {CHALLENGE_ICON[alarm.challenge.type]}{' '}
                {alarm.challenge.type === 'tap'
                  ? 'Tap'
                  : alarm.challenge.type === 'swipe'
                  ? 'Swipe'
                  : 'Shake'}
              </Text>
            </View>
            <View style={[styles.badge, { borderColor: DIFFICULTY_COLOR[alarm.challenge.difficulty] }]}>
              <Text style={[styles.badgeText, { color: DIFFICULTY_COLOR[alarm.challenge.difficulty] }]}>
                {alarm.challenge.difficulty === 'easy'
                  ? 'Mudah'
                  : alarm.challenge.difficulty === 'medium'
                  ? 'Sedang'
                  : 'Sulit'}
              </Text>
            </View>
            {alarm.repeatDays.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🔁 Berulang</Text>
              </View>
            )}
          </View>
        </View>
        <Switch
          value={alarm.enabled}
          onValueChange={() => toggleAlarm(alarm.id)}
          trackColor={{ false: '#1e1e2e', true: '#ff6b35' }}
          thumbColor="#fff"
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Halaman utama (Home) ─────────────────────────────────────────────────────
export default function HomeScreen() {
  const { alarms, loading, loadAlarms } = useAlarmStore();
  const headerAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  // useEffect: muat data & jalankan animasi header + FAB
  useEffect(() => {
    loadAlarms();
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fabAnim, { toValue: 1, duration: 800, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (loading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.loadingText}>⏳ Memuat alarm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header animasi */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              { translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) },
            ],
          },
        ]}
      >
        <Text style={styles.headerTime}>{timeStr}</Text>
        <Text style={styles.headerTitle}>WakeForce</Text>
        <Text style={styles.headerSub}>
          {alarms.filter((a) => a.enabled).length} alarm aktif
        </Text>
      </Animated.View>

      {/* Daftar Alarm */}
      {alarms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>⏰</Text>
          <Text style={styles.emptyText}>Belum ada alarm</Text>
          <Text style={styles.emptySub}>Tekan + untuk membuat alarm baru</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AlarmCard alarm={item} />}
          contentContainerStyle={styles.list}
        />
      )}

      {/* FAB — tombol tambah alarm */}
      <Animated.View
        style={[
          styles.fabWrapper,
          {
            opacity: fabAnim,
            transform: [{ scale: fabAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          // router.push() — navigasi ke halaman tambah alarm
          onPress={() => router.push('/add-alarm')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f0f1a' },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#12121f',
  },
  headerTime: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ff6b35',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerSub: {
    color: '#555',
    fontSize: 13,
    marginTop: 2,
  },
  list: { padding: 16 },
  card: {
    backgroundColor: '#12121f',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e1e2e',
    overflow: 'hidden',
  },
  cardDisabled: { opacity: 0.5 },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  cardTime: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  dimText: { color: '#444' },
  cardLabel: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  badge: {
    borderWidth: 1,
    borderColor: '#1e1e2e',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  emptySub: { color: '#555', fontSize: 14, marginTop: 6 },
  loadingText: { color: '#555', fontSize: 16 },
  fabWrapper: {
    position: 'absolute',
    bottom: 32,
    right: 24,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ff6b35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff6b35',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '900', lineHeight: 36 },
});
