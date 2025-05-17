import { useEffect, useRef } from "react";
import { Stack, Slot, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import useAuthStore from "../store/authStore";
import useNotificationStore from "../store/notificationStore";
import usePropertyStore from "../store/propertyStore";

export default function RootLayout() {
  console.log("RootLayout inicializándose");
  // Added mounting ref to track component mounting state
  const isMounted = useRef(false);
  const { initialize, user } = useAuthStore();
  const { initializeRealTimeNotifications, cleanupSubscriptions } =
    useNotificationStore();
  const { fetchUserProperties } = usePropertyStore();

  // Initialize auth state when app starts and set mounted ref
  useEffect(() => {
    console.log("RootLayout - Efecto de inicialización ejecutándose");
    try {
      initialize();
      console.log("Inicialización de autenticación completada");
      // Mark component as mounted after initialization
      isMounted.current = true;
    } catch (error) {
      console.error("Error durante la inicialización:", error);
    }
  }, []);

  // Set up real-time notifications when user logs in
  useEffect(() => {
    console.log(
      "RootLayout - Efecto de usuario cambió",
      user ? "Usuario presente" : "Sin usuario"
    );
    if (user) {
      try {
        console.log(
          "Inicializando notificaciones en tiempo real para usuario ID:",
          user.id
        );
        // Initialize real-time notifications for the logged-in user
        initializeRealTimeNotifications(user.id);

        // If user is a property owner, fetch their properties
        if (user.tipo_usuario === "propietario") {
          console.log("Usuario es propietario, obteniendo propiedades");
          fetchUserProperties(user.id);
        }
      } catch (error) {
        console.error("Error al configurar notificaciones:", error);
      }
    } else {
      console.log("No hay usuario, limpiando suscripciones");
      // Clean up subscriptions when user logs out
      try {
        cleanupSubscriptions();
      } catch (error) {
        console.error("Error al limpiar suscripciones:", error);
      }
    }

    // Clean up on unmount
    return () => {
      console.log("RootLayout - Limpiando subscripciones (cleanup)");
      try {
        cleanupSubscriptions();
      } catch (error) {
        console.error("Error durante la limpieza:", error);
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
        console.log("Verificando navegación para ruta:", currentPath);
        
        // If user is null and not already on login or signup, redirect to login
        if (!user && !currentPath.startsWith('/login') && !currentPath.startsWith('/signup')) {
          console.log("Redirigiendo a login");
          router.replace('/login');
        }
        // If user exists and is on login or signup, redirect to (tabs)
        else if (user && (currentPath.startsWith('/login') || currentPath.startsWith('/signup'))) {
          console.log("Redirigiendo a tabs");
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error("Error en navegación:", error);
      }
    }, 0);
    
    return () => clearTimeout(navigationTimeout);
  }, [user]);

  // Render the application
  try {
    console.log("RootLayout - Renderizando la aplicación");
    return (
      <>
        <StatusBar style="auto" />
        <Slot />
      </>
    );
  } catch (error) {
    console.error("Error al renderizar RootLayout:", error);
    // Renderizado de emergencia si algo sale mal
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error al cargar la aplicación. Por favor, reinicia.</Text>
      </View>
    );
  }
}
