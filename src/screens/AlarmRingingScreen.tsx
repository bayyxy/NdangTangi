import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  BackHandler,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useAlarmStore } from '../store/alarmStore';
import { AudioService } from '../services/AudioService';
import TapChallenge from './challenges/TapChallenge';
import SwipeChallenge from './challenges/SwipeChallenge';
import ShakeChallenge from './challenges/ShakeChallenge';
import { formatTime } from '../utils/helpers';

export default function AlarmRingingScreen() {
  const { activeAlarm, alarms, setActiveAlarm, toggleAlarm, snoozeAlarm } = useAlarmStore();
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [alertBarAnim] = useState(() => new Animated.Value(0));

  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return formatTime(now.getHours(), now.getMinutes());
  });

  const alarm = alarms.find((a) => a.id === activeAlarm?.alarmId);

  // Pulse animation for ringing clock and siren (ENERGY 3, MOTION 2)
  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(alertBarAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
        Animated.timing(alertBarAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
      ])
    ).start();
  }, [pulseAnim, alertBarAnim]);

  useEffect(() => {
    AudioService.play();
    startPulse();

    // Keep live digital clock updating every second
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(formatTime(now.getHours(), now.getMinutes()));
    }, 1000);

    // Block hardware back button so user must solve challenge or snooze
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);

    return () => {
      clearInterval(clockInterval);
      sub.remove();
    };
  }, [startPulse]);

  const handleChallengeComplete = useCallback(async () => {
    await AudioService.stop();
    await setActiveAlarm(null);
    // If no repeat days, turn off the alarm
    if (alarm && alarm.repeatDays.length === 0) {
      await toggleAlarm(alarm.id);
    }
  }, [alarm, setActiveAlarm, toggleAlarm]);

  const handleSnooze = useCallback(async () => {
    if (!alarm) return;
    await AudioService.stop();
    await snoozeAlarm(alarm.id);
  }, [alarm, snoozeAlarm]);

  if (!alarm) {
    AudioService.stop();
    return null;
  }

  const canSnooze = alarm.snoozeEnabled && (alarm.snoozeCount || 0) < (alarm.maxSnooze || 3);
  const remainingSnoozeCount = Math.max(0, (alarm.maxSnooze || 3) - (alarm.snoozeCount || 0));

  const alertBarColor = alertBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FF5500', '#EF4444'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0E" />

      {/* Top Urgent Siren Header (R-02: Playful Indonesian copy without em dashes) */}
      <Animated.View style={[styles.sirenBar, { backgroundColor: alertBarColor }]}>
        <Text style={styles.sirenText}>🚨 NDANG TANGI REK! KASURMU DUDU KUBURAN 🚨</Text>
      </Animated.View>

      {/* Hero Clock & Alarm Identity Display */}
      <View style={styles.clockHeader}>
        <Animated.View style={[styles.clockWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.digitalClock}>{currentTime}</Text>
        </Animated.View>

        <View style={styles.labelBadge}>
          <Text style={styles.labelBadgeText}>
            {alarm.label ? alarm.label.toUpperCase() : 'ALARM PAGI'}
          </Text>
        </View>

        <Text style={styles.cheekyTagline}>
          Selesaikan misi di bawah untuk mematikan alarm
        </Text>
      </View>

      {/* Interactive Challenge Arena */}
      <View style={styles.challengeContainer}>
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

      {/* Bottom Tactical Footer: Snooze or High-Discipline Banner */}
      <View style={styles.footer}>
        {canSnooze ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSnooze}
            style={styles.snoozeButton}
          >
            <Text style={styles.snoozeBtnText}>
              😴 Tunda 5 Menit (Sisa {remainingSnoozeCount}x)
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.noSnoozeCard}>
            <Text style={styles.noSnoozeText}>
              🔒 MODE DISIPLIN: Snooze dimatikan, wajib tuntaskan misi!
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0E',
  },
  sirenBar: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sirenText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  clockHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  clockWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitalClock: {
    fontSize: 68,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  labelBadge: {
    backgroundColor: '#1E1E2C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D42',
    marginTop: 2,
  },
  labelBadgeText: {
    color: '#FF5500',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  cheekyTagline: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  challengeContainer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  snoozeButton: {
    minHeight: 50, // R-03: Tap target >= 44px
    backgroundColor: '#1C1C2B',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2D2D42',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  snoozeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  noSnoozeCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#14141E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262638',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSnoozeText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
