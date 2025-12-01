// Temporarily commented out due to worklets version mismatch
// import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { NetworkProvider } from '../src/contexts/NetworkContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { useRouter, useSegments } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Request permissions on app start
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('Media library permission denied on start');
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'index';

    if (user && inAuthGroup) {
      // Redirect to the tabs group if the user is signed in and trying to access auth screens
      router.replace('/(tabs)');
    } else if (!user && inTabsGroup) {
      // Redirect to the login page if the user is not signed in and trying to access tabs
      router.replace('/login');
    }
  }, [user, loading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, title: 'Welcome' }} />
        <Stack.Screen name="login" options={{ headerShown: false, title: 'Login' }} />

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="upload" options={{ headerShown: false, title: 'Upload Image' }} />
        <Stack.Screen name="chatbot" options={{ headerShown: false, title: 'AI Assistant' }} />
        <Stack.Screen name="result" options={{ headerShown: false, title: 'Results' }} />
        <Stack.Screen name="settings" options={{ headerShown: false, title: 'Settings' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <NetworkProvider>
        <AuthProvider>
          <RootLayoutContent />
        </AuthProvider>
      </NetworkProvider>
    </LanguageProvider>
  );
}
