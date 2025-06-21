import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../utils/themeContext';
import { MODERN_SHADOWS, BORDER_RADIUS, SPACING } from '../../utils/constants';

const FloatingCard = ({
  children,
  onPress,
  style,
  shadowLevel = 'medium', // 'small', 'medium', 'large'
  borderRadius = 'large', // 'small', 'medium', 'large', 'xlarge'
  padding = 'md', // 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'
  backgroundColor,
  elevated = false, // Use elevated surface color
  ...props
}) => {
  const { currentTheme } = useTheme();

  const getShadowStyle = () => {
    switch (shadowLevel) {
      case 'small':
        return MODERN_SHADOWS.small;
      case 'large':
        return MODERN_SHADOWS.large;
      default: // medium
        return MODERN_SHADOWS.medium;
    }
  };

  const getBorderRadius = () => {
    switch (borderRadius) {
      case 'small':
        return BORDER_RADIUS.small;
      case 'medium':
        return BORDER_RADIUS.medium;
      case 'xlarge':
        return BORDER_RADIUS.xlarge;
      default: // large
        return BORDER_RADIUS.large;
    }
  };

  const getPadding = () => {
    return SPACING[padding] || SPACING.md;
  };

  const cardStyle = {
    backgroundColor: backgroundColor || 
      (elevated ? currentTheme.surfaceElevated : currentTheme.surface),
    borderRadius: getBorderRadius(),
    padding: getPadding(),
    ...getShadowStyle(),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[cardStyle, style]}
        activeOpacity={0.95}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};

export default FloatingCard;
