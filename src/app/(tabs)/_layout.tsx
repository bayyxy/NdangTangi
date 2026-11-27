// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(focused: boolean, nameOn: IconName, nameOff: IconName) {
  return ({ color }: { color: string }) => (
    <Ionicons name={focused ? nameOn : nameOff} size={22} color={color} />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F1118',
          borderTopColor: '#1E2330',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 65,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FF5500',
        tabBarInactiveTintColor: '#6F788B',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Jadwal',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Fokus',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'timer' : 'timer-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistik',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}

