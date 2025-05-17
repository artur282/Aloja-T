import React, { useEffect } from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import {
  FontAwesome,
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { router } from "expo-router";
import useAuthStore from "../../store/authStore";
import useNotificationStore from "../../store/notificationStore";
import NotificationBadge from "../../components/NotificationBadge";
import { COLORS } from "../../utils/constants";

export default function TabsLayout() {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  // Redirect to login if not authenticated
  if (!user) {
    return null;
  }

  // Verificamos estrictamente el rol del usuario
  const isOwner = user?.rol === "propietario";
  const isAdmin = user?.rol === "administrador";

  // La mejor forma de ocultar las pestañas en Expo Router es usando el condicional
  // como hemos implementado más abajo con {isOwner && <Tabs.Screen ... />}
  // Las pantallas no definidas aquí no serán accesibles desde la barra de pestañas

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      {/* Home/Search Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Explorar",
          tabBarLabel: "Buscar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      {/* Reservations Tab */}
      <Tabs.Screen
        name="reservations"
        options={{
          title: "Reservas",
          tabBarLabel: "Reservas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* Notifications Tab */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notificaciones",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="notifications" size={size} color={color} />
              <NotificationBadge count={unreadCount} />
            </View>
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
        }}
      />

      {/* Owner Properties Tab - Solo visible para propietarios */}
      {isOwner && (
        <Tabs.Screen
          name="owner"
          options={{
            title: "Mis Propiedades",
            tabBarLabel: "Propietario",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="person" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
