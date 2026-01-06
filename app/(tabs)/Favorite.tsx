import { router } from 'expo-router';
import { Heart, HeartOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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

const MOCK_FAVORITES = [
  {
    id: 1,
    name: 'Toyota Camry 2020',
    brand: 'Toyota',
    model: 'Camry',
    year: 2020,
    price: 850000000,
    mileage: 15000,
    fuel_type: 'gasoline',
    transmission: 'automatic',
    color: 'Đen',
    description: 'Xe mới đẹp, full option',
    images: ['camry1.jpg'],
    image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
    status: 'available',
  },
  {
    id: 2,
    name: 'Honda CR-V 2021',
    brand: 'Honda',
    model: 'CR-V',
    year: 2021,
    price: 950000000,
    mileage: 10000,
    fuel_type: 'gasoline',
    transmission: 'automatic',
    color: 'Trắng',
    description: 'Xe gia đình, tiết kiệm nhiên liệu',
    images: ['crv1.jpg'],
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop',
    status: 'available',
  },
];

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [favoriteCars, setFavoriteCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load mock favorites
    setTimeout(() => {
      setFavoriteCars(MOCK_FAVORITES);
      setLoading(false);
    }, 1000);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleRemoveFavorite = (carId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa xe khỏi danh sách yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setFavoriteCars(favoriteCars.filter(car => car.id !== carId));
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
          {favoriteCars.length} xe trong danh sách
        </Text>
      </View>

      <FlatList
        data={favoriteCars}
        renderItem={({ item }) => (
          <View style={styles.carItem}>
            <CarCard car={item} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFavorite(item.id)}
            >
              <HeartOff size={20} color={colors.danger} />
              <Text style={styles.removeText}>Bỏ thích</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
});