import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../utils/themeContext';
import { MODERN_SHADOWS, BORDER_RADIUS, SPACING } from '../../utils/constants';

const ModernButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'gradient'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  gradientColors,
  ...props
}) => {
  const { currentTheme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING.xl,
          minHeight: 56,
        };
      default: // medium
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          minHeight: 48,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: 14, fontWeight: '600' };
      case 'large':
        return { fontSize: 18, fontWeight: '700' };
      default: // medium
        return { fontSize: 16, fontWeight: '600' };
    }
  };

  const baseButtonStyle = {
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...getSizeStyles(),
    opacity: disabled ? 0.6 : 1,
  };

  const baseTextStyle = {
    ...getTextSize(),
    textAlign: 'center',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: {
            backgroundColor: currentTheme.surface,
            borderWidth: 1,
            borderColor: currentTheme.border,
            ...MODERN_SHADOWS.small,
          },
          text: {
            color: currentTheme.onBackground,
          },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: currentTheme.primary,
          },
          text: {
            color: currentTheme.primary,
          },
        };
      case 'gradient':
        return {
          button: {
            ...MODERN_SHADOWS.medium,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      default: // primary
        return {
          button: {
            backgroundColor: currentTheme.primary,
            ...MODERN_SHADOWS.medium,
          },
          text: {
            color: '#FFFFFF',
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  const renderContent = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variantStyles.text.color} 
          style={{ marginRight: title ? SPACING.sm : 0 }}
        />
      ) : icon ? (
        <View style={{ marginRight: title ? SPACING.sm : 0 }}>
          {icon}
        </View>
      ) : null}
      {title && (
        <Text style={[baseTextStyle, variantStyles.text, textStyle]}>
          {title}
        </Text>
      )}
    </View>
  );

  if (variant === 'gradient') {
    const defaultGradientColors = gradientColors || [
      currentTheme.primary,
      '#FF8A50', // Gradiente hacia naranja más claro
    ];

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[baseButtonStyle, style]}
        {...props}
      >
        <LinearGradient
          colors={defaultGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            {
              ...baseButtonStyle,
              paddingVertical: 0,
              paddingHorizontal: 0,
              minHeight: 'auto',
              width: '100%',
              height: '100%',
            },
            variantStyles.button,
          ]}
        >
          <View style={getSizeStyles()}>
            {renderContent()}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[baseButtonStyle, variantStyles.button, style]}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default ModernButton;
