import { styles } from '@/components/car/styles';
import { useRouter } from 'expo-router'; // 1. Thêm import này
import { Calendar, Fuel, Gauge, Heart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { favoriteService } from '../../services/firebase/favoriteService';
import { Car } from '../../types/firebase';

interface CarCardProps {
  car: Car;
  onPress?: () => void;
}

export default function CarCard({ car, onPress }: CarCardProps) {
  const { user } = useAuth();
  const router = useRouter(); // 2. Khởi tạo router
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  // Check if car is favorite (giữ nguyên logic của bạn)
  useEffect(() => {
    const checkFavorite = async () => {
      if (user?.uid) {
        const favorite = await favoriteService.isFavorite(user.uid, car.id);
        setIsFavorite(favorite);
      }
    };
    checkFavorite();
  }, [user, car.id]);

  const handleToggleFavorite = async () => {
    if (!user?.uid) {
      Alert.alert('Vui lòng đăng nhập', 'Đăng nhập để thêm vào yêu thích');
      return;
    }
    setLoadingFavorite(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(user.uid, car.id);
        setIsFavorite(false);
      } else {
        await favoriteService.addFavorite(user.uid, car.id);
        setIsFavorite(true);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    } finally {
      setLoadingFavorite(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  // 3. Hàm xử lý khi nhấn vào thẻ xe
  const handlePress = () => {
    if (onPress) {
      onPress(); // Nếu có truyền onPress từ ngoài vào thì chạy
    } else {
      // Mặc định chuyển sang trang chi tiết dựa trên car.id
      router.push(`/car-detail/${car.id}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress} // 4. Sử dụng hàm handlePress
      activeOpacity={0.8}
    >
      <Image source={{ uri: car.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{car.name}</Text>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            disabled={loadingFavorite}
          >
            <Heart
              size={24}
              color={isFavorite ? '#FF4757' : '#CED6E0'}
              fill={isFavorite ? '#FF4757' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.price}>{formatPrice(car.price)}</Text>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Calendar size={16} color="#666" />
            <Text style={styles.detailText}>{car.year}</Text>
          </View>

          <View style={styles.detailItem}>
            <Gauge size={16} color="#666" />
            <Text style={styles.detailText}>
              {typeof car.mileage === 'number' ? car.mileage.toLocaleString() : car.mileage} km
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Fuel size={16} color="#666" />
            <Text style={styles.detailText}>{car.fuel_type}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {car.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}