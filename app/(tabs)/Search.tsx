import { useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { api } from "../../service/api";

export default function Search() {
  const [keyword, setKeyword] = useState("");
  const [cars, setCars] = useState([]);

  const handleSearch = async (text: string) => {
    setKeyword(text);
    const res = await api.get(`/cars?search=${text}`);
    setCars(res.data);
  };

  return (
    <View>
      <TextInput
        placeholder="Search car..."
        value={keyword}
        onChangeText={handleSearch}
      />

      <FlatList
        data={cars}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => <Text>{item.name}</Text>}
      />
    </View>
  );
}
