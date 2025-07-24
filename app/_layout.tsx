import '../global.css';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const hideSplash = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await SplashScreen.hideAsync();
    };
    
    hideSplash();
  }, []);

  useEffect(() => {
    const configureSystemUI = async () => {
      try {
        // Configure status bar
        await SystemUI.setBackgroundColorAsync(isDark ? '#000000' : '#ffffff');
        
        // Configure Android navigation bar
        if (Platform.OS === 'android') {
          await NavigationBar.setBackgroundColorAsync(isDark ? '#000000' : '#ffffff');
          await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
        }
      } catch (error) {
        console.warn('Failed to configure system UI:', error);
      }
    };

    configureSystemUI();
  }, [isDark]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="(modal)" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="my-connections" options={{ headerShown: false }} />
          <Stack.Screen name="change-account" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ title: 'Modal', presentation: 'modal' }} />
        </Stack>
      </SafeAreaView>
      <Toast />
    </GestureHandlerRootView>
  );
}
