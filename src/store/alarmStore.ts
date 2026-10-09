import { create } from 'zustand';
import { Alarm, ActiveAlarm } from '../types/alarm';
import { AlarmStorage } from '../services/AlarmStorage';
import { scheduleAlarmNotification, cancelAlarmNotification } from '../services/NotificationService';

interface AlarmState {
  alarms: Alarm[];
  activeAlarm: ActiveAlarm | null;
  loading: boolean;

  loadAlarms: () => Promise<void>;
  addAlarm: (alarm: Alarm) => Promise<void>;
  updateAlarm: (alarm: Alarm) => Promise<void>;
  removeAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  setActiveAlarm: (active: ActiveAlarm | null) => Promise<void>;
}

export const useAlarmStore = create<AlarmState>((set, get) => ({
  alarms: [],
  activeAlarm: null,
  loading: true,

  loadAlarms: async () => {
    const alarms = await AlarmStorage.getAll();
    const activeAlarm = await AlarmStorage.getActiveAlarm();
    set({ alarms, activeAlarm, loading: false });
  },

  addAlarm: async (alarm) => {
    await AlarmStorage.upsert(alarm);
    if (alarm.enabled) {
      await scheduleAlarmNotification(alarm);
    }
    set((s) => ({ alarms: [...s.alarms, alarm] }));
  },

  updateAlarm: async (alarm) => {
    await AlarmStorage.upsert(alarm);
    if (alarm.enabled) {
      await scheduleAlarmNotification(alarm);
    } else {
      await cancelAlarmNotification(alarm.id);
    }
    set((s) => ({
      alarms: s.alarms.map((a) => (a.id === alarm.id ? alarm : a)),
    }));
  },

  removeAlarm: async (id) => {
    await AlarmStorage.remove(id);
    await cancelAlarmNotification(id);
    set((s) => ({ alarms: s.alarms.filter((a) => a.id !== id) }));
  },

  toggleAlarm: async (id) => {
    const alarm = get().alarms.find((a) => a.id === id);
    if (!alarm) return;
    const updated = { ...alarm, enabled: !alarm.enabled };
    await get().updateAlarm(updated);
  },

  setActiveAlarm: async (active) => {
    await AlarmStorage.setActiveAlarm(active);
    set({ activeAlarm: active });
  },
}));
