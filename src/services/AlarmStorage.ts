import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, ActiveAlarm } from '../types/alarm';

const ALARMS_KEY = '@wakeforce:alarms';
const ACTIVE_ALARM_KEY = '@wakeforce:activeAlarm';

export const AlarmStorage = {
  async getAll(): Promise<Alarm[]> {
    try {
      const data = await AsyncStorage.getItem(ALARMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async save(alarms: Alarm[]): Promise<void> {
    await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
  },

  async upsert(alarm: Alarm): Promise<void> {
    const alarms = await this.getAll();
    const idx = alarms.findIndex((a) => a.id === alarm.id);
    if (idx >= 0) alarms[idx] = alarm;
    else alarms.push(alarm);
    await this.save(alarms);
  },

  async remove(id: string): Promise<void> {
    const alarms = await this.getAll();
    await this.save(alarms.filter((a) => a.id !== id));
  },

  async setActiveAlarm(active: ActiveAlarm | null): Promise<void> {
    if (active === null) {
      await AsyncStorage.removeItem(ACTIVE_ALARM_KEY);
    } else {
      await AsyncStorage.setItem(ACTIVE_ALARM_KEY, JSON.stringify(active));
    }
  },

  async getActiveAlarm(): Promise<ActiveAlarm | null> {
    try {
      const data = await AsyncStorage.getItem(ACTIVE_ALARM_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};
