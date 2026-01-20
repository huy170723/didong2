import { Link, router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ArrowLeft, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { auth } from '@/config/firebase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    console.log('[DEBUG] Bắt đầu gửi reset password cho:', trimmedEmail);

    try {
      setLoading(true);

      console.log('[DEBUG] Đang gửi email reset...');

      await sendPasswordResetEmail(auth, trimmedEmail, {
        // CHỈ dùng domain gốc đã được Authorized
        url: 'https://app-car-56a56.firebaseapp.com',

        // true: cho phép mở lại ứng dụng sau khi hoàn tất trên trình duyệt
        handleCodeInApp: true,
      });

      console.log('[DEBUG] GỬI THÀNH CÔNG (Firebase resolved)');

      Alert.alert(
        'Thành công',
        'Link đặt lại mật khẩu đã được gửi đến email của bạn.\n\n' +
        'Vui lòng kiểm tra:\n' +
        '- Hộp thư đến (Inbox)\n' +
        '- Thư rác / Spam\n' +
        '- Tab Promotions / Social (nếu dùng Gmail)\n\n' +
        'Nếu không thấy sau 5-10 phút, thử gửi test từ Firebase Console hoặc kiểm tra lại spam.',
        [
          {
            text: 'Về đăng nhập',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('[ERROR] RESET PASSWORD FAILED:', {
        code: error.code,
        message: error.message,
      });

      let msg = 'Không thể gửi email. Vui lòng thử lại sau.';
      if (error.code === 'auth/invalid-email') msg = 'Email không hợp lệ';
      if (error.code === 'auth/too-many-requests') {
        msg = 'Quá nhiều yêu cầu. Chờ 5-10 phút rồi thử lại';
      }
      // Không hiển thị user-not-found để tránh leak
      Alert.alert('Lỗi', `${msg}\n(Mã lỗi: ${error.code || 'unknown'})`);
    } finally {
      setLoading(false);
      console.log('[DEBUG] Hoàn tất xử lý reset password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập email để nhận link đặt lại mật khẩu
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Email của bạn"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color="#666" />}
          />

          <Button
            title="Gửi link đặt lại mật khẩu"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.resetButton}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Hoặc</Text>
            <View style={styles.line} />
          </View>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.backLoginText}>
                Quay lại đăng nhập
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Styles giữ nguyên
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#666',
  },
  form: {
    gap: 12,
  },
  resetButton: {
    marginTop: 10,
    height: 55,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
  },
  backLoginText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
  },
});