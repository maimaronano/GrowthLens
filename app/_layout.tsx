import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
// 一時的にAdMobをコメントアウト（prebuildが必要）
// import mobileAds from 'react-native-google-mobile-ads';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // AdMobの初期化（実機ビルド時にコメントを外す）
  useEffect(() => {
    if (Platform.OS !== 'web' && !__DEV__) {
      /* 実機ビルド時にコメントを外す
      mobileAds()
        .initialize()
        .then(() => {
          console.log('AdMob initialized');
        })
        .catch((error) => {
          console.error('AdMob initialization failed:', error);
        });
      */
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="log-detail" options={{ headerShown: false }} />
        <Stack.Screen name="log-list" options={{ headerShown: false }} />
        <Stack.Screen name="quick-log-list" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
