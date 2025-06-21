import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import useAuthStore from "../../store/authStore";
import { COLORS } from "../../utils/constants";

export default function ProfileScreen() {
  const { user, signOut, updateProfile, uploadProfilePhoto, isLoading } =
    useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState(
    user?.nombre_completo || ""
  );
  const [numeroTelefono, setNumeroTelefono] = useState(
    user?.numero_telefono || ""
  );
  const [documentoIdentidad, setDocumentoIdentidad] = useState(
    user?.documento_identidad || ""
  );

  const handleUpdateProfile = async () => {
    if (!nombreCompleto) {
      Alert.alert("Error", "El nombre completo es obligatorio");
      return;
    }

    // Crear objeto con datos explícitos para actualizar
    const datosActualizados = {
      nombre_completo: nombreCompleto,
      numero_telefono: numeroTelefono || null,
      documento_identidad: documentoIdentidad || null,
    };

    const { error, user: updatedUser } = await updateProfile(datosActualizados);

    if (error) {
      console.error("Error al actualizar perfil:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil");
    } else {
      // Actualizar el estado local con los nuevos valores
      if (updatedUser) {
        setNombreCompleto(updatedUser.nombre_completo || "");
        setNumeroTelefono(updatedUser.numero_telefono || "");
        setDocumentoIdentidad(updatedUser.documento_identidad || "");
      }
      Alert.alert("Éxito", "Perfil actualizado correctamente");
      setIsEditing(false);
    }
  };

  const handleSelectProfilePhoto = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se necesita acceso a la galería de fotos"
        );
        return;
      }

      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const { error, publicUrl } = await uploadProfilePhoto(
          result.assets[0].uri
        );

        if (error) {
          Alert.alert("Error", "No se pudo subir la foto de perfil");
        } else {
          Alert.alert("Éxito", "Foto de perfil actualizada correctamente");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al seleccionar la imagen");
      console.error(error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={handleSelectProfilePhoto}
          disabled={isLoading}
        >
          {user.url_foto_perfil ? (
            <Image
              source={{
                uri: user.url_foto_perfil,
                // Agregar un timestamp para evitar caché en desarrollo
                cache: "reload",
              }}
              style={styles.profileImage}
              // Añadir manejadores de eventos para imagen
              onError={(e) => {
                console.error("Error al cargar imagen:", e.nativeEvent.error);
              }}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <FontAwesome name="user" size={60} color={COLORS.white} />
            </View>
          )}
          <View style={styles.editImageButton}>
            <FontAwesome name="camera" size={16} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        <Text style={styles.username}>{user.nombre_completo || "Usuario"}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {(() => {
              const rol = user.rol
                ? user.rol.toString().toLowerCase().trim()
                : "";
              if (rol.includes("estudiante")) return "Estudiante";
              if (rol.includes("propietario")) return "Propietario";
              if (rol.includes("admin")) return "Administrador";
              return user.rol || "Usuario";
            })()}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoHeader}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          {!isEditing ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <FontAwesome name="edit" size={16} color={COLORS.primary} />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(false)}
            >
              <FontAwesome name="times" size={16} color={COLORS.error} />
              <Text style={[styles.editButtonText, { color: COLORS.error }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          // Edit mode
          <View style={styles.editForm}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre completo *</Text>
              <TextInput
                style={styles.input}
                value={nombreCompleto}
                onChangeText={setNombreCompleto}
                placeholder="Tu nombre completo"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Número de teléfono</Text>
              <TextInput
                style={styles.input}
                value={numeroTelefono}
                onChangeText={setNumeroTelefono}
                placeholder="Tu número de teléfono"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Documento de identidad</Text>
              <TextInput
                style={styles.input}
                value={documentoIdentidad}
                onChangeText={setDocumentoIdentidad}
                placeholder="Tu documento de identidad"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // View mode
          <View style={styles.infoDetails}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre completo:</Text>
              <Text style={styles.infoValue}>
                {user.nombre_completo || "No especificado"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Correo electrónico:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>
                {user.numero_telefono || "No especificado"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Documento de identidad:</Text>
              <Text style={styles.infoValue}>
                {user.documento_identidad || "No especificado"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado de verificación:</Text>
              <View style={styles.verificationContainer}>
                {user.estado_verificacion ? (
                  <>
                    <FontAwesome
                      name="check-circle"
                      size={16}
                      color={COLORS.secondary}
                    />
                    <Text
                      style={[
                        styles.infoValue,
                        { color: COLORS.secondary, marginLeft: 5 },
                      ]}
                    >
                      Verificado
                    </Text>
                  </>
                ) : (
                  <>
                    <FontAwesome
                      name="exclamation-circle"
                      size={16}
                      color={COLORS.accent}
                    />
                    <Text
                      style={[
                        styles.infoValue,
                        { color: COLORS.accent, marginLeft: 5 },
                      ]}
                    >
                      Pendiente
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoading}
      >
        <FontAwesome name="sign-out" size={18} color={COLORS.white} />
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 30,
  },
  profileImageContainer: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.darkGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  infoContainer: {
    backgroundColor: COLORS.white,
    margin: 15,
    borderRadius: 10,
    padding: 15,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButtonText: {
    marginLeft: 5,
    color: COLORS.primary,
    fontWeight: "500",
  },
  infoDetails: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  verificationContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  editForm: {
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.darkGray,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: COLORS.error,
    margin: 15,
    marginTop: 0,
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
});
