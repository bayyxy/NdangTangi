import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { generateTapTargets, getDifficultyConfig } from '../../utils/helpers';

const { width: W, height: H } = Dimensions.get('window');
const TARGET_SIZE = 68;

interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: () => void;
}

export default function TapChallenge({ difficulty, onComplete }: Props) {
  const config = getDifficultyConfig(difficulty);
  const [targets, setTargets] = useState(() => generateTapTargets(config.tapCount));
  const [currentIndex, setCurrentIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const wrongFlash = useRef(new Animated.Value(0)).current;

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 450, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    startPulse();
  }, [currentIndex, startPulse]);

  const handleTapTarget = () => {
    pulseAnim.stopAnimation();
    const next = currentIndex + 1;
    if (next >= targets.length) {
      onComplete();
    } else {
      setCurrentIndex(next);
    }
  };

  const handleWrongTap = () => {
    Animated.sequence([
      Animated.timing(wrongFlash, { toValue: 1, duration: 120, useNativeDriver: false }),
      Animated.timing(wrongFlash, { toValue: 0, duration: 120, useNativeDriver: false }),
    ]).start();
    setTargets(generateTapTargets(config.tapCount));
    setCurrentIndex(0);
  };

  const current = targets[currentIndex];
  const progress = currentIndex / targets.length;

  const bgColor = wrongFlash.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0B0C10', '#3D0D14'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header Tantangan */}
      <View style={styles.header}>
        <Text style={styles.missionTag}>MISI: KETUK TARGET ACAK</Text>
        <Text style={styles.counterText}>
          {currentIndex} / {targets.length} Target
        </Text>
        <Text style={styles.subtitle}>
          Ketuk lingkaran oranye yang berkedip di layar
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Area Tap Layar */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleWrongTap}
        style={styles.tapArea}
      >
        <Animated.View
          style={[
            styles.target,
            {
              left: (current.x / 100) * (W - TARGET_SIZE - 32),
              top: (current.y / 100) * (H * 0.45),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleTapTarget();
            }}
            style={styles.targetInner}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Target nomor ${currentIndex + 1}`}
          >
            <Text style={styles.targetNumber}>{currentIndex + 1}</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.footerBar}>
        <Text style={styles.hint}>
          Ketuk lingkaran bernomor tepat sasaran. Jika meleset, hitungan diulang dari awal.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF5500',
  },
  tapArea: {
    flex: 1,
    backgroundColor: '#12141B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222735',
    position: 'relative',
    overflow: 'hidden',
  },
  target: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetInner: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: '#FF5500',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5500',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  targetNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
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
