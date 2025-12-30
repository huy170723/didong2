// app/search.tsx
import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Trang tìm kiếm</Text>
      <Button title="Quay lại" onPress={() => router.back()} />
    </View>
  );
}