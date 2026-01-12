import { StyleSheet } from 'react-native';
// import colors from '../../constants/colors';  // ← comment hoặc xóa nếu chưa cần

export const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover', // thêm để ảnh đẹp hơn, không bị méo
    },

    content: {
        padding: 16,
    },

    // ── Phần header (tên xe + nút yêu thích) ───────────────────────────────
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    name: {                     // thay vì carName
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        flex: 1,                  // để tên xe chiếm hết không gian bên trái
        marginRight: 12,
    },

    // ── Giá xe ───────────────────────────────────────────────────────────────
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: '#007AFF',         // xanh iOS / hoặc thay bằng màu thương hiệu của bạn
        marginVertical: 8,
    },

    // ── Thông tin chi tiết (năm, km, nhiên liệu) ─────────────────────────────
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12,
    },

    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,                   // khoảng cách giữa icon và text
    },

    detailText: {
        fontSize: 14,
        color: '#666666',
    },

    // ── Mô tả xe ─────────────────────────────────────────────────────────────
    description: {
        fontSize: 14,
        color: '#444444',
        lineHeight: 20,
    },

    // ── Nếu bạn vẫn giữ nút (button) nào đó trong CarCard thì để lại ─────────
    // button: { ... },
    // buttonText: { ... },
});