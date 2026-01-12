// hooks/use-color-scheme.ts
import { useColorScheme as useDeviceColorScheme } from 'react-native';

/**
 * Custom hook để lấy color scheme, fallback về 'light' nếu null
 * (React Native built-in có thể trả null trong một số trường hợp)
 */
export function useColorScheme() {
    const scheme = useDeviceColorScheme();
    return scheme ?? 'light'; // hoặc 'dark' tùy bạn muốn default
}