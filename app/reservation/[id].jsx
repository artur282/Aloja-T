import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";
import useReservationStore from "../../store/reservationStore";
import usePaymentStore from "../../store/paymentStore";
import { COLORS } from "../../utils/constants";

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const {
    selectedReservation,
    fetchReservationById,
    cancelReservation,
    updateReservationStatus,
    isLoading,
  } = useReservationStore();

  useEffect(() => {
    if (id) {
      loadReservationData();
    }
  }, [id]);

  const loadReservationData = async () => {
    // Load reservation data
    await fetchReservationById(id);
  };

  const handleCancelReservation = () => {
    Alert.alert(
      "Cancelar Reserva",
      "¿Estás seguro que deseas cancelar esta reserva?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, Cancelar",
          style: "destructive",
          onPress: async () => {
            const { error } = await cancelReservation(id);
            if (error) {
              Alert.alert("Error", "No se pudo cancelar la reserva");
            } else {
              Alert.alert("Éxito", "Reserva cancelada correctamente", [
                { text: "OK", onPress: () => router.back() },
              ]);
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = (newStatus) => {
    const statusText = newStatus === "aceptada" ? "aceptar" : "rechazar";

    Alert.alert(
      `${newStatus === "aceptada" ? "Aceptar" : "Rechazar"} Reserva`,
      `¿Estás seguro que deseas ${statusText} esta reserva?`,
      [
        { text: "No", style: "cancel" },
        {
          text: `Sí, ${newStatus === "aceptada" ? "Aceptar" : "Rechazar"}`,
          onPress: async () => {
            const { error } = await updateReservationStatus(id, newStatus);
            if (error) {
              Alert.alert("Error", `No se pudo ${statusText} la reserva`);
            } else {
              Alert.alert("Éxito", `Reserva ${newStatus} correctamente`);
              loadReservationData();
            }
          },
        },
      ]
    );
  };

  const handleRecordPayment = () => {
    router.push(`/payment/record?reservationId=${id}`);
  };

  const handleViewPayment = () => {
    router.push(`/payment/record?reservationId=${id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!selectedReservation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la reserva</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const property = selectedReservation.properties;
  const isPending = selectedReservation.estado_reserva === "pendiente";
  const isAccepted = selectedReservation.estado_reserva === "aceptada";
  const isRejected = selectedReservation.estado_reserva === "rechazada";
  const isCancelled = selectedReservation.estado_reserva === "cancelada";
  const isPaid = selectedReservation.estado_pago;

  // Check if user is the property owner
  const isOwner = user && property && property.id_propietario === user.id;
  // Check if user is the reservation creator
  const isReservationCreator =
    user && selectedReservation.id_usuario === user.id;
  // Get property owner data
  const propertyOwnerData = property?.propietario;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={18} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de la Reserva</Text>
      </View>

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            isPending
              ? styles.pendingBadge
              : isAccepted
              ? styles.acceptedBadge
              : isRejected
              ? styles.rejectedBadge
              : styles.cancelledBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {isPending
              ? "Pendiente"
              : isAccepted
              ? "Aceptada"
              : isRejected
              ? "Rechazada"
              : "Cancelada"}
          </Text>
        </View>

        <View
          style={[
            styles.paymentBadge,
            isPaid ? styles.paidBadge : styles.unpaidBadge,
          ]}
        >
          <Text style={styles.paymentText}>
            {isPaid ? "Pagado" : "No pagado"}
          </Text>
        </View>
      </View>

      <View style={styles.propertyCard}>
        <View style={styles.imageContainer}>
          {property?.galeria_fotos && property.galeria_fotos.length > 0 ? (
            <Image
              source={{ uri: property.galeria_fotos[0] }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <FontAwesome name="home" size={40} color={COLORS.lightGray} />
              <Text style={styles.noImageText}>Sin imagen</Text>
            </View>
          )}
        </View>

        <View style={styles.propertyDetails}>
          <Text style={styles.propertyTitle} numberOfLines={2}>
            {property?.titulo || "Propiedad"}
          </Text>
          <Text style={styles.propertyLocation} numberOfLines={1}>
            <FontAwesome name="map-marker" size={14} color={COLORS.darkGray} />{" "}
            {property?.direccion || "Dirección no disponible"}
          </Text>

          <TouchableOpacity
            style={styles.viewPropertyButton}
            onPress={() => router.push(`/property/${property.id}`)}
          >
            <Text style={styles.viewPropertyText}>Ver propiedad</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Detalles de la Reserva</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ID de Reserva:</Text>
          <Text style={styles.detailText}>{id.substring(0, 8)}...</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha de llegada:</Text>
          <Text style={styles.detailText}>
            {formatDate(selectedReservation.fecha_llegada)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha de salida:</Text>
          <Text style={styles.detailText}>
            {formatDate(selectedReservation.fecha_salida)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha de reserva:</Text>
          <Text style={styles.detailText}>
            {formatDate(selectedReservation.created_at)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Costo total:</Text>
          <Text style={styles.priceText}>
            ${selectedReservation.costo_total.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Owner or Guest information */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          {isOwner
            ? "Información del Huésped"
            : "Información del Propietario"}
        </Text>

        <View style={styles.userInfo}>
          <View style={styles.userImageContainer}>
            {isOwner 
              ? (selectedReservation.users?.url_foto_perfil 
                ? <Image
                    source={{ uri: selectedReservation.users.url_foto_perfil }}
                    style={styles.userImage}
                  />
                : <View style={styles.userImagePlaceholder}>
                    <FontAwesome name="user" size={24} color={COLORS.white} />
                  </View>)
              : (propertyOwnerData?.url_foto_perfil 
                ? <Image
                    source={{ uri: propertyOwnerData.url_foto_perfil }}
                    style={styles.userImage}
                  />
                : <View style={styles.userImagePlaceholder}>
                    <FontAwesome name="user" size={24} color={COLORS.white} />
                  </View>)
            }
          </View>

          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {isOwner
                ? (selectedReservation.users?.nombre_completo || "Usuario")
                : (propertyOwnerData?.nombre_completo || "Propietario")}
            </Text>
            <Text style={styles.userEmail}>
              {isOwner
                ? (selectedReservation.users?.email || "Email no disponible")
                : (propertyOwnerData?.email || "Email no disponible")}
            </Text>
            {isOwner 
              ? (selectedReservation.users?.numero_telefono && (
                <Text style={styles.userPhone}>
                  <FontAwesome name="phone" size={14} color={COLORS.darkGray} />{" "}
                  {selectedReservation.users.numero_telefono}
                </Text>))
              : (propertyOwnerData?.numero_telefono && (
                <Text style={styles.userPhone}>
                  <FontAwesome name="phone" size={14} color={COLORS.darkGray} />{" "}
                  {propertyOwnerData.numero_telefono}
                </Text>))
            }
          </View>
        </View>
      </View>

      {/* Espacio para información adicional si es necesario */}

      {/* Actions */}
      {isPending && isReservationCreator && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelReservation}
        >
          <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
        </TouchableOpacity>
      )}

      {isPending && isOwner && (
        <View style={styles.ownerActionContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleUpdateStatus("aceptada")}
          >
            <Text style={styles.actionButtonText}>Aceptar Reserva</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleUpdateStatus("rechazada")}
          >
            <Text style={styles.actionButtonText}>Rechazar Reserva</Text>
          </TouchableOpacity>
        </View>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginLeft: -30,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 15,
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingBadge: {
    backgroundColor: COLORS.accent,
  },
  acceptedBadge: {
    backgroundColor: COLORS.secondary,
  },
  rejectedBadge: {
    backgroundColor: COLORS.error,
  },
  cancelledBadge: {
    backgroundColor: COLORS.darkGray,
  },
  statusText: {
    color: COLORS.white,
    fontWeight: "500",
    fontSize: 12,
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paidBadge: {
    backgroundColor: COLORS.secondary,
  },
  unpaidBadge: {
    backgroundColor: COLORS.accent,
  },
  paymentText: {
    color: COLORS.white,
    fontWeight: "500",
    fontSize: 12,
  },
  propertyCard: {
    backgroundColor: COLORS.white,
    margin: 15,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    height: 150,
  },
  propertyImage: {
    width: "100%",
    height: "100%",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: COLORS.darkGray,
    marginTop: 5,
  },
  propertyDetails: {
    padding: 15,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 5,
  },
  propertyLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  viewPropertyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  viewPropertyText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  detailText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginRight: 15,
  },
  userImage: {
    width: "100%",
    height: "100%",
  },
  userImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  paymentInfoText: {
    marginLeft: 10,
    flex: 1,
    color: COLORS.text,
  },
  viewPaymentButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  viewPaymentText: {
    color: COLORS.white,
    fontWeight: "500",
    fontSize: 12,
  },
  noPaymentContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noPaymentText: {
    marginTop: 10,
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  recordPaymentButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  recordPaymentText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  ownerActionContainer: {
    flexDirection: "row",
    margin: 15,
    marginTop: 0,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 5,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 5,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
