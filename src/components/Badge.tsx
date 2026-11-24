import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'sm',
  style,
  textStyle,
  icon,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return { bg: COLORS.secondaryLight, text: COLORS.secondaryDark };
      case 'success':
        return { bg: COLORS.successLight, text: COLORS.success };
      case 'warning':
        return { bg: '#FFF7E6', text: COLORS.warning };
      case 'error':
        return { bg: COLORS.errorLight, text: COLORS.error };
      case 'neutral':
        return { bg: '#F0F0EE', text: COLORS.textSecondary };
      case 'primary':
      default:
        return { bg: COLORS.primaryLight, text: COLORS.primary };
    }
  };

  const colors = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 10,
        },
        style,
      ]}
    >
      {icon ? <View style={{ marginRight: 4 }}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSm ? 10 : 12,
            fontWeight: '600',
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    letterSpacing: 0.2,
  },
});
