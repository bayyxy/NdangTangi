import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';

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
  const { activeAlarm, setActiveAlarm, loadAlarms } = useAlarmStore();

  useEffect(() => {
    loadAlarms();

    // Listen for notification tap / received while app foreground
    const receivedSub = Notifications.addNotificationReceivedListener((notif) => {
      const alarmId = notif.request.content.data?.alarmId as string | undefined;
      if (alarmId) {
        setActiveAlarm({ alarmId, triggeredAt: Date.now() });
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const alarmId = response.notification.request.content.data?.alarmId as string | undefined;
      if (alarmId) {
        setActiveAlarm({ alarmId, triggeredAt: Date.now() });
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  return (
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
  );
}
