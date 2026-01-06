import { Search as SearchIcon, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CarCard from '../../components/car/CarCard';
import { colors } from '../../constants/colors';
import { carService } from '../../services/car.service';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(['Toyota', 'Honda', 'Ford']);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    
    if (text.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await carService.searchCars(text);
      
      if (response.success) {
        setSearchResults(response.data || []);
        
        // Add to recent searches
        if (!recentSearches.includes(text)) {
          setRecentSearches(prev => [text, ...prev.slice(0, 4)]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
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
            value={searchText}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchText.length === 0 ? (
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
          <View style={styles.recentList}>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => handleSearch(search)}
              >
                <Text style={styles.recentText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => <CarCard car={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            loading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Đang tìm kiếm...</Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <SearchIcon size={48} color={colors.gray} />
                <Text style={styles.emptyText}>
                  Không tìm thấy xe phù hợp với "{searchText}"
                </Text>
              </View>
            )
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
    backgroundColor: colors.background,
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
  recentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  recentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentItem: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentText: {
    color: colors.text,
    fontSize: 14,
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