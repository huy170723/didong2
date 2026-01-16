import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { auth, db } from '@/config/firebase';
import { Car, ChevronLeft, XCircle } from 'lucide-react-native';

type ServiceType = 'normal' | 'pro' | 'vip';
type PaymentType = 'momo' | 'bank';

export default function DepositScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [qrUrl, setQrUrl] = useState('');

    // --- Lấy dữ liệu từ params ---
    const carId = (params.carId as string) || '';
    const carName = (params.name as string) || '';
    const carImage = (params.image as string) || '';
    const carPrice = Number(params.price || 0);

    const [service, setService] = useState<ServiceType>('normal');
    const [payment, setPayment] = useState<PaymentType>('momo');

    const servicePrice: Record<ServiceType, number> = {
        normal: 2000000,
        pro: 5000000,
        vip: 10000000,
    };

    const depositAmount = useMemo(() => carPrice * 0.1, [carPrice]);
    const totalAmount = depositAmount + servicePrice[service];

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsub;
    }, []);

    // --- HÀM HỦY GIAO DỊCH: Xóa sạch Stack và Params ---
    const handleCancel = () => {
        if (router.canGoBack()) {
            router.dismissAll(); // Đóng tất cả các màn hình đang mở đè lên nhau
        }
        // Replace về trang chính và ghi đè params bằng giá trị rỗng để xóa cache
        router.replace({
            pathname: '/(tabs)',
            params: { carId: '', name: '', image: '', price: '' }
        });
    };

    // --- Màn hình kiểm tra dữ liệu rỗng ---
    if (!loading && (!carId || carId === '' || carId === 'undefined')) {
        return (
            <View style={styles.errorCenter}>
                <View style={styles.iconCircle}>
                    <Car size={50} color="#000" />
                </View>
                <Text style={styles.errorTitle}>Hãy chọn xe bạn yêu thích</Text>
                <Text style={styles.errorSub}>Phiên làm việc đã kết thúc hoặc chưa có xe được chọn.</Text>
                <TouchableOpacity style={styles.backBtn} onPress={handleCancel}>
                    <Text style={styles.backBtnText}>Xem danh sách xe</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const generateQR = () => {
        const description = `DAT COC ${carName} + GOI ${service.toUpperCase()}`.replace(/\s/g, '%20');
        if (payment === 'bank') {
            const BANK_ID = "vcb";
            const ACCOUNT_NO = "1025537554";
            return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${totalAmount}&addInfo=${description}`;
        } else {
            const MOMO_PHONE = "0987654321";
            return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=2|99|${MOMO_PHONE}|||0|0|${totalAmount}|${description}`;
        }
    };

    const handleConfirmPayment = async () => {
        if (!user) return Alert.alert("Thông báo", "Vui lòng đăng nhập");
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'deposits'), {
                userId: user.uid,
                carId, carName, carImage,
                depositAmount, service, totalAmount,
                paymentMethod: payment,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            setQrUrl(generateQR());
            setShowQR(true);
        } catch (e) {
            Alert.alert("Lỗi", "Giao dịch không thành công");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>;

    return (
        // Dùng carId làm key để React tự reset hoàn toàn UI khi ID thay đổi hoặc mất
        <View key={carId} style={{ flex: 1, backgroundColor: '#fff' }}>
            <Stack.Screen options={{
                headerTitle: 'Chi tiết đặt cọc',
                headerLeft: () => (
                    <TouchableOpacity onPress={handleCancel}><ChevronLeft size={24} color="#000" /></TouchableOpacity>
                )
            }} />

            <ScrollView style={styles.container}>
                <View style={styles.carCard}>
                    <Image source={{ uri: carImage || 'https://via.placeholder.com/300' }} style={styles.carImg} />
                    <View style={styles.carInfo}>
                        <Text style={styles.carTitle}>{carName}</Text>
                        <Text style={styles.priceSub}>Giá xe: {carPrice.toLocaleString()} đ</Text>
                        <Text style={styles.priceSub}>Cọc (10%): {depositAmount.toLocaleString()} đ</Text>
                    </View>
                </View>

                {/* Phần chọn dịch vụ */}
                <View style={styles.section}>
                    <Text style={styles.label}>Gói dịch vụ trao xe</Text>
                    {(['normal', 'pro', 'vip'] as ServiceType[]).map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.opt, service === type && styles.optActive]}
                            onPress={() => setService(type)}
                        >
                            <Text style={service === type ? styles.optTextActive : styles.optText}>
                                {type === 'normal' ? 'Gói Cơ bản' : type === 'pro' ? 'Gói Chuyên nghiệp' : 'Gói Hoàng Gia VIP'}
                                {` (+${servicePrice[type].toLocaleString()} đ)`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Phần thanh toán */}
                <View style={styles.section}>
                    <Text style={styles.label}>Hình thức thanh toán</Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.payOpt, payment === 'momo' && styles.payOptActive]} onPress={() => setPayment('momo')}>
                            <Text style={payment === 'momo' && { fontWeight: 'bold' }}>Ví MoMo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.payOpt, payment === 'bank' && styles.payOptActive]} onPress={() => setPayment('bank')}>
                            <Text style={payment === 'bank' && { fontWeight: 'bold' }}>Ngân hàng</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tổng cộng */}
                <View style={styles.summary}>
                    <View style={styles.sumRow}><Text>Tiền cọc:</Text><Text>{depositAmount.toLocaleString()} đ</Text></View>
                    <View style={styles.sumRow}><Text>Dịch vụ:</Text><Text>{servicePrice[service].toLocaleString()} đ</Text></View>
                    <View style={[styles.sumRow, { marginTop: 10 }]}><Text style={styles.bold}>TỔNG CỘNG:</Text><Text style={styles.totalVal}>{totalAmount.toLocaleString()} đ</Text></View>
                </View>

                <TouchableOpacity style={styles.mainBtn} onPress={handleConfirmPayment} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>THANH TOÁN NGAY</Text>}
                </TouchableOpacity>

                {/* NÚT HỦY GIAO DỊCH MỚI */}
                <TouchableOpacity style={styles.cancelActionBtn} onPress={handleCancel}>
                    <XCircle size={18} color="#ff4444" />
                    <Text style={styles.cancelActionText}>Hủy giao dịch & Thoát</Text>
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>

            {/* Modal QR */}
            <Modal visible={showQR} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.qrCard}>
                        <Text style={styles.qrTitle}>QUÉT MÃ THANH TOÁN</Text>
                        <Image source={{ uri: qrUrl }} style={styles.qrImgMain} resizeMode="contain" />
                        <Text style={styles.qrPrice}>{totalAmount.toLocaleString()} đ</Text>
                        <TouchableOpacity style={styles.doneBtn} onPress={() => { setShowQR(false); router.replace('/history'); }}>
                            <Text style={styles.doneBtnText}>XÁC NHẬN ĐÃ CHUYỂN TIỀN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowQR(false)} style={{ marginTop: 15 }}>
                            <Text style={{ color: '#999' }}>Quay lại</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 40 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    errorTitle: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 10 },
    errorSub: { color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
    backBtn: { backgroundColor: '#000', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30 },
    backBtnText: { color: '#fff', fontWeight: 'bold' },
    carCard: { backgroundColor: '#f9f9f9', borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
    carImg: { width: '100%', height: 160 },
    carInfo: { padding: 15 },
    carTitle: { fontSize: 18, fontWeight: 'bold' },
    priceSub: { color: '#666', marginTop: 5 },
    section: { marginBottom: 25 },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
    opt: { padding: 15, borderWidth: 1, borderColor: '#eee', borderRadius: 12, marginBottom: 8 },
    optActive: { borderColor: '#000', backgroundColor: '#f4f4f4' },
    optText: { color: '#666' },
    optTextActive: { color: '#000', fontWeight: 'bold' },
    row: { flexDirection: 'row', gap: 10 },
    payOpt: { flex: 1, padding: 15, borderWidth: 1, borderColor: '#eee', borderRadius: 12, alignItems: 'center' },
    payOptActive: { borderColor: '#000', backgroundColor: '#eee' },
    summary: { backgroundColor: '#fdfdfd', padding: 20, borderRadius: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ddd' },
    sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    bold: { fontWeight: 'bold' },
    totalVal: { fontSize: 22, fontWeight: 'bold', color: '#e53935' },
    mainBtn: { backgroundColor: '#000', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 25 },
    mainBtnText: { color: '#fff', fontWeight: 'bold' },
    cancelActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, padding: 10, borderWidth: 1, borderColor: '#ff4444', borderRadius: 10 },
    cancelActionText: { color: '#ff4444', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    qrCard: { backgroundColor: '#fff', width: '85%', borderRadius: 30, padding: 25, alignItems: 'center' },
    qrTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 15 },
    qrImgMain: { width: 260, height: 260 },
    qrPrice: { fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
    doneBtn: { backgroundColor: '#000', width: '100%', padding: 18, borderRadius: 15, alignItems: 'center' },
    doneBtnText: { color: '#fff', fontWeight: 'bold' }
});