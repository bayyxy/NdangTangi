// src/types/schedule.ts
export type DayKey = 'sen' | 'sel' | 'rab' | 'kam' | 'jum' | 'sab';

export const DAY_LABELS: Record<DayKey, string> = {
  sen: 'Senin',
  sel: 'Selasa',
  rab: 'Rabu',
  kam: 'Kamis',
  jum: "Jum'at",
  sab: 'Sabtu',
};

export const DAY_KEYS: DayKey[] = ['sen', 'sel', 'rab', 'kam', 'jum', 'sab'];

export const COURSE_COLORS = [
  '#FF5500', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899',
];

export interface CourseSchedule {
  id: string;
  courseName: string;
  room: string;
  lecturer?: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  day: DayKey;
  color: string;
  credits?: number;
}

