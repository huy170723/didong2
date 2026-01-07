import { styles } from '@/components/car/styles';
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  // Check if car is favorite
  useEffect(() => {
    const checkFavorite = async () => {
      if (user?.id) {
        const favorite = await favoriteService.isFavorite(user.id, car.id);
        setIsFavorite(favorite);
      }
    };

    checkFavorite();
  }, [user, car.id]);

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!user?.id) {
      Alert.alert('Vui lòng đăng nhập', 'Đăng nhập để thêm vào yêu thích');
      return;
    }

    setLoadingFavorite(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(user.id, car.id);
        setIsFavorite(false);
      } else {
        await favoriteService.addFavorite(user.id, car.id);
        setIsFavorite(true);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    } finally {
      setLoadingFavorite(false);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: car.image_url }} style={styles.image} />

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
            <Text style={styles.detailText}>{car.mileage.toLocaleString()} km</Text>
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