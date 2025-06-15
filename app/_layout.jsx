import { useEffect, useRef } from "react";
import { Stack, Slot, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import useAuthStore from "../store/authStore";
import useNotificationStore from "../store/notificationStore";
import usePropertyStore from "../store/propertyStore";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {

  // Added mounting ref to track component mounting state
  const isMounted = useRef(false);
  const { initialize, user } = useAuthStore();
  const { initializeRealTimeNotifications, cleanupSubscriptions } =
    useNotificationStore();
  const { fetchUserProperties } = usePropertyStore();

  // Initialize auth state when app starts and set mounted ref
  useEffect(() => {

    try {
      initialize();

      // Mark component as mounted after initialization
      isMounted.current = true;
    } catch (error) {
      // Error controlado
    }
  }, []);

  // Set up real-time notifications when user logs in
  useEffect(() => {

    if (user) {
      try {

        // Initialize real-time notifications for the logged-in user
        initializeRealTimeNotifications(user.id);

        // If user is a property owner, fetch their properties
        if (user.tipo_usuario === "propietario") {

          fetchUserProperties(user.id);
        }
      } catch (error) {

      }
    } else {
      // Clean up subscriptions when user logs out
      try {
        cleanupSubscriptions();
      } catch (error) {

      }
    }

    // Clean up on unmount
    return () => {
      // Limpieza de suscripciones
      try {
        cleanupSubscriptions();
      } catch (error) {

      }
    };
  }, [user]);

  // Auth-based redirection - with mounting check
  useEffect(() => {
    // Only perform navigation if the component is mounted
    if (!isMounted.current) return;
    
    // Use setTimeout to ensure this runs after render is complete
    const navigationTimeout = setTimeout(() => {
      try {
        // Get current route path
        const currentPath = router.asPath || router.pathname || '';

        
        // If user is null and not already on login or signup, redirect to login
        if (!user && !currentPath.startsWith('/login') && !currentPath.startsWith('/signup')) {

          router.replace('/login');
        }
        // If user exists and is on login or signup, redirect to (tabs)
        else if (user && (currentPath.startsWith('/login') || currentPath.startsWith('/signup'))) {

          router.replace('/(tabs)');
        }
      } catch (error) {

      }
    }, 0);
    
    return () => clearTimeout(navigationTimeout);
  }, [user]);

  // Render the application
  try {

    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {/* SafeAreaView asegura padding en los bordes seguros */}
        <SafeAreaView style={{ flex: 1 }} edges={["top", "right", "left", "bottom"]}>
          {/* Use Slot directly in root layout */}
          <Slot />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  } catch (error) {
    // Error controlado
    // Renderizado de emergencia si algo sale mal
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error al cargar la aplicación. Por favor, reinicia.</Text>
      </View>
    );
  }
}
