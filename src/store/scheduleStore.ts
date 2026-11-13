// src/store/scheduleStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourseSchedule, COURSE_COLORS } from '../types/schedule';

const STORAGE_KEY = '@ndangtangi_schedule_v1';

const SEED: CourseSchedule[] = [
  { id: 'sc1', courseName: 'Pemrograman Mobile', room: 'Lab IT-3', lecturer: 'Dosen Mobile', startTime: '07:00', endTime: '08:40', day: 'sen', color: '#FF5500', credits: 3 },
  { id: 'sc2', courseName: 'Kecerdasan Buatan', room: 'GKB 1-204', lecturer: 'Dosen KA', startTime: '09:00', endTime: '10:40', day: 'sen', color: '#10B981', credits: 3 },
  { id: 'sc3', courseName: 'Basis Data Lanjut', room: 'Lab Komputer', lecturer: 'Dosen BD', startTime: '13:00', endTime: '14:40', day: 'sel', color: '#3B82F6', credits: 3 },
  { id: 'sc4', courseName: 'Jaringan Komputer', room: 'GKB 2-105', lecturer: 'Dosen JK', startTime: '10:00', endTime: '11:40', day: 'rab', color: '#F59E0B', credits: 3 },
  { id: 'sc5', courseName: 'Rekayasa Perangkat Lunak', room: 'GKB 1-308', lecturer: 'Dosen RPL', startTime: '13:00', endTime: '14:40', day: 'rab', color: '#8B5CF6', credits: 3 },
  { id: 'sc6', courseName: 'Statistik & Probabilitas', room: 'GKB 1-202', lecturer: 'Dosen Statistik', startTime: '07:00', endTime: '08:40', day: 'kam', color: '#EC4899', credits: 2 },
  { id: 'sc7', courseName: 'Praktikum AI', room: 'Lab IT-2', lecturer: 'Dosen AI', startTime: '10:00', endTime: '11:40', day: 'jum', color: '#10B981', credits: 1 },
];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface ScheduleState {
  courses: CourseSchedule[];
  isLoaded: boolean;
  loadSchedule: () => Promise<void>;
  addCourse: (input: Omit<CourseSchedule, 'id' | 'color'>) => Promise<void>;
  removeCourse: (id: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  courses: [],
  isLoaded: false,

  loadSchedule: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ courses: JSON.parse(stored) as CourseSchedule[], isLoaded: true });
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
        set({ courses: SEED, isLoaded: true });
      }
    } catch {
      set({ courses: SEED, isLoaded: true });
    }
  },

  addCourse: async (input) => {
    const existing = get().courses;
    const colorIndex = existing.length % COURSE_COLORS.length;
    const newCourse: CourseSchedule = { ...input, id: generateId(), color: COURSE_COLORS[colorIndex] };
    const updated = [...existing, newCourse].sort((a, b) => a.startTime.localeCompare(b.startTime));
    set({ courses: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  removeCourse: async (id) => {
    const updated = get().courses.filter((c) => c.id !== id);
    set({ courses: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
}));

