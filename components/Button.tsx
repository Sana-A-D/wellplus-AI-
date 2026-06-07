import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle[] = [styles.button as ViewStyle, styles[size] as ViewStyle];
    
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.secondary as ViewStyle);
        break;
      case 'danger':
        baseStyle.push(styles.danger as ViewStyle);
        break;
      default:
        baseStyle.push(styles.primary as ViewStyle);
    }

    if (disabled) {
      baseStyle.push(styles.disabled as ViewStyle);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle[] = [styles.text as TextStyle, styles[`${size}Text` as keyof typeof styles] as TextStyle];
    
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.secondaryText as TextStyle);
        break;
      case 'danger':
        baseStyle.push(styles.dangerText as TextStyle);
        break;
      default:
        baseStyle.push(styles.primaryText as TextStyle);
    }

    if (disabled) {
      baseStyle.push(styles.disabledText as TextStyle);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon}
      <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  primary: {
    backgroundColor: '#22C55E',
  },
  secondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  disabled: {
    backgroundColor: '#E5E7EB',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#374151',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});