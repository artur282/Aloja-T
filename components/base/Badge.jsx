import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, useComponentColors } from '../../utils/themeContext';

const Badge = ({
  text,
  type = 'default', // 'default', 'property', 'user', 'status'
  variant = 'available', // For property: 'available', 'reserved', 'occupied', 'pending'
                         // For user: 'student', 'owner', 'admin'
                         // For status: 'active', 'inactive', 'pending', 'rejected'
  size = 'medium', // 'small', 'medium', 'large'
  style,
  textStyle,
}) => {
  const { currentTheme } = useTheme();
  const componentColors = useComponentColors();

  const getBadgeColor = () => {
    switch (type) {
      case 'property':
        return componentColors.property[variant] || currentTheme.primary;
      case 'user':
        return componentColors.user[variant] || currentTheme.accent;
      case 'status':
        return componentColors.status[variant] || currentTheme.textSecondary;
      default:
        return currentTheme.primary;
    }
  };

  const getBadgeStyles = () => {
    const backgroundColor = getBadgeColor();
    
    const baseStyle = {
      backgroundColor: `${backgroundColor}20`, // 20% opacity
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: backgroundColor,
    };

    const sizeStyles = {
      small: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 8,
      },
      medium: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
      },
      large: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
      },
    };

    return [baseStyle, sizeStyles[size]];
  };

  const getTextStyles = () => {
    const color = getBadgeColor();
    
    const baseTextStyle = {
      color: color,
      fontWeight: '600',
    };

    const sizeTextStyles = {
      small: {
        fontSize: 10,
      },
      medium: {
        fontSize: 12,
      },
      large: {
        fontSize: 14,
      },
    };

    return [baseTextStyle, sizeTextStyles[size]];
  };

  const getDisplayText = () => {
    if (text) return text;

    // Default texts for common variants
    const defaultTexts = {
      property: {
        available: 'Disponible',
        reserved: 'Reservado',
        occupied: 'Ocupado',
        pending: 'Pendiente',
      },
      user: {
        student: 'Estudiante',
        owner: 'Propietario',
        admin: 'Administrador',
      },
      status: {
        active: 'Activo',
        inactive: 'Inactivo',
        pending: 'Pendiente',
        rejected: 'Rechazado',
      },
    };

    return defaultTexts[type]?.[variant] || variant;
  };

  return (
    <View style={[getBadgeStyles(), style]}>
      <Text style={[getTextStyles(), textStyle]}>
        {getDisplayText()}
      </Text>
    </View>
  );
};

export default Badge;
