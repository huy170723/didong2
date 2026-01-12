import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { carService } from '@/services/firebase/carService';
import { favoriteService } from '@/services/firebase/favoriteService';
import { Car } from '@/types/firebase';

export default function HomeScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const router = useRouter();
  const theme = colors.light;

  useEffect(() => {
    loadCars();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        loadUserFavorites();
      } else {
        setFavoriteIds([]);
      }
    }, [user])
  );

  const loadCars = async () => {
    try {
      const res = await carService.getAllCars(20);
      setCars(res.cars);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserFavorites = async () => {
    try {
      const favCars = await favoriteService.getUserFavorites(user!.uid);
      setFavoriteIds(favCars.map((car) => car.id));
    } catch (err) {
      console.error("Lỗi tải yêu thích:", err);
    }
  };

  const handleToggleFavorite = async (carId: string) => {
    if (!user?.uid) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để lưu xe yêu thích");
      return;
    }
    const isLiked = favoriteIds.includes(carId);
    if (isLiked) {
      setFavoriteIds((prev) => prev.filter((id) => id !== carId));
    } else {
      setFavoriteIds((prev) => [...prev, carId]);
    }
    try {
      if (isLiked) {
        await favoriteService.removeFavorite(user.uid, carId);
      } else {
        await favoriteService.addFavorite(user.uid, carId);
      }
    } catch (error) {
      loadUserFavorites();
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái yêu thích");
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: '#FFFFFF' }]}>
        <ActivityIndicator size="small" color="#000000" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER: Nền trắng chữ đen thuần túy */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>CHÀO MỪNG</Text>
          <Text style={styles.mainTitle}>Khám phá</Text>
        </View>
        <TouchableOpacity
          style={styles.searchIconBtn}
          onPress={() => router.push('/(tabs)/Search')}
        >
          <Ionicons name="search-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isLiked = favoriteIds.includes(item.id);

          return (
            <View style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push(`/car-detail/${item.id}` as any)}
              >
                <Image source={{ uri: item.image_url }} style={styles.image} />

                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={styles.carName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.carPrice}>
                      {item.price.toLocaleString()} ₫
                    </Text>
                  </View>
                  <Text style={styles.brandText}>{item.brand || 'Luxury Edition'}</Text>
                </View>
              </TouchableOpacity>

              {/* Nút yêu thích: Đen/Trắng */}
              <TouchableOpacity
                onPress={() => handleToggleFavorite(item.id)}
                style={styles.favoriteButton}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={20}
                  color={isLiked ? "#000000" : "#000000"}
                />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 60,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 2
  },
  searchIconBtn: {
    padding: 5,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 30,
    position: 'relative',
    // Không dùng border màu, dùng đổ bóng cực nhẹ để tạo khối
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: '#F5F5F5'
  },
  info: {
    paddingVertical: 15,
    paddingHorizontal: 5
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    marginRight: 10
  },
  carPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000'
  },
  brandText: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    // Đổ bóng cho nút tròn
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});