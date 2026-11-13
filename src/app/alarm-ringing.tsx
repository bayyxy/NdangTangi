import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    AudioService.play();
    startPulse();

    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [startPulse]);

  const handleChallengeComplete = useCallback(async () => {
    await AudioService.stop();
    await setActiveAlarm(null);
    if (alarm && alarm.repeatDays.length === 0) {
      await toggleAlarm(alarm.id);
    }
    // Setelah misi alarm berhasil diselesaikan, arahkan ke Briefing Pagi (Modul 3)
    router.replace('/briefing');
  }, [alarm, setActiveAlarm, toggleAlarm]);

  if (!alarm) {
    AudioService.stop();
    router.replace('/');
    return null;
  }

  const now = new Date();
  const timeStr = formatTime(now.getHours(), now.getMinutes());

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Header Alarm Berdering */}
      <View style={styles.topBanner}>
        <View style={styles.urgentTag}>
          <View style={styles.urgentDot} />
          <Text style={styles.urgentTagText}>ALARM SEDANG BERDERING</Text>
        </View>

        <Animated.View style={[styles.clockSection, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.clock}>{timeStr}</Text>
          <Text style={styles.alarmLabel}>{alarm.label || 'WAKTU BANGUN!'}</Text>
        </Animated.View>

        <Text style={styles.instructionText}>
          Selesaikan misi di bawah ini untuk menonaktifkan dering alarm.
        </Text>
      </View>

      {/* Area Misi Tantangan */}
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
    backgroundColor: '#0B0C10',
  },
  topBanner: {
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#0F1117',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2430',
  },
  urgentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
    marginBottom: 8,
  },
  urgentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  urgentTagText: {
    color: '#FF6B6B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  clockSection: {
    alignItems: 'center',
    marginVertical: 4,
  },
  clock: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  alarmLabel: {
    fontSize: 16,
    color: '#FF5500',
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  instructionText: {
    fontSize: 12,
    color: '#8E97A8',
    textAlign: 'center',
    marginTop: 6,
  },
  challengeArea: {
    flex: 1,
  },
});
