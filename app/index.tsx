// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // TẠM THỜI redirect thẳng đến home để test
  return <Redirect href="/(tabs)/Home" />;
  
  // Code thật (comment lại)
  // const { user, loading } = useAuth();
  // if (loading) {
  //   return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  // }
  // if (user) {
  //   return <Redirect href="/(tabs)/home" />;
  // }
  // return <Redirect href="/(auth)/login" />;
}