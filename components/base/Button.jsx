import React, { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useTheme } from "../../utils/themeContext";
import { animatedButtonPress } from "../../utils/animations";

const Button = ({
  title,
  onPress,
  variant = "primary", // 'primary', 'secondary', 'outline'
  size = "medium", // 'small', 'medium', 'large'
  disabled = false,
  loading = false,
  hapticType = "light", // 'light', 'medium', 'heavy'
  style,
  textStyle,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Create animated press handler
  const handlePress = animatedButtonPress(scaleValue, onPress, hapticType);

  const getButtonStyles = () => {
    const baseStyle = {
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 36,
      },
      medium: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        minHeight: 44,
      },
      large: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: disabled
          ? currentTheme.textSecondary
          : currentTheme.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: disabled ? currentTheme.surface : currentTheme.accent,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: disabled
          ? currentTheme.textSecondary
          : currentTheme.primary,
      },
    };

    return [baseStyle, sizeStyles[size], variantStyles[variant]];
  };

  const getTextStyles = () => {
    const baseTextStyle = {
      fontWeight: "600",
    };

    // Size text styles
    const sizeTextStyles = {
      small: {
        fontSize: 14,
      },
      medium: {
        fontSize: 16,
      },
      large: {
        fontSize: 18,
      },
    };

    // Variant text styles
    const variantTextStyles = {
      primary: {
        color: disabled ? currentTheme.background : "#FFFFFF",
      },
      secondary: {
        color: disabled ? currentTheme.textSecondary : "#FFFFFF",
      },
      outline: {
        color: disabled ? currentTheme.textSecondary : currentTheme.primary,
      },
    };

    return [baseTextStyle, sizeTextStyles[size], variantTextStyles[variant]];
  };

  return (
    <TouchableOpacity
      onPress={disabled || loading ? null : handlePress}
      disabled={disabled || loading}
      activeOpacity={1}
      {...props}
    >
      <Animated.View
        style={[
          getButtonStyles(),
          {
            transform: [{ scale: scaleValue }],
          },
          style,
        ]}
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === "outline" ? currentTheme.primary : "#FFFFFF"}
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={[getTextStyles(), textStyle]}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default Button;
