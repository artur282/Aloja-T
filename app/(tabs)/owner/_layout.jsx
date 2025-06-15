import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../../utils/constants';
import useAuthStore from '../../../store/authStore';
import { Text, View } from 'react-native';

export default function OwnerLayout() {
  const { user } = useAuthStore();

  // Verificar que el usuario es propietario
  if (!user || user.rol !== 'propietario') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No tienes permisos para acceder a esta sección</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Mis Propiedades',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Añadir Propiedad',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Editar Propiedad',
        }}
      />
    </Stack>
  );
}
