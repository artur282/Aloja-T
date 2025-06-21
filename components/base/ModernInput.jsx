import React, { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/themeContext';
import { BORDER_RADIUS, SPACING } from '../../utils/constants';

const ModernInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  labelStyle,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  floatingLabel = true,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    if (floatingLabel) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (floatingLabel && !value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelTop = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -8],
  });

  const labelFontSize = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const getBorderColor = () => {
    if (error) return currentTheme.error;
    if (isFocused) return currentTheme.primary;
    return currentTheme.border;
  };

  const containerStyle = {
    marginBottom: SPACING.md,
  };

  const inputContainerStyle = {
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    borderWidth: 2,
    borderColor: getBorderColor(),
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: currentTheme.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: multiline ? SPACING.md : SPACING.sm,
    minHeight: multiline ? 80 : 56,
    opacity: disabled ? 0.6 : 1,
  };

  const textInputStyle = {
    flex: 1,
    fontSize: 16,
    color: currentTheme.onBackground,
    paddingTop: floatingLabel && label ? SPACING.md : 0,
    paddingBottom: 0,
    textAlignVertical: multiline ? 'top' : 'center',
  };

  const floatingLabelStyle = {
    position: 'absolute',
    left: SPACING.md,
    backgroundColor: currentTheme.surface,
    paddingHorizontal: SPACING.xs,
    color: error ? currentTheme.error : 
           isFocused ? currentTheme.primary : currentTheme.textSecondary,
    fontWeight: '500',
  };

  return (
    <View style={[containerStyle, style]}>
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={{ marginRight: SPACING.sm }}>
            {leftIcon}
          </View>
        )}

        <View style={{ flex: 1, position: 'relative' }}>
          {floatingLabel && label && (
            <Animated.Text
              style={[
                floatingLabelStyle,
                {
                  top: labelTop,
                  fontSize: labelFontSize,
                },
                labelStyle,
              ]}
            >
              {label}
            </Animated.Text>
          )}

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={floatingLabel ? undefined : (placeholder || label)}
            placeholderTextColor={currentTheme.textSecondary}
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            multiline={multiline}
            numberOfLines={numberOfLines}
            style={[textInputStyle, inputStyle]}
            {...props}
          />
        </View>

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ marginLeft: SPACING.sm }}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={currentTheme.textSecondary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ marginLeft: SPACING.sm }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <Text
          style={{
            fontSize: 12,
            color: error ? currentTheme.error : currentTheme.textSecondary,
            marginTop: SPACING.xs,
            marginLeft: SPACING.sm,
          }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

export default ModernInput;
