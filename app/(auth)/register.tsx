import { router } from "expo-router";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import api from "../../service/api";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            await api.post("/register", { email, password });
            Alert.alert("Đăng ký thành công");
            router.replace("/login");
        } catch (e) {
            Alert.alert("Lỗi đăng ký");
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput placeholder="Email" onChangeText={setEmail} />
            <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
            <Button title="Đăng ký" onPress={handleRegister} />
        </View>
    );
}
