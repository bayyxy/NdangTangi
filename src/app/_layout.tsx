import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, router, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useAlarmStore } from '../store/alarmStore';

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const { activeAlarm, setActiveAlarm, loadAlarms } = useAlarmStore();
  const lastTriggered = useRef<string>('');
  const wasAlarmActive = useRef<boolean>(false);

  // Route Protection Guard berbasis useSegments() & status sesi global
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);

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
  }, [loadAlarms, setActiveAlarm]);

  useEffect(() => {
    if (isLoading || !session) return;

    if (activeAlarm) {
      wasAlarmActive.current = true;
      router.push('/alarm-ringing');
    } else if (wasAlarmActive.current) {
      wasAlarmActive.current = false;
      router.replace('/(tabs)');
    }
  }, [activeAlarm, isLoading, session]);

  // Perisai pemuatan saat memeriksa token dari SecureStore (mencegah flicker rute)
  if (isLoading) {
    return (
      <View style={styles.splashLoading}>
        <ActivityIndicator size="large" color="#FF5500" />
        <Text style={styles.splashText}>Memverifikasi sesi aman...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0B0C10' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: '#0B0C10' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-alarm"
        options={{ title: 'Atur Alarm', headerBackTitle: 'Kembali' }}
      />
      <Stack.Screen
        name="add-task"
        options={{ title: 'Tambah Agenda Tugas', headerBackTitle: 'Kembali' }}
      />
      <Stack.Screen
        name="task/[id]"
        options={{ title: 'Detail Agenda', headerBackTitle: 'Kembali' }}
      />
      <Stack.Screen
        name="alarm-ringing"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="briefing/index"
        options={{ title: 'Briefing & Cuaca Pagi', headerBackTitle: 'Kembali' }}
      />
      <Stack.Screen
        name="briefing/[id]"
        options={{ title: 'Detail Kesiapan Pagi', headerBackTitle: 'Kembali' }}
      />
      <Stack.Screen
        name="notes"
        options={{ title: 'Catatan Baru (Supabase)', headerBackTitle: 'Kembali' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <RootLayoutNav />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashLoading: {
    flex: 1,
    backgroundColor: '#0B0C10',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  splashText: {
    color: '#8E97A8',
    fontSize: 13,
    fontWeight: '600',
  },
});
