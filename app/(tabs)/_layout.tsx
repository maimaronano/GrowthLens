import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].card,
          borderTopColor: Colors[colorScheme ?? "light"].border,
          borderTopWidth: 1,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "記録",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="bolt.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="growth-diary"
        options={{
          title: "成長日記",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="child-os"
        options={{
          title: "分析",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="bias"
        options={{
          title: "傾向",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="checkmark.seal.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
