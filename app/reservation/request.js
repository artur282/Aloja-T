import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import useAuthStore from '../../store/authStore';
import usePropertyStore from '../../store/propertyStore';
import useReservationStore from '../../store/reservationStore';
import { COLORS } from '../../utils/constants';

export default function ReservationRequestScreen() {
  const { propertyId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { selectedProperty, fetchPropertyById, isLoading: isLoadingProperty } = usePropertyStore();
  const { createReservation, isLoading: isLoadingReservation } = useReservationStore();
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nightsCount, setNightsCount] = useState(1);
  
  useEffect(() => {
    if (propertyId) {
      fetchPropertyById(propertyId);
    }
  }, [propertyId]);
  
  useEffect(() => {
    // Calculate nights and total price whenever dates change
    if (startDate && endDate) {
      const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      setNightsCount(Math.max(1, nights));
      
      if (selectedProperty) {
        setTotalPrice(selectedProperty.precio_noche * Math.max(1, nights));
      }
    }
  }, [startDate, endDate, selectedProperty]);
  
  const handleCreateReservation = async () => {
    try {
      // Validate dates
      if (startDate >= endDate) {
        Alert.alert('Error', 'La fecha de llegada debe ser anterior a la fecha de salida');
        return;
      }
      
      if (startDate < new Date()) {
        Alert.alert('Error', 'La fecha de llegada no puede ser en el pasado');
        return;
      }
      
      // Create reservation data
      const reservationData = {
        id_usuario: user.id,
        id_propiedad: propertyId,
        fecha_llegada: startDate.toISOString().split('T')[0],
        fecha_salida: endDate.toISOString().split('T')[0],
        costo_total: totalPrice,
        estado_reserva: 'pendiente',
        estado_pago: false
      };
      
      const { data, error } = await createReservation(reservationData);
      
      if (error) {
        Alert.alert('Error', 'No se pudo crear la reserva');
        return;
      }
      
      Alert.alert(
        'Éxito', 
        'Reserva creada correctamente. El propietario confirmará tu solicitud pronto.',
        [{ text: 'OK', onPress: () => router.push('/reservations') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al crear la reserva');
      console.error(error);
    }
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (isLoadingProperty) {
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={18} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitar Reserva</Text>
      </View>
      
      <View style={styles.propertyCard}>
        <View style={styles.imageContainer}>
          {selectedProperty.galeria_fotos && selectedProperty.galeria_fotos.length > 0 ? (
            <Image 
              source={{ uri: selectedProperty.galeria_fotos[0] }} 
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
            {selectedProperty.titulo}
          </Text>
          <Text style={styles.propertyLocation} numberOfLines={1}>
            <FontAwesome name="map-marker" size={14} color={COLORS.darkGray} /> {selectedProperty.direccion}
          </Text>
          <Text style={styles.propertyPrice}>
            ${selectedProperty.precio_noche.toLocaleString()} <Text style={styles.perNight}>/ noche</Text>
          </Text>
        </View>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Fechas de tu estancia</Text>
        
        <View style={styles.dateSelectionContainer}>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateLabel}>Llegada</Text>
            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          
          <View style={styles.dateSeparator}>
            <FontAwesome name="arrow-right" size={16} color={COLORS.darkGray} />
          </View>
          
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={styles.dateLabel}>Salida</Text>
            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.nightsCount}>
          {nightsCount} {nightsCount === 1 ? 'noche' : 'noches'}
        </Text>
        
        <DatePicker
          modal
          open={showStartDatePicker}
          date={startDate}
          minimumDate={new Date()}
          onConfirm={(date) => {
            setStartDate(date);
            setShowStartDatePicker(false);
            
            // Ensure end date is after start date
            if (date >= endDate) {
              const newEndDate = new Date(date);
              newEndDate.setDate(date.getDate() + 1);
              setEndDate(newEndDate);
            }
          }}
          onCancel={() => setShowStartDatePicker(false)}
          mode="date"
          locale="es"
        />
        
        <DatePicker
          modal
          open={showEndDatePicker}
          date={endDate}
          minimumDate={new Date(startDate.getTime() + 86400000)} // Start date + 1 day
          onConfirm={(date) => {
            setEndDate(date);
            setShowEndDatePicker(false);
          }}
          onCancel={() => setShowEndDatePicker(false)}
          mode="date"
          locale="es"
        />
      </View>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Resumen de precio</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            ${selectedProperty.precio_noche.toLocaleString()} x {nightsCount} {nightsCount === 1 ? 'noche' : 'noches'}
          </Text>
          <Text style={styles.priceValue}>
            ${(selectedProperty.precio_noche * nightsCount).toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${totalPrice.toLocaleString()}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.reserveButton}
        onPress={handleCreateReservation}
        disabled={isLoadingReservation}
      >
        {isLoadingReservation ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.reserveButtonText}>Solicitar Reserva</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.disclaimer}>
        <FontAwesome name="info-circle" size={16} color={COLORS.darkGray} />
        <Text style={styles.disclaimerText}>
          No se te cobrará aún. El propietario debe confirmar la disponibilidad.
        </Text>
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
    marginBottom: 20,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: -30, // To center the text accounting for back button
  },
  propertyCard: {
    backgroundColor: COLORS.white,
    margin: 15,
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  imageContainer: {
    height: 150,
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
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  perNight: {
    fontSize: 14,
    fontWeight: 'normal',
    color: COLORS.darkGray,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    margin: 15,
    padding: 15,
    borderRadius: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  dateSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateInput: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 5,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  dateValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  dateSeparator: {
    marginHorizontal: 10,
  },
  nightsCount: {
    textAlign: 'center',
    color: COLORS.darkGray,
    fontStyle: 'italic',
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  priceValue: {
    fontSize: 16,
    color: COLORS.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  reserveButton: {
    backgroundColor: COLORS.secondary,
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    marginTop: 0,
  },
  disclaimerText: {
    marginLeft: 8,
    color: COLORS.darkGray,
    fontSize: 14,
    flex: 1,
  },
});
