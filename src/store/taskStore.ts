// src/store/taskStore.ts
// Store Zustand terintegrasi Cloud Database Supabase (CRUD + RLS + Optimistic UI)

import { create } from 'zustand';
import { DailyTask, TaskCategory, TaskPriority } from '../types/task';
import { supabase } from '../lib/supabase';
import { generateId } from '../utils/helpers';

interface SupabaseTaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  reminder_enabled: boolean;
  created_at: string;
}

function mapRowToTask(row: SupabaseTaskRow): DailyTask {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    startTime: row.start_time,
    endTime: row.end_time ?? undefined,
    priority: row.priority,
    category: row.category,
    completed: row.completed,
    reminderEnabled: row.reminder_enabled,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function sortByStartTime(list: DailyTask[]): DailyTask[] {
  return [...list].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

interface TaskState {
  tasks: DailyTask[];
  isLoading: boolean;
  error: string | null;
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<DailyTask, 'id' | 'createdAt'>) => Promise<DailyTask | null>;
  updateTask: (id: string, updates: Partial<DailyTask>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  // READ (SELECT): otomatis terisolasi per akun melalui kebijakan RLS Supabase (auth.uid() = user_id)
  loadTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        set({ tasks: [], isLoading: false, error: null });
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      const mapped = ((data as SupabaseTaskRow[]) ?? []).map(mapRowToTask);
      set({ tasks: mapped, isLoading: false, error: null });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal memuat data tugas dari cloud.';
      set({ error: msg, isLoading: false });
    }
  },

  // CREATE (INSERT) dengan Optimistic UI & rollback jika gagal
  addTask: async (taskInput) => {
    const previousTasks = get().tasks;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      set({ error: 'Sesi tidak aktif. Silakan masuk kembali.' });
      return null;
    }

    const tempId = `temp-${generateId()}`;
    const optimisticTask: DailyTask = {
      ...taskInput,
      id: tempId,
      createdAt: Date.now(),
    };

    set({ tasks: sortByStartTime([...previousTasks, optimisticTask]), error: null });

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: user.id,
          title: taskInput.title,
          description: taskInput.description ?? null,
          start_time: taskInput.startTime,
          end_time: taskInput.endTime ?? null,
          priority: taskInput.priority,
          category: taskInput.category,
          completed: taskInput.completed,
          reminder_enabled: taskInput.reminderEnabled,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      set({
        tasks: previousTasks,
        error: error?.message ?? 'Gagal menyimpan tugas ke cloud.',
      });
      return null;
    }

    const savedTask = mapRowToTask(data as SupabaseTaskRow);
    set({
      tasks: sortByStartTime(
        get().tasks.map((t) => (t.id === tempId ? savedTask : t))
      ),
      error: null,
    });
    return savedTask;
  },

  // UPDATE dengan Optimistic UI & rollback jika gagal
  updateTask: async (id, updates) => {
    const previousTasks = get().tasks;
    const updated = sortByStartTime(
      previousTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
    set({ tasks: updated, error: null });

    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description ?? null;
    if (updates.startTime !== undefined) payload.start_time = updates.startTime;
    if (updates.endTime !== undefined) payload.end_time = updates.endTime ?? null;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.completed !== undefined) payload.completed = updates.completed;
    if (updates.reminderEnabled !== undefined) {
      payload.reminder_enabled = updates.reminderEnabled;
    }

    const { error } = await supabase.from('tasks').update(payload).eq('id', id);

    if (error) {
      set({ tasks: previousTasks, error: error.message });
    }
  },

  // UPDATE status selesai dengan Optimistic UI & rollback jika gagal
  toggleTask: async (id) => {
    const previousTasks = get().tasks;
    const target = previousTasks.find((t) => t.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;
    set({
      tasks: previousTasks.map((task) =>
        task.id === id ? { ...task, completed: nextCompleted } : task
      ),
      error: null,
    });

    const { error } = await supabase
      .from('tasks')
      .update({ completed: nextCompleted })
      .eq('id', id);

    if (error) {
      set({ tasks: previousTasks, error: error.message });
    }
  },

  // DELETE dengan Optimistic UI & rollback jika gagal
  removeTask: async (id) => {
    const previousTasks = get().tasks;
    set({
      tasks: previousTasks.filter((task) => task.id !== id),
      error: null,
    });

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      set({ tasks: previousTasks, error: error.message });
    }
  },

  clearTasks: () => {
    set({ tasks: [], isLoading: false, error: null });
  },
}));
