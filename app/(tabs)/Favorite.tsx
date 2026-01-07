import { router } from 'expo-router';
import { Heart, HeartOff } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CarCard from '../../components/car/CarCard';
import Loading from '../../components/ui/Loading';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { favoriteService } from '../../services/firebase/favoriteService';
import { Car } from '../../types/firebase';

// Interface Favorite (nếu chưa có trong types)
interface Favorite {
  id: string;
  userId: string;
  carId: string;
  carData?: Car;
  createdAt: Date;
}

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Car[]>([]); // Chỉ lưu Car, không cần Favorite object
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load favorites từ Firebase
  const loadFavorites = async () => {
    if (!user?.id) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userFavorites = await favoriteService.getUserFavorites(user.id);
      setFavorites(userFavorites);
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (carId: string, carName: string) => {
    if (!user?.id) return;

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn xóa "${carName}" khỏi danh sách yêu thích?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoriteService.removeFavorite(user.id, carId);
              // Cập nhật state
              setFavorites(prev => prev.filter(car => car.id !== carId));
              Alert.alert('Thành công', 'Đã xóa khỏi yêu thích');
            } catch (error: any) {
              console.error('Error removing favorite:', error);
              Alert.alert('Lỗi', 'Không thể xóa khỏi yêu thích');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Heart size={64} color={colors.gray} />
          <Text style={styles.authTitle}>Vui lòng đăng nhập</Text>
          <Text style={styles.authText}>
            Đăng nhập để xem danh sách yêu thích của bạn
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Xe yêu thích</Text>
        <Text style={styles.subtitle}>
          {favorites.length} xe trong danh sách
        </Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <View style={styles.carItem}>
            <CarCard car={item} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFavorite(item.id, item.name)}
            >
              <HeartOff size={20} color={colors.danger} />
              <Text style={styles.removeText}>Bỏ thích</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Heart size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>Chưa có xe yêu thích</Text>
            <Text style={styles.emptyText}>
              Thêm xe vào danh sách yêu thích để xem lại sau
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.browseButtonText}>Duyệt xe</Text>
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
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  carItem: {
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.lightGray,
  },
  removeText: {
    marginLeft: 8,
    color: colors.danger,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  authText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  authButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  errorCard: {
    padding: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
  },
});