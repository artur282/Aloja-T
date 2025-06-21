import { useEffect, useRef } from "react";
import { Stack, Slot, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import useAuthStore from "../store/authStore";
import useNotificationStore from "../store/notificationStore";
import usePropertyStore from "../store/propertyStore";
import useOnboardingStore from "../store/onboardingStore";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider } from "../utils/themeContext";

export default function RootLayout() {
  // Added mounting ref to track component mounting state
  const isMounted = useRef(false);
  const { initialize, user } = useAuthStore();
  const { initializeRealTimeNotifications, cleanupSubscriptions } =
    useNotificationStore();
  const { fetchUserProperties } = usePropertyStore();
  const { shouldShowOnboarding, initialize: initializeOnboarding } =
    useOnboardingStore();

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
      } catch (error) {}
    } else {
      // Clean up subscriptions when user logs out
      try {
        cleanupSubscriptions();
      } catch (error) {}
    }

    // Clean up on unmount
    return () => {
      // Limpieza de suscripciones
      try {
        cleanupSubscriptions();
      } catch (error) {}
    };
  }, [user]);

  // Auth-based redirection with onboarding check
  useEffect(() => {
    // Only perform navigation if the component is mounted
    if (!isMounted.current) return;

    // Use setTimeout to ensure this runs after render is complete
    const navigationTimeout = setTimeout(async () => {
      try {
        // Get current route path
        const currentPath = router.asPath || router.pathname || "";

        // If user is null and not already on login or signup, redirect to login
        if (
          !user &&
          !currentPath.startsWith("/login") &&
          !currentPath.startsWith("/signup")
        ) {
          router.replace("/login");
        }
        // If user exists, check onboarding regardless of current path
        else if (user) {
          // Initialize onboarding store and check if onboarding is needed
          await initializeOnboarding();

          // Use consistent field for user role (prioritize rol, fallback to tipo_usuario)
          const userRole =
            user.rol || user.tipo_usuario || user.user_metadata?.rol;

          const onboardingType = shouldShowOnboarding(userRole);

          // If onboarding is needed and not already on onboarding screen
          if (onboardingType && !currentPath.startsWith("/onboarding")) {
            router.replace("/onboarding");
          }
          // If no onboarding needed and on login/signup/onboarding, go to main app
          else if (
            !onboardingType &&
            (currentPath.startsWith("/login") ||
              currentPath.startsWith("/signup") ||
              currentPath.startsWith("/onboarding"))
          ) {
            router.replace("/(tabs)");
          }
        }
      } catch (error) {
        console.error("Navigation error:", error);
      }
    }, 0);

    return () => clearTimeout(navigationTimeout);
  }, [user]);

  // Render the application
  try {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          {/* SafeAreaView asegura padding en los bordes seguros */}
          <SafeAreaView
            style={{ flex: 1 }}
            edges={["top", "right", "left", "bottom"]}
          >
            {/* Use Slot directly in root layout */}
            <Slot />
          </SafeAreaView>
        </SafeAreaProvider>
      </ThemeProvider>
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
