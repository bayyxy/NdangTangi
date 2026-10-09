import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SwipeDirection } from '../../types/alarm';
import { generateSwipePattern, getDifficultyConfig } from '../../utils/helpers';

const { width: W } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;

const ARROW_MAP: Record<SwipeDirection, string> = {
  left: '←',
  right: '→',
  up: '↑',
  down: '↓',
};

const COLOR_MAP: Record<SwipeDirection, string> = {
  left: '#7c3aed',
  right: '#2563eb',
  up: '#16a34a',
  down: '#dc2626',
};

interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: () => void;
}

export default function SwipeChallenge({ difficulty, onComplete }: Props) {
  const config = getDifficultyConfig(difficulty);
  const [pattern] = useState(() => generateSwipePattern(config.swipeCount));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerWrong = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setFailed(true);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start(() => {
      setFailed(false);
      setCurrentIndex(0);
    });
  }, [shakeAnim]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: (_, gestureState) => {
      const { dx, dy } = gestureState;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) return;

      let detected: SwipeDirection;
      if (absDx > absDy) {
        detected = dx > 0 ? 'right' : 'left';
      } else {
        detected = dy > 0 ? 'down' : 'up';
      }

      const expected = pattern[currentIndex];
      if (detected === expected) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const next = currentIndex + 1;
        if (next >= pattern.length) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onComplete();
        } else {
          setCurrentIndex(next);
        }
      } else {
        triggerWrong();
      }
    },
  });

  const current = pattern[currentIndex];
  const progress = currentIndex / pattern.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>👆 Ikuti Pola!</Text>
        <Text style={styles.subtitle}>{currentIndex}/{pattern.length} langkah</Text>
      </View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {pattern.map((dir, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < currentIndex && styles.dotDone,
              i === currentIndex && styles.dotCurrent,
            ]}
          >
            {i <= currentIndex && (
              <Text style={styles.dotArrow}>
                {i < currentIndex ? '✓' : ARROW_MAP[dir]}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Main swipe area */}
      <Animated.View
        style={[styles.swipeArea, { transform: [{ translateX: shakeAnim }] }]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.arrowContainer, { borderColor: COLOR_MAP[current] }]}>
          <Text style={[styles.arrow, { color: COLOR_MAP[current] }]}>
            {ARROW_MAP[current]}
          </Text>
          <Text style={[styles.dirLabel, { color: COLOR_MAP[current] }]}>
            Geser {
              current === 'left' ? 'Kiri' :
              current === 'right' ? 'Kanan' :
              current === 'up' ? 'Atas' : 'Bawah'
            }
          </Text>
        </View>
      </Animated.View>

      {/* Next preview */}
      {currentIndex + 1 < pattern.length && (
        <Text style={styles.nextHint}>
          Berikutnya: {ARROW_MAP[pattern[currentIndex + 1]]}
        </Text>
      )}

      <Text style={styles.hint}>Geser sesuai arah panah • Salah = Mulai Ulang</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    paddingTop: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: '#16a34a',
  },
  dotCurrent: {
    backgroundColor: '#7c3aed',
  },
  dotArrow: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  swipeArea: {
    flex: 1,
    width: W - 48,
    borderRadius: 24,
    backgroundColor: '#12121f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 80,
    fontWeight: '900',
  },
  dirLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  nextHint: {
    color: '#555',
    fontSize: 14,
    marginTop: 12,
  },
  hint: {
    color: '#444',
    fontSize: 12,
    paddingVertical: 12,
  },
});
