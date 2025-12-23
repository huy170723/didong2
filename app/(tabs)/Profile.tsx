import { router } from "expo-router";
import { Button, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View>
      <Button title="Đăng xuất" onPress={handleLogout} />
    </View>
  );
}
