import { Search as SearchIcon, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CarCard from '../../components/car/CarCard';
import { colors } from '../../constants/colors';
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
    setSearchPerformed(false);

    if (text.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await carService.searchCars(text);
      setSearchResults(results);
      setSearchPerformed(true);

      // Add to recent searches (nếu chưa có)
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
    if (searchText.trim() !== '') {
      handleSearch(searchText.trim());
    }
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

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tìm kiếm xe</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color={colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên, hãng, model..."
            placeholderTextColor={colors.gray}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={20} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchText.length === 0 && !searchPerformed ? (
        <View style={styles.recentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={styles.clearRecentText}>Xóa</Text>
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
              <Text style={styles.noRecentText}>Chưa có tìm kiếm gần đây</Text>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => <CarCard car={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            loading ? (
              <View style={styles.empty}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.emptyText}>Đang tìm kiếm...</Text>
              </View>
            ) : searchPerformed ? (
              <View style={styles.empty}>
                <SearchIcon size={48} color={colors.gray} />
                <Text style={styles.emptyText}>
                  Không tìm thấy xe phù hợp với "{searchText}"
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
  searchContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  recentContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  clearRecentText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  recentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentItem: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentText: {
    color: colors.text,
    fontSize: 14,
  },
  noRecent: {
    padding: 20,
    alignItems: 'center',
  },
  noRecentText: {
    fontSize: 14,
    color: colors.gray,
  },
  resultsList: {
    padding: 16,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 16,
    textAlign: 'center',
  },
});