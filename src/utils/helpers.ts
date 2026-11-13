import { SwipeDirection, RepeatDay } from '../types/alarm';

/** Generate N random tap targets (x, y) in percentage of screen */
export function generateTapTargets(count: number): { x: number; y: number }[] {
  const targets: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    targets.push({
      x: 10 + Math.random() * 80, // 10% sampai 90% lebar layar
      y: 15 + Math.random() * 70, // 15% sampai 85% tinggi layar
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

/** Menghitung sisa waktu hingga alarm berdering berikutnya */
export function getTimeUntil(hour: number, minute: number): string {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const diffMs = target.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours === 0) {
    return `${diffMinutes} menit lagi`;
  }
  if (diffMinutes === 0) {
    return `${diffHours} jam lagi`;
  }
  return `${diffHours} jam ${diffMinutes} mnt lagi`;
}

const DAY_LABELS: Record<RepeatDay, string> = {
  mon: 'Sen',
  tue: 'Sel',
  wed: 'Rab',
  thu: 'Kam',
  fri: 'Jum',
  sat: 'Sab',
  sun: 'Min',
};

/** Format ringkasan hari pengulangan alarm */
export function formatDaysSummary(days: RepeatDay[]): string {
  if (!days || days.length === 0) return 'Hanya Sekali';
  if (days.length === 7) return 'Setiap Hari';
  if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) return 'Hari Kerja';
  if (days.length === 2 && days.includes('sat') && days.includes('sun')) return 'Akhir Pekan';
  return days.map((d) => DAY_LABELS[d] || d).join(', ');
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
