import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import colors from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  // Sử dụng light mode trực tiếp
  const theme = colors.light;

  const getButtonStyle = () => {
    const baseStyle = styles.base;
    const variantStyle = styles[variant];
    const sizeStyle = styles[size];
    const disabledStyle = disabled ? styles.disabled : {};

    return [baseStyle, variantStyle, sizeStyle, disabledStyle, style];
  };

  const getTextStyle = () => {
    const baseTextStyle = styles.baseText;
    const variantTextStyle = styles[`${variant}Text`];
    const sizeTextStyle = styles[`${size}Text`];

    return [baseTextStyle, variantTextStyle, sizeTextStyle, textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.primary : theme.white}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const theme = colors.light; // Định nghĩa theme để StyleSheet sử dụng

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  primaryText: {
    color: theme.white,
  },
  secondary: {
    backgroundColor: theme.secondary,
    borderColor: theme.secondary,
  },
  secondaryText: {
    color: theme.white,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: theme.primary,
  },
  outlineText: {
    color: theme.primary,
  },
  danger: {
    backgroundColor: theme.danger,
    borderColor: theme.danger,
  },
  dangerText: {
    color: theme.white,
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  smallText: {
    fontSize: 14,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  mediumText: {
    fontSize: 16,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  largeText: {
    fontSize: 18,
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});