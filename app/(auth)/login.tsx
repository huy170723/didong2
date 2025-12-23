import { router } from "expo-router";
import { useState } from "react";
import { Button, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        await login(email, password);
        router.replace("./(tabs)/index");
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput placeholder="Email" onChangeText={setEmail} />
            <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
            <Button title="Đăng nhập" onPress={handleLogin} />
        </View>
    );
}
