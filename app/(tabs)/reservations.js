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
    isLoading 
  } = useReservationStore();
  
  const [activeTab, setActiveTab] = useState('user');
  const isOwner = user?.rol === 'propietario';
  
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
            <MaterialCommunityIcons name="calendar-range" size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>
              {new Date(item.fecha_llegada).toLocaleDateString()} - {new Date(item.fecha_salida).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <FontAwesome name="dollar" size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>
              Total: ${item.costo_total.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <FontAwesome name="credit-card" size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>
              Estado de pago: {item.estado_pago ? 'Pagado' : 'Pendiente'}
            </Text>
          </View>
        </View>
        
        {/* Actions for student */}
        {activeTab === 'user' && isCancelable && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelReservation(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
          </TouchableOpacity>
        )}
        
        {/* Actions for property owner */}
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
      {isOwner && (
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'user' && styles.activeTab]}
            onPress={() => setActiveTab('user')}
          >
            <Text style={[styles.tabText, activeTab === 'user' && styles.activeTabText]}>
              Mis Reservas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'owner' && styles.activeTab]}
            onPress={() => setActiveTab('owner')}
          >
            <Text style={[styles.tabText, activeTab === 'owner' && styles.activeTabText]}>
              Solicitudes
            </Text>
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
});
