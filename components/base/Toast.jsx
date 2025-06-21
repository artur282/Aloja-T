import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../../utils/themeContext';

const Toast = ({
  visible = false,
  message,
  type = 'info', // 'success', 'error', 'warning', 'info'
  duration = 3000,
  onHide,
  position = 'top', // 'top', 'bottom'
  style,
}) => {
  const { currentTheme } = useTheme();
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      showToast();
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const showToast = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const getToastConfig = () => {
    const configs = {
      success: {
        backgroundColor: currentTheme.success,
        icon: 'check-circle',
        iconColor: '#FFFFFF',
      },
      error: {
        backgroundColor: currentTheme.error,
        icon: 'exclamation-circle',
        iconColor: '#FFFFFF',
      },
      warning: {
        backgroundColor: currentTheme.warning,
        icon: 'exclamation-triangle',
        iconColor: '#FFFFFF',
      },
      info: {
        backgroundColor: currentTheme.info,
        icon: 'info-circle',
        iconColor: '#FFFFFF',
      },
    };

    return configs[type] || configs.info;
  };

  const getAnimatedStyles = () => {
    const config = getToastConfig();
    
    const translateY = slideAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: position === 'top' ? [-100, 0] : [100, 0],
    });

    return {
      transform: [{ translateY }],
      opacity: opacityAnimation,
      backgroundColor: config.backgroundColor,
    };
  };

  const getContainerStyles = () => {
    const baseStyle = {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 9999,
      borderRadius: 8,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    };

    const positionStyle = position === 'top' 
      ? { top: 50 } 
      : { bottom: 50 };

    return [baseStyle, positionStyle];
  };

  if (!visible && slideAnimation._value === 0) {
    return null;
  }

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        getContainerStyles(),
        getAnimatedStyles(),
        style,
      ]}
    >
      <FontAwesome
        name={config.icon}
        size={20}
        color={config.iconColor}
        style={{ marginRight: 12 }}
      />
      
      <Text
        style={{
          flex: 1,
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: '500',
        }}
        numberOfLines={3}
      >
        {message}
      </Text>
      
      <TouchableOpacity
        onPress={hideToast}
        style={{
          marginLeft: 12,
          padding: 4,
        }}
      >
        <FontAwesome
          name="times"
          size={16}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Hook para usar Toast fácilmente
export const useToast = () => {
  const [toastConfig, setToastConfig] = React.useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
  });

  const showToast = (message, type = 'info', duration = 3000) => {
    setToastConfig({
      visible: true,
      message,
      type,
      duration,
    });
  };

  const hideToast = () => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  };

  const ToastComponent = () => (
    <Toast
      {...toastConfig}
      onHide={hideToast}
    />
  );

  return {
    showToast,
    hideToast,
    ToastComponent,
    showSuccess: (message, duration) => showToast(message, 'success', duration),
    showError: (message, duration) => showToast(message, 'error', duration),
    showWarning: (message, duration) => showToast(message, 'warning', duration),
    showInfo: (message, duration) => showToast(message, 'info', duration),
  };
};

export default Toast;
