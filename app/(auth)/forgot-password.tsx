import { Link, router } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      // Giả lập gửi reset password
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Thành công',
        'Link đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
        [{ text: 'Về trang đăng nhập', onPress: () => router.replace('/login') }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: '#FFFFFF' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Nút Back - Đổi sang màu Đen */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: '#000000' }]}>Quên mật khẩu</Text>
          <Text style={[styles.subtitle, { color: '#666' }]}>
            Nhập email của bạn để nhận link đặt lại mật khẩu qua email
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Email của bạn"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            // Màu icon và màu chữ input đổi sang tông đen/xám đậm
            leftIcon={<Mail size={20} color="#666666" />}
            style={{ backgroundColor: '#F9F9F9', borderColor: '#EEEEEE', color: '#000000' }}
          />

          <Button
            title="Gửi link đặt lại mật khẩu"
            onPress={handleResetPassword}
            loading={loading}
            // Nút bấm đổi sang nền Đen chữ Trắng
            style={StyleSheet.flatten([
              styles.resetButton,
              { backgroundColor: '#000000' }
            ])}
            textStyle={{ color: '#FFFFFF' }}
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: '#EEEEEE' }]} />
            <Text style={styles.dividerText}>Hoặc</Text>
            <View style={[styles.dividerLine, { backgroundColor: '#EEEEEE' }]} />
          </View>

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.backToLoginBtn}>
              <Text style={{ color: '#000000', fontWeight: 'bold', textAlign: 'center' }}>
                Quay lại đăng nhập
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 8,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 10,
  },
  resetButton: {
    marginTop: 10,
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    // Đổ bóng nhẹ cho nút đen thêm sang trọng
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  backToLoginBtn: {
    padding: 15,
  }
});