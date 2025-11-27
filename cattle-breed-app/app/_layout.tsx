// Temporarily commented out due to worklets version mismatch
// import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../src/contexts/AuthContext';
import { NetworkProvider } from '../src/contexts/NetworkContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, title: 'Welcome' }} />
        <Stack.Screen name="login" options={{ headerShown: false, title: 'Login' }} />
        <Stack.Screen name="signup" options={{ headerShown: false, title: 'Sign Up' }} />
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
