// src/types/task.ts
// Tipe data untuk Daily Task & Schedule Timeline

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'kuliah' | 'praktikum' | 'tugas' | 'pribadi';

export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  startTime: string; // Format "HH:mm", misal "07:00"
  endTime?: string;   // Format "HH:mm", misal "08:40"
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  reminderEnabled: boolean;
  createdAt: number;
}

export interface PriorityMeta {
  key: TaskPriority;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const PRIORITY_CONFIG: Record<TaskPriority, PriorityMeta> = {
  high: {
    key: 'high',
    label: 'Prioritas Tinggi',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
  },
  medium: {
    key: 'medium',
    label: 'Prioritas Sedang',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  low: {
    key: 'low',
    label: 'Prioritas Rendah',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
  },
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  kuliah: 'Kuliah Teori',
  praktikum: 'Praktikum Lab',
  tugas: 'Tugas Kuliah',
  pribadi: 'Agenda Pribadi',
};
