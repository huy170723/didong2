import { Search as SearchIcon, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CarCard from '../../components/car/CarCard';
import { carService } from '../../services/firebase/carService';
import { Car } from '../../types/firebase';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Car[]>([]);
  const [recentSearches, setRecentSearches] = useState(['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes']);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.trim().length === 0) {
      setSearchResults([]);
      setSearchPerformed(false);
      return;
    }
    try {
      setLoading(true);
      const results = await carService.searchCars(text);
      setSearchResults(results);
      setSearchPerformed(true);
      if (text.trim() !== '' && !recentSearches.includes(text)) {
        setRecentSearches(prev => [text, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchText.trim() !== '') handleSearch(searchText.trim());
  };

  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setSearchPerformed(false);
  };

  const handleRecentSearch = (search: string) => {
    setSearchText(search);
    handleSearch(search);
  };

  const clearRecentSearches = () => setRecentSearches([]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER: Đen Trắng thuần túy */}
      <View style={styles.header}>
        <Text style={styles.title}>Tìm kiếm</Text>
      </View>

      {/* SEARCH BAR: Viền đen mảnh hoặc nền xám cực nhạt */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color="#000000" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn đang tìm xe gì?"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (text === '') clearSearch();
            }}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color="#000000" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CONTENT */}
      {searchText.length === 0 && !searchPerformed ? (
        <View style={styles.recentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TÌM KIẾM GẦN ĐÂY</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={styles.clearRecentText}>Xóa tất cả</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentSearches.length > 0 ? (
            <View style={styles.recentList}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleRecentSearch(search)}
                >
                  <Text style={styles.recentText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noRecent}>
              <Text style={styles.noRecentText}>Lịch sử tìm kiếm trống</Text>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => <CarCard car={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <View style={styles.empty}>
                <ActivityIndicator size="small" color="#000000" />
                <Text style={styles.emptyText}>Đang lấy dữ liệu...</Text>
              </View>
            ) : searchPerformed ? (
              <View style={styles.empty}>
                <SearchIcon size={40} color="#000000" />
                <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
                <Text style={styles.emptyText}>
                  Thử tìm kiếm với tên hãng hoặc dòng xe khác
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000'
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    backgroundColor: '#F5F5F5', // Xám cực nhạt để phân biệt với nền trắng
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500'
  },
  clearButton: {
    padding: 5
  },
  recentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1
  },
  clearRecentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    textDecorationLine: 'underline'
  },
  recentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  recentItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000', // Viền đen phong cách Minimalist
  },
  recentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000'
  },
  noRecent: {
    paddingVertical: 30,
    alignItems: 'center'
  },
  noRecentText: {
    fontSize: 14,
    color: '#999'
  },
  resultsList: {
    padding: 20,
    paddingBottom: 40
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 20,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20
  },
});