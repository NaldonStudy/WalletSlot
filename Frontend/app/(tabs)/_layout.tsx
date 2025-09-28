import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, useColorScheme } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { themes } from '@/src/constants/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#2383BD',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      })}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: '대시보드',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: '리포트',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: '위시리스트',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: '알림',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard/slot/[slotId]/transaction/[transactionId]"
        options={{
          href: null, // 탭에 표시 안 함
        }}
      />
      <Tabs.Screen
        name="dashboard/slot/[slotId]/transaction/[transactionId]/splits"
        options={{
          href: null, // 탭에 표시 안 함
        }}
      />
      <Tabs.Screen
        name="dashboard/slot/[slotId]/transaction/[transactionId]/receipt-scan"
        options={{
          href: null, // 탭에 표시 안 함
        }}
      />
    </Tabs>
  );
}
