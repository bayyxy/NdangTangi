import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import AddAlarmScreen from './src/screens/AddAlarmScreen';
import AlarmRingingScreen from './src/screens/AlarmRingingScreen';
import { useAlarmStore } from './src/store/alarmStore';
import { Alarm } from './src/types/alarm';

export type RootStackParamList = {
  Home: undefined;
  AddAlarm: { alarm?: Alarm };
  AlarmRinging: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { activeAlarm, setActiveAlarm, loadAlarms, alarms } = useAlarmStore();
  const lastTriggered = useRef<string>('');

  useEffect(() => {
    loadAlarms();

    // Mengganti notifikasi dengan interval manual untuk mode Expo Go
    const interval = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const timeStr = `${h}:${m}`;

      const activeStore = useAlarmStore.getState().activeAlarm;
      if (!activeStore && lastTriggered.current !== timeStr) {
        const allAlarms = useAlarmStore.getState().alarms;
        const matching = allAlarms.find(a => a.enabled && a.hour === h && a.minute === m);
        
        if (matching) {
          lastTriggered.current = timeStr;
          setActiveAlarm({ alarmId: matching.id, triggeredAt: Date.now() });
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#0a0a12' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '800' },
              contentStyle: { backgroundColor: '#0a0a12' },
              animation: 'slide_from_right',
            }}
          >
            {activeAlarm ? (
              <Stack.Screen
                name="AlarmRinging"
                component={AlarmRingingScreen}
                options={{ headerShown: false, gestureEnabled: false }}
              />
            ) : (
              <>
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="AddAlarm"
                  component={AddAlarmScreen}
                  options={{ title: 'Atur Alarm', headerBackTitle: 'Kembali' }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
