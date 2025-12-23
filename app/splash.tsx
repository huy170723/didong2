// app/splash.tsx
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useAuth } from './context/AuthContext'; // 🟢 Import AuthContext để kiểm tra trạng thái đăng nhập

export default function SplashScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth(); // Lấy trạng thái đăng nhập từ AuthContext

  useEffect(() => {
    // Đợi 2 giây sau đó điều hướng
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        // Nếu đã đăng nhập, chuyển đến trang chính (tabs)
        router.replace('/(tabs)');
      } else {
        // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
        router.replace('/(auth)/login'); 
      }
    }, 2000); // 2000ms = 2 giây

    // Dọn dẹp timer khi component unmount
    return () => clearTimeout(timer);
  }, [isLoggedIn, router]); // Dependency array đảm bảo useEffect chạy lại nếu isLoggedIn thay đổi

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/pill.png")} // Đường dẫn đến logo của bạn
        style={styles.logo}
        resizeMode="contain"
      />
      {/* Bạn có thể thêm Text ở đây nếu muốn, ví dụ: <Text style={styles.welcomeText}>Chào mừng!</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Màu nền của màn hình chào mừng
  },
  logo: {
    width: 200, // Kích thước logo
    height: 200,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#0A84FF',
  }
});