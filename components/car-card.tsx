import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
    name: string;
    price: number;
    image: string;
    onPress?: () => void;
};

export default function CarCard({ name, price, image, onPress }: Props) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.price}>
                    {price.toLocaleString()} đ
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
        elevation: 3,
    },
    image: {
        height: 160,
        width: "100%",
    },
    info: {
        padding: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
    },
    price: {
        marginTop: 6,
        color: "#e63946",
        fontWeight: "bold",
    },
});
