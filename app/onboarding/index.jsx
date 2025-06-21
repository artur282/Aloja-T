import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import useAuthStore from "../../store/authStore";
import useOnboardingStore from "../../store/onboardingStore";
import { useTheme } from "../../utils/themeContext";
import GeneralOnboarding from "../../components/onboarding/GeneralOnboarding";
import StudentOnboarding from "../../components/onboarding/StudentOnboarding";
import OwnerOnboarding from "../../components/onboarding/OwnerOnboarding";
import { LoadingCard } from "../../components/base";

const OnboardingScreen = () => {
  const { user } = useAuthStore();
  const {
    shouldShowOnboarding,
    completeGeneralOnboarding,
    completeStudentOnboarding,
    completeOwnerOnboarding,
    initialize,
    isLoading,
  } = useOnboardingStore();
  const { currentTheme } = useTheme();
  const [currentOnboarding, setCurrentOnboarding] = useState(null);

  useEffect(() => {
    initializeOnboarding();
  }, [user]);

  const initializeOnboarding = async () => {
    if (!user) {
      console.log("OnboardingScreen: No user found, redirecting to login");
      router.replace("/login");
      return;
    }

    console.log("OnboardingScreen: Initializing onboarding for user:", {
      id: user.id,
      rol: user.rol,
      tipo_usuario: user.tipo_usuario,
      user_metadata_rol: user.user_metadata?.rol,
    });

    // Initialize onboarding store
    await initialize();

    // Use consistent field for user role (prioritize rol, fallback to tipo_usuario)
    const userRole = user.rol || user.tipo_usuario || user.user_metadata?.rol;
    console.log("OnboardingScreen: Detected user role:", userRole);

    // Determine which onboarding to show
    const onboardingType = shouldShowOnboarding(userRole);
    console.log("OnboardingScreen: Onboarding type needed:", onboardingType);
    setCurrentOnboarding(onboardingType);

    // If no onboarding needed, redirect to main app
    if (!onboardingType) {
      console.log(
        "OnboardingScreen: No onboarding needed, redirecting to tabs"
      );
      router.replace("/(tabs)");
    }
  };

  const handleGeneralComplete = async () => {
    await completeGeneralOnboarding();

    // Use consistent field for user role (prioritize rol, fallback to tipo_usuario)
    const userRole = user.rol || user.tipo_usuario || user.user_metadata?.rol;

    // Check if role-specific onboarding is needed
    const nextOnboarding = shouldShowOnboarding(userRole);
    if (nextOnboarding) {
      setCurrentOnboarding(nextOnboarding);
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleStudentComplete = async () => {
    await completeStudentOnboarding();
    router.replace("/(tabs)");
  };

  const handleOwnerComplete = async () => {
    await completeOwnerOnboarding();
    router.replace("/(tabs)");
  };

  const handleSkip = async () => {
    // Complete current onboarding and move to next or main app
    switch (currentOnboarding) {
      case "general":
        await handleGeneralComplete();
        break;
      case "student":
        await handleStudentComplete();
        break;
      case "owner":
        await handleOwnerComplete();
        break;
      default:
        router.replace("/(tabs)");
    }
  };

  if (isLoading || !currentOnboarding) {
    return (
      <View
        style={[styles.container, { backgroundColor: currentTheme.background }]}
      >
        <StatusBar style="auto" />
        <LoadingCard type="custom" />
      </View>
    );
  }

  const renderOnboarding = () => {
    switch (currentOnboarding) {
      case "general":
        return (
          <GeneralOnboarding
            onComplete={handleGeneralComplete}
            onSkip={handleSkip}
          />
        );
      case "student":
        return (
          <StudentOnboarding
            onComplete={handleStudentComplete}
            onSkip={handleSkip}
          />
        );
      case "owner":
        return (
          <OwnerOnboarding
            onComplete={handleOwnerComplete}
            onSkip={handleSkip}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <StatusBar style="auto" />
      {renderOnboarding()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingScreen;
