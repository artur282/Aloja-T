import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../utils/themeContext';
import { Button } from '../base';

const { width } = Dimensions.get('window');

const GeneralOnboarding = ({ onComplete, onSkip }) => {
  const { currentTheme } = useTheme();

  const renderIcon = (iconName, iconFamily = 'FontAwesome') => {
    const IconComponent = iconFamily === 'MaterialIcons' ? MaterialIcons : FontAwesome;
    return (
      <View style={[styles.iconContainer, { backgroundColor: currentTheme.primary }]}>
        <IconComponent name={iconName} size={40} color="#FFFFFF" />
      </View>
    );
  };

  const renderCustomButton = (text, onPress, variant = 'primary') => (
    <Button
      title={text}
      onPress={onPress}
      variant={variant}
      style={styles.customButton}
    />
  );

  const pages = [
    {
      backgroundColor: currentTheme.background,
      image: renderIcon('home'),
      title: '¡Bienvenido a Aloja-T!',
      subtitle: 'Encuentra tu hogar ideal cerca de tu universidad. Conectamos estudiantes con alojamientos verificados y seguros.',
      titleStyles: { color: currentTheme.onBackground, fontSize: 24, fontWeight: 'bold' },
      subTitleStyles: { color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
    },
    {
      backgroundColor: currentTheme.background,
      image: renderIcon('search'),
      title: 'Busca, Reserva, Vive',
      subtitle: 'Proceso simple en 3 pasos:\n1. Busca propiedades con filtros avanzados\n2. Reserva de forma segura\n3. Disfruta tu nuevo hogar',
      titleStyles: { color: currentTheme.onBackground, fontSize: 24, fontWeight: 'bold' },
      subTitleStyles: { color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
    },
    {
      backgroundColor: currentTheme.background,
      image: renderIcon('shield', 'FontAwesome'),
      title: 'Propiedades Verificadas',
      subtitle: 'Todas nuestras propiedades pasan por un proceso de verificación riguroso. Tu seguridad es nuestra prioridad.',
      titleStyles: { color: currentTheme.onBackground, fontSize: 24, fontWeight: 'bold' },
      subTitleStyles: { color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
    },
    {
      backgroundColor: currentTheme.background,
      image: renderIcon('users'),
      title: 'Únete a la Comunidad',
      subtitle: 'Conecta con otros estudiantes, comparte experiencias y encuentra compañeros de cuarto ideales.',
      titleStyles: { color: currentTheme.onBackground, fontSize: 24, fontWeight: 'bold' },
      subTitleStyles: { color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
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
      doneLabel="Comenzar"
      bottomBarHighlight={false}
      controlStatusBar={false}
      // Custom styling
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
      // Dot indicator styling
      dotStyle={{
        backgroundColor: currentTheme.border,
        width: 8,
        height: 8,
      }}
      selectedDotStyle={{
        backgroundColor: currentTheme.primary,
        width: 8,
        height: 8,
      }}
      // Button styling
      skipToPage={3}
      allowFontScaling={false}
      pageIndexCallback={(index) => {
        // Optional: track onboarding progress
        console.log('Onboarding page:', index);
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
  customButton: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
});

export default GeneralOnboarding;
