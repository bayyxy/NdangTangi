import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { generateTapTargets, getDifficultyConfig } from '../../utils/helpers';

const { width: W, height: H } = Dimensions.get('window');
const TARGET_SIZE = 64;

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
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    startPulse();
  }, [currentIndex, startPulse]);

  const handleTapTarget = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pulseAnim.stopAnimation();
    const next = currentIndex + 1;
    if (next >= targets.length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    } else {
      setCurrentIndex(next);
    }
  };

  const handleWrongTap = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(wrongFlash, { toValue: 1, duration: 150, useNativeDriver: false }),
      Animated.timing(wrongFlash, { toValue: 0, duration: 150, useNativeDriver: false }),
    ]).start();
    // Reset
    setTargets(generateTapTargets(config.tapCount));
    setCurrentIndex(0);
  };

  const current = targets[currentIndex];
  const progress = currentIndex / targets.length;

  const bgColor = wrongFlash.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0f0f1a', '#3d0000'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Ketuk Target!</Text>
        <Text style={styles.subtitle}>
          {currentIndex}/{targets.length} tapped
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Tap Area */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleWrongTap}
        style={styles.tapArea}
      >
        {/* Current Target */}
        <Animated.View
          style={[
            styles.target,
            {
              left: (current.x / 100) * (W - TARGET_SIZE),
              top: (current.y / 100) * (H * 0.55 - TARGET_SIZE),
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
          >
            <Text style={styles.targetNumber}>{currentIndex + 1}</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      <Text style={styles.hint}>Ketuk lingkaran berwarna • Salah = Mulai Ulang</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#ff6b35',
    marginTop: 4,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1e1e2e',
    marginHorizontal: 24,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b35',
    borderRadius: 3,
  },
  tapArea: {
    flex: 1,
    position: 'relative',
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e1e2e',
  },
  target: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
  },
  targetInner: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: '#ff6b35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff6b35',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  targetNumber: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  hint: {
    color: '#555',
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 12,
  },
});
