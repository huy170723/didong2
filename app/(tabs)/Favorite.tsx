import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowRight, Heart, HeartOff } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CarCard from '../../components/car/CarCard';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../contexts/AuthContext';
import { favoriteService } from '../../services/firebase/favoriteService';
import { Car } from '../../types/firebase';

export default function FavoritesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async (showLoading = true) => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    if (showLoading) setLoading(true);
    try {
      const data = await favoriteService.getUserFavorites(user.uid);
      setFavorites(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites(false);
  };

  const handleRemove = async (carId: string, carName: string) => {
    if (!user?.uid) return;
    Alert.alert('Thông báo', `Bỏ "${carName}" khỏi danh sách yêu thích?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đồng ý',
        style: 'destructive',
        onPress: async () => {
          try {
            await favoriteService.removeFavorite(user.uid, carId);
            setFavorites(prev => prev.filter(c => c.id !== carId));
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa xe khỏi danh sách');
          }
        }
      }
    ]);
  };

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER: Chữ đen in đậm, nền trắng */}
      <View style={styles.header}>
        <Text style={styles.title}>Bộ sưu tập</Text>
        <Text style={styles.subtitle}>{favorites.length} xe đã lưu</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000000" // Màu xoay cho iOS
            colors={["#000000"]} // Màu xoay cho Android
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <CarCard car={item} />
            <TouchableOpacity
              style={styles.removeAction}
              onPress={() => handleRemove(item.id, item.name)}
            >
              <HeartOff size={16} color="#000000" />
              <Text style={styles.removeText}>Xóa khỏi yêu thích</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Heart size={40} color="#000000" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có xe yêu thích</Text>
            <Text style={styles.emptySubtitle}>
              Hãy khám phá và lưu lại những mẫu xe bạn ưng ý nhất.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              style={styles.goBtn}
            >
              <Text style={styles.goBtnText}>Khám phá ngay</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000'
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
    fontWeight: '500'
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    // Đổ bóng nhẹ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  removeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE'
  },
  removeText: {
    marginLeft: 8,
    color: '#000000',
    fontWeight: '600',
    fontSize: 13
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000'
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20
  },
  goBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 25,
    gap: 8
  },
  goBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15
  }
});