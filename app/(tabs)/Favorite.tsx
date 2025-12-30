import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import api from "../../service/api";

export default function Favorite() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    api.get("/favorites").then(res => setFavorites(res.data));
  }, []);

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item: any) => item.id.toString()}
      renderItem={({ item }: any) => (
        <View>
          <Text>{item.car.name}</Text>
          <Text>{item.car.price}</Text>
        </View>
      )}
    />
  );
}
