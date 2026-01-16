import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'; // Import Firebase Auth
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreatePost() {
    const router = useRouter();
    const auth = getAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Form states
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);

    // 1. Theo dõi trạng thái đăng nhập
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Thông báo', 'Bạn cần cho phép quyền truy cập ảnh!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handlePost = () => {
        if (!title || !price || !image) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin và chọn ảnh!");
            return;
        }
        console.log({ title, price, description, image, userId: user?.uid });
        Alert.alert("Thành công", "Tin của bạn đã được đăng!");
    };

    // 2. Nếu chưa đăng nhập: Hiển thị giao diện yêu cầu đăng nhập
    if (!user && !loading) {
        return (
            <View style={styles.centered}>
                <Stack.Screen options={{ title: 'Tài khoản' }} />
                <View style={styles.iconCircle}>
                    <Text style={{ fontSize: 40 }}>👤</Text>
                </View>
                <Text style={styles.loginTitle}>Tài khoản</Text>
                <Text style={styles.loginSub}>Đăng nhập để quản lý bộ sưu tập xe và các đơn đặt hàng của bạn</Text>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 3. Nếu đã đăng nhập: Hiển thị Form đăng tin
    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Đăng tin mới' }} />

            <Text style={styles.label}>Hình ảnh sản phẩm</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>+ Thêm ảnh</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Text style={styles.label}>Tên sản phẩm/xe</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập tên xe..."
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Giá (VNĐ)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ví dụ: 500.000.000"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
            />

            <Text style={styles.label}>Mô tả chi tiết</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tình trạng xe, thông số..."
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.button} onPress={handlePost}>
                <Text style={styles.buttonText}>Đăng tin ngay</Text>
            </TouchableOpacity>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    // Styles cho Form
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
    imagePicker: {
        width: '100%', height: 200, borderRadius: 8, borderWidth: 1,
        borderColor: '#ccc', borderStyle: 'dashed', justifyContent: 'center',
        alignItems: 'center', backgroundColor: '#f9f9f9', overflow: 'hidden'
    },
    previewImage: { width: '100%', height: '100%' },
    placeholder: { alignItems: 'center' },
    placeholderText: { color: '#888', fontSize: 16 },
    button: { backgroundColor: '#000', padding: 15, borderRadius: 8, marginTop: 30, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

    // Styles cho màn hình yêu cầu Đăng nhập (giống ảnh mẫu)
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#fff' },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    loginTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    loginSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
    loginButton: { backgroundColor: '#000', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, width: '100%', alignItems: 'center' },
    loginButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});