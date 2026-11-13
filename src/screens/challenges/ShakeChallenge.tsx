import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useShakeDetector } from '../../hooks/useShakeDetector';
import { getDifficultyConfig } from '../../utils/helpers';

const { width: W } = Dimensions.get('window');

interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: () => void;
}

export default function ShakeChallenge({ difficulty, onComplete }: Props) {
  const config = getDifficultyConfig(difficulty);
  const total = config.shakeDuration;

  const [elapsed, setElapsed] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phoneAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const startPhoneShake = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(phoneAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
        Animated.timing(phoneAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
      ])
    ).start();
    Animated.timing(glowAnim, { toValue: 1, duration: 250, useNativeDriver: false }).start();
  }, [phoneAnim, glowAnim]);

  const stopPhoneShake = useCallback(() => {
    phoneAnim.stopAnimation();
    Animated.timing(phoneAnim, { toValue: 0, duration: 90, useNativeDriver: true }).start();
    Animated.timing(glowAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
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
    // Hentikan status jika tidak ada guncangan dalam rentang 400ms
    stoppedTimerRef.current = setTimeout(() => {
      setIsShaking(false);
      stopPhoneShake();
    }, 400);
  }, [isShaking, startPhoneShake, stopPhoneShake]);

  useShakeDetector({ onShake: handleShake, enabled: true });

  // Timer guncangan hanya bertambah saat perangkat bergerak
  useEffect(() => {
    if (isShaking) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 0.1;
          if (next >= total) {
            clearInterval(intervalRef.current!);
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

  const bezelBorderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#232733', '#FF5500'],
  });

  return (
    <View style={styles.container}>
      {/* Header Tantangan */}
      <View style={styles.header}>
        <Text style={styles.missionTag}>MISI: GUNCANG PERANGKAT</Text>
        <Text style={styles.counterText}>{remaining}s</Text>
        <Text style={styles.subtitle}>
          Pertahankan guncangan hingga target {total} detik tercapai
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Area Sensor HUD Interaktif */}
      <View style={styles.hudCard}>
        <Animated.View
          style={[
            styles.phoneBezel,
            {
              borderColor: bezelBorderColor,
              transform: [{ translateX: phoneAnim }],
            },
          ]}
        >
          <View style={styles.deviceSpeaker} />

          <View style={styles.sensorGraph}>
            <View style={[styles.signalBar, isShaking && styles.signalBarActive]} />
            <View style={[styles.signalBar, styles.signalBarTall, isShaking && styles.signalBarActive]} />
            <View style={[styles.signalBar, isShaking && styles.signalBarActive]} />
          </View>

          <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
          <Text style={styles.percentSub}>AKUMULASI ENERGI</Text>

          <View style={styles.deviceHomeBar} />
        </Animated.View>

        {/* Status Sensor */}
        <View
          style={[
            styles.statusPill,
            isShaking ? styles.statusPillActive : styles.statusPillIdle,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isShaking ? styles.statusDotActive : styles.statusDotIdle,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isShaking ? styles.statusTextActive : styles.statusTextIdle,
            ]}
          >
            {isShaking ? 'SENSOR MENDETEKSI GUNCANGAN' : 'GERAKKAN PERANGKAT SEKARANG'}
          </Text>
        </View>
      </View>

      {/* Footer Info */}
      <View style={styles.footerBar}>
        <Text style={styles.hint}>
          Guncangkan perangkat secara konstan. Waktu akan terjeda jika gerakan tangan berhenti.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C10',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  missionTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF5500',
    letterSpacing: 1.5,
  },
  counterText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E97A8',
    marginTop: 4,
    textAlign: 'center',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1E2330',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF5500',
  },
  hudCard: {
    flex: 1,
    backgroundColor: '#15171E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#232733',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    width: W - 32,
    alignSelf: 'center',
  },
  phoneBezel: {
    width: 140,
    height: 220,
    borderRadius: 28,
    backgroundColor: '#0E1017',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    shadowColor: '#FF5500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  deviceSpeaker: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2A3042',
  },
  sensorGraph: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
  },
  signalBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#232733',
  },
  signalBarTall: {
    height: 28,
  },
  signalBarActive: {
    backgroundColor: '#FF5500',
  },
  percentText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  percentSub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6F788B',
    letterSpacing: 1.2,
    marginTop: -4,
  },
  deviceHomeBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2A3042',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillActive: {
    backgroundColor: 'rgba(255, 85, 0, 0.12)',
    borderColor: 'rgba(255, 85, 0, 0.3)',
  },
  statusPillIdle: {
    backgroundColor: '#1C1F2A',
    borderColor: '#2A3042',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotActive: {
    backgroundColor: '#FF5500',
  },
  statusDotIdle: {
    backgroundColor: '#6F788B',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusTextActive: {
    color: '#FF5500',
  },
  statusTextIdle: {
    color: '#8E97A8',
  },
  footerBar: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  hint: {
    color: '#6F788B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
