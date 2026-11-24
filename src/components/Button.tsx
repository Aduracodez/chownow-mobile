import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.full,
    };

    // Size
    if (size === 'sm') {
      base = { ...base, paddingVertical: 8, paddingHorizontal: 16 };
    } else if (size === 'lg') {
      base = { ...base, paddingVertical: 16, paddingHorizontal: 28 };
    } else {
      base = { ...base, paddingVertical: 12, paddingHorizontal: 22 };
    }

    // Variant
    switch (variant) {
      case 'secondary':
        base = { ...base, backgroundColor: COLORS.secondary };
        break;
      case 'outline':
        base = {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: COLORS.primary,
        };
        break;
      case 'ghost':
        base = { ...base, backgroundColor: 'transparent' };
        break;
      case 'primary':
      default:
        base = { ...base, backgroundColor: COLORS.primary };
        break;
    }

    if (disabled || loading) {
      base = { ...base, opacity: 0.55 };
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let base: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    if (size === 'sm') {
      base = { ...base, fontSize: 13 };
    } else if (size === 'lg') {
      base = { ...base, fontSize: 16 };
    } else {
      base = { ...base, fontSize: 14 };
    }

    switch (variant) {
      case 'outline':
      case 'ghost':
        base = { ...base, color: COLORS.primary };
        break;
      case 'secondary':
        base = { ...base, color: COLORS.white };
        break;
      case 'primary':
      default:
        base = { ...base, color: COLORS.white };
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' ? <>{icon}</> : null}
          <Text
            style={[
              getTextStyle(),
              icon ? (iconPosition === 'left' ? { marginLeft: 8 } : { marginRight: 8 }) : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' ? <>{icon}</> : null}
        </>
      )}
    </TouchableOpacity>
  );
};
