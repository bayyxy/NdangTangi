import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  BackHandler,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useAlarmStore } from '../store/alarmStore';
import { AudioService } from '../services/AudioService';
import TapChallenge from '../screens/challenges/TapChallenge';
import SwipeChallenge from '../screens/challenges/SwipeChallenge';
import ShakeChallenge from '../screens/challenges/ShakeChallenge';
import { formatTime } from '../utils/helpers';

export default function AlarmRingingScreen() {
  const { activeAlarm, alarms, setActiveAlarm, toggleAlarm } = useAlarmStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const alarm = alarms.find((a) => a.id === activeAlarm?.alarmId);

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  // useEffect: putar audio, animasi pulse, dan blokir tombol back hardware
  useEffect(() => {
    AudioService.play();
    startPulse();

    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [startPulse]);

  const handleChallengeComplete = useCallback(async () => {
    await AudioService.stop();
    await setActiveAlarm(null);
    // Jika tidak ada hari berulang, nonaktifkan alarm
    if (alarm && alarm.repeatDays.length === 0) {
      await toggleAlarm(alarm.id);
    }
    // router.replace('/') — kembali ke home, menghapus stack alarm-ringing
    router.replace('/');
  }, [alarm, setActiveAlarm, toggleAlarm]);

  if (!alarm) {
    AudioService.stop();
    // router.replace('/') — fallback jika alarm tidak ditemukan
    router.replace('/');
    return null;
  }

  const now = new Date();
  const timeStr = formatTime(now.getHours(), now.getMinutes());

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      {/* Jam dengan animasi pulse */}
      <Animated.View style={[styles.clockSection, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.clock}>{timeStr}</Text>
        <Text style={styles.alarmLabel}>{alarm.label || 'Alarm'}</Text>
      </Animated.View>

      {/* Area tantangan */}
      <View style={styles.challengeArea}>
        {alarm.challenge.type === 'tap' && (
          <TapChallenge
            difficulty={alarm.challenge.difficulty}
            onComplete={handleChallengeComplete}
          />
        )}
        {alarm.challenge.type === 'swipe' && (
          <SwipeChallenge
            difficulty={alarm.challenge.difficulty}
            onComplete={handleChallengeComplete}
          />
        )}
        {alarm.challenge.type === 'shake' && (
          <ShakeChallenge
            difficulty={alarm.challenge.difficulty}
            onComplete={handleChallengeComplete}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  clockSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
  },
  clock: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  alarmLabel: {
    fontSize: 16,
    color: '#ff6b35',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  challengeArea: {
    flex: 1,
  },
});
