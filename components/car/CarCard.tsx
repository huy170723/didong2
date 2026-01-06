import { router } from 'expo-router';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../constants/colors';
import { Car } from '../../types';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/car-detail/${car.id}`)}
    >
      <Image
        source={{ uri: car.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop' }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{car.name}</Text>
          <Text style={styles.price}>{formatPrice(car.price)}</Text>
        </View>
        
        <Text style={styles.brand}>{car.brand} • {car.model} • {car.year}</Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Số KM</Text>
            <Text style={styles.detailValue}>{car.mileage.toLocaleString()} km</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Nhiên liệu</Text>
            <Text style={styles.detailValue}>
              {car.fuel_type === 'gasoline' ? 'Xăng' : 
               car.fuel_type === 'diesel' ? 'Dầu' : 
               car.fuel_type === 'electric' ? 'Điện' : 'Hybrid'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Hộp số</Text>
            <Text style={styles.detailValue}>
              {car.transmission === 'automatic' ? 'Tự động' : 'Số sàn'}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            car.status === 'available' ? styles.statusAvailable : 
            car.status === 'sold' ? styles.statusSold : styles.statusPending
          ]}>
            <Text style={styles.statusText}>
              {car.status === 'available' ? 'CÓ SẴN' : 
               car.status === 'sold' ? 'ĐÃ BÁN' : 'CHỜ DUYỆT'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  brand: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusAvailable: {
    backgroundColor: colors.successLight,
  },
  statusSold: {
    backgroundColor: colors.gray200,
  },
  statusPending: {
    backgroundColor: colors.warningLight,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});