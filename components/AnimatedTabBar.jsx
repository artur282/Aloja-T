import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';

const AnimatedTabBar = ({ state, descriptors, navigation }) => {
  const { bottom } = useSafeAreaInsets();
  
  // Filtrar solo las rutas visibles (donde tabBarVisible no es false)
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.tabBarVisible !== false;
  });
  
  // Calcular el ancho del indicador basado en rutas visibles
  const indicatorWidth = Dimensions.get('window').width / visibleRoutes.length;
  
  // Crear una referencia animada para el indicador
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleValues = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;
  
  // Mover el indicador cuando cambia la tab activa
  useEffect(() => {
    // Calcular la posición correcta del indicador basado en pestañas visibles
    let visibleIndex = 0;
    
    // Contar cuántas pestañas visibles hay antes de la pestaña activa
    for (let i = 0; i < state.index; i++) {
      const { options } = descriptors[state.routes[i].key];
      if (options.tabBarVisible !== false) {
        visibleIndex++;
      }
    }
    
    // Animar el movimiento del indicador usando el índice de pestañas visibles
    Animated.spring(translateX, {
      toValue: visibleIndex * indicatorWidth,
      friction: 8,
      tension: 60,
      useNativeDriver: true
    }).start();
    
    // Animar los iconos
    state.routes.forEach((route, i) => {
      // Solo animar si la pestaña es visible
      const routeOptions = descriptors[route.key].options;
      if (routeOptions.tabBarVisible !== false) {
        Animated.timing(scaleValues[i], {
          toValue: i === state.index ? 1.2 : 1,
          duration: 200,
          useNativeDriver: true
        }).start();
      }
    });
  }, [state.index, indicatorWidth]);

  return (
    <View style={[styles.container, { paddingBottom: bottom || 8 }]}>
      {/* Indicador animado */}
      <Animated.View 
        style={[
          styles.indicator,
          {
            transform: [{ translateX }],
            width: indicatorWidth,
          }
        ]} 
      />
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;
          
          // Ocultar la pestaña si tabBarVisible es false
          if (options.tabBarVisible === false) {
            return null;
          }
          
          // Calcular el índice visible para esta pestaña (para animaciones)
          let visibleIndex = 0;
          for (let i = 0; i < index; i++) {
            const routeOptions = descriptors[state.routes[i].key].options;
            if (routeOptions.tabBarVisible !== false) {
              visibleIndex++;
            }
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tab}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  isFocused && styles.activeIconContainer,
                  { transform: [{ scale: scaleValues[index] }] }
                ]}
              >
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused ? COLORS.primary : COLORS.darkGray,
                    size: 24,
                  })}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flexDirection: 'column',
    borderTopColor: COLORS.lightGray,
    borderTopWidth: 1,
    position: 'relative',
  },
  tabContainer: {
    flexDirection: 'row',
    height: 60,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: COLORS.primaryLight,
  },
  indicator: {
    height: 3,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  },
});

export default AnimatedTabBar;
