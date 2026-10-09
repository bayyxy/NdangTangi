import { SwipeDirection } from '../types/alarm';

/** Generate N random tap targets (x, y) in percentage of screen */
export function generateTapTargets(count: number): Array<{ x: number; y: number }> {
  const targets: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    targets.push({
      x: 10 + Math.random() * 80, // 10%–90% of width
      y: 15 + Math.random() * 70, // 15%–85% of height
    });
  }
  return targets;
}

/** Generate a random sequence of swipe directions */
export function generateSwipePattern(length: number): SwipeDirection[] {
  const dirs: SwipeDirection[] = ['left', 'right', 'up', 'down'];
  return Array.from({ length }, () => dirs[Math.floor(Math.random() * dirs.length)]);
}

/** Format time as HH:MM */
export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Generate a unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Get difficulty config values */
export function getDifficultyConfig(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      return { tapCount: 5, swipeCount: 3, shakeDuration: 10 };
    case 'medium':
      return { tapCount: 10, swipeCount: 6, shakeDuration: 20 };
    case 'hard':
      return { tapCount: 20, swipeCount: 10, shakeDuration: 30 };
  }
}
