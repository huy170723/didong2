import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { carService } from '../../services/firebase/carService';
import { Car } from '../../types/firebase';

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadCarDetail();
  }, [id]);

  const loadCarDetail = async () => {
    try {
      const data = await carService.getCarById(id as string);
      setCar(data);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết xe:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!car) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy thông tin xe.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Ẩn header mặc định của Expo để dùng Header tự custom bên dưới */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* CUSTOM HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết xe</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: car.imageUrl || car.images?.[0] }}
          style={styles.mainImage}
        />

        <View style={styles.content}>
          <Text style={styles.brand}>{car.brand || 'Luxury Edition'}</Text>
          <Text style={styles.name}>{car.name}</Text>
          <Text style={styles.price}>
            {car.price?.toLocaleString('vi-VN')} VNĐ
          </Text>

          {/* THÔNG SỐ XE */}
          <View style={styles.specContainer}>
            <View style={styles.specItem}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.specText}>{car.year}</Text>
            </View>

            <View style={styles.specItem}>
              <Ionicons name="speedometer-outline" size={20} color="#007AFF" />
              <Text style={styles.specText}>
                {typeof car.mileage === 'number'
                  ? car.mileage.toLocaleString()
                  : car.mileage}{' '}
                km
              </Text>
            </View>

            <View style={styles.specItem}>
              <Ionicons name="settings-outline" size={20} color="#007AFF" />
              <Text style={styles.specText}>
                {car.transmission === 'automatic' ? 'Số tự động' : 'Số sàn'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
          <Text style={styles.description}>
            {car.description || 'Chưa có mô tả cho xe này.'}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nhiên liệu:</Text>
            <Text style={styles.infoValue}>
              {car.fuel_type === 'gasoline'
                ? 'Xăng'
                : car.fuel_type === 'diesel'
                  ? 'Dầu'
                  : 'Điện / Khác'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Màu sắc:</Text>
            <Text style={styles.infoValue}>{car.color || 'N/A'}</Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER - NƠI THỰC HIỆN ĐIỀU HƯỚNG */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.depositButton]}
          onPress={() =>
            router.push({
              // Sửa pathname để khớp với cấu trúc app/(tabs)/Deposit.tsx
              pathname: '/(tabs)/Deposit',
              params: {
                carId: car.id,
                name: car.name,
                price: car.price,
                image: car.imageUrl || car.images?.[0],
              },
            })
          }
        >
          <Text style={styles.buttonText}>Đặt cọc xe</Text>
        </TouchableOpacity>


      </View>
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // Đảm bảo header không bị dính vào tai thỏ trên điện thoại
    paddingTop: 50,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16 },

  mainImage: { width: '100%', height: 260, resizeMode: 'cover' },
  content: { padding: 20 },

  brand: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  name: { fontSize: 24, fontWeight: 'bold', marginVertical: 4 },
  price: {
    fontSize: 20,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 20,
  },

  specContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
  },
  specItem: { alignItems: 'center', gap: 5 },
  specText: { fontSize: 12, color: '#666' },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 20 },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: { color: '#888' },
  infoValue: { fontWeight: '500' },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row', // Để 2 nút nằm hàng ngang
    gap: 10,
  },

  button: {
    flex: 1, // Chia đều không gian cho 2 nút
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  depositButton: {
    backgroundColor: '#000',
  },
  contactButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});