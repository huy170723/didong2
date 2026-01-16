import { router } from 'expo-router';
import {
  ChevronRight,
  Clock,
  Edit2,
  Heart,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User as UserIcon,
  X
} from 'lucide-react-native';
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

type EditMode = 'phone' | 'address' | 'password';

export default function ProfileScreen() {
  const { user, userData, logout, loading, updateUserData, changePassword } = useAuth();

  // --- States quản lý Modal ---
  const [modalVisible, setModalVisible] = useState(false);
  const [editType, setEditType] = useState<EditMode>('phone');
  const [updating, setUpdating] = useState(false);

  // States cho các ô nhập liệu
  const [tempValue, setTempValue] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // ⏳ TRẠNG THÁI ĐANG TẢI (Toàn trang)
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="small" color="#000" />
      </SafeAreaView>
    );
  }

  // ❌ CHƯA ĐĂNG NHẬP
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <View style={styles.emptyIconCircle}>
            <UserIcon size={40} color="#000" />
          </View>
          <Text style={styles.authTitle}>Tài khoản</Text>
          <Text style={styles.authText}>Đăng nhập để quản lý bộ sưu tập xe và các đơn đặt hàng của bạn</Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- Mở Modal dựa theo loại chỉnh sửa ---
  const openEditModal = (type: EditMode, currentVal: string = '') => {
    setEditType(type);
    setOldPassword('');
    setNewPassword('');
    setTempValue(currentVal === 'Chưa cập nhật' ? '' : currentVal);
    setModalVisible(true);
  };

  // --- Xử lý Lưu dữ liệu ---
  const handleUpdate = async () => {
    setUpdating(true);
    try {
      if (editType === 'password') {
        if (!oldPassword || !newPassword) throw new Error("Vui lòng nhập đầy đủ mật khẩu");
        if (newPassword.length < 6) throw new Error("Mật khẩu mới phải từ 6 ký tự");

        await changePassword(oldPassword, newPassword);
        Alert.alert("Thành công", "Mật khẩu của bạn đã được thay đổi.");
      } else {
        if (!tempValue.trim()) throw new Error("Thông tin không được để trống");

        const field = editType === 'phone' ? 'phoneNumber' : 'address';
        await updateUserData({ [field]: tempValue });
        Alert.alert("Thành công", "Thông tin đã được cập nhật.");
      }
      setModalVisible(false);
    } catch (error: any) {
      let errorMessage = "Đã có lỗi xảy ra.";
      if (error.code === 'auth/wrong-password') errorMessage = "Mật khẩu cũ không chính xác.";
      else if (error.message) errorMessage = error.message;

      Alert.alert("Thông báo", errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* --- MODAL CẬP NHẬT --- */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editType === 'password' ? 'Bảo mật tài khoản' : 'Cập nhật thông tin'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {editType === 'password' ? (
              <View>
                <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="••••••••"
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Tối thiểu 6 ký tự"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>
            ) : (
              <View>
                <Text style={styles.inputLabel}>
                  {editType === 'phone' ? 'Số điện thoại mới' : 'Địa chỉ giao xe'}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={tempValue}
                  onChangeText={setTempValue}
                  keyboardType={editType === 'phone' ? 'phone-pad' : 'default'}
                  autoFocus
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveButton, updating && { opacity: 0.7 }]}
              onPress={handleUpdate}
              disabled={updating}
            >
              {updating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Lưu thay đổi</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE HEADER */}
        <View style={styles.header}>
          <View style={styles.profileBox}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{userData?.displayName || 'Người dùng'}</Text>
              <View style={styles.badgePremium}>
                <ShieldCheck size={12} color="#000" />
                <Text style={styles.badgeText}>Tài khoản xác thực</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION: THÔNG TIN CÁ NHÂN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.infoCard}>
            <InfoRow icon={<Mail size={18} color="#000" />} label="Email" value={userData?.email} isReadOnly />
            <View style={styles.divider} />
            <InfoRow
              icon={<Phone size={18} color="#000" />}
              label="Điện thoại"
              value={userData?.phoneNumber || 'Chưa cập nhật'}
              onEdit={() => openEditModal('phone', userData?.phoneNumber || '')}
            />
            <View style={styles.divider} />
            <InfoRow
              icon={<MapPin size={18} color="#000" />}
              label="Địa chỉ giao xe"
              value={userData?.address || 'Chưa cập nhật'}
              onEdit={() => openEditModal('address', userData?.address || '')}
            />
          </View>
        </View>

        {/* SECTION: BẢO MẬT & HOẠT ĐỘNG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản & Bảo mật</Text>
          <View style={styles.menuCard}>
            <MenuLink
              icon={<Lock size={20} color="#000" />}
              label="Đổi mật khẩu bảo mật"
              onPress={() => openEditModal('password')}
            />
            <MenuLink icon={<Clock size={20} color="#000" />} label="Lịch sử đặt cọc" onPress={() => router.push('/History' as any)} />
            <MenuLink icon={<Heart size={20} color="#000" />} label="Xe yêu thích" onPress={() => router.push('/Favorite' as any)} isLast />
          </View>
        </View>

        {/* ĐĂNG XUẤT */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>App Version 1.0.0 (Stable)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Các Thành Phần Phụ ---
const InfoRow = ({ icon, label, value, onEdit, isReadOnly }: any) => (
  <View style={styles.infoItem}>
    <View style={styles.iconBox}>{icon}</View>
    <View style={styles.infoTextWrapper}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
    {!isReadOnly && (
      <TouchableOpacity onPress={onEdit} style={styles.editIconBtn}>
        <Edit2 size={16} color="#AAA" />
      </TouchableOpacity>
    )}
  </View>
);

const MenuLink = ({ icon, label, onPress, isLast }: any) => (
  <TouchableOpacity style={[styles.menuItem, !isLast && styles.borderBottom]} onPress={onPress}>
    <View style={styles.menuIconWrapper}>{icon}</View>
    <Text style={styles.menuText}>{label}</Text>
    <ChevronRight size={18} color="#DDD" />
  </TouchableOpacity>
);

// --- Hệ thống Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingBottom: 10 },
  profileBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8', padding: 20, borderRadius: 24 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  profileInfo: { marginLeft: 16 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  badgePremium: { flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#EEE' },
  badgeText: { fontSize: 10, color: '#888', marginLeft: 4, fontWeight: '600' },
  section: { paddingHorizontal: 24, marginTop: 25 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#BBB', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 },
  infoCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F2F2F2' },
  infoItem: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 30 },
  infoTextWrapper: { flex: 1, marginLeft: 10 },
  infoLabel: { fontSize: 11, color: '#AAA', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#F8F8F8', marginVertical: 12 },
  editIconBtn: { padding: 5 },
  menuCard: { backgroundColor: '#FFF' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  menuIconWrapper: { width: 35 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#222' },
  logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 24, marginTop: 35, padding: 16, borderRadius: 20, backgroundColor: '#FFF1F0' },
  logoutText: { marginLeft: 10, fontSize: 15, fontWeight: 'bold', color: '#FF3B30' },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  authTitle: { fontSize: 24, fontWeight: 'bold' },
  authText: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 10, marginBottom: 30 },
  authButton: { backgroundColor: '#000', paddingHorizontal: 35, paddingVertical: 14, borderRadius: 30 },
  authButtonText: { color: '#FFF', fontWeight: 'bold' },
  versionText: { textAlign: 'center', color: '#DDD', fontSize: 10, marginVertical: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 25, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  inputLabel: { fontSize: 12, color: '#888', marginBottom: 8, fontWeight: '600' },
  modalInput: { backgroundColor: '#F8F8F8', borderRadius: 12, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#EEE', marginBottom: 20 },
  saveButton: { backgroundColor: '#000', padding: 16, borderRadius: 15, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontWeight: 'bold' }
});