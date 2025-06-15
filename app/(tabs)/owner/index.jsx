import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useAuthStore from '../../../store/authStore';
import usePropertyStore from '../../../store/propertyStore';
import useReservationStore from '../../../store/reservationStore';
import { COLORS } from '../../../utils/constants';

export default function OwnerPropertiesScreen() {
  const { user } = useAuthStore();
  const { userProperties, fetchUserProperties, deleteProperty, isLoading } = usePropertyStore();
  const { propertyReservations, fetchAllOwnerReservations } = useReservationStore();
  const [refreshing, setRefreshing] = useState(false);
  
  // Mostrar todas las propiedades, excepto las marcadas como inactivas
  const filteredProperties = useMemo(() =>
    userProperties.filter((p) => p.estado !== 'inactivo'),
    [userProperties]
  );

  // Protección de ruta: solo propietarios pueden acceder
  useEffect(() => {
    if (user && user.rol !== 'propietario') {
      // Si no es propietario, redirigir a la página principal
      Alert.alert(
        'Acceso restringido',
        'Esta sección está disponible solo para usuarios propietarios.',
        [{ text: 'Entendido', onPress: () => router.replace('/') }]
      );
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    if (user) {
      await Promise.all([
        fetchUserProperties(user.id),
        fetchAllOwnerReservations(user.id),
      ]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  const handleAddProperty = () => {
    router.push('/owner/add');
  };

  const handleEditProperty = (propertyId) => {
    router.push(`/owner/edit/${propertyId}`);
  };

  const handleDeleteProperty = (propertyId) => {
    // Verificar si la propiedad está reservada
    const property = userProperties.find((p) => p.id === propertyId);
    if (property && property.estado === 'reservado') {
      Alert.alert(
        'Acción no permitida',
        'No puedes eliminar una propiedad que actualmente tiene una reserva activa.'
      );
      return;
    }

    Alert.alert(
      'Eliminar Propiedad',
      '¿Estás seguro que deseas eliminar esta propiedad? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteProperty(propertyId);
            if (error) {
              Alert.alert('Error', 'No se pudo eliminar la propiedad');
            } else {
              Alert.alert('Éxito', 'Propiedad eliminada correctamente');
            }
          }
        },
      ]
    );
  };

  const renderPropertyItem = ({ item }) => (
    <View style={styles.propertyCard}>
      <View style={styles.imageContainer}>
        {item.galeria_fotos && item.galeria_fotos.length > 0 ? (
          <Image 
            source={{ uri: item.galeria_fotos[0] }} 
            style={styles.propertyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImageContainer}>
            <FontAwesome name="image" size={40} color={COLORS.lightGray} />
            <Text style={styles.noImageText}>Sin imagen</Text>
          </View>
        )}
        
        <View style={[
          styles.statusBadge,
          item.estado === 'disponible' ? styles.availableBadge :
          item.estado === 'reservado' ? styles.reservedBadge :
          styles.inactiveBadge
        ]}>
          <Text style={styles.statusText}>
            {item.estado === 'disponible' ? 'Disponible' :
             item.estado === 'reservado' ? 'Reservado' :
             'Inactivo'}
          </Text>
        </View>
      </View>
      
      <View style={styles.propertyDetails}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {item.titulo}
        </Text>
        
        <Text style={styles.propertyLocation} numberOfLines={1}>
          <FontAwesome name="map-marker" size={14} color={COLORS.darkGray} /> 
          {item.ciudad ? `${item.ciudad} - ` : ""}{item.direccion}
        </Text>
        
        <View style={styles.propertyStats}>
          <Text style={styles.propertyPrice}>
            ${item.precio_noche.toLocaleString()} <Text style={styles.perNight}>/ mes</Text>
          </Text>
          
          {item.tipo_propiedad && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {item.tipo_propiedad}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditProperty(item.id)}
          >
            <FontAwesome name="edit" size={14} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProperty(item.id)}
          >
            <FontAwesome name="trash" size={14} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddProperty}
      >
        <FontAwesome name="plus" size={16} color={COLORS.white} />
        <Text style={styles.addButtonText}>Agregar Propiedad</Text>
      </TouchableOpacity>
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="apartment" size={60} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No tienes propiedades registradas</Text>
              <Text style={styles.emptySubtext}>Agrega una propiedad para comenzar a recibir reservas</Text>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    padding: 15,
    margin: 15,
    borderRadius: 10,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
    paddingTop: 0,
  },
  propertyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    height: 150,
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: COLORS.darkGray,
    marginTop: 5,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  availableBadge: {
    backgroundColor: COLORS.secondary,
  },
  reservedBadge: {
    backgroundColor: COLORS.accent,
  },
  inactiveBadge: {
    backgroundColor: COLORS.darkGray,
  },
  statusText: {
    color: COLORS.white,
    fontWeight: '500',
    fontSize: 12,
  },
  propertyDetails: {
    padding: 15,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  propertyLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  perNight: {
    fontSize: 12,
    fontWeight: 'normal',
    color: COLORS.darkGray,
  },
  typeBadge: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  typeText: {
    color: COLORS.darkGray,
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 0,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    marginRight: 0,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '500',
    marginLeft: 5,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 5,
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});
