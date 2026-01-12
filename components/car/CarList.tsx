import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { carService } from '../../services/firebase/carService';
import { Car } from '../../types/firebase';
import CarCard from './CarCard';

interface CarListProps {
    filters?: {
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
        fuelType?: string;
    };
    searchQuery?: string;
}

export default function CarList({ filters, searchQuery }: CarListProps) {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);

    const loadCars = async (isRefreshing = false) => {
        try {
            if (isRefreshing) {
                setRefreshing(true);
            } else if (loading) {
                setLoading(true);
            }

            let carData: Car[] = [];

            if (searchQuery && searchQuery.trim() !== '') {
                // Search mode
                carData = await carService.searchCars(searchQuery);
                setHasMore(false);
            } else if (filters && Object.keys(filters).length > 0) {
                // Filter mode
                // @ts-ignore
                carData = await carService.filterCars(filters);
                setHasMore(false);
            } else {
                // Normal pagination mode
                const { cars: newCars, lastVisible } = await carService.getAllCars(
                    10,
                    isRefreshing ? undefined : lastDoc
                );
                setLastDoc(lastVisible);
                setHasMore(!!lastVisible);
                carData = newCars;
            }

            if (isRefreshing) {
                setCars(carData);
            } else {
                setCars(prev => [...prev, ...carData]);
            }
        } catch (error) {
            console.error('Error loading cars:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setCars([]);
        setLastDoc(null);
        loadCars(true);
    }, [filters, searchQuery]);

    const handleRefresh = () => {
        setCars([]);
        setLastDoc(null);
        loadCars(true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore && !searchQuery && (!filters || Object.keys(filters).length === 0)) {
            loadCars();
        }
    };

    if (loading && cars.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (cars.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.noDataText}>Không tìm thấy xe nào</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={cars}
            renderItem={({ item }) => <CarCard car={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                loading && cars.length > 0 ? (
                    <ActivityIndicator style={styles.footerLoader} />
                ) : null
            }
        />
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noDataText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
    },
});