import { Stack } from 'expo-router';
import React from "react";
import { View } from 'react-native';
import ChatBubble from '../components/ChatBubble';
import { AuthProvider } from '../contexts/AuthContext';

// BẮT BUỘC phải có từ khóa "export default"
export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <ChatBubble />
      </View>
    </AuthProvider>
  );
}