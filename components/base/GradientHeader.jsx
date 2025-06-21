import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/themeContext';
import { SPACING, BORDER_RADIUS } from '../../utils/constants';

const GradientHeader = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  gradientColors,
  children,
  style,
  titleStyle,
  subtitleStyle,
  height = 120,
  showBackButton = false,
  transparent = false,
  ...props
}) => {
  const { currentTheme } = useTheme();

  const defaultGradientColors = gradientColors || [
    currentTheme.primary,
    '#FF8A50', // Gradiente hacia naranja más claro
  ];

  const headerContent = (
    <View style={[
      {
        height,
        justifyContent: 'flex-end',
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
      },
      style
    ]}>
      {/* Navigation Row */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: title || subtitle ? SPACING.md : 0,
      }}>
        {/* Left Side */}
        <View style={{ flex: 1 }}>
          {showBackButton || leftIcon ? (
            <TouchableOpacity
              onPress={onLeftPress}
              style={{
                width: 40,
                height: 40,
                borderRadius: BORDER_RADIUS.round,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {leftIcon || (
                <Ionicons 
                  name="chevron-back" 
                  size={24} 
                  color="white" 
                />
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Right Side */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightPress}
              style={{
                width: 40,
                height: 40,
                borderRadius: BORDER_RADIUS.round,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Title and Subtitle */}
      {(title || subtitle) && (
        <View>
          {title && (
            <Text style={[
              {
                fontSize: 28,
                fontWeight: '700',
                color: 'white',
                marginBottom: subtitle ? SPACING.xs : 0,
              },
              titleStyle
            ]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[
              {
                fontSize: 16,
                fontWeight: '400',
                color: 'rgba(255, 255, 255, 0.9)',
              },
              subtitleStyle
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Custom Children */}
      {children}
    </View>
  );

  if (transparent) {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView edges={['top']}>
          {headerContent}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={defaultGradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      {...props}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']}>
        {headerContent}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default GradientHeader;
