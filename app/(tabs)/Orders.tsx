import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { api } from "../../service/api";

export default function Order() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders").then(res => setOrders(res.data));
  }, []);

  return (
    <FlatList
      data={orders}
      keyExtractor={(item: any) => item.id.toString()}
      renderItem={({ item }: any) => (
        <View>
          <Text>Car: {item.car.name}</Text>
          <Text>Status: {item.status}</Text>
        </View>
      )}
    />
  );
}
