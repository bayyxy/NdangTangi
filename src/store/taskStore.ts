// src/store/taskStore.ts
// Store Zustand untuk Daily Tasks & Timeline Jadwal Harian

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyTask } from '../types/task';
import { generateId } from '../utils/helpers';

const STORAGE_KEY = '@ndangtangi_daily_tasks_v1';

const INITIAL_SEED_TASKS: DailyTask[] = [
  {
    id: 'seed-task-1',
    title: 'Praktikum Pemrograman Mobile',
    description: 'Sesi praktikum di Lab Informatika Kampus III UMM, materi Async dan API Call.',
    startTime: '07:00',
    endTime: '08:40',
    priority: 'high',
    category: 'praktikum',
    completed: true,
    reminderEnabled: true,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'seed-task-2',
    title: 'Review Modul 3 & Uji Live Coding',
    description: 'Pelajari konsep Promise, async/await, dan .then() untuk persiapan demo di depan aslab.',
    startTime: '10:00',
    endTime: '11:30',
    priority: 'high',
    category: 'tugas',
    completed: false,
    reminderEnabled: true,
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'seed-task-3',
    title: 'Diskusi Proyek Tim & Git Push',
    description: 'Sinkronisasi fitur repositori bersama anggota kelompok Informatika 24.',
    startTime: '13:00',
    endTime: '14:30',
    priority: 'medium',
    category: 'kuliah',
    completed: false,
    reminderEnabled: true,
    createdAt: Date.now() - 900000,
  },
  {
    id: 'seed-task-4',
    title: 'Olahraga Sore di Stadion UMM',
    description: 'Jogging 30 menit untuk menjaga stamina dan kebugaran tubuh.',
    startTime: '16:00',
    endTime: '17:00',
    priority: 'low',
    category: 'pribadi',
    completed: false,
    reminderEnabled: false,
    createdAt: Date.now(),
  },
];

interface TaskState {
  tasks: DailyTask[];
  isLoading: boolean;
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<DailyTask, 'id' | 'createdAt'>) => Promise<DailyTask>;
  updateTask: (id: string, updates: Partial<DailyTask>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: true,

  loadTasks: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DailyTask[];
        set({ tasks: parsed, isLoading: false });
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_TASKS));
        set({ tasks: INITIAL_SEED_TASKS, isLoading: false });
      }
    } catch {
      set({ tasks: INITIAL_SEED_TASKS, isLoading: false });
    }
  },

  addTask: async (taskInput) => {
    const newTask: DailyTask = {
      ...taskInput,
      id: generateId(),
      createdAt: Date.now(),
    };
    const updated = [...get().tasks, newTask].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
    set({ tasks: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newTask;
  },

  updateTask: async (id, updates) => {
    const updated = get().tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
    set({ tasks: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  toggleTask: async (id) => {
    const updated = get().tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    set({ tasks: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  removeTask: async (id) => {
    const updated = get().tasks.filter((task) => task.id !== id);
    set({ tasks: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
}));
