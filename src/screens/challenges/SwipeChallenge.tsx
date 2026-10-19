import React, { useCallback, useState } from 'react';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 45;

// R-29: Palette alignment (amber for current, green for done, red for wrong)
const ARROW_SYMBOL: Record<SwipeDirection, string> = {
  left: '←',
  right: '→',
  up: '↑',
  down: '↓',
};

const DIRECTION_NAME: Record<SwipeDirection, string> = {
  left: 'GESER KIRI',
  right: 'GESER KANAN',
  up: 'GESER ATAS',
  down: 'GESER BAWAH',
};

interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: () => void;
}

// R-02: Playful Indonesian wake-up feedback without em dashes
const SWIPE_COMMENTS = [
  'Ayo tangani pola panah iki!',
  'Bagus! Aja nganti kliru!',
  'Nyawamu wis mulai kumpul!',
  'Siji maneh rek, ojo loyo!',
];

export default function SwipeChallenge({ difficulty, onComplete }: Props) {
  const config = getDifficultyConfig(difficulty);
  const [pattern] = useState(() => generateSwipePattern(config.swipeCount));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentary, setCommentary] = useState(SWIPE_COMMENTS[0]);

  // Gestural and feedback animations
  const [shakeAnim] = useState(() => new Animated.Value(0));
  const [compassScale] = useState(() => new Animated.Value(1));
  const [gestureTranslateX] = useState(() => new Animated.Value(0));
  const [gestureTranslateY] = useState(() => new Animated.Value(0));

  const triggerWrong = useCallback(() => {
    setCommentary('Salah arah rek! Baleni saka awal!');

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 20, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -20, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => {
      setCurrentIndex(0);
    });
  }, [shakeAnim]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      // Dynamic tactile drag tracking
      gestureTranslateX.setValue(Math.max(-40, Math.min(40, gestureState.dx * 0.4)));
      gestureTranslateY.setValue(Math.max(-40, Math.min(40, gestureState.dy * 0.4)));
    },
    onPanResponderRelease: (_, gestureState) => {
      const { dx, dy } = gestureState;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Spring back drag indicator
      Animated.parallel([
        Animated.spring(gestureTranslateX, { toValue: 0, useNativeDriver: true }),
        Animated.spring(gestureTranslateY, { toValue: 0, useNativeDriver: true }),
      ]).start();

      if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) return;

      let detected: SwipeDirection;
      if (absDx > absDy) {
        detected = dx > 0 ? 'right' : 'left';
      } else {
        detected = dy > 0 ? 'down' : 'up';
      }

      const expected = pattern[currentIndex];
      if (detected === expected) {
        // Subtle success bounce on compass
        Animated.sequence([
          Animated.timing(compassScale, { toValue: 1.08, duration: 100, useNativeDriver: true }),
          Animated.timing(compassScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        const next = currentIndex + 1;
        const commentIdx = Math.min(
          Math.floor((next / pattern.length) * SWIPE_COMMENTS.length),
          SWIPE_COMMENTS.length - 1
        );
        setCommentary(SWIPE_COMMENTS[commentIdx]);

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

  const current = pattern[currentIndex] || 'up';
  const remainingSteps = pattern.length - currentIndex;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.arcadeBadge}>
            <Text style={styles.arcadeBadgeText}>MISI 02 : GESER POLA</Text>
          </View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              LANGKAH {currentIndex + 1}/{pattern.length}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Ikuti Arah Panah!</Text>
        <Text style={styles.commentaryText}>{commentary}</Text>
      </View>

      {/* Pattern Breadcrumbs Track */}
      <View style={styles.breadcrumbsContainer}>
        <View style={styles.breadcrumbsHeader}>
          <Text style={styles.breadcrumbsLabel}>URUTAN GERAKAN</Text>
          <Text style={styles.breadcrumbsStatus}>
            {remainingSteps === 1 ? 'Langkah terakhir!' : `Sisa ${remainingSteps} gerakan`}
          </Text>
        </View>

        <View style={styles.dotsRow}>
          {pattern.map((dir, i) => {
            const isDone = i < currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isDone && styles.dotDone,
                  isCurrent && styles.dotCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.dotText,
                    isDone && styles.dotTextDone,
                    isCurrent && styles.dotTextCurrent,
                  ]}
                >
                  {isDone ? '✓' : ARROW_SYMBOL[dir]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Main Interactive Swipe Arena */}
      <Animated.View
        style={[
          styles.swipeArea,
          {
            transform: [
              { translateX: shakeAnim },
              { translateX: gestureTranslateX },
              { translateY: gestureTranslateY },
              { scale: compassScale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Tactical Directional Compass Outer Disc */}
        <View style={styles.compassRing}>
          {/* North, South, East, West Direction Markers */}
          <Text style={[styles.cardinalLabel, styles.cardinalN, current === 'up' && styles.cardinalActive]}>
            ▲ ATAS
          </Text>
          <Text style={[styles.cardinalLabel, styles.cardinalS, current === 'down' && styles.cardinalActive]}>
            ▼ BAWAH
          </Text>
          <Text style={[styles.cardinalLabel, styles.cardinalW, current === 'left' && styles.cardinalActive]}>
            ◀ KIRI
          </Text>
          <Text style={[styles.cardinalLabel, styles.cardinalE, current === 'right' && styles.cardinalActive]}>
            KANAN ▶
          </Text>

          {/* Core Indicator */}
          <View style={styles.coreIndicator}>
            <Text style={styles.mainArrow}>{ARROW_SYMBOL[current]}</Text>
            <Text style={styles.dirInstruction}>{DIRECTION_NAME[current]}</Text>
          </View>
        </View>

        {/* Swipe Gesture Prompt */}
        <View style={styles.swipePromptBox}>
          <Text style={styles.swipePromptText}>Tahan & Usap Layar ke Arah Ini</Text>
        </View>
      </Animated.View>

      {/* Bottom Tactical Hint (R-02: No em dashes) */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          Geser jari mengikuti panah aktif • Jika salah arah, urutan diulang dari awal
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
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
  stepBadge: {
    backgroundColor: '#14141E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#262638',
  },
  stepBadgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
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
  breadcrumbsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  breadcrumbsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breadcrumbsLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  breadcrumbsStatus: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dot: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#14141E',
    borderWidth: 1.5,
    borderColor: '#262638',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: '#0F291E',
    borderColor: '#10B981',
  },
  dotCurrent: {
    backgroundColor: '#2E1508',
    borderColor: '#FF5500',
    elevation: 4,
  },
  dotText: {
    color: '#475569',
    fontWeight: '800',
    fontSize: 16,
  },
  dotTextDone: {
    color: '#10B981',
  },
  dotTextCurrent: {
    color: '#FF5500',
  },
  swipeArea: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#14141E',
    borderWidth: 1.5,
    borderColor: '#262638',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  compassRing: {
    width: Math.min(SCREEN_WIDTH * 0.65, 230),
    height: Math.min(SCREEN_WIDTH * 0.65, 230),
    borderRadius: Math.min(SCREEN_WIDTH * 0.65, 230) / 2,
    backgroundColor: '#1C1C2B',
    borderWidth: 2,
    borderColor: '#2D2D42',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardinalLabel: {
    position: 'absolute',
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardinalActive: {
    color: '#FF5500',
    fontWeight: '900',
  },
  cardinalN: { top: 12 },
  cardinalS: { bottom: 12 },
  cardinalW: { left: 10 },
  cardinalE: { right: 10 },
  coreIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0E',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2.5,
    borderColor: '#FF5500',
    elevation: 10,
    shadowColor: '#FF5500',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  mainArrow: {
    color: '#FF5500',
    fontSize: 54,
    fontWeight: '900',
    lineHeight: 60,
  },
  dirInstruction: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  swipePromptBox: {
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#1E1E2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D42',
  },
  swipePromptText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  hintContainer: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  hintText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
