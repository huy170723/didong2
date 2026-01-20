import { auth } from '@/config/firebase';
import { router, useLocalSearchParams } from 'expo-router';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';

export default function ResetPassword() {
    const { oobCode, mode } = useLocalSearchParams<{ oobCode?: string; mode?: string }>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!oobCode || mode !== 'resetPassword') {
            Alert.alert('Link không hợp lệ');
            router.replace('/login');
            return;
        }

        verifyPasswordResetCode(auth, oobCode)
            .then((emailFromCode) => setEmail(emailFromCode))
            .catch((err) => {
                Alert.alert('Link hết hạn hoặc không hợp lệ', err.message);
                router.replace('/forgot-password');
            });
    }, [oobCode, mode]);

    const handleConfirm = async () => {
        if (password !== confirmPassword || password.length < 6) {
            Alert.alert('Mật khẩu không khớp hoặc quá ngắn');
            return;
        }

        setLoading(true);
        try {
            await confirmPasswordReset(auth, oobCode!, password);
            Alert.alert('Thành công', 'Đổi mật khẩu OK. Đăng nhập lại nhé!', [
                { text: 'OK', onPress: () => router.replace('/login') },
            ]);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Xác nhận thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Đặt lại mật khẩu</Text>
            <Text>Cho tài khoản: {email || '...'}</Text>

            <TextInput
                placeholder="Mật khẩu mới"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{ borderWidth: 1, padding: 12, marginVertical: 8 }}
            />
            <TextInput
                placeholder="Xác nhận mật khẩu"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={{ borderWidth: 1, padding: 12, marginVertical: 8 }}
            />

            <Button title="Xác nhận" onPress={handleConfirm} disabled={loading} />
        </View>
    );
}