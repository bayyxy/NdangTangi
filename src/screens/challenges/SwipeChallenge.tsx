import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { SwipeDirection } from '../../types/alarm';
import { generateSwipePattern, getDifficultyConfig } from '../../utils/helpers';

const { width: W } = Dimensions.get('window');
const SWIPE_THRESHOLD = 45;

const ARROW_MAP: Record<SwipeDirection, string> = {
  left: '←',
  right: '→',
  up: '↑',
  down: '↓',
};

const LABEL_MAP: Record<SwipeDirection, string> = {
  left: 'GESER KIRI',
  right: 'GESER KANAN',
  up: 'GESER ATAS',
  down: 'GESER BAWAH',
};

interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: () => void;
}

export default function SwipeChallenge({ difficulty, onComplete }: Props) {
  const config = getDifficultyConfig(difficulty);
  const [pattern] = useState(() => generateSwipePattern(config.swipeCount));
  const [currentIndex, setCurrentIndex] = useState(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerWrong = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 16, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -16, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => {
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
        const next = currentIndex + 1;
        if (next >= pattern.length) {
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
      {/* Header Tantangan */}
      <View style={styles.header}>
        <Text style={styles.missionTag}>MISI: GESER POLA REFLEKS</Text>
        <Text style={styles.counterText}>
          {currentIndex} / {pattern.length} Langkah
        </Text>
        <Text style={styles.subtitle}>
          Geser layar sesuai urutan arah panah target
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Rangkaian Langkah / Pola */}
      <View style={styles.stepsRow}>
        {pattern.map((dir, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <View
              key={i}
              style={[
                styles.stepChip,
                isDone && styles.stepChipDone,
                isCurrent && styles.stepChipCurrent,
              ]}
            >
              <Text
                style={[
                  styles.stepArrow,
                  isDone && styles.stepArrowDone,
                  isCurrent && styles.stepArrowCurrent,
                ]}
              >
                {isDone ? '✓' : ARROW_MAP[dir]}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Area Geser Interaktif */}
      <Animated.View
        style={[styles.swipeArea, { transform: [{ translateX: shakeAnim }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.targetBezel}>
          <Text style={styles.targetArrow}>{ARROW_MAP[current]}</Text>
          <View style={styles.labelBadge}>
            <Text style={styles.labelText}>{LABEL_MAP[current]}</Text>
          </View>
        </View>

        {currentIndex + 1 < pattern.length ? (
          <View style={styles.nextHintContainer}>
            <Text style={styles.nextHintLabel}>BERIKUTNYA</Text>
            <Text style={styles.nextHintValue}>
              {ARROW_MAP[pattern[currentIndex + 1]]} {LABEL_MAP[pattern[currentIndex + 1]]}
            </Text>
          </View>
        ) : (
          <View style={styles.nextHintContainer}>
            <Text style={styles.nextHintLabel}>STATUS</Text>
            <Text style={styles.nextHintValue}>LANGKAH TERAKHIR</Text>
          </View>
        )}
      </Animated.View>

      {/* Footer Info */}
      <View style={styles.footerBar}>
        <Text style={styles.hint}>
          Geser jari pada kotak di atas. Jika arah salah, urutan langkah akan diulang.
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
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E97A8',
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1E2330',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF5500',
  },
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stepChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepChipDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  stepChipCurrent: {
    backgroundColor: 'rgba(255, 85, 0, 0.2)',
    borderColor: '#FF5500',
  },
  stepArrow: {
    color: '#4B5565',
    fontWeight: '800',
    fontSize: 14,
  },
  stepArrowDone: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 13,
  },
  stepArrowCurrent: {
    color: '#FF5500',
    fontWeight: '900',
    fontSize: 16,
  },
  swipeArea: {
    flex: 1,
    width: W - 32,
    alignSelf: 'center',
    borderRadius: 20,
    backgroundColor: '#15171E',
    borderWidth: 1,
    borderColor: '#232733',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  targetBezel: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#0F1118',
    borderWidth: 3,
    borderColor: '#FF5500',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  targetArrow: {
    fontSize: 76,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 82,
  },
  labelBadge: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 85, 0, 0.14)',
  },
  labelText: {
    color: '#FF5500',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  nextHintContainer: {
    marginTop: 28,
    alignItems: 'center',
  },
  nextHintLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6F788B',
    letterSpacing: 1.2,
  },
  nextHintValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E97A8',
    marginTop: 2,
    letterSpacing: 0.5,
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
