import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../utils/themeContext';

const { width } = Dimensions.get('window');

const StudentOnboarding = ({ onComplete, onSkip }) => {
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
      image: renderIcon('search', 'FontAwesome', currentTheme.primary),
      title: 'Tutorial de Búsqueda',
      subtitle: 'Aprende a usar nuestros filtros avanzados:\n• Filtra por precio, ubicación y tipo\n• Usa el mapa para ver propiedades cercanas\n• Ordena resultados por relevancia',
      titleStyles: { color: currentTheme.onBackground, fontSize: 24, fontWeight: 'bold' },
      subTitleStyles: { color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
    },
    {
      backgroundColor: currentTheme.background,
      image: renderIcon('heart', 'FontAwesome', currentTheme.error),
      title: 'Sistema de Favoritos',
      subtitle: 'Guarda las propiedades que más te gusten:\n• Toca el corazón para añadir a favoritos\n• Compara hasta 3 propiedades\n• Recibe notificaciones de cambios de precio',
      titleStyles: { color: currentTheme.onBackground, fontSize: 24, fontWeight: 'bold' },
      subTitleStyles: { color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
    },
    {
      backgroundColor: currentTheme.background,
      image: renderIcon('calendar-check-o', 'FontAwesome', currentTheme.success),
      title: 'Proceso de Reserva',
      subtitle: 'Reserva paso a paso de forma segura:\n• Selecciona fechas de entrada y salida\n• Revisa términos y condiciones\n• Pago seguro con confirmación inmediata',
      titleStyles: { color: currentTheme.onBackground, fontSize: 24, fontWeight: 'bold' },
      subTitleStyles: { color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
    },
    {
      backgroundColor: currentTheme.background,
      image: renderIcon('bell', 'FontAwesome', currentTheme.warning),
      title: 'Notificaciones',
      subtitle: 'Mantente informado en todo momento:\n• Confirmaciones de reserva\n• Recordatorios de pago\n• Mensajes del propietario\n• Ofertas especiales',
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
      doneLabel="¡Empezar a Buscar!"
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
        console.log('Student onboarding page:', index);
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

export default StudentOnboarding;
