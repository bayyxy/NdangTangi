// src/app/(tabs)/focus.tsx
// Pomodoro Focus Timer — 25/5 teknik belajar

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';

type SessionType = 'work' | 'short' | 'long';

const DURATIONS: Record<SessionType, number> = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const SESSION_LABELS: Record<SessionType, string> = {
  work: 'SESI FOKUS',
  short: 'ISTIRAHAT PENDEK',
  long: 'ISTIRAHAT PANJANG',
};

const SESSION_COLORS: Record<SessionType, string> = {
  work: '#FF5500',
  short: '#10B981',
  long: '#3B82F6',
};

function formatCountdown(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function ArcProgress({ percent, color }: { percent: number; color: string }) {
  const SIZE = 200;
  const STROKE = 12;
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
      <View style={{ position: 'absolute', top: STROKE, left: STROKE, width: INNER, height: INNER, borderRadius: INNER / 2, backgroundColor: '#0F1118', alignItems: 'center', justifyContent: 'center' }} />
    </View>
  );
}

export default function FocusScreen() {
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [remaining, setRemaining] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsDone, setSessionsDone] = useState(0);

  const totalDuration = DURATIONS[sessionType];
  const elapsed = totalDuration - remaining;
  const arcPercent = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
  const color = SESSION_COLORS[sessionType];

  useEffect(() => {
    if (!isRunning) return;
    activateKeepAwakeAsync();
    return () => { deactivateKeepAwake(); };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (sessionType === 'work') setSessionsDone((d) => d + 1);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, sessionType]);

  const switchSession = useCallback((type: SessionType) => {
    setIsRunning(false);
    setSessionType(type);
    setRemaining(DURATIONS[type]);
  }, []);

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(DURATIONS[sessionType]);
  };

  const handlePlayPause = () => {
    if (remaining === 0) {
      setRemaining(DURATIONS[sessionType]);
      setIsRunning(true);
    } else {
      setIsRunning((v) => !v);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTag}>TEKNIK POMODORO</Text>
      <Text style={styles.pageTitle}>Focus Timer</Text>

      {/* Session Type Selector */}
      <View style={styles.sessionTabs}>
        {(['work', 'short', 'long'] as SessionType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.sessionTab, sessionType === t && { backgroundColor: SESSION_COLORS[t], borderColor: SESSION_COLORS[t] }]}
            onPress={() => switchSession(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sessionTabText, sessionType === t && { color: '#FFFFFF' }]}>
              {t === 'work' ? '25 mnt' : t === 'short' ? '5 mnt' : '15 mnt'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer Circle */}
      <View style={styles.timerContainer}>
        <ArcProgress percent={arcPercent} color={color} />
        <View style={styles.timerOverlay}>
          <Text style={[styles.sessionLabel, { color }]}>{SESSION_LABELS[sessionType]}</Text>
          <Text style={styles.countdown}>{formatCountdown(remaining)}</Text>
          <Text style={styles.sessionProgress}>
            {sessionsDone > 0 ? `${sessionsDone} sesi selesai hari ini` : 'Mulai fokus belajar'}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetBtnText}>↺ RESET</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.playBtn, { backgroundColor: color }]} onPress={handlePlayPause} activeOpacity={0.8}>
          <Text style={styles.playBtnText}>{isRunning ? '⏸ PAUSE' : remaining === 0 ? '↺ ULANG' : '▶ MULAI'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => switchSession(sessionType === 'work' ? (sessionsDone % 4 === 3 ? 'long' : 'short') : 'work')}
          activeOpacity={0.8}
        >
          <Text style={styles.skipBtnText}>SKIP ⏭</Text>
        </TouchableOpacity>
      </View>

      {/* Info Cards */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Text style={[styles.infoValue, { color: '#FF5500' }]}>{sessionsDone}</Text>
          <Text style={styles.infoLabel}>Pomodoro Selesai</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={[styles.infoValue, { color: '#10B981' }]}>{sessionsDone * 25}</Text>
          <Text style={styles.infoLabel}>Menit Fokus</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={[styles.infoValue, { color: '#3B82F6' }]}>{sessionsDone >= 4 ? Math.floor(sessionsDone / 4) : 0}</Text>
          <Text style={styles.infoLabel}>Siklus Penuh</Text>
        </View>
      </View>

      {/* Guide */}
      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>📖 Cara Kerja Pomodoro</Text>
        <Text style={styles.guideText}>1. Fokus kerja 25 menit tanpa gangguan</Text>
        <Text style={styles.guideText}>2. Istirahat pendek 5 menit</Text>
        <Text style={styles.guideText}>3. Setelah 4 sesi → istirahat panjang 15 menit</Text>
        <Text style={styles.guideText}>4. Ulangi hingga tugas selesai</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0C10' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40, alignItems: 'center' },
  pageTag: { color: '#FF5500', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
  pageTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', marginBottom: 24 },
  sessionTabs: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  sessionTab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#232733', backgroundColor: '#15171E' },
  sessionTabText: { color: '#8E97A8', fontSize: 12, fontWeight: '800' },
  timerContainer: { width: 200, height: 200, marginBottom: 36, alignItems: 'center', justifyContent: 'center' },
  timerOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  sessionLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 6 },
  countdown: { color: '#FFFFFF', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  sessionProgress: { color: '#6F788B', fontSize: 10, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  resetBtn: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  resetBtnText: { color: '#8E97A8', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  playBtn: { borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14 },
  playBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  skipBtn: { backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  skipBtnText: { color: '#8E97A8', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  infoGrid: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 20 },
  infoCard: { flex: 1, backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 14, padding: 14, alignItems: 'center' },
  infoValue: { fontSize: 24, fontWeight: '900' },
  infoLabel: { color: '#6F788B', fontSize: 10, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  guideCard: { width: '100%', backgroundColor: '#15171E', borderWidth: 1, borderColor: '#232733', borderRadius: 14, padding: 16 },
  guideTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginBottom: 10 },
  guideText: { color: '#8E97A8', fontSize: 12, fontWeight: '500', lineHeight: 20 },
});

