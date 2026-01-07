import React from 'react';
import {
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
}

export default function Card({ children, style, elevation = 2 }: CardProps) {
  return (
    <View style={[
      styles.card,
      { elevation, shadowOpacity: elevation * 0.1 },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});