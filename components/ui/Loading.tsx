import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import colors from '../../constants/colors';

interface PropsThanhLoading {
  thongBao?: string;
  kichThuoc?: 'small' | 'large';
  toanManHinh?: boolean;
  coOverlayMo?: boolean;
  styleThem?: StyleProp<ViewStyle>;
}

export default function ThanhLoading({
  thongBao = 'Đang tải...',
  kichThuoc = 'large',
  toanManHinh = true,
  coOverlayMo = false,
  styleThem,
}: PropsThanhLoading) {
  // ← Thêm dòng này: dùng light mode trực tiếp
  const theme = colors.light;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        toanManHinh && styles.toanManHinh,
        coOverlayMo && styles.overlayMo,
        { opacity: fadeAnim },
        styleThem,
      ]}
    >
      <ActivityIndicator size={kichThuoc} color={theme.primary} />

      {thongBao && (
        <Text style={styles.textThongBao}>{thongBao}</Text>
      )}
    </Animated.View>
  );
}

const theme = colors.light; // Để StyleSheet dùng được

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },

  toanManHinh: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.background,
  },

  overlayMo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textThongBao: {
    marginTop: 20,
    fontSize: 15.5,
    fontWeight: '500',
    color: theme.textLight,
    textAlign: 'center',
    letterSpacing: 0.25,
    lineHeight: 22,
  },
});