import { Link, Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ Email của bạn.");
      return;
    }
    
    // 1. Kích hoạt trạng thái loading
    setLoading(true);

    // 2. GIẢ ĐỊNH: Gọi API gửi link đặt lại mật khẩu
    console.log(`Gửi yêu cầu đặt lại mật khẩu cho: ${email}`);
    
    // Giả lập độ trễ API
    setTimeout(() => {
      setLoading(false);

      // 3. Thông báo cho người dùng và chuyển hướng
      Alert.alert(
        "Kiểm tra Email",
        `Chúng tôi đã gửi link đặt lại mật khẩu tới ${email}. Vui lòng kiểm tra hộp thư đến của bạn.`
      );
      
      // Quay lại màn hình đăng nhập
      router.replace("/login"); 
    }, 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'Quên Mật khẩu' }} />
      
      <View style={styles.container}>
        {/* Logo (Sử dụng alias @/ để truy cập assets) */}
        <Image
          source={require("@/assets/images/pill.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Quên Mật khẩu?</Text>
        <Text style={styles.subtitle}>
          Nhập Email của bạn. Chúng tôi sẽ gửi cho bạn một link để đặt lại mật khẩu.
        </Text>

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity 
          style={[styles.resetButton, loading && styles.disabledButton]} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.resetText}>
            {loading ? "Đang gửi..." : "GỬI LINK ĐẶT LẠI"}
          </Text>
        </TouchableOpacity>
        
        {/* Quay lại đăng nhập */}
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.backLink}>
            <Text style={styles.backLinkText}>
                Quay lại <Text style={styles.backLinkAction}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </Link>
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  container: {
    padding: 24,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: "#0A84FF",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 15,
    color: "#666",
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: "#0A84FF",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  resetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
  backLink: {
    marginTop: 30,
    alignSelf: 'center',
  },
  backLinkText: {
    fontSize: 15,
    color: "#666",
  },
  backLinkAction: {
    color: "#0A84FF",
    fontWeight: "700",
  }
});