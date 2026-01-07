import { useEffect, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import CarCard from '../../components/car/CarCard';
import Loading from '../../components/ui/Loading';
import { carService } from '../../services/firebase/carService';
import { Car } from '../../types/firebase';

export default function HomeScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const loadCars = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      }

      const { cars: newCars, lastVisible } = await carService.getAllCars(
        10,
        isRefreshing ? undefined : lastDoc
      );

      if (isRefreshing) {
        setCars(newCars);
      } else {
        setCars(prev => [...prev, ...newCars]);
      }

      setLastDoc(lastVisible);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  if (loading && cars.length === 0) {
    return <Loading />;
  }

  return (
    <FlatList
      data={cars}
      renderItem={({ item }) => <CarCard car={item} />}
      keyExtractor={item => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadCars(true)}
        />
      }
      onEndReached={() => loadCars()}
      onEndReachedThreshold={0.5}
    />
  );
}