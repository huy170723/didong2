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
  View
} from 'react-native';

import { db } from '@/config/firebase';
import { collection, limit as firestoreLimit, getDocs, orderBy, query, startAfter, where } from 'firebase/firestore';

import { useAuth } from '@/contexts/AuthContext';
import { favoriteService } from '@/services/firebase/favoriteService';
import { Car } from '@/types/firebase';

// Định nghĩa danh sách Logo hãng xe
const BRAND_LOGOS = [
  { name: 'Tất cả', url: 'https://cdn-icons-png.flaticon.com/512/744/744465.png' },
  { name: 'Toyota', url: 'https://www.carlogos.org/car-logos/toyota-logo-2020-europe-640.png' },
  { name: 'Honda', url: 'https://www.carlogos.org/car-logos/honda-logo-1700x1150.png' },
  { name: 'Suzuki', url: 'https://www.carlogos.org/car-logos/suzuki-logo-2002-640.png' },
  { name: 'Mazda', url: 'https://www.carlogos.org/car-logos/mazda-logo-2018-640.png' },
];

export default function HomeScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isOutOfData, setIsOutOfData] = useState(false);

  // Thêm state để lọc theo hãng
  const [selectedBrand, setSelectedBrand] = useState('Tất cả');

  const PAGE_SIZE = 4;
  const { user } = useAuth();
  const router = useRouter();

  // Load lại khi đổi hãng xe
  useEffect(() => {
    loadFirstBatch();
  }, [selectedBrand]);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) loadUserFavorites();
      else setFavoriteIds([]);
    }, [user])
  );

  const loadFirstBatch = async () => {
    setLoading(true);
    setIsOutOfData(false);
    try {
      // Logic query: Nếu chọn "Tất cả" thì lấy hết, ngược lại lọc theo brand
      let q = query(
        collection(db, 'cars'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(PAGE_SIZE)
      );

      if (selectedBrand !== 'Tất cả') {
        q = query(
          collection(db, 'cars'),
          where('brand', '==', selectedBrand),
          orderBy('createdAt', 'desc'),
          firestoreLimit(PAGE_SIZE)
        );
      }

      const documentSnapshots = await getDocs(q);
      const lastVisibleDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

      const carList = documentSnapshots.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Car[];

      setCars(carList);
      setLastVisible(lastVisibleDoc);
      if (documentSnapshots.docs.length < PAGE_SIZE) setIsOutOfData(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreCars = async () => {
    if (loadingMore || isOutOfData || !lastVisible) return;
    setLoadingMore(true);
    try {
      let nextQuery = query(
        collection(db, 'cars'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        firestoreLimit(PAGE_SIZE)
      );

      if (selectedBrand !== 'Tất cả') {
        nextQuery = query(
          collection(db, 'cars'),
          where('brand', '==', selectedBrand),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          firestoreLimit(PAGE_SIZE)
        );
      }

      const documentSnapshots = await getDocs(nextQuery);
      if (documentSnapshots.empty) {
        setIsOutOfData(true);
      } else {
        const lastVisibleDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        const newCars = documentSnapshots.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Car[];

        setCars(prev => [...prev, ...newCars]);
        setLastVisible(lastVisibleDoc);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFirstBatch();
  }, [selectedBrand]);

  const loadUserFavorites = async () => {
    try {
      const favCars = await favoriteService.getUserFavorites(user!.uid);
      setFavoriteIds(favCars.map((car) => car.id));
    } catch (err) { console.error(err); }
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
    } catch (error) { loadUserFavorites(); }
  };

  // --- PHẦN THÊM MỚI: BANNER VÀ LOGO ---
  const renderHeader = () => (
    <View>
      {/* Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000' }}
          style={styles.bannerImage}
        />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>New Season Sale</Text>

        </View>
      </View>




      <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
    </View>
  );

  const renderFooter = () => {
    if (isOutOfData) return <View style={styles.footer}><Text style={styles.outOfDataText}>Đã hiển thị toàn bộ xe</Text></View>;
    return (
      <View style={styles.footer}>
        <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMoreCars}>
          {loadingMore ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loadMoreText}>Xem thêm</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header cũ của bạn */}
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
        ListHeaderComponent={renderHeader} // Gắn Banner và Logo vào đây
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => {
          const isLiked = favoriteIds.includes(item.id);
          return (
            <View style={styles.card}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(`/car-detail/${item.id}` as any)}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={styles.carName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.carPrice}>{item.price.toLocaleString()} ₫</Text>
                  </View>
                  <Text style={styles.brandText}>{item.brand}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginTop: 60, marginBottom: 20 },
  greeting: { fontSize: 12, fontWeight: '700', color: '#888888' },
  mainTitle: { fontSize: 32, fontWeight: 'bold', color: '#000000' },
  searchIconBtn: { padding: 5 },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },

  // Styles mới cho Banner
  bannerContainer: { width: '100%', height: 160, borderRadius: 15, overflow: 'hidden', marginBottom: 20 },
  bannerImage: { width: '100%', height: '100%' },
  bannerTextContainer: { position: 'absolute', bottom: 15, left: 15 },
  bannerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  bannerSub: { color: '#EEE', fontSize: 14 },

  // Styles mới cho Logo Hãng
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  brandScroll: { marginBottom: 25 },
  brandItem: { alignItems: 'center', marginRight: 20, padding: 5, borderRadius: 10 },
  brandActive: { backgroundColor: '#F0F0F0' },
  logoCircle: { width: 60, height: 60, backgroundColor: '#FFF', borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowOpacity: 0.1 },
  logoImg: { width: 35, height: 35 },
  brandNameText: { marginTop: 8, fontSize: 12, fontWeight: '500' },

  card: { backgroundColor: '#FFFFFF', marginBottom: 30, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  image: { width: '100%', height: 240, borderRadius: 12 },
  info: { paddingVertical: 15, paddingHorizontal: 10 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carName: { fontSize: 18, fontWeight: '700', flex: 1, marginRight: 10 },
  carPrice: { fontSize: 16, fontWeight: '600' },
  brandText: { fontSize: 13, color: '#666666', marginTop: 4 },
  favoriteButton: { position: 'absolute', top: 15, right: 15, backgroundColor: '#FFFFFF', padding: 8, borderRadius: 20 },
  footer: { marginTop: 10, marginBottom: 40, alignItems: 'center' },
  loadMoreBtn: { backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
  loadMoreText: { color: '#FFF', fontWeight: '600' },
  outOfDataText: { color: '#888', fontStyle: 'italic' },
});