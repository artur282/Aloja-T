import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEYS = {
  GENERAL: "hasSeenGeneralOnboarding",
  STUDENT: "hasSeenStudentOnboarding",
  OWNER: "hasSeenOwnerOnboarding",
};

const useOnboardingStore = create((set, get) => ({
  hasSeenGeneralOnboarding: false,
  hasSeenStudentOnboarding: false,
  hasSeenOwnerOnboarding: false,
  isLoading: false,

  // Initialize onboarding state from AsyncStorage
  initialize: async () => {
    set({ isLoading: true });
    try {
      const [general, student, owner] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEYS.GENERAL),
        AsyncStorage.getItem(ONBOARDING_KEYS.STUDENT),
        AsyncStorage.getItem(ONBOARDING_KEYS.OWNER),
      ]);

      set({
        hasSeenGeneralOnboarding: general === "true",
        hasSeenStudentOnboarding: student === "true",
        hasSeenOwnerOnboarding: owner === "true",
        isLoading: false,
      });
    } catch (error) {
      console.error("Error initializing onboarding store:", error);
      set({ isLoading: false });
    }
  },

  // Determine which onboarding to show based on user role
  shouldShowOnboarding: (userRole) => {
    const state = get();

    // Normalize user role to handle different field names and casing
    const normalizedRole = userRole?.toLowerCase();

    // Always show general onboarding first if not seen
    if (!state.hasSeenGeneralOnboarding) {
      return "general";
    }

    // Then show role-specific onboarding
    if (normalizedRole === "estudiante" && !state.hasSeenStudentOnboarding) {
      return "student";
    }

    if (normalizedRole === "propietario" && !state.hasSeenOwnerOnboarding) {
      return "owner";
    }

    return null; // No onboarding needed
  },

  // Mark general onboarding as completed
  completeGeneralOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEYS.GENERAL, "true");
      set({ hasSeenGeneralOnboarding: true });
    } catch (error) {
      console.error("Error saving general onboarding completion:", error);
    }
  },

  // Mark student onboarding as completed
  completeStudentOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEYS.STUDENT, "true");
      set({ hasSeenStudentOnboarding: true });
    } catch (error) {
      console.error("Error saving student onboarding completion:", error);
    }
  },

  // Mark owner onboarding as completed
  completeOwnerOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEYS.OWNER, "true");
      set({ hasSeenOwnerOnboarding: true });
    } catch (error) {
      console.error("Error saving owner onboarding completion:", error);
    }
  },

  // Reset all onboarding (for testing/debugging)
  resetOnboarding: async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_KEYS.GENERAL),
        AsyncStorage.removeItem(ONBOARDING_KEYS.STUDENT),
        AsyncStorage.removeItem(ONBOARDING_KEYS.OWNER),
      ]);

      set({
        hasSeenGeneralOnboarding: false,
        hasSeenStudentOnboarding: false,
        hasSeenOwnerOnboarding: false,
      });
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  },

  // Skip onboarding (for users who don't want to see it)
  skipOnboarding: async (type) => {
    switch (type) {
      case "general":
        await get().completeGeneralOnboarding();
        break;
      case "student":
        await get().completeStudentOnboarding();
        break;
      case "owner":
        await get().completeOwnerOnboarding();
        break;
      default:
        console.warn("Unknown onboarding type:", type);
    }
  },
}));

export default useOnboardingStore;
