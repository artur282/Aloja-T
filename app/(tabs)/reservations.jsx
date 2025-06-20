import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useAuthStore from '../../store/authStore';
import useReservationStore from '../../store/reservationStore';
import usePropertyStore from '../../store/propertyStore';
import { COLORS } from '../../utils/constants';

export default function ReservationsScreen() {
  const { user } = useAuthStore();
  const { 
    userReservations, 
    propertyReservations, 
    fetchUserReservations, 
    fetchAllOwnerReservations,
    updateReservationStatus,
    cancelReservation,
    clearCanceledAndRejectedReservations,
    isLoading 
  } = useReservationStore();
  
  const isOwner = user?.rol === 'propietario';
  // Si es propietario, por defecto mostrar la vista de solicitudes
  const [activeTab, setActiveTab] = useState(isOwner ? 'owner' : 'user');
  
  useEffect(() => {
    // Load appropriate reservations based on user role
    if (user) {
      if (isOwner && activeTab === 'owner') {
        fetchAllOwnerReservations(user.id);
      } else {
        fetchUserReservations(user.id);
      }
    }
  }, [user, activeTab]);

  const handleViewReservation = (reservationId) => {
    router.push(`/reservation/${reservationId}`);
  };

  const handleCancelReservation = (reservationId) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro que deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, Cancelar', 
          style: 'destructive',
          onPress: async () => {
            const { error } = await cancelReservation(reservationId);
            if (error) {
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            } else {
              Alert.alert('Éxito', 'Reserva cancelada correctamente');
            }
          }
        },
      ]
    );
  };

  const handleUpdateReservationStatus = (reservationId, newStatus) => {
    const statusText = newStatus === 'aceptada' ? 'aceptar' : 'rechazar';
    
    Alert.alert(
      `${newStatus === 'aceptada' ? 'Aceptar' : 'Rechazar'} Reserva`,
      `¿Estás seguro que deseas ${statusText} esta reserva?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: `Sí, ${newStatus === 'aceptada' ? 'Aceptar' : 'Rechazar'}`, 
          onPress: async () => {
            const { error } = await updateReservationStatus(reservationId, newStatus);
            if (error) {
              Alert.alert('Error', `No se pudo ${statusText} la reserva`);
            } else {
              Alert.alert('Éxito', `Reserva ${newStatus} correctamente`);
            }
          }
        },
      ]
    );
  };
  
  const handleClearCanceledAndRejected = () => {
    Alert.alert(
      'Eliminar Reservas',
      '¿Estás seguro que deseas eliminar todas las reservas canceladas y rechazadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            console.log('Intentando eliminar reservas, rol:', user?.rol);
            const { data, error } = await clearCanceledAndRejectedReservations(user.id, user?.rol === 'propietario');
            if (error) {
              Alert.alert('Error', 'No se pudieron eliminar las reservas');
              console.error('Error al eliminar reservas:', error);
            } else {
              if (data.count === 0) {
                Alert.alert('Información', 'No hay reservas canceladas o rechazadas para eliminar');
              } else {
                Alert.alert('Éxito', `Se eliminaron ${data.count} reservas correctamente`);
              }
            }
          }
        },
      ]
    );
  };

  const renderReservationItem = ({ item }) => {
    const property = item.properties;
    const isCancelable = item.estado_reserva === 'pendiente';
    const isPending = item.estado_reserva === 'pendiente';
    const isAccepted = item.estado_reserva === 'aceptada';
    const isRejected = item.estado_reserva === 'rechazada';
    const isCancelled = item.estado_reserva === 'cancelada';
    
    return (
      <TouchableOpacity 
        style={styles.reservationCard}
        onPress={() => handleViewReservation(item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, 
            isPending ? styles.pendingBadge : 
            isAccepted ? styles.acceptedBadge : 
            isRejected ? styles.rejectedBadge : 
            styles.cancelledBadge
          ]}>
            <Text style={styles.statusText}>
              {isPending ? 'Pendiente' : 
               isAccepted ? 'Aceptada' : 
               isRejected ? 'Rechazada' : 
               'Cancelada'}
            </Text>
          </View>
          
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.propertyInfo}>
          <View style={styles.imageContainer}>
            {property?.galeria_fotos && property.galeria_fotos.length > 0 ? (
              <Image 
                source={{ uri: property.galeria_fotos[0] }} 
                style={styles.propertyImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.noImageContainer}>
                <FontAwesome name="home" size={20} color={COLORS.lightGray} />
              </View>
            )}
          </View>
          
          <View style={styles.propertyDetails}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {property?.titulo || 'Propiedad'}
            </Text>
            <Text style={styles.propertyLocation} numberOfLines={1}>
              {property?.direccion || 'Ubicación no disponible'}
            </Text>
          </View>
        </View>
        
        <View style={styles.reservationDetails}>
          <View style={styles.detailRow}>
            <FontAwesome name="calendar" size={16} color={COLORS.primary} />
            <Text style={styles.detailText}>
              {new Date(item.fecha_llegada).toLocaleDateString()} - {new Date(item.fecha_salida).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <FontAwesome name="clock-o" size={16} color={COLORS.primary} />
            <Text style={styles.detailText}>
              Duración: {item.duration_months} {Number(item.duration_months) === 1 ? 'mes' : 'meses'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <FontAwesome name="dollar" size={16} color={COLORS.primary} />
            <Text style={styles.detailText}>
              Total: ${item.costo_total}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <FontAwesome name="credit-card" size={16} color={COLORS.primary} />
            <Text style={styles.detailText}>
              Pago: {item.estado_pago ? 'Completado' : 'Pendiente'}
            </Text>
          </View>
        </View>
        
        {/* Botón para gestionar pagos mensuales - solo para reservas aceptadas */}
        {isAccepted && (
          <TouchableOpacity
            style={styles.managePaymentsButton}
            onPress={() => router.push(`/payment/manage?reservationId=${item.id}`)}
          >
            <FontAwesome name="money" size={16} color={COLORS.white} />
            <Text style={styles.managePaymentsText}>Gestionar Pagos </Text>
          </TouchableOpacity>
        )}
        
        {/* Actions for students */}
        {activeTab === 'user' && isCancelable && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelReservation(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
          </TouchableOpacity>
        )}
        
        {/* Actions for property owners */}
        {activeTab === 'owner' && isPending && (
          <View style={styles.ownerActions}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleUpdateReservationStatus(item.id, 'aceptada')}
            >
              <Text style={styles.actionButtonText}>Aceptar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleUpdateReservationStatus(item.id, 'rechazada')}
            >
              <Text style={styles.actionButtonText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Si es propietario, mostramos solo la sección de Solicitudes sin opción de cambiar */}
      {isOwner && (
        <View style={styles.tabs}>
          <View style={[styles.tab, styles.activeTab]}> 
            <Text style={[styles.tabText, styles.activeTabText]}>Solicitudes</Text>
          </View>
        </View>
      )}
      
      {/* Botón para limpiar reservas canceladas/rechazadas */}
      {!isLoading && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearCanceledAndRejected}
            disabled={isLoading}
          >
            <FontAwesome name="trash" size={14} color={COLORS.white} />
            <Text style={styles.clearButtonText}>Eliminar canceladas/rechazadas</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'user' ? userReservations : propertyReservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={50} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>
                {activeTab === 'user' 
                  ? 'No tienes reservas aún' 
                  : 'No tienes solicitudes de reserva'}
              </Text>
              {activeTab === 'user' && (
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => router.push('/')}
                >
                  <Text style={styles.exploreButtonText}>Explorar propiedades</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  reservationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
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
    fontWeight: '500',
    fontSize: 12,
  },
  dateText: {
    color: COLORS.darkGray,
    fontSize: 12,
  },
  propertyInfo: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 10,
    marginBottom: 10,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  propertyLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  reservationDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  detailText: {
    marginLeft: 10,
    color: COLORS.text,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  ownerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginRight: 5,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginLeft: 5,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  managePaymentsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  managePaymentsText: {
    color: COLORS.white,
    fontWeight: '500',
    marginLeft: 5,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  exploreButton: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearButton: {
    backgroundColor: COLORS.error,
    borderRadius: 5,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
});
