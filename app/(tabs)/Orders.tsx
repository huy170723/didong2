import { router } from 'expo-router';
import { CheckCircle, Clock, Package, XCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Loading from '../../components/ui/Loading';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';

const MOCK_ORDERS = [
  {
    id: 1,
    car_id: 1,
    user_id: 1,
    total_price: 850000000,
    status: 'completed',
    payment_method: 'Chuyển khoản',
    shipping_address: '123 Đường ABC, Quận 1, TP.HCM',
    notes: 'Giao hàng vào cuối tuần',
    created_at: '2024-01-10',
    car: {
      id: 1,
      name: 'Toyota Camry 2020',
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      price: 850000000,
      image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
    },
  },
  {
    id: 2,
    car_id: 2,
    user_id: 1,
    total_price: 950000000,
    status: 'pending',
    payment_method: 'Tiền mặt',
    shipping_address: '456 Đường XYZ, Quận 2, TP.HCM',
    notes: '',
    created_at: '2024-01-12',
    car: {
      id: 2,
      name: 'Honda CR-V 2021',
      brand: 'Honda',
      model: 'CR-V',
      year: 2021,
      price: 950000000,
      image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop',
    },
  },
];

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load mock orders
    setTimeout(() => {
      setOrders(MOCK_ORDERS);
      setLoading(false);
    }, 1000);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} color={colors.warning} />;
      case 'confirmed':
      case 'completed':
        return <CheckCircle size={20} color={colors.secondary} />;
      case 'cancelled':
        return <XCircle size={20} color={colors.danger} />;
      default:
        return <Package size={20} color={colors.gray} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Package size={64} color={colors.gray} />
          <Text style={styles.authTitle}>Vui lòng đăng nhập</Text>
          <Text style={styles.authText}>
            Đăng nhập để xem lịch sử đơn hàng
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
        <Text style={styles.title}>Đơn hàng của tôi</Text>
        <Text style={styles.subtitle}>
          {orders.length} đơn hàng
        </Text>
      </View>

      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.orderCard}
            onPress={() => Alert.alert('Thông tin đơn hàng', `Đơn hàng #${item.id}`)}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
              <View style={styles.statusBadge}>
                {getStatusIcon(item.status)}
                <Text style={[
                  styles.statusText,
                  item.status === 'completed' && styles.statusCompleted,
                  item.status === 'cancelled' && styles.statusCancelled,
                ]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>
            
            <View style={styles.orderBody}>
              <Text style={styles.carName}>
                {item.car?.name || 'Đang tải...'}
              </Text>
              <Text style={styles.orderDate}>
                Ngày đặt: {formatDate(item.created_at)}
              </Text>
              <Text style={styles.orderTotal}>
                Tổng tiền: {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(item.total_price)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
            <Text style={styles.emptyText}>
              Bạn chưa có đơn hàng nào. Hãy đặt xe ngay!
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.browseButtonText}>Mua sắm ngay</Text>
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
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.warning,
  },
  statusCompleted: {
    color: colors.secondary,
  },
  statusCancelled: {
    color: colors.danger,
  },
  orderBody: {
    gap: 6,
  },
  carName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  orderDate: {
    fontSize: 14,
    color: colors.textLight,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
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