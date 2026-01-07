import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Car,
  Check,
  Cog,
  Fuel,
  Heart,
  MapPin,
  MessageSquare,
  Phone,
  Users
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { carService } from '../../services/firebase/carService';
import { favoriteService } from '../../services/firebase/favoriteService';
import type { Car as CarType } from '../../types/firebase';

const { width: screenWidth } = Dimensions.get('window');

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [car, setCar] = useState<CarType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  useEffect(() => {
    if (user?.id && car?.id) {
      checkFavorite();
    }
  }, [user, car]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Car Detail] Đang lấy chi tiết xe ID:', id);

      if (!id) {
        throw new Error('Không tìm thấy ID xe');
      }

      const carData = await carService.getCarById(id);

      if (!carData) {
        throw new Error('Không tìm thấy thông tin xe');
      }

      setCar(carData);

      console.log('[Car Detail] Lấy chi tiết xe thành công:', carData.name);
    } catch (error: any) {
      console.error('[Car Detail] Lỗi lấy chi tiết xe:', error);
      setError(error.message || 'Không thể tải thông tin xe');

      Alert.alert(
        'Lỗi',
        'Không thể tải thông tin xe. Vui lòng kiểm tra kết nối và thử lại.',
        [
          { text: 'Quay lại', onPress: () => router.back() },
          { text: 'Thử lại', onPress: fetchCarDetails },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!user?.id || !car?.id) return;

    try {
      const isFav = await favoriteService.isFavorite(user.id, car.id);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user?.id || !car?.id) {
      Alert.alert(
        'Vui lòng đăng nhập',
        'Bạn cần đăng nhập để thêm vào yêu thích',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await favoriteService.removeFavorite(user.id, car.id);
        setIsFavorite(false);
        Alert.alert('Thành công', 'Đã xóa khỏi danh sách yêu thích');
      } else {
        await favoriteService.addFavorite(user.id, car.id);
        setIsFavorite(true);
        Alert.alert('Thành công', 'Đã thêm vào danh sách yêu thích');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật yêu thích');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getFuelTypeName = (fuelType: string) => {
    switch (fuelType) {
      case 'gasoline': return 'Xăng';
      case 'diesel': return 'Dầu';
      case 'electric': return 'Điện';
      case 'hybrid': return 'Hybrid';
      default: return fuelType;
    }
  };

  const getTransmissionName = (transmission: string) => {
    return transmission === 'automatic' ? 'Tự động' : 'Số sàn';
  };

  const handleContact = () => {
    Alert.alert(
      'Liên hệ',
      'Bạn muốn liên hệ với chúng tôi bằng cách nào?',
      [
        { text: 'Gọi điện', onPress: () => Alert.alert('Gọi điện', 'Số điện thoại: 0901 234 567') },
        { text: 'Nhắn tin', onPress: () => Alert.alert('Nhắn tin', 'Gửi tin nhắn đến Zalo: 0901 234 567') },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleAddToCart = () => {
    if (!car) return;

    addToCart(car);
    Alert.alert(
      'Thành công',
      'Đã thêm xe vào giỏ hàng',
      [{ text: 'OK' }]
    );
  };

  const handleBuyNow = () => {
    if (!user) {
      Alert.alert(
        'Vui lòng đăng nhập',
        'Bạn cần đăng nhập để đặt mua xe',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    Alert.alert(
      'Đặt mua xe',
      `Xác nhận đặt mua ${car?.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            Alert.alert(
              'Thành công',
              'Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin xe...</Text>
      </View>
    );
  }

  if (error || !car) {
    return (
      <View style={styles.errorContainer}>
        <Car size={64} color={colors.gray} />
        <Text style={styles.errorTitle}>Không thể tải thông tin xe</Text>
        <Text style={styles.errorText}>{error || 'Xe không tồn tại'}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchCarDetails}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const features = [
    { icon: Calendar, label: 'Năm sản xuất', value: car.year },
    { icon: Fuel, label: 'Nhiên liệu', value: getFuelTypeName(car.fuel_type) },
    { icon: Cog, label: 'Hộp số', value: getTransmissionName(car.transmission) },
    { icon: Users, label: 'Số chỗ', value: `${car.seats} chỗ` },
    { icon: MapPin, label: 'Màu sắc', value: car.color || 'Chưa xác định' },
  ];

  const images = [car.image_url];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header với nút back */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
            disabled={favoriteLoading}
          >
            <Heart
              size={24}
              color={isFavorite ? colors.danger : colors.white}
              fill={isFavorite ? colors.danger : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[activeImageIndex] || 'https://via.placeholder.com/800x600' }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {images.length > 1 && (
            <FlatList
              data={images}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailList}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => setActiveImageIndex(index)}>
                  <Image
                    source={{ uri: item }}
                    style={[
                      styles.thumbnail,
                      index === activeImageIndex && styles.thumbnailActive
                    ]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(_, index) => index.toString()}
            />
          )}
        </View>

        {/* Car Info */}
        <View style={styles.content}>
          <Text style={styles.carName}>{car.name}</Text>
          <Text style={styles.price}>{formatPrice(car.price)}</Text>

          <View style={styles.features}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <feature.icon size={20} color={colors.primary} />
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <Text style={styles.featureValue}>{feature.value}</Text>
              </View>
            ))}
          </View>

          {/* Additional Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Hãng xe</Text>
                <Text style={styles.infoValue}>{car.brand}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Model</Text>
                <Text style={styles.infoValue}>{car.model}</Text>
              </View>
              {car.mileage && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Số KM</Text>
                  <Text style={styles.infoValue}>{car.mileage.toLocaleString()} km</Text>
                </View>
              )}
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Tình trạng</Text>
                <View style={[
                  styles.statusBadge,
                  car.status === 'available' ? styles.availableBadge : styles.soldBadge
                ]}>
                  <Check size={12} color={colors.white} />
                  <Text style={styles.statusText}>
                    {car.status === 'available' ? 'Có sẵn' : 'Đã bán'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descriptionText}>
              {car.description || 'Chưa có mô tả chi tiết cho xe này.'}
            </Text>
          </View>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Liên hệ ngay</Text>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleContact}
              >
                <Phone size={20} color={colors.primary} />
                <Text style={styles.contactButtonText}>Gọi điện</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactButton, styles.messageButton]}
                onPress={handleContact}
              >
                <MessageSquare size={20} color={colors.white} />
                <Text style={[styles.contactButtonText, styles.messageButtonText]}>
                  Nhắn tin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.cartButtonText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={handleBuyNow}
          disabled={car.status !== 'available'}
        >
          <Text style={styles.buyButtonText}>
            {car.status === 'available' ? 'Đặt mua ngay' : 'Đã bán'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonError: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: screenWidth,
    height: 300,
  },
  thumbnailList: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  thumbnail: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: colors.primary,
  },
  content: {
    padding: 16,
  },
  carName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  featureLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoGrid: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoItemLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  availableBadge: {
    backgroundColor: colors.success,
  },
  soldBadge: {
    backgroundColor: colors.danger,
  },
  statusText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  contactSection: {
    marginBottom: 100, // Space for action bar
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  },
  messageButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  messageButtonText: {
    color: colors.white,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cartButton: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  buyButton: {
    flex: 2,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: colors.gray,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});