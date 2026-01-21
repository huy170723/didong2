import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const notify = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const validateForm = () => {
    // 1. Kiểm tra tên (Chỉ chữ)
    if (!name.trim()) {
      notify('Lỗi', 'Vui lòng nhập họ tên');
      return false;
    }

    // 2. Kiểm tra Email
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      notify('Lỗi', 'Email không hợp lệ');
      return false;
    }

    // 3. Kiểm tra Mật khẩu (6-20 ký tự, chữ và số)
    if (password.length < 6) {
      notify('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    // Check lại lần cuối để đề phòng copy-paste ký tự đặc biệt
    const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphaNumericRegex.test(password)) {
      notify('Lỗi', 'Mật khẩu chỉ được chứa chữ cái và chữ số');
      return false;
    }

    if (password !== confirmPassword) {
      notify('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }

    if (!agreeToTerms) {
      notify('Lỗi', 'Vui lòng đồng ý với điều khoản sử dụng');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await register(email, password, name);
      notify('🎉 Thành công', 'Tài khoản đã được tạo thành công');
      router.replace('/login');
    } catch (error: any) {
      notify('❌ Lỗi', error.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Ionicons name="car-sport" size={32} color="#000000" style={styles.logoIcon} />
              <Text style={styles.logoText}>Car Market</Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Đăng ký</Text>
            <Text style={styles.subtitle}>Tạo tài khoản để trải nghiệm dịch vụ</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* HỌ TÊN: Chặn nhập số trực tiếp bằng regex */}
            <InputBox
              label="Họ tên"
              icon="person-outline"
              value={name}
              onChange={(text: string) => setName(text.replace(/[0-9]/g, ''))}
              placeholder="Nguyễn Văn A"
            />

            <InputBox
              label="Email"
              icon="mail-outline"
              value={email}
              onChange={setEmail}
              placeholder="email@gmail.com"
              keyboardType="email-address"
            />

            {/* MẬT KHẨU: Chặn ký tự đặc biệt và giới hạn 20 ký tự */}
            <InputBox
              label="Mật khẩu (Tối đa 20 ký tự chữ & số)"
              icon="lock-closed-outline"
              value={password}
              onChange={(text: string) => setPassword(text.replace(/[^a-zA-Z0-9]/g, ''))}
              placeholder="••••••"
              secure={!showPassword}
              onIconPress={() => setShowPassword(!showPassword)}
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              maxLength={20}
            />

            <InputBox
              label="Xác nhận mật khẩu"
              icon="lock-closed-outline"
              value={confirmPassword}
              onChange={(text: string) => setConfirmPassword(text.replace(/[^a-zA-Z0-9]/g, ''))}
              placeholder="••••••"
              secure={!showConfirmPassword}
              onIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              maxLength={20}
            />

            {/* Terms */}
            <View style={styles.termsContainer}>
              <TouchableOpacity onPress={() => setAgreeToTerms(!agreeToTerms)}>
                <Ionicons
                  name={agreeToTerms ? "checkbox" : "square-outline"}
                  size={22}
                  color="#000000"
                />
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Tôi đồng ý với <Text style={{ color: '#000000', fontWeight: 'bold' }}>Điều khoản & Chính sách</Text>
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                (isLoading || !agreeToTerms) && { backgroundColor: '#666' }
              ]}
              onPress={handleRegister}
              disabled={isLoading || !agreeToTerms}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}
              </Text>
              {!isLoading && <Ionicons name="arrow-forward" size={20} color="#fff" />}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={{ color: '#666' }}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Component InputBox hỗ trợ maxLength
const InputBox = ({ label, icon, value, onChange, placeholder, secure = false, rightIcon = null, onIconPress = null, keyboardType = 'default', maxLength }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color="#666" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
        maxLength={maxLength}
      />
      {rightIcon && (
        <TouchableOpacity onPress={onIconPress}>
          <Ionicons name={rightIcon} size={20} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  backButton: { padding: 8, marginLeft: -10 },
  logoContainer: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  logoIcon: { marginRight: 8 },
  logoText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  titleContainer: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 5 },
  form: { flex: 1 },
  inputContainer: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#000' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderColor: '#EEE',
    backgroundColor: '#F9F9F9'
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#000' },
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 10 },
  termsText: { fontSize: 13, color: '#666' },
  registerButton: {
    backgroundColor: '#000',
    borderRadius: 12, paddingVertical: 15, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 5
  },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  loginLink: { color: '#000', fontWeight: 'bold' }
});

export default Register;