import { db } from '@/app/config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';

const Orders = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders từ Firestore
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Tạo query lấy orders của user hiện tại
    const ordersQuery = query(
      collection(db, 'orders'),
      where('buyerId', '==', user.uid)
    );

    // Listen for real-time updates
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = [];
      snapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Sắp xếp theo thời gian mới nhất
      ordersData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(ordersData);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [user]);

  // Lọc orders theo status
  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab);

  const renderOrderItem = ({ item }) => {
    // Format ngày tháng
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    };

    // Format giá tiền
    const formatPrice = (price) => {
      if (!price) return '0 VND';
      return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
    };

    // Map status tiếng Việt
    const getStatusText = (status) => {
      switch (status) {
        case 'pending': return 'Chờ xác nhận';
        case 'confirmed': return 'Đã xác nhận';
        case 'completed': return 'Hoàn thành';
        case 'cancelled': return 'Đã hủy';
        default: return status;
      }
    };

    // Map status màu
    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return '#fff4e6'; // Cam nhạt
        case 'confirmed': return '#e6f3ff'; // Xanh nhạt
        case 'completed': return '#e6f7ee'; // Xanh lá nhạt
        case 'cancelled': return '#ffe6e6'; // Đỏ nhạt
        default: return '#f0f0f0';
      }
    };

    // Map status text màu
    const getStatusTextColor = (status) => {
      switch (status) {
        case 'pending': return '#e67e22'; // Cam
        case 'confirmed': return '#3498db'; // Xanh dương
        case 'completed': return '#27ae60'; // Xanh lá
        case 'cancelled': return '#e74c3c'; // Đỏ
        default: return '#666';
      }
    };

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => {
          // Navigate to order detail
          router.push(`/orders/${item.id}`);
        }}
      >
        <Image
          source={{ uri: item.carImage || 'https://via.placeholder.com/80x60' }}
          style={styles.carImage}
        />
        <View style={styles.orderInfo}>
          <Text style={styles.carName} numberOfLines={1}>
            {item.carName || 'Không có tên'}
          </Text>
          <Text style={styles.price}>
            {formatPrice(item.price)}
          </Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusTextColor(item.status) }
              ]}>
                {getStatusText(item.status)}
              </Text>
            </View>
            <Text style={styles.date}>
              {formatDate(item.orderDate)}
            </Text>
          </View>
          <Text style={styles.seller}>
            Mã đơn: {item.id.substring(0, 8)}...
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>
    );
  };

  // Nếu chưa đăng nhập
  if (!loading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loginContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.loginTitle}>Vui lòng đăng nhập</Text>
          <Text style={styles.loginSubtitle}>
            Đăng nhập để xem lịch sử đơn hàng của bạn
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.registerButtonText}>Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Nếu đang loading
  if (loading || isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text>Đang tải đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Đơn hàng của tôi</Text>
        <Text style={styles.subtitle}>
          Xin chào, {user?.displayName || user?.email || 'Khách'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'pending', label: 'Chờ xác nhận' },
          { key: 'confirmed', label: 'Đã xác nhận' },
          { key: 'completed', label: 'Hoàn thành' },
          { key: 'cancelled', label: 'Đã hủy' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order List */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => setIsLoading(true)}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'all'
              ? 'Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!'
              : `Không có đơn hàng nào ở mục ${activeTab === 'pending' ? 'Chờ xác nhận' :
                activeTab === 'confirmed' ? 'Đã xác nhận' :
                  activeTab === 'completed' ? 'Hoàn thành' : 'Đã hủy'
              }`}
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/Home')}
          >
            <Text style={styles.browseButtonText}>Xem xe ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 15,
    flexWrap: 'wrap',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  seller: {
    fontSize: 13,
    color: '#666',
  },
  // Login screen styles
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Orders;