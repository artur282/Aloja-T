import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import useAuthStore from '../store/authStore';
import { COLORS } from '../utils/constants';

export default function ResetPasswordScreen() {
  const { requestPasswordReset, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu correo');
      return;
    }
    const { success, error } = await requestPasswordReset(email);
    if (success) {
      Alert.alert('Revisa tu correo', 'Hemos enviado un enlace para restablecer tu contraseña');
      router.back();
    } else {
      Alert.alert('Error', error?.message || 'No se pudo enviar el correo');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar enlace</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
