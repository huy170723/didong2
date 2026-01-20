import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { db } from '../config/firebase';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUBBLE_SIZE = 60;

export default function ChatBubble() {
    const [visible, setVisible] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [carData, setCarData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Vị trí bong bóng chat
    const translateX = useSharedValue(SCREEN_WIDTH - BUBBLE_SIZE - 20);
    const translateY = useSharedValue(SCREEN_HEIGHT - 150);

    // 1. Lấy dữ liệu xe từ Firebase
    useEffect(() => {
        const fetchCars = async () => {
            try {
                const snap = await getDocs(collection(db, "cars"));
                const list = snap.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || doc.data().title || "Xe chưa tên",
                    price: doc.data().price || "Liên hệ"
                }));
                setCarData(list);
            } catch (e) {
                console.error("Lỗi tải xe:", e);
            }
        };
        fetchCars();
    }, []);

    // 2. Lắng nghe tin nhắn Realtime
    useEffect(() => {
        const q = query(collection(db, "messages"), orderBy("createdAt", "asc"), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs || []);
        });
        return () => unsubscribe();
    }, []);

    // Tự động cuộn xuống cuối
    useEffect(() => {
        if (visible && messages?.length > 0) {
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages?.length, visible]);

    // 3. Logic Bot phản hồi
    const handleSendMessage = async (text: string) => {
        const msg = text?.trim();
        if (!msg) return;
        setInput('');

        try {
            await addDoc(collection(db, "messages"), {
                text: msg,
                role: 'user',
                createdAt: serverTimestamp(),
            });

            const foundCar = carData.find(car =>
                msg.toLowerCase().includes(car.name.toLowerCase())
            );

            let botReply = "Cảm ơn bạn. Chuyên viên sẽ tư vấn chi tiết cho bạn sau ít phút!";
            if (foundCar) {
                botReply = `Giá xe ${foundCar.name} hiện tại là: ${foundCar.price}. Bạn có muốn nhận ưu đãi phí trước bạ không?`;
            }

            setTimeout(async () => {
                await addDoc(collection(db, "messages"), {
                    text: botReply,
                    role: 'bot',
                    createdAt: serverTimestamp(),
                });
            }, 1000);

        } catch (e) {
            console.error("Lỗi gửi tin:", e);
        }
    };

    // 4. Gesture kéo thả
    const gesture = Gesture.Pan().onChange(e => {
        translateX.value += e.changeX;
        translateY.value += e.changeY;
    }).onEnd(() => {
        // Hít vào lề gần nhất
        translateX.value = withSpring(translateX.value > SCREEN_WIDTH / 2 ? SCREEN_WIDTH - BUBBLE_SIZE - 10 : 10);
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    }));

    return (
        <View style={styles.master} pointerEvents="box-none">
            <GestureHandlerRootView style={styles.gestureWrapper} pointerEvents="box-none">

                {/* Bong bóng chat di động */}
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[styles.bubble, animatedStyle]}>
                        <TouchableOpacity
                            onPress={() => setVisible(true)}
                            style={styles.inner}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="chatbubbles" size={28} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>
                </GestureDetector>

                {/* Cửa sổ Chat Modal */}
                <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
                    <View style={styles.modalBg}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.window}
                        >
                            <View style={styles.header}>
                                <View>
                                    <Text style={styles.title}>Tư vấn báo giá xe</Text>
                                    <Text style={styles.status}>Bot hỗ trợ 24/7</Text>
                                </View>
                                <TouchableOpacity onPress={() => setVisible(false)}>
                                    <Ionicons name="close-circle" size={32} color="#E5E5EA" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView ref={scrollViewRef} style={styles.list}>
                                {messages.map((m) => (
                                    <View key={m.id} style={[styles.msg, m.role === 'user' ? styles.user : styles.bot]}>
                                        <Text style={{ color: m.role === 'user' ? '#fff' : '#000', fontSize: 15 }}>{m.text}</Text>
                                    </View>
                                ))}
                            </ScrollView>

                            <View style={styles.footer}>
                                <Text style={styles.hint}>CHỌN DÒNG XE TRONG DATABASE:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carSelector}>
                                    {carData.length > 0 ? (
                                        carData.map((car) => (
                                            <TouchableOpacity
                                                key={car.id}
                                                style={styles.carBtn}
                                                onPress={() => handleSendMessage(`Giá ${car.name}`)}
                                            >
                                                <Text style={styles.carBtnText}>{car.name}</Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <ActivityIndicator size="small" color="#999" />
                                    )}
                                </ScrollView>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        value={input}
                                        onChangeText={setInput}
                                        placeholder="Nhập tên xe bạn muốn hỏi..."
                                        style={styles.input}
                                        onSubmitEditing={() => handleSendMessage(input)}
                                    />
                                    <TouchableOpacity
                                        onPress={() => handleSendMessage(input)}
                                        style={styles.sendBtn}
                                    >
                                        <Ionicons name="send" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>
            </GestureHandlerRootView>
        </View>
    );
}

const styles = StyleSheet.create({
    master: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
    },
    gestureWrapper: {
        flex: 1,
    },
    bubble: {
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        borderRadius: 30,
        backgroundColor: '#1A1A1A',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    inner: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    window: { height: '85%', backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
        alignItems: 'center'
    },
    title: { fontWeight: 'bold', fontSize: 18, color: '#1C1C1E' },
    status: { fontSize: 12, color: '#34C759', fontWeight: '500' },
    list: { flex: 1, padding: 15 },
    msg: { padding: 14, borderRadius: 18, marginBottom: 10, maxWidth: '80%' },
    user: { alignSelf: 'flex-end', backgroundColor: '#007AFF', borderBottomRightRadius: 2 },
    bot: { alignSelf: 'flex-start', backgroundColor: '#F2F2F7', borderBottomLeftRadius: 2 },
    footer: { padding: 15, borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingBottom: Platform.OS === 'ios' ? 40 : 20, backgroundColor: '#fff' },
    hint: { fontSize: 10, fontWeight: '800', color: '#8E8E93', marginBottom: 10, textTransform: 'uppercase' },
    carSelector: { flexDirection: 'row', marginBottom: 15 },
    carBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 20, marginRight: 8 },
    carBtnText: { fontSize: 13, fontWeight: '600', color: '#1C1C1E' },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    input: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 22, paddingHorizontal: 18, height: 44, fontSize: 15 },
    sendBtn: { marginLeft: 10, backgroundColor: '#000', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }
});