// app/(tabs)/home.tsx
import { useBrands } from '@/hooks/useBrands';
import { useCarCategories } from '@/hooks/useCarCategories';
import { useFeaturedCars } from '@/hooks/useCars';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext'; // Sửa đường dẫn này

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const { featuredCars, loading: carsLoading, refetch: refetchCars } = useFeaturedCars();
  const { brands, loading: brandsLoading } = useBrands();
  const { categories, loading: categoriesLoading } = useCarCategories();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchCars();
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  };

  const renderCarItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.carCard}
      onPress={() => router.push(`./car-detail/${item.id}`)} // Sửa thành '/'
    >
      {item.images && item.images.length > 0 ? (
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.carImage}
        />
      ) : (
        <View style={[styles.carImage, styles.placeholderImage]}>
          <Ionicons name="car" size={40} color="#ccc" />
        </View>
      )}
      
      <View style={styles.carInfo}>
        <Text style={styles.carBrand}>{item.brand}</Text>
        <Text style={styles.carName} numberOfLines={1}>{item.name}</Text>
        
        <View style={styles.carMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.year}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="car-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.type}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.metaText}>{item.rating?.toFixed(1) || 'N/A'}</Text>
          </View>
        </View>

        <Text style={styles.carPrice}>{formatPrice(item.price)}</Text>
        
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => router.push(`./car-detail/${item.id}`)} // Sửa thành '/'
        >
          <Text style={styles.detailButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemSelected
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons
        name={item.icon as any}
        size={24}
        color={selectedCategory === item.id ? '#007AFF' : '#666'}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextSelected
        ]}
      >
        {item.name}
      </Text>
      <Text style={styles.categoryCount}>{item.count}</Text>
    </TouchableOpacity>
  );

  const renderBrandItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.brandItem}
      onPress={() => router.push(`./brand/${item.id}`)} // Sửa thành '/'
    >
      <View style={styles.brandLogo}>
        <Text style={styles.brandInitial}>{item.name.charAt(0)}</Text>
      </View>
      <Text style={styles.brandName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.brandCount}>{item.carCount} xe</Text>
    </TouchableOpacity>
  );

  if (carsLoading || brandsLoading || categoriesLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.title}>
              {user ? `Xin chào, ${user.displayName || user.email}` : 'Tìm xe ưng ý của bạn'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('./profile')}> {/* Sửa thành '/' */}
            <View style={styles.avatar}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={24} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('./search')} 
        >
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchPlaceholder}>Tìm kiếm xe hơi...</Text>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Cars */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Xe nổi bật</Text>
            <TouchableOpacity onPress={() => router.push('/all-cars')}> {/* Sửa thành '/' */}
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {featuredCars.length > 0 ? (
            <FlatList
              data={featuredCars}
              renderItem={renderCarItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>Không có xe nào</Text>
            </View>
          )}
        </View>

        {/* Brands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thương hiệu</Text>
          {brands.length > 0 ? (
            <FlatList
              data={brands}
              renderItem={renderBrandItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>Không có thương hiệu</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="car-outline" size={24} color="#007AFF" />
            <Text style={styles.statNumber}>{featuredCars.length}+</Text>
            <Text style={styles.statLabel}>Xe có sẵn</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#007AFF" />
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Chính hãng</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={24} color="#007AFF" />
            <Text style={styles.statNumber}>
              {featuredCars.length > 0 
                ? (featuredCars.reduce((acc, car) => acc + (car.rating || 0), 0) / featuredCars.length).toFixed(1)
                : '0.0'
              }
            </Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    maxWidth: '80%',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: '#666',
    fontSize: 16,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  categoriesList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryItemSelected: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.2,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  carsList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  carCard: {
    width: width * 0.75,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  carImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carInfo: {
    padding: 15,
  },
  carBrand: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  carMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 12,
  },
  detailButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  brandsList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  brandItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  brandLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  brandInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  brandName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 2,
  },
  brandCount: {
    fontSize: 10,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingVertical: 25,
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});