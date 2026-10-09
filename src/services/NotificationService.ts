// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Alarm } from '../types/alarm';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

export async function requestNotificationPermissions(): Promise<boolean> {
  // if (!Device.isDevice) return false;
  // const { status: existing } = await Notifications.getPermissionsAsync();
  // if (existing === 'granted') return true;
  // const { status } = await Notifications.requestPermissionsAsync();
  // return status === 'granted';
  return true;
}

export async function scheduleAlarmNotification(alarm: Alarm): Promise<string | null> {
  // const hasPermission = await requestNotificationPermissions();
  // if (!hasPermission) return null;

  // // Cancel existing if any
  // await cancelAlarmNotification(alarm.id);

  // const now = new Date();
  // const trigger = new Date();
  // trigger.setHours(alarm.hour, alarm.minute, 0, 0);
  // if (trigger <= now) trigger.setDate(trigger.getDate() + 1);

  // const secondsUntil = Math.floor((trigger.getTime() - now.getTime()) / 1000);

  // const id = await Notifications.scheduleNotificationAsync({
  //   content: {
  //     title: '⏰ WakeForce Alarm',
  //     body: alarm.label || 'Selesaikan tantanganmu untuk menonaktifkan alarm!',
  //     data: { alarmId: alarm.id },
  //     sound: true,
  //     priority: Notifications.AndroidNotificationPriority.MAX,
  //   },
  //   trigger: {
  //     type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
  //     seconds: Math.max(secondsUntil, 5),
  //     repeats: false,
  //   },
  // });

  // return id;
  return 'mock-id';
}

export async function cancelAlarmNotification(alarmId: string): Promise<void> {
  // const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  // for (const notif of scheduled) {
  //   if (notif.content.data?.alarmId === alarmId) {
  //     await Notifications.cancelScheduledNotificationAsync(notif.identifier);
  //   }
  // }
}

export async function cancelAllAlarmNotifications(): Promise<void> {
  // await Notifications.cancelAllScheduledNotificationsAsync();
}
