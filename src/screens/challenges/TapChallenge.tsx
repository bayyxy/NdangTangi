import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { generateTapTargets, getDifficultyConfig } from '../../utils/helpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// R-03: Minimum tap target size well above 44px for accessibility and responsiveness
const TARGET_SIZE = 72;
const PLAY_AREA_WIDTH = SCREEN_WIDTH - 32;
// Keep target area comfortably inside screen bounds to prevent clipping on mobile
const PLAY_AREA_HEIGHT = Math.min(SCREEN_HEIGHT * 0.52, 420);

interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: () => void;
}

// R-02: Witty Indonesian encouragement copy without em dashes
const CHEEKY_COMMENTS = [
  'Ayo melek rek!',
  'Mata wis buka separo?',
  'Awas mlecet, fokus!',
  'Nyawa wis 70% kumpul!',
  'Sedikit lagi kasurmu kalah!',
  'Masa kalah karo alarm?',
];

export default function TapChallenge({ difficulty, onComplete }: Props) {
  const config = getDifficultyConfig(difficulty);
  const [targets, setTargets] = useState(() => generateTapTargets(config.tapCount));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [commentary, setCommentary] = useState(CHEEKY_COMMENTS[0]);

  // Animation values
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [ringScaleAnim] = useState(() => new Animated.Value(1));
  const [wrongFlash] = useState(() => new Animated.Value(0));
  const [successScale] = useState(() => new Animated.Value(1));

  // Pulse effect on active target (ENERGY 3, MOTION 2)
  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 450,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScaleAnim, {
          toValue: 1.35,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringScaleAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, ringScaleAnim]);

  useEffect(() => {
    startPulse();
  }, [currentIndex, startPulse]);

  const handleTapTarget = () => {
    pulseAnim.stopAnimation();
    ringScaleAnim.stopAnimation();

    const nextStreak = streak + 1;
    setStreak(nextStreak);

    // Pick cheeky commentary based on progress
    const commentIndex = Math.min(
      Math.floor((nextStreak / config.tapCount) * CHEEKY_COMMENTS.length),
      CHEEKY_COMMENTS.length - 1
    );
    setCommentary(CHEEKY_COMMENTS[commentIndex]);

    const next = currentIndex + 1;
    if (next >= targets.length) {
      Animated.sequence([
        Animated.timing(successScale, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(successScale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        onComplete();
      });
    } else {
      setCurrentIndex(next);
    }
  };

  const handleWrongTap = () => {
    setStreak(0);
    setCommentary('Waduh mlecet! Baleni maneh rek!');

    Animated.sequence([
      Animated.timing(wrongFlash, { toValue: 1, duration: 120, useNativeDriver: false }),
      Animated.timing(wrongFlash, { toValue: 0, duration: 180, useNativeDriver: false }),
    ]).start();

    // Reset challenge targets
    setTargets(generateTapTargets(config.tapCount));
    setCurrentIndex(0);
  };

  const current = targets[currentIndex];
  const progressRatio = targets.length > 0 ? currentIndex / targets.length : 0;
  const remainingTaps = targets.length - currentIndex;

  const backgroundColorInterpolation = wrongFlash.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0A0A0E', '#3D0A0A'],
  });

  // Calculate target coordinate inside play area safely
  const targetX = (current.x / 100) * (PLAY_AREA_WIDTH - TARGET_SIZE);
  const targetY = (current.y / 100) * (PLAY_AREA_HEIGHT - TARGET_SIZE);

  return (
    <Animated.View style={[styles.container, { backgroundColor: backgroundColorInterpolation }]}>
      {/* Tactical Arcade Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.arcadeBadge}>
            <Text style={styles.arcadeBadgeText}>MISI 01 : KETUK CEPAT</Text>
          </View>
          {streak > 1 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>COMBO x{streak}!</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>Matikan Target!</Text>
        <Text style={styles.commentaryText}>{commentary}</Text>
      </View>

      {/* Progress Track */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>PROGRESS BANGUN</Text>
          <Text style={styles.progressCount}>
            Sisa {remainingTaps} dari {targets.length}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
        </View>
      </View>

      {/* Interactive Arena (R-26: Wrong taps flash penalty, accurate taps proceed) */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleWrongTap}
        style={styles.arena}
      >
        {/* Tactical Crosshair Background Grids */}
        <View style={styles.gridOverlay} pointerEvents="none">
          <View style={styles.gridLineH} />
          <View style={styles.gridLineV} />
        </View>

        {/* Current Active Target Node */}
        <Animated.View
          style={[
            styles.targetNode,
            {
              left: Math.max(0, Math.min(targetX, PLAY_AREA_WIDTH - TARGET_SIZE)),
              top: Math.max(0, Math.min(targetY, PLAY_AREA_HEIGHT - TARGET_SIZE)),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {/* Animated Outermost Tactical Pulse Ring */}
          <Animated.View
            style={[
              styles.targetHalo,
              {
                transform: [{ scale: ringScaleAnim }],
                opacity: ringScaleAnim.interpolate({
                  inputRange: [1, 1.35],
                  outputRange: [0.6, 0],
                }),
              },
            ]}
          />

          {/* Chunky Clickable Button Target (R-03: >= 72px) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={(e) => {
              e.stopPropagation();
              handleTapTarget();
            }}
            style={styles.targetInner}
          >
            <View style={styles.targetCenterDot} />
            <Text style={styles.targetNumber}>{currentIndex + 1}</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      {/* Tactical Hint (R-02: No em dashes) */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          Ketuk lingkaran berapi • Jangan sampai mlecet kena area kosong!
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Container: Deep pitch obsidian base (#0A0A0E)
  container: {
    flex: 1,
    paddingTop: 12,
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
  streakBadge: {
    backgroundColor: '#FF5500',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  streakText: {
    color: '#0A0A0E',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
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
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#14141E',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#262638',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF5500',
    borderRadius: 4,
  },
  arena: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#14141E',
    borderWidth: 1.5,
    borderColor: '#262638',
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLineH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  gridLineV: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  targetNode: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetHalo: {
    position: 'absolute',
    width: TARGET_SIZE + 24,
    height: TARGET_SIZE + 24,
    borderRadius: (TARGET_SIZE + 24) / 2,
    borderWidth: 2,
    borderColor: '#FF5500',
  },
  targetInner: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: '#FF5500',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFA066',
    elevation: 8,
    shadowColor: '#FF5500',
    shadowOpacity: 0.8,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  targetCenterDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    top: 10,
  },
  targetNumber: {
    color: '#0A0A0E',
    fontWeight: '900',
    fontSize: 24,
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
