import { Stack } from 'expo-router';
import React from "react";
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* auth */}
        <Stack.Screen name="(auth)" />
        {/* tabs */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}
