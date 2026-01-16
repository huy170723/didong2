import { auth, db } from '@/config/firebase';
import { Stack, useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Box, Calendar, ChevronLeft, Image as ImageIcon, ReceiptText } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function HistoryScreen() {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sử dụng onAuthStateChanged để tránh mất dữ liệu khi load lại trang (F5)
        const authUnsub = auth.onAuthStateChanged((user) => {
            if (!user) {
                setLoading(false);
                setHistory([]);
                return;
            }

            // Truy vấn lấy dữ liệu theo đúng cấu trúc Firestore của bạn
            const q = query(
                collection(db, 'deposits'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            const firestoreUnsub = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setHistory(data);
                setLoading(false);
            }, (error) => {
                console.error("Lỗi lấy lịch sử:", error);
                setLoading(false);
            });

            return () => firestoreUnsub();
        });

        return () => authUnsub();
    }, []);

    const renderItem = ({ item }: any) => {
        // Lấy carImage khớp với field trong Firestore của bạn
        const imageUrl = item.carImage;

        const dateDisplay = item.createdAt?.toDate
            ? item.createdAt.toDate().toLocaleDateString('vi-VN')
            : 'Đang cập nhật...';

        return (
            <View style={styles.card}>
                <View style={styles.imageContainer}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.carImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <ImageIcon size={20} color="#CCC" />
                        </View>
                    )}
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.headerRow}>
                        <Text style={styles.carName} numberOfLines={1}>
                            {item.carName || 'Xe không tên'}
                        </Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.status === 'pending' ? '#F5F5F5' : '#E8F5E9' }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: item.status === 'pending' ? '#999' : '#2E7D32' }
                            ]}>
                                {item.status === 'pending' ? 'Đang chờ' : 'Thành công'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Calendar size={12} color="#BBB" />
                        <Text style={styles.infoText}>{dateDisplay}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Box size={12} color="#BBB" />
                        {/* Khớp với field 'service' trong Firestore của bạn */}
                        <Text style={styles.infoText}>
                            Gói: {(item.service || 'NORMAL').toUpperCase()}
                        </Text>
                    </View>

                    <View style={styles.footerRow}>
                        <Text style={styles.totalAmount}>
                            {item.totalAmount?.toLocaleString() || 0} đ
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: "Lịch sử giao dịch",
                headerTitleStyle: { fontWeight: 'bold', fontSize: 17 },
                headerShadowVisible: false,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>
                ),
            }} />

            {loading ? (
                <View style={styles.center}><ActivityIndicator color="#000" /></View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconBox}>
                                <ReceiptText size={40} color="#DDD" />
                            </View>
                            <Text style={styles.emptyText}>Chưa có lịch sử đặt cọc</Text>
                            <TouchableOpacity
                                style={styles.shopBtn}
                                onPress={() => router.replace('/(tabs)')}
                            >
                                <Text style={styles.shopBtnText}>Khám phá các mẫu xe</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backButton: { padding: 8, marginLeft: Platform.OS === 'web' ? 0 : 5 },
    listContent: { padding: 20 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: 16,
        flexDirection: 'row',
        padding: 12,
        borderWidth: 1,
        borderColor: '#F2F2F2',
        ...Platform.select({
            web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' },
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 2 }
        })
    },
    imageContainer: {
        width: 90,
        height: 75,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F9F9F9',
        flexShrink: 0
    },
    carImage: { width: '100%', height: '100%' },
    imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
    cardContent: { flex: 1, marginLeft: 15 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    carName: { fontSize: 14, fontWeight: 'bold', color: '#000', flex: 1, marginRight: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    infoText: { fontSize: 11, color: '#AAA', marginLeft: 6 },
    footerRow: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F8F8F8' },
    totalAmount: { fontSize: 15, fontWeight: '800', color: '#000' },
    emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F9F9F9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyText: { color: '#AAA', fontSize: 14, marginBottom: 25 },
    shopBtn: { backgroundColor: '#000', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25 },
    shopBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});