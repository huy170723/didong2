import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { colors } from '../../constants/colors';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function Loading({ message = 'Đang tải...', size = 'large' }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
});