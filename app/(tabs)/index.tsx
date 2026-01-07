import { Car, Filter } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
import { colors } from '../../constants/colors';
import { carService } from '../../services/car.service';

export default function HomeScreen() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const fetchCars = async () => {
    try {
      console.log('[Home] Bắt đầu gọi API lấy xe...');
      
      setError(null);
      const response = await carService.getAllCars();
      
      console.log('[Home] API trả về:', response);
      
      if (response.success) {
        setCars(response.data || []);
        setIsConnected(true);
        console.log(`[Home] Đã tải ${response.data?.length || 0} xe`);
      } else {
        setError(response.message || 'Không thể tải danh sách xe');
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách xe');
      }
    } catch (error: any) {
      console.error('[Home] Lỗi gọi API:', error);
      
      setError(error.message || 'Lỗi kết nối máy chủ');
      setIsConnected(false);
      
      // Hiển thị hướng dẫn nếu lỗi mạng
      if (error.code === 'NETWORK_ERROR') {
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến máy chủ. Vui lòng:\n\n1. Kiểm tra XAMPP đã chạy chưa\n2. Kiểm tra IP trong config.ts\n3. Kiểm tra kết nối mạng',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCars();
  };

  const retryConnection = () => {
    setLoading(true);
    setError(null);
    fetchCars();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu từ máy chủ...</Text>
        <Text style={styles.loadingSubtext}>Kiểm tra XAMPP và kết nối mạng</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>CarShop</Text>
          <Text style={styles.subtitle}>
            {cars.length} xe đang có sẵn
            {!isConnected && ' (Đang dùng dữ liệu cũ)'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
        >
          <Filter size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Lỗi kết nối</Text>
          <Text style={styles.errorText}>{error}</Text>
          
          <View style={styles.debugInfo}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>• Kiểm tra XAMPP đã chạy chưa</Text>
            <Text style={styles.debugText}>• Kiểm tra Apache và MySQL</Text>
            <Text style={styles.debugText}>• Kiểm tra IP trong config.ts</Text>
            <Text style={styles.debugText}>• Thiết bị và máy tính cùng mạng WiFi</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={retryConnection}
          >
            <Text style={styles.retryButtonText}>Thử lại kết nối</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={cars}
        renderItem={({ item }) => <CarCard car={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <Car size={64} color={colors.gray} />
              <Text style={styles.emptyText}>Không có xe nào</Text>
              <Text style={styles.emptySubtext}>
                {isConnected 
                  ? 'Chưa có xe trong hệ thống' 
                  : 'Không thể tải dữ liệu từ máy chủ'}
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          cars.length > 0 && error ? (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                ⚠️ Đang hiển thị dữ liệu cũ từ lần tải trước
              </Text>
            </View>
          ) : null
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.lightPrimary,
  },
  list: {
    padding: 16,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: colors.warningLight,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.warning,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
  },
  debugInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  warningBanner: {
    backgroundColor: colors.warningLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningText: {
    fontSize: 14,
    color: colors.warning,
    textAlign: 'center',
  },
});