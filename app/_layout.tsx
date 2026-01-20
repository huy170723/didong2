import { Stack } from 'expo-router';
import React from "react";
import ChatBubble from '../components/ChatBubble'; // Đảm bảo đường dẫn này đúng với file bạn đã tạo
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Không cần View bọc flex:1 ở đây nếu Stack đã chiếm toàn màn hình */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      {/* Bong bóng chat tự bản thân nó đã có position absolute nên sẽ nổi lên trên */}
      <ChatBubble />
    </AuthProvider>
  );
}