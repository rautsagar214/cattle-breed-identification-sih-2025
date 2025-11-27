import React from 'react';
import { View, Text } from 'react-native';

// Minimal fallback entry (no expo-router) to test Metro parsing
export default function AppFallback() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22 }}>Fallback App Loaded ✅</Text>
      <Text style={{ marginTop: 12, paddingHorizontal: 24, textAlign: 'center' }}>
        If you can see this on web, the parse error is isolated to expo-router SSR.
      </Text>
    </View>
  );
}
