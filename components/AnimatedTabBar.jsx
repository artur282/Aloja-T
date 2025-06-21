import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { COLORS } from "../utils/constants";
import { useTheme } from "../utils/themeContext";

const AnimatedTabBar = ({ state, descriptors, navigation }) => {
  const { bottom } = useSafeAreaInsets();
  const { currentTheme } = useTheme();

  // Tab colors specific to Aloja-T brand
  const tabColors = {
    index: currentTheme.primary, // Amarillo para Home
    search: currentTheme.accent, // Verde para Search
    reservations: "#FF8F00", // Naranja para Reservations
    notifications: "#FFB300", // Naranja claro para Notifications
    owner: currentTheme.accent, // Verde para Owner
    profile: "#E65100", // Rojo-naranja para Profile
  };

  // Filtrar solo las rutas visibles
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.tabBarVisible !== false;
  });

  // Animation values for each tab
  const animationValues = useRef(
    state.routes.map(() => ({
      scale: new Animated.Value(0.8),
      width: new Animated.Value(40), // Reducido de 50 a 40
      opacity: new Animated.Value(0),
    }))
  ).current;

  // Animate tabs when active tab changes
  useEffect(() => {
    state.routes.forEach((route, i) => {
      const { options } = descriptors[route.key];
      if (options.tabBarVisible === false) return;

      const isFocused = i === state.index;
      const animations = animationValues[i];

      // Animate scale (native driver)
      Animated.timing(animations.scale, {
        toValue: isFocused ? 1 : 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animate width (layout driver - cannot use native)
      Animated.timing(animations.width, {
        toValue: isFocused ? 100 : 40, // Reducido proporcionalmente
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Animate text opacity (native driver)
      Animated.timing(animations.opacity, {
        toValue: isFocused ? 1 : 0,
        duration: isFocused ? 400 : 200,
        delay: isFocused ? 100 : 0,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index]);

  const getTabColor = (routeName) => {
    return tabColors[routeName] || currentTheme.primary;
  };

  const getTabLabel = (route) => {
    const { options } = descriptors[route.key];
    const label = options.tabBarLabel || options.title || route.name;

    // Convert route names to Spanish labels
    const labelMap = {
      index: "Inicio",
      search: "Buscar",
      reservations: "Reservas",
      notifications: "Alertas",
      owner: "Propiedad",
      profile: "Perfil",
    };

    return labelMap[route.name] || label;
  };

  const onPress = (route, isFocused) => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: bottom || 8, backgroundColor: currentTheme.surface },
      ]}
    >
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tabColor = getTabColor(route.name);
          const label = getTabLabel(route);

          // Hide tab if tabBarVisible is false
          if (options.tabBarVisible === false) {
            return null;
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => onPress(route, isFocused)}
              style={styles.tab}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    width: animationValues[index].width,
                    backgroundColor: isFocused
                      ? `${tabColor}20`
                      : "transparent",
                  },
                ]}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: animationValues[index].scale }],
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View style={styles.iconContainer}>
                    {options.tabBarIcon &&
                      options.tabBarIcon({
                        focused: isFocused,
                        color: isFocused
                          ? tabColor
                          : currentTheme.textSecondary,
                        size: 20, // Reducido de 24 a 20
                      })}
                  </View>

                  <Animated.Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused
                          ? tabColor
                          : currentTheme.textSecondary,
                        opacity: animationValues[index].opacity,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Animated.Text>
                </Animated.View>
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
    flexDirection: "column",
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: "row",
    height: 55, // Reducido de 70 a 55
    paddingHorizontal: 8,
    paddingVertical: 4, // Reducido de 8 a 4
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10, // Reducido de 12 a 10
    paddingVertical: 4, // Reducido de 8 a 4
    borderRadius: 20, // Reducido de 25 a 20 para mantener proporción
    minWidth: 40, // Reducido de 50 a 40
    height: 40, // Reducido de 50 a 40
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 10, // Reducido de 12 a 10
    fontWeight: "600",
    marginLeft: 4, // Reducido de 6 a 4
  },
});

export default AnimatedTabBar;
