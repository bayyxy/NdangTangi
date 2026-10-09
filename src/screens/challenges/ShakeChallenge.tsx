import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useShakeDetector } from '../../hooks/useShakeDetector';
import { getDifficultyConfig } from '../../utils/helpers';

const PENALTY_SECONDS = 3; // seconds added when stops shaking

interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: () => void;
}

export default function ShakeChallenge({ difficulty, onComplete }: Props) {
  const config = getDifficultyConfig(difficulty);
  const total = config.shakeDuration;

  const [elapsed, setElapsed] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [penaltyActive, setPenaltyActive] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phoneAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const penaltyAnim = useRef(new Animated.Value(0)).current;

  const startPhoneShake = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(phoneAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(phoneAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      ])
    ).start();
    Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
  }, [phoneAnim, glowAnim]);

  const stopPhoneShake = useCallback(() => {
    phoneAnim.stopAnimation();
    Animated.timing(phoneAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start();
    Animated.timing(glowAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  }, [phoneAnim, glowAnim]);

  const handleShake = useCallback(() => {
    if (stoppedTimerRef.current) {
      clearTimeout(stoppedTimerRef.current);
      stoppedTimerRef.current = null;
    }
    if (!isShaking) {
      setIsShaking(true);
      startPhoneShake();
    }
    // Stop detection — if no more shake in 400ms, mark as stopped
    stoppedTimerRef.current = setTimeout(() => {
      setIsShaking(false);
      stopPhoneShake();
    }, 400);
  }, [isShaking, startPhoneShake, stopPhoneShake]);

  useShakeDetector({ onShake: handleShake, enabled: true });

  // Timer — only counts while shaking
  useEffect(() => {
    if (isShaking) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 0.1;
          if (next >= total) {
            clearInterval(intervalRef.current!);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete();
            return total;
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isShaking, total, onComplete]);

  const progress = Math.min(elapsed / total, 1);
  const remaining = Math.max(0, total - elapsed).toFixed(1);

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(220,38,38,0)', 'rgba(220,38,38,0.4)'],
  });

  const ringColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1e1e2e', '#dc2626'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📳 Guncang HP!</Text>
      <Text style={styles.subtitle}>
        {isShaking ? 'Terus kocok!' : 'Mulai guncangkan HP...'}
      </Text>

      {/* Phone animation */}
      <Animated.View style={[styles.phoneGlow, { shadowColor: glowColor }]}>
        <Animated.View
          style={[
            styles.phoneWrapper,
            { transform: [{ translateX: phoneAnim }] },
          ]}
        >
          <Animated.View style={[styles.phoneBorder, { borderColor: ringColor }]}>
            <Text style={styles.phoneEmoji}>📱</Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* Progress ring (simplified as bar) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: isShaking ? '#dc2626' : '#555',
              },
            ]}
          />
        </View>
        <Text style={styles.timer}>{remaining}s</Text>
      </View>

      <Text style={[styles.status, isShaking ? styles.statusActive : styles.statusIdle]}>
        {isShaking ? '🔥 MENGGUNCANG!' : '⏸ Berhenti'}
      </Text>

      <Text style={styles.hint}>
        Guncang selama {total} detik • Berhenti = timer berhenti
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  phoneGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    shadowOpacity: 1,
    elevation: 20,
  },
  phoneWrapper: {
    alignItems: 'center',
  },
  phoneBorder: {
    borderWidth: 4,
    borderRadius: 24,
    padding: 20,
    borderColor: '#1e1e2e',
  },
  phoneEmoji: {
    fontSize: 100,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 12,
    backgroundColor: '#1e1e2e',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  timer: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 12,
  },
  status: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  statusActive: {
    color: '#dc2626',
    backgroundColor: 'rgba(220,38,38,0.15)',
  },
  statusIdle: {
    color: '#555',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  hint: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
