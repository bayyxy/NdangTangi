import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, router } from 'expo-router';
import { useAlarmStore } from '../store/alarmStore';

export default function RootLayout() {
  const { activeAlarm, setActiveAlarm, loadAlarms } = useAlarmStore();
  const lastTriggered = useRef<string>('');

  // ─── useEffect: muat alarm & cek alarm tiap detik ───────────────────────────
  useEffect(() => {
    loadAlarms();

    const interval = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const timeStr = `${h}:${m}`;

      const activeStore = useAlarmStore.getState().activeAlarm;
      if (!activeStore && lastTriggered.current !== timeStr) {
        const allAlarms = useAlarmStore.getState().alarms;
        const matching = allAlarms.find(
          (a) => a.enabled && a.hour === h && a.minute === m
        );

        if (matching) {
          lastTriggered.current = timeStr;
          setActiveAlarm({ alarmId: matching.id, triggeredAt: Date.now() });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ─── useEffect: navigasi otomatis saat alarm aktif / selesai ─────────────────
  useEffect(() => {
    if (activeAlarm) {
      // router.push() — mendorong halaman alarm ke atas stack
      router.push('/alarm-ringing');
    } else {
      // router.replace() — ganti stack kembali ke home tanpa menyisakan history
      router.replace('/');
    }
  }, [activeAlarm]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#0a0a12' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '800' },
            contentStyle: { backgroundColor: '#0a0a12' },
            animation: 'slide_from_right',
          }}
        >
          {/* Stack.Screen — mendefinisikan konfigurasi tiap rute */}
          <Stack.Screen
            name="index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="add-alarm"
            options={{ title: 'Atur Alarm', headerBackTitle: 'Kembali' }}
          />
          <Stack.Screen
            name="alarm-ringing"
            options={{ headerShown: false, gestureEnabled: false }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
