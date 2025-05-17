import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import usePropertyStore from '../../store/propertyStore';
import { COLORS } from '../../utils/constants';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams();
  const { selectedProperty, fetchPropertyById, isLoading } = usePropertyStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchPropertyById(id);
    }
  }, [id]);

  const handleCallOwner = () => {
    if (selectedProperty?.users?.numero_telefono) {
      Linking.openURL(`tel:${selectedProperty.users.numero_telefono}`);
    } else {
      Alert.alert('Error', 'No hay número de teléfono disponible');
    }
  };

  const handleWhatsApp = () => {
    if (selectedProperty?.users?.numero_telefono) {
      const message = `Hola, estoy interesado/a en tu propiedad "${selectedProperty.titulo}" en Alojate.`;
      Linking.openURL(`whatsapp://send?phone=${selectedProperty.users.numero_telefono}&text=${encodeURIComponent(message)}`);
    } else {
      Alert.alert('Error', 'No hay número de teléfono disponible');
    }
  };

  const handleReservationRequest = () => {
    router.push(`/reservation/request?propertyId=${id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!selectedProperty) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la propiedad</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Property Gallery */}
      <View style={styles.galleryContainer}>
        {selectedProperty.galeria_fotos && selectedProperty.galeria_fotos.length > 0 ? (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const contentOffset = e.nativeEvent.contentOffset.x;
                const index = Math.round(contentOffset / width);
                setCurrentImageIndex(index);
              }}
            >
              {selectedProperty.galeria_fotos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            
            {/* Image Indicator */}
            {selectedProperty.galeria_fotos.length > 1 && (
              <View style={styles.indicatorContainer}>
                {selectedProperty.galeria_fotos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentImageIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.noImageContainer}>
            <FontAwesome name="home" size={60} color={COLORS.lightGray} />
            <Text style={styles.noImageText}>Sin imágenes disponibles</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
      {/* Property Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.propertyTitle}>{selectedProperty.titulo}</Text>
        
        <View style={styles.locationContainer}>
          <FontAwesome name="map-marker" size={16} color={COLORS.darkGray} />
          <Text style={styles.locationText}>{selectedProperty.direccion}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            ${selectedProperty.precio_noche.toLocaleString()}
            <Text style={styles.perNightText}> / Mes</Text>
          </Text>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="apartment" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {selectedProperty.tipo_propiedad || 'Propiedad'}
              </Text>
            </View>
            
            {selectedProperty.capacidad && (
              <View style={styles.infoItem}>
                <FontAwesome name="users" size={18} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  {selectedProperty.capacidad} {selectedProperty.capacidad === 1 ? 'persona' : 'personas'}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>
            {selectedProperty.descripcion || 'No hay descripción disponible para esta propiedad.'}
          </Text>
        </View>
        
        {/* Services */}
        {selectedProperty.servicios && selectedProperty.servicios.length > 0 && (
          <View style={styles.servicesContainer}>
            <Text style={styles.sectionTitle}>Servicios</Text>
            <View style={styles.servicesList}>
              {selectedProperty.servicios.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <FontAwesome name="check" size={14} color={COLORS.primary} />
                  <Text style={styles.serviceText}>
                    {service.charAt(0).toUpperCase() + service.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Owner Info */}
        <View style={styles.ownerContainer}>
          <Text style={styles.sectionTitle}>Propietario</Text>
          <View style={styles.ownerInfo}>
            <View style={styles.ownerImageContainer}>
              {selectedProperty.users?.url_foto_perfil ? (
                <Image
                  source={{ uri: selectedProperty.users.url_foto_perfil }}
                  style={styles.ownerImage}
                />
              ) : (
                <View style={styles.ownerPlaceholder}>
                  <FontAwesome name="user" size={24} color={COLORS.white} />
                </View>
              )}
            </View>
            <Text style={styles.ownerName}>
              {selectedProperty.users?.nombre_completo || 'Propietario'}
            </Text>
          </View>
        </View>
        
        {/* Contact Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleCallOwner}
          >
            <FontAwesome name="phone" size={18} color={COLORS.white} />
            <Text style={styles.buttonText}>Llamar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.contactButton, styles.whatsappButton]}
            onPress={handleWhatsApp}
          >
            <FontAwesome name="whatsapp" size={18} color={COLORS.white} />
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
        
        {/* Reserve Button */}
        <TouchableOpacity
          style={styles.reserveButton}
          onPress={handleReservationRequest}
        >
          <Text style={styles.reserveButtonText}>Solicitar Reserva</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  galleryContainer: {
    position: 'relative',
    height: 250,
  },
  galleryImage: {
    width,
    height: 250,
  },
  noImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 10,
    color: COLORS.darkGray,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: COLORS.white,
  },
  backIconButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  priceContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  perNightText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: COLORS.darkGray,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 8,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  servicesContainer: {
    marginBottom: 20,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceText: {
    marginLeft: 8,
    color: COLORS.text,
  },
  ownerContainer: {
    marginBottom: 20,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 10,
  },
  ownerImage: {
    width: '100%',
    height: '100%',
  },
  ownerPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  actionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  contactButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    marginRight: 0,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '500',
    marginLeft: 8,
  },
  reserveButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
