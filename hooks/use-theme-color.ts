import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors'; // ← file Colors này cũng cần tồn tại

/**
 * Hook để lấy màu theo theme light/dark
 * @param props - { light?: string; dark?: string } override màu cụ thể
 * @param colorName - tên màu trong Colors.light / Colors.dark
 */
export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
    const theme = useColorScheme() ?? 'light';  // 'light' | 'dark' | null

    const colorFromProps = props[theme];

    if (colorFromProps) {
        return colorFromProps;
    } else {
        return Colors[theme][colorName];
    }
}