import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useShakeDetector } from '../../hooks/useShakeDetector';
import { getDifficultyConfig } from '../../utils/helpers';

interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: () => void;
}

// R-02: Playful Indonesian wake-up comments without em dashes
const SHAKE_ACTIVE_COMMENTS = [
  'Mantap rek! Terus guncangkan!',
  'Kocok koyo ngocok es campur!',
  'Ayo nyawane wis meh genep!',
  'Sedikit lagi kasurmu kalah!',
];

const SHAKE_IDLE_COMMENTS = [
  'Lho kok mandheg? Ayo guncang maneh!',
  'Ojo turu maneh rek! Guncang terus!',
  'Kasurmu ngenteni kowe kalah lho!',
];

export default function ShakeChallenge({ difficulty, onComplete }: Props) {
  const config = getDifficultyConfig(difficulty);
  const total = config.shakeDuration;

  const [elapsed, setElapsed] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [activeComment, setActiveComment] = useState(SHAKE_ACTIVE_COMMENTS[0]);
  const [idleComment, setIdleComment] = useState(SHAKE_IDLE_COMMENTS[0]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animations (ENERGY 3, MOTION 2)
  const [phoneTranslateX] = useState(() => new Animated.Value(0));
  const [phoneRotate] = useState(() => new Animated.Value(0));

  const startPhoneAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(phoneTranslateX, { toValue: 12, duration: 50, useNativeDriver: true }),
        Animated.timing(phoneTranslateX, { toValue: -12, duration: 50, useNativeDriver: true }),
        Animated.timing(phoneTranslateX, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(phoneTranslateX, { toValue: 0, duration: 50, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(phoneRotate, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(phoneRotate, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(phoneRotate, { toValue: 0, duration: 60, useNativeDriver: true }),
      ])
    ).start();
  }, [phoneTranslateX, phoneRotate]);

  const stopPhoneAnimation = useCallback(() => {
    phoneTranslateX.stopAnimation();
    phoneRotate.stopAnimation();
    Animated.timing(phoneTranslateX, { toValue: 0, duration: 100, useNativeDriver: true }).start();
    Animated.timing(phoneRotate, { toValue: 0, duration: 100, useNativeDriver: true }).start();
  }, [phoneTranslateX, phoneRotate]);

  const handleShake = useCallback(() => {
    if (stoppedTimerRef.current) {
      clearTimeout(stoppedTimerRef.current);
      stoppedTimerRef.current = null;
    }

    if (!isShaking) {
      setIsShaking(true);
      startPhoneAnimation();
      const randIdx = Math.floor(Math.random() * SHAKE_ACTIVE_COMMENTS.length);
      setActiveComment(SHAKE_ACTIVE_COMMENTS[randIdx]);
    }

    // Stop detection timer: if no kinetic reading for 450ms, mark stopped
    stoppedTimerRef.current = setTimeout(() => {
      setIsShaking(false);
      stopPhoneAnimation();
      const randIdx = Math.floor(Math.random() * SHAKE_IDLE_COMMENTS.length);
      setIdleComment(SHAKE_IDLE_COMMENTS[randIdx]);
    }, 450);
  }, [isShaking, startPhoneAnimation, stopPhoneAnimation]);

  const { hasSensor, triggerShake } = useShakeDetector({ onShake: handleShake, enabled: true });

  // Timer accumulation: only charges up while active
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
  const remainingSeconds = Math.max(0, total - elapsed).toFixed(1);
  const percentComplete = Math.floor(progress * 100);

  const rotateInterpolation = phoneRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-12deg', '12deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.arcadeBadge}>
            <Text style={styles.arcadeBadgeText}>MISI 03 : GUNCANG HP</Text>
          </View>
          <View style={[styles.statusPill, isShaking ? styles.statusPillActive : styles.statusPillIdle]}>
            <Text style={[styles.statusPillText, isShaking ? styles.statusTextActive : styles.statusTextIdle]}>
              {isShaking ? 'SEDANG MENGGUNCANG' : 'SIAP GUNCANG'}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Guncang Sampai Melek!</Text>
        <Text style={styles.commentaryText}>
          {isShaking ? activeComment : idleComment}
        </Text>
      </View>

      {/* Kinetic Kinetic Hub Centerpiece */}
      <View style={styles.hubWrapper}>
        <Animated.View
          style={[
            styles.phoneContainer,
            isShaking && styles.phoneContainerActive,
            {
              transform: [
                { translateX: phoneTranslateX },
                { rotate: rotateInterpolation },
              ],
            },
          ]}
        >
          <View style={styles.phoneScreen}>
            <Text style={styles.phoneIcon}>📳</Text>
            <Text style={styles.phoneLabel}>
              {isShaking ? 'TURBO ON!' : 'GOYANGKAN'}
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Tactical Turbo Energy Gauge */}
      <View style={styles.gaugeSection}>
        <View style={styles.gaugeHeader}>
          <Text style={styles.gaugeLabel}>TURBO ENERGY METER</Text>
          <Text style={styles.gaugePercent}>{percentComplete}% TERCAPAI</Text>
        </View>

        <View style={styles.trackWrapper}>
          <View style={[styles.trackFill, { width: `${percentComplete}%` }]} />
        </View>

        <View style={styles.timerRow}>
          <Text style={styles.timerSub}>Waktu tersisa:</Text>
          <Text style={styles.timerValue}>{remainingSeconds} detik</Text>
        </View>
      </View>

      {/* Manual Fallback Shake Trigger (C-4 Resilience & R-26: Testable anywhere) */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={triggerShake}
          style={styles.manualBtn}
        >
          <Text style={styles.manualBtnText}>
            ⚡ {hasSensor ? 'Sentuh Cepat / Guncang Fisik' : 'Kocok Manual (Ketuk Cepat)'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.hintText}>
          Guncang HP secara konstan • Berhenti guncang berarti waktu berhenti
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  arcadeBadge: {
    backgroundColor: '#1E1E2C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2D2D42',
  },
  arcadeBadgeText: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillActive: {
    backgroundColor: '#301309',
    borderColor: '#FF5500',
  },
  statusPillIdle: {
    backgroundColor: '#14141E',
    borderColor: '#262638',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextActive: {
    color: '#FF5500',
  },
  statusTextIdle: {
    color: '#94A3B8',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  commentaryText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  hubWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  phoneContainer: {
    width: 150,
    height: 150,
    borderRadius: 32,
    backgroundColor: '#14141E',
    borderWidth: 3,
    borderColor: '#262638',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  phoneContainerActive: {
    borderColor: '#FF5500',
    backgroundColor: '#261208',
    shadowColor: '#FF5500',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  phoneScreen: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIcon: {
    fontSize: 58,
  },
  phoneLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 6,
  },
  gaugeSection: {
    marginHorizontal: 16,
    backgroundColor: '#14141E',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#262638',
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gaugeLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  gaugePercent: {
    color: '#FF5500',
    fontSize: 12,
    fontWeight: '800',
  },
  trackWrapper: {
    height: 16,
    backgroundColor: '#0A0A0E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262638',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: '#FF5500',
    borderRadius: 7,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  timerSub: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  timerValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  actionSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  manualBtn: {
    width: '100%',
    minHeight: 48, // R-03: Tap target >= 44px
    backgroundColor: '#1C1C2B',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2D2D42',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  manualBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hintText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
