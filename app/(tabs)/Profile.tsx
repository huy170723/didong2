// app/(tabs)/home.tsx
import { Link } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Trang chủ - App Car</Text>
      <Link href="/(auth)/login" asChild>
        <Button title="Đăng nhập" />
      </Link>
      <Link href="/(auth)/register" asChild>
        <Button title="Đăng ký" />
      </Link>
    </View>
  );
}