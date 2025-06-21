import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/themeContext';
import { SPACING } from '../../utils/constants';
import ModernButton from './ModernButton';

const ModernEmptyState = ({
  icon = 'search',
  title = 'No se encontraron resultados',
  subtitle = 'Intenta ajustar tus filtros de búsqueda',
  actionText,
  onActionPress,
  style,
}) => {
  const { currentTheme } = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.xxl,
        },
        style,
      ]}
    >
      {/* Icon */}
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: `${currentTheme.primary}10`,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: SPACING.lg,
        }}
      >
        <Ionicons
          name={icon}
          size={40}
          color={currentTheme.textSecondary}
        />
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: currentTheme.onBackground,
          textAlign: 'center',
          marginBottom: SPACING.sm,
        }}
      >
        {title}
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: 16,
          color: currentTheme.textSecondary,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: actionText ? SPACING.xl : 0,
        }}
      >
        {subtitle}
      </Text>

      {/* Action Button */}
      {actionText && onActionPress && (
        <ModernButton
          title={actionText}
          onPress={onActionPress}
          variant="primary"
          size="large"
        />
      )}
    </View>
  );
};

export default ModernEmptyState;
