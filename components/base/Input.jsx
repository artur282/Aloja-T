import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../../utils/themeContext';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  success,
  helperText,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  containerStyle,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getContainerStyles = () => {
    const baseStyle = {
      marginBottom: 16,
    };

    return [baseStyle, containerStyle];
  };

  const getInputContainerStyles = () => {
    const baseStyle = {
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: multiline ? 12 : 0,
      minHeight: multiline ? 80 : 44,
      backgroundColor: currentTheme.background,
    };

    let borderColor = currentTheme.border;
    if (error) {
      borderColor = currentTheme.error;
    } else if (success) {
      borderColor = currentTheme.success;
    } else if (isFocused) {
      borderColor = currentTheme.primary;
    }

    return [baseStyle, { borderColor }, style];
  };

  const getInputStyles = () => {
    const baseStyle = {
      flex: 1,
      fontSize: 16,
      color: currentTheme.onBackground,
      paddingVertical: multiline ? 0 : 12,
    };

    if (!editable) {
      baseStyle.color = currentTheme.textSecondary;
    }

    return [baseStyle, inputStyle];
  };

  const getLabelStyles = () => {
    return {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.onBackground,
      marginBottom: 6,
    };
  };

  const getHelperTextStyles = () => {
    let color = currentTheme.textSecondary;
    if (error) {
      color = currentTheme.error;
    } else if (success) {
      color = currentTheme.success;
    }

    return {
      fontSize: 12,
      color: color,
      marginTop: 4,
    };
  };

  const renderIcon = (iconName, onPress, isRight = false) => {
    if (!iconName) return null;

    const iconColor = error 
      ? currentTheme.error 
      : isFocused 
        ? currentTheme.primary 
        : currentTheme.textSecondary;

    const IconComponent = (
      <FontAwesome
        name={iconName}
        size={16}
        color={iconColor}
        style={{
          marginLeft: isRight ? 8 : 0,
          marginRight: isRight ? 0 : 8,
        }}
      />
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress}>
          {IconComponent}
        </TouchableOpacity>
      );
    }

    return IconComponent;
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={getContainerStyles()}>
      {label && (
        <Text style={getLabelStyles()}>
          {label}
        </Text>
      )}
      
      <View style={getInputContainerStyles()}>
        {renderIcon(leftIcon)}
        
        <TextInput
          style={getInputStyles()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={currentTheme.textSecondary}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={handlePasswordToggle}>
            <FontAwesome
              name={showPassword ? 'eye-slash' : 'eye'}
              size={16}
              color={currentTheme.textSecondary}
            />
          </TouchableOpacity>
        )}
        
        {renderIcon(rightIcon, onRightIconPress, true)}
      </View>
      
      {(error || success || helperText) && (
        <Text style={getHelperTextStyles()}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

export default Input;
