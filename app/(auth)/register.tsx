import { Link, router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
}

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return false;
    }

    if (!form.email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return false;
    }

    if (!form.password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return false;
    }

    if (form.password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const registerData = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || '',
        address: form.address || '',
      };

      const success = await register(registerData);
      
      if (success) {
        Alert.alert(
          'Thành công',
          'Đăng ký tài khoản thành công!',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        Alert.alert('Lỗi', 'Đăng ký thất bại. Email có thể đã được sử dụng.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>Đăng ký để bắt đầu mua sắm</Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="Họ và tên"
              value={form.name}
              onChangeText={(value) => handleChange('name', value)}
              leftIcon={<User size={20} color={colors.gray} />}
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={colors.gray} />}
            />

            <Input
              placeholder="Mật khẩu"
              value={form.password}
              onChangeText={(value) => handleChange('password', value)}
              secureTextEntry={!showPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={colors.gray} />
                  ) : (
                    <Eye size={20} color={colors.gray} />
                  )}
                </TouchableOpacity>
              }
              leftIcon={<Lock size={20} color={colors.gray} />}
            />

            <Input
              placeholder="Xác nhận mật khẩu"
              value={form.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.gray} />
                  ) : (
                    <Eye size={20} color={colors.gray} />
                  )}
                </TouchableOpacity>
              }
              leftIcon={<Lock size={20} color={colors.gray} />}
            />

            <Input
              placeholder="Số điện thoại (tùy chọn)"
              value={form.phone}
              onChangeText={(value) => handleChange('phone', value)}
              keyboardType="phone-pad"
              leftIcon={<Phone size={20} color={colors.gray} />}
            />

            <Input
              placeholder="Địa chỉ (tùy chọn)"
              value={form.address}
              onChangeText={(value) => handleChange('address', value)}
              leftIcon={<MapPin size={20} color={colors.gray} />}
            />

            <Button
              title="Đăng Ký"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <View style={styles.terms}>
              <Text style={styles.termsText}>
                Bằng việc đăng ký, bạn đồng ý với{' '}
                <Text style={styles.termsLink}>Điều khoản sử dụng</Text>{' '}
                và <Text style={styles.termsLink}>Chính sách bảo mật</Text>
              </Text>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Đã có tài khoản?</Text>
              <View style={styles.dividerLine} />
            </View>

            <Link href="/(auth)/login" asChild>
              <Button
                title="Đăng Nhập"
                variant="outline"
              />
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  form: {
    gap: 16,
  },
  registerButton: {
    marginTop: 8,
  },
  terms: {
    marginTop: 8,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textLight,
    fontSize: 14,
  },
});