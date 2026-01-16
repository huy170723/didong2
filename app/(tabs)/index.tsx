import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import các hàm Firestore cần thiết
import { db } from '@/config/firebase';
import { collection, limit as firestoreLimit, getDocs, orderBy, query, startAfter } from 'firebase/firestore';

import { useAuth } from '@/contexts/AuthContext';
import { favoriteService } from '@/services/firebase/favoriteService';
import { Car } from '@/types/firebase';

export default function HomeScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null); // Lưu xe cuối cùng để lấy xe tiếp theo
  const [isOutOfData, setIsOutOfData] = useState(false); // Kiểm tra xem còn dữ liệu không

  const PAGE_SIZE = 4; // Mỗi lần lấy 4 xe mới
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadFirstBatch();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) loadUserFavorites();
      else setFavoriteIds([]);
    }, [user])
  );

  // Lấy dữ liệu lần đầu tiên (hoặc khi reload)
  const loadFirstBatch = async () => {
    setLoading(true);
    setIsOutOfData(false);
    try {
      const q = query(
        collection(db, 'cars'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(PAGE_SIZE)
      );

      const documentSnapshots = await getDocs(q);
      const lastVisibleDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

      const carList = documentSnapshots.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Car[];

      setCars(carList);
      setLastVisible(lastVisibleDoc);

      if (documentSnapshots.docs.length < PAGE_SIZE) {
        setIsOutOfData(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Lấy dữ liệu TIẾP THEO (Dữ liệu mới hoàn toàn)
  const loadMoreCars = async () => {
    if (loadingMore || isOutOfData || !lastVisible) return;

    setLoadingMore(true);
    try {
      const nextQuery = query(
        collection(db, 'cars'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible), // Bắt đầu SAU xe cuối cùng hiện tại
        firestoreLimit(PAGE_SIZE)
      );

      const documentSnapshots = await getDocs(nextQuery);

      if (documentSnapshots.empty) {
        setIsOutOfData(true);
      } else {
        const lastVisibleDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        const newCars = documentSnapshots.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Car[];

        setCars(prev => [...prev, ...newCars]); // Nối dữ liệu mới vào dữ liệu cũ
        setLastVisible(lastVisibleDoc);
      }
    } catch (err) {
      console.error("Lỗi lấy thêm dữ liệu:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFirstBatch();
  }, []);

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
    setFavoriteIds(prev => isLiked ? prev.filter(id => id !== carId) : [...prev, carId]);
    try {
      if (isLiked) await favoriteService.removeFavorite(user.uid, carId);
      else await favoriteService.addFavorite(user.uid, carId);
    } catch (error) {
      loadUserFavorites();
    }
  };

  const renderFooter = () => {
    if (isOutOfData) {
      return (
        <View style={styles.footer}>
          <Text style={styles.outOfDataText}>Đã hiển thị toàn bộ siêu xe</Text>
        </View>
      );
    }
    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.loadMoreBtn}
          onPress={loadMoreCars}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.loadMoreText}>Xem thêm sản phẩm mới</Text>
              <Ionicons name="chevron-down" size={16} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: '#FFFFFF' }]}>
        <ActivityIndicator size="small" color="#000000" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>CHÀO MỪNG</Text>
          <Text style={styles.mainTitle}>Khám phá</Text>
        </View>
        <TouchableOpacity style={styles.searchIconBtn} onPress={() => router.push('/(tabs)/Search')}>
          <Ionicons name="search-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => {
          const isLiked = favoriteIds.includes(item.id);
          return (
            <View style={styles.card}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(`/car-detail/${item.id}` as any)}>
                <Image source={{ uri: item.image_url }} style={styles.image} />
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={styles.carName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.carPrice}>{item.price.toLocaleString()} ₫</Text>
                  </View>
                  <Text style={styles.brandText}>{item.brand || 'Luxury Edition'}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleToggleFavorite(item.id)} style={styles.favoriteButton}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "#FF3B30" : "#000000"} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginTop: 60, marginBottom: 20 },
  greeting: { fontSize: 12, fontWeight: '700', color: '#888888', letterSpacing: 1 },
  mainTitle: { fontSize: 32, fontWeight: 'bold', color: '#000000', marginTop: 2 },
  searchIconBtn: { padding: 5 },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { backgroundColor: '#FFFFFF', marginBottom: 30, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  image: { width: '100%', height: 240, borderRadius: 12 },
  info: { paddingVertical: 15, paddingHorizontal: 10 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carName: { fontSize: 18, fontWeight: '700', color: '#000000', flex: 1, marginRight: 10 },
  carPrice: { fontSize: 16, fontWeight: '600', color: '#000000' },
  brandText: { fontSize: 13, color: '#666666', marginTop: 4 },
  favoriteButton: { position: 'absolute', top: 15, right: 15, backgroundColor: '#FFFFFF', padding: 8, borderRadius: 20, elevation: 5 },
  footer: { marginTop: 10, marginBottom: 40, alignItems: 'center' },
  loadMoreBtn: { backgroundColor: '#000', flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, alignItems: 'center', gap: 8 },
  loadMoreText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  outOfDataText: { color: '#888', fontStyle: 'italic', fontSize: 14 },
});