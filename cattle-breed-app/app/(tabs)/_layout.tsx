import { Tabs } from 'expo-router';
import React from 'react';
import { CustomTabBar } from '@/components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'AI Assistant',
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Identify',
          // This points to the upload screen, but we might need to handle it differently
          // if it's not a tab but a modal. For now, we treat it as a tab route.
          // If 'upload' is not in (tabs) directory, we might need a dummy component here
          // and handle navigation in CustomTabBar.
          // BUT, since we want it to be a tab for now to simplify, let's assume we move upload.tsx here
          // OR we just link to the existing route.
          // Wait, if 'upload' is outside (tabs), we can't put it here easily as a tab screen
          // unless we create a wrapper.
          // Let's check if upload.tsx is in app/ or app/(tabs)/.
          // It is in app/upload.tsx.
          // So we should probably create a wrapper in (tabs)/upload.tsx or just use a listener in CustomTabBar.
          // Actually, let's create a simple wrapper app/(tabs)/upload.tsx that redirects or renders the upload component.
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
