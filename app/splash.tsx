import { ActivityIndicator, Text, View } from 'react-native';

export default function SplashScreen() {
  // Tạm thời không dùng AuthContext
  const loading = false;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Text>Welcome to Car App</Text>
      )}
    </View>
  );
}