import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image,
  TextInput
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import usePropertyStore from '../../store/propertyStore';
import useReservationStore from '../../store/reservationStore';
import { COLORS } from '../../utils/constants';

export default function ReservationRequestScreen() {
  // Obtener el ID de la propiedad de los parámetros de la URL
  const params = useLocalSearchParams();
  const propertyId = params.propertyId;
  
  const { user } = useAuthStore();
  const { selectedProperty, fetchPropertyById, isLoading: isLoadingProperty } = usePropertyStore();
  const { createReservation, isLoading: isLoadingReservation } = useReservationStore();
  
  // Start date will be based on current date
  const [startDateStr, setStartDateStr] = useState(new Date().toISOString().split('T')[0]);
  // Use months for duration instead of specific end date
  const [durationMonths, setDurationMonths] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  // Estado para controlar la visibilidad del diálogo de confirmación
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Calculate end date based on start date + duration months (for display only)
  const calculateEndDate = (start, months) => {
    const startDate = new Date(start);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + months);
    return endDate.toISOString().split('T')[0];
  };
  
  // Computed end date (for display only)
  const [endDateStr, setEndDateStr] = useState(
    calculateEndDate(startDateStr, durationMonths)
  );
  
  // Fetch property details when propertyId is available
  useEffect(() => {
    if (propertyId) {
      fetchPropertyById(propertyId);
    }
  }, [propertyId]);
  
  // Update end date whenever start date or duration months changes
  useEffect(() => {
    setEndDateStr(calculateEndDate(startDateStr, durationMonths));
  }, [startDateStr, durationMonths]);
  
  // Calculate total price based on monthly price and duration
  useEffect(() => {
    if (selectedProperty) {
      // Calculate total price by multiplying monthly price by number of months
      const monthlyPrice = selectedProperty.precio_noche; // precio_noche now represents price per month
      setTotalPrice(monthlyPrice * durationMonths);
    }
  }, [selectedProperty, durationMonths]);
  
  // Función para mostrar el diálogo de confirmación
  const handleShowConfirmation = () => {
    // Get current date without time portion for fair comparison
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Ensure we have a valid start date
    let start = new Date(startDateStr);
    
    if (isNaN(start.getTime())) {
      // If invalid date, default to today
      start = currentDate;
      setStartDateStr(currentDate.toISOString().split('T')[0]);
    }
    
    // If date is in the past, automatically use today's date
    if (start < currentDate) {
      start = currentDate;
      setStartDateStr(currentDate.toISOString().split('T')[0]);
      // Recalculate end date
      setEndDateStr(calculateEndDate(currentDate.toISOString().split('T')[0], durationMonths));
    }
    
    // Validate duration
    if (durationMonths < 1) {
      Alert.alert('Error', 'La duración mínima es de 1 mes');
      return;
    }
    
    // Mostrar diálogo de confirmación
    setShowConfirmation(true);
  };

  // Función que ejecuta la creación de la reserva después de confirmar
  const handleCreateReservation = async () => {
    try {
      // Ocultar el diálogo de confirmación
      setShowConfirmation(false);
      
      // Create reservation data
      const reservationData = {
        id_usuario: user.id,
        id_propiedad: propertyId,
        fecha_llegada: startDateStr,
        fecha_salida: endDateStr, // This is now calculated based on start date + months
        duration_months: durationMonths, // New field for database
        costo_total: totalPrice,
        estado_reserva: 'pendiente',
        estado_pago: false
      };
      
      const { data, error } = await createReservation(reservationData);
      
      if (error) {
        // Mostramos el mensaje específico si ya tiene una solicitud pendiente
        const errorMsg = error.message && error.message.includes('solicitud de reserva pendiente') 
          ? error.message 
          : 'No se pudo crear la reserva';
        Alert.alert('Aviso', errorMsg);
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
  
  // Función para cancelar la confirmación
  const handleCancelReservation = () => {
    setShowConfirmation(false);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };
  
  // Handle date input changes
  const handleStartDateChange = (text) => {
    // Basic validation for YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(text) || text === '') {
      setStartDateStr(text);
    }
  };
  
  const handleEndDateChange = (text) => {
    // Basic validation for YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(text) || text === '') {
      setEndDateStr(text);
    }
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
            ${selectedProperty.precio_noche.toLocaleString()} <Text style={styles.perNight}>/ mes</Text>
          </Text>
        </View>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Detalles de tu estancia</Text>
        
        {/* Fecha de llegada */}
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Fecha de llegada:</Text>
          <TextInput
            style={styles.dateInput}
            value={startDateStr}
            onChangeText={(text) => {
              // Basic validation for YYYY-MM-DD format
              if (/^\d{4}-\d{2}-\d{2}$/.test(text) || text === '') {
                setStartDateStr(text);
              }
            }}
            placeholder="AAAA-MM-DD"
            keyboardType="default"
          />
        </View>
        <Text style={styles.dateHelperText}>{formatDate(startDateStr)}</Text>
        
        {/* Duration selector */}
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Duración del alquiler:</Text>
          <View style={styles.durationSelector}>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => durationMonths > 1 && setDurationMonths(durationMonths - 1)}
              disabled={durationMonths <= 1}
            >
              <Text style={styles.durationButtonText}>-</Text>
            </TouchableOpacity>
            
            <View style={styles.durationDisplay}>
              <Text style={styles.durationText}>{durationMonths} {durationMonths === 1 ? 'mes' : 'meses'}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setDurationMonths(durationMonths + 1)}
            >
              <Text style={styles.durationButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Display calculated end date */}
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Fecha de salida (estimada):</Text>
          <Text style={styles.calculatedEndDate}>{formatDate(endDateStr)}</Text>
        </View>
      </View>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Resumen de precio</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            Alquiler mensual
          </Text>
          <Text style={styles.priceValue}>
            ${selectedProperty.precio_noche.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            Duración
          </Text>
          <Text style={styles.priceValue}>
            {durationMonths} {durationMonths === 1 ? 'mes' : 'meses'}
          </Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${totalPrice.toLocaleString()}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.reserveButton}
        onPress={handleShowConfirmation}
        disabled={isLoadingReservation}
      >
        {isLoadingReservation ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.reserveButtonText}>Solicitar Reserva</Text>
        )}
      </TouchableOpacity>
      
      {/* Diálogo de confirmación */}
      {showConfirmation && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationDialog}>
            <Text style={styles.confirmationTitle}>Confirmar Reserva</Text>
            
            <Text style={styles.confirmationText}>
              ¿Estás seguro de que deseas solicitar esta reserva por {durationMonths} {durationMonths === 1 ? 'mes' : 'meses'}?
            </Text>
            
            <Text style={styles.confirmationDetails}>
              Propiedad: {selectedProperty?.titulo}
            </Text>
            <Text style={styles.confirmationDetails}>
              Fecha inicio: {formatDate(startDateStr)}
            </Text>
            <Text style={styles.confirmationDetails}>
              Fecha fin: {formatDate(endDateStr)}
            </Text>
            <Text style={styles.confirmationDetails}>
              Costo total: ${totalPrice.toLocaleString()}
            </Text>
            
            <View style={styles.confirmationButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelReservation}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleCreateReservation}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
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
  // Form layout styles
  formRow: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateInput: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 5,
    fontSize: 14,
  },
  dateHelperText: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 15,
  },
  calculatedEndDate: {
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 5,
  },
  
  // Duration selector styles
  durationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  durationButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  durationDisplay: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
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
  // Estilos para el diálogo de confirmación
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  confirmationDialog: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmationDetails: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
