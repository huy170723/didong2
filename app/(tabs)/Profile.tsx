import { router } from 'expo-router';
import {
  ChevronRight,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShoppingBag,
  User as UserIcon
} from 'lucide-react-native';
import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/firebase';

type UserWithAddress = User & { address?: string };

export default function ProfileScreen() {
  const { user, logout, loading } = useAuth();

  // ⏳ TRẠNG THÁI ĐANG TẢI
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="small" color="#000000" />
      </SafeAreaView>
    );
  }

  // ❌ CHƯA ĐĂNG NHẬP
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <View style={styles.emptyIconCircle}>
            <UserIcon size={40} color="#000000" />
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

  const currentUser = (user as unknown) as UserWithAddress;

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER - PROFILE INFO */}
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{currentUser.name}</Text>
              <Text style={styles.email}>{currentUser.email}</Text>
            </View>
          </View>
        </View>

        {/* THÔNG TIN CHI TIẾT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.infoCard}>
            <InfoRow icon={<Mail size={18} color="#000" />} label="Email" value={currentUser.email} />
            <View style={styles.divider} />
            <InfoRow icon={<Phone size={18} color="#000" />} label="Điện thoại" value={currentUser.phone || 'Chưa cập nhật'} />
            <View style={styles.divider} />
            <InfoRow icon={<MapPin size={18} color="#000" />} label="Địa chỉ" value={currentUser.address || 'Chưa cập nhật'} />
          </View>
        </View>

        {/* DANH MỤC QUẢN LÝ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.menuCard}>
            <MenuLink
              icon={<ShoppingBag size={20} color="#000" />}
              label="Đơn hàng của tôi"
              onPress={() => router.push('/Orders' as any)}
            />
            <MenuLink
              icon={<Heart size={20} color="#000" />}
              label="Xe yêu thích"
              onPress={() => router.push('/Favorite' as any)}
            />
            <MenuLink
              icon={<Settings size={20} color="#000" />}
              label="Cài đặt"
              onPress={() => { }}
              isLast
            />
          </View>
        </View>

        {/* ĐĂNG XUẤT */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#000000" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>v1.0.0 (Premium)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// UI Components
const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoItem}>
    <View style={styles.iconBox}>{icon}</View>
    <View style={styles.infoTextWrapper}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

const MenuLink = ({ icon, label, onPress, isLast }: any) => (
  <TouchableOpacity
    style={[styles.menuItem, !isLast && styles.borderBottom]}
    onPress={onPress}
  >
    <View style={styles.menuIconWrapper}>{icon}</View>
    <Text style={styles.menuText}>{label}</Text>
    <ChevronRight size={18} color="#CCCCCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 24, paddingTop: 20 },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#000000',
    justifyContent: 'center', alignItems: 'center', marginRight: 20,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#000000' },
  email: { fontSize: 14, color: '#888', marginTop: 4 },

  section: { paddingHorizontal: 20, paddingTop: 30 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#888888',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },

  infoCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  infoItem: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 35 },
  infoTextWrapper: { flex: 1, marginLeft: 5 },
  infoLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#000' },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 15 },

  menuCard: { backgroundColor: '#FFFFFF' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuIconWrapper: { width: 40 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#000' },

  logoutButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginHorizontal: 20, marginTop: 40, marginBottom: 20, padding: 18,
    borderRadius: 16, borderWidth: 1, borderColor: '#000000'
  },
  logoutText: { marginLeft: 10, fontSize: 16, fontWeight: 'bold', color: '#000000' },

  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 25
  },
  authTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  authText: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 12, marginBottom: 30, lineHeight: 22 },
  authButton: {
    backgroundColor: '#000000', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30
  },
  authButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  versionText: { textAlign: 'center', color: '#BBB', marginVertical: 20, fontSize: 11, letterSpacing: 1 }
});