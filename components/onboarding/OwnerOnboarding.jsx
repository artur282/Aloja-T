import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../utils/themeContext';

const { width } = Dimensions.get('window');

const OwnerOnboarding = ({ onComplete, onSkip }) => {
  const { currentTheme } = useTheme();

  const renderIcon = (iconName, iconFamily = 'FontAwesome', backgroundColor) => {
    const IconComponent = iconFamily === 'MaterialIcons' ? MaterialIcons : FontAwesome;
    return (
      <View style={[styles.iconContainer, { backgroundColor: backgroundColor || currentTheme.accent }]}>
        <IconComponent name={iconName} size={40} color="#FFFFFF" />
      </View>
    );
  };

  const pages = [
    {
      backgroundColor: currentTheme.background,
      image: renderIcon('dashboard', 'MaterialIcons', currentTheme.primary),
      title: 'Dashboard de Propietario',
      subtitle: 'Tu centro de control personalizado:\n• Vista general de todas tus propiedades\n• Estadísticas de ocupación y ingresos\n• Gestión rápida de reservas\n• Reportes mensuales automáticos',
      titleStyles: { color: currentTheme.onBackground, fontSize: 24, fontWeight: 'bold' },
      subTitleStyles: { color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
    },
    {
      backgroundColor: currentTheme.background,
      image: renderIcon('plus-circle', 'FontAwesome', currentTheme.accent),
      title: 'Publicar Propiedades',
      subtitle: 'Proceso simple para añadir propiedades:\n• Sube fotos de alta calidad\n• Describe servicios y ubicación\n• Establece precios competitivos\n• Verificación automática en 24h',
      titleStyles: { color: currentTheme.onBackground, fontSize: 24, fontWeight: 'bold' },
      subTitleStyles: { color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
    },
    {
      backgroundColor: currentTheme.background,
      image: renderIcon('calendar', 'FontAwesome', currentTheme.warning),
      title: 'Gestionar Reservas',
      subtitle: 'Control total de tus reservas:\n• Aprobar o rechazar solicitudes\n• Comunicación directa con inquilinos\n• Calendario de disponibilidad\n• Historial completo de reservas',
      titleStyles: { color: currentTheme.onBackground, fontSize: 24, fontWeight: 'bold' },
      subTitleStyles: { color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
    },
    {
      backgroundColor: currentTheme.background,
      image: renderIcon('credit-card', 'FontAwesome', currentTheme.success),
      title: 'Sistema de Pagos',
      subtitle: 'Recibe pagos de forma segura:\n• Transferencias automáticas semanales\n• Comisión transparente del 8%\n• Reportes detallados de ingresos\n• Soporte 24/7 para pagos',
      titleStyles: { color: currentTheme.onBackground, fontSize: 24, fontWeight: 'bold' },
      subTitleStyles: { color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
    },
  ];

  return (
    <Onboarding
      pages={pages}
      onDone={onComplete}
      onSkip={onSkip}
      showSkip={true}
      skipLabel="Saltar"
      nextLabel="Siguiente"
      doneLabel="¡Comenzar a Publicar!"
      bottomBarHighlight={false}
      controlStatusBar={false}
      containerStyles={{
        backgroundColor: currentTheme.background,
      }}
      imageContainerStyles={{
        paddingBottom: 0,
      }}
      titleStyles={{
        color: currentTheme.onBackground,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
      }}
      subTitleStyles={{
        color: currentTheme.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 24,
      }}
      dotStyle={{
        backgroundColor: currentTheme.border,
        width: 8,
        height: 8,
      }}
      selectedDotStyle={{
        backgroundColor: currentTheme.accent,
        width: 8,
        height: 8,
      }}
      skipToPage={3}
      allowFontScaling={false}
      pageIndexCallback={(index) => {
        console.log('Owner onboarding page:', index);
      }}
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default OwnerOnboarding;
