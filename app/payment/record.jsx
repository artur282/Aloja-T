import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useReservationStore from '../../store/reservationStore';
import usePaymentStore from '../../store/paymentStore';
import useAuthStore from '../../store/authStore';
import supabase from '../../services/supabaseClient';
import { COLORS, PAYMENT_METHODS } from '../../utils/constants';

export default function PaymentRecordScreen() {
  const { reservationId, month } = useLocalSearchParams();
  const { selectedReservation, fetchReservationById, isLoading: isLoadingReservation } = useReservationStore();
  const { 
    paymentDetails, 
    createPayment, 
    getPaymentByReservationId, 
    uploadPaymentProof, 
    isLoading: isLoadingPayment,
    verifyPaymentAsOwner,
    checkIsPropertyOwner
  } = usePaymentStore();
  const { user } = useAuthStore();
  
  const [metodoPago, setMetodoPago] = useState('');
  const [montoPagado, setMontoPagado] = useState('');
  const [comprobantePago, setComprobantePago] = useState(null);
  const [existingPayment, setExistingPayment] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(month ? parseInt(month) : 1);
  const [monthlyAmount, setMonthlyAmount] = useState(0);
  const [isPagoRechazado, setIsPagoRechazado] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  
  useEffect(() => {
    if (reservationId) {
      loadData();
    }
  }, [reservationId, month]);
  
  const loadData = async () => {
    // Get reservation details
    await fetchReservationById(reservationId);
    
    // Si se especifica un mes, cargar el pago específico de ese mes
    if (month) {
      await loadMonthlyPayment(parseInt(month));
    } else {
      // Check if payment already exists (comportamiento original)
      const { data } = await getPaymentByReservationId(reservationId);
      
      if (data) {
        setExistingPayment(true);
        setMetodoPago(data.metodo_pago || '');
        setMontoPagado(data.monto_pagado ? data.monto_pagado.toString() : '');
        setComprobantePago(data.url_comprobante_pago || null);
        setCurrentMonth(data.mes_numero || 1);
      }
    }

    // Check if the current user is the owner of the property
    if (user) {
      const ownerCheck = await checkIsPropertyOwner(user.id, reservationId);
      setIsOwner(ownerCheck);
    }
  };

  const loadMonthlyPayment = async (monthNumber) => {
    try {
      // Obtener la reserva para conocer el precio mensual
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select('*, properties(titulo, precio_noche)')
        .eq('id', reservationId)
        .single();

      if (reservationError) throw reservationError;

      setMonthlyAmount(reservation?.properties?.precio_noche || 0);
      setMontoPagado((reservation?.properties?.precio_noche || 0).toString());

      // Buscar pago específico para este mes
      const { data: monthPayment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id_reserva', reservationId)
        .eq('mes_numero', monthNumber)
        .single();

      if (paymentError && paymentError.code !== 'PGRST116') {
        throw paymentError;
      }

      if (monthPayment) {
        // Si el pago está en estado pendiente_registro y el usuario no es propietario,
        // permitimos registrar el pago (no mostramos como existingPayment)
        if (monthPayment.estado_pago === 'pendiente_registro') {
          // Verificar si es el estudiante (no propietario)
          const ownerCheck = await checkIsPropertyOwner(user?.id, reservationId);
          if (!ownerCheck) {
            // Es estudiante, mostrar formulario de registro
            setExistingPayment(false);
          } else {
            // Es propietario, mostrar como existente
            setExistingPayment(true);
          }
        } else if (monthPayment.estado_pago === 'rechazado') {
          // Los pagos rechazados deben permitir actualización
          console.log('Cargando pago rechazado para reenvío');
          setExistingPayment(false); // Mostrar formulario para actualizar
          setIsPagoRechazado(true);
          setMotivoRechazo(monthPayment.motivo_rechazo || 'No se especificó motivo');
          
          // Cargar los datos previos para facilitar la actualización
          setMetodoPago(monthPayment.metodo_pago || '');
          setMontoPagado(monthPayment.monto_pagado ? monthPayment.monto_pagado.toString() : '');
          setComprobantePago(monthPayment.url_comprobante_pago || null);
        } else {
          // Para otros estados (verificado, pendiente), mostrar como existente
          console.log(`Pago en estado ${monthPayment.estado_pago}, mostrando como existente`);
          setExistingPayment(true);
          setIsPagoRechazado(false);
          setMotivoRechazo('');
          
          // Guardamos los datos del pago
          setMetodoPago(monthPayment.metodo_pago || '');
          setMontoPagado(monthPayment.monto_pagado ? monthPayment.monto_pagado.toString() : '');
          setComprobantePago(monthPayment.url_comprobante_pago || null);
        }
      }
      
    } catch (error) {
      console.error('Error loading monthly payment:', error);
      Alert.alert('Error', 'No se pudo cargar la información del pago mensual');
    }
  };
  
  useEffect(() => {
    if (selectedReservation) {
      // Establecer el monto según el precio mensual de la propiedad
      setMonthlyAmount(selectedReservation?.properties?.precio_noche || 0);
      if (!montoPagado) {
        setMontoPagado((selectedReservation?.properties?.precio_noche || 0).toString());
      }
    }
  }, [selectedReservation]);

  const handleSelectImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la galería de fotos');
        return;
      }
      
      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setComprobantePago(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al seleccionar la imagen');
      console.error(error);
    }
  };
  
  const validateForm = () => {
    if (!metodoPago) {
      Alert.alert('Error', 'Por favor selecciona un método de pago');
      return false;
    }
    
    if (!montoPagado || isNaN(parseFloat(montoPagado)) || parseFloat(montoPagado) <= 0) {
      Alert.alert('Error', 'El monto pagado debe ser un número válido mayor a cero');
      return false;
    }
    
    if (!comprobantePago) {
      Alert.alert('Error', 'Por favor sube un comprobante de pago');
      return false;
    }
    
    return true;
  };
  
  const handleSubmitPayment = async () => {
    if (!validateForm()) return;
    
    try {
      // First upload the payment proof image
      const { error: uploadError, publicUrl } = await uploadPaymentProof(reservationId, comprobantePago);
      
      if (uploadError) {
        Alert.alert('Error', 'No se pudo subir el comprobante de pago');
        return;
      }
      
      // Create the payment record
      const paymentData = {
        id_reserva: reservationId,
        metodo_pago: metodoPago,
        monto_pagado: parseFloat(montoPagado),
        url_comprobante_pago: publicUrl,
        estado_pago: 'pendiente',
        mes_numero: currentMonth
      };
      
      const { error } = await createPayment(paymentData);
      
      if (error) {
        Alert.alert('Error', 'No se pudo registrar el pago');
        return;
      }
      
      // Para evitar las notificaciones en blanco, en lugar de usar Alert, mostrar mensajes directamente
      // en la pantalla de gestión de pagos o usar un componente Toast si está disponible
      console.log('Pago registrado correctamente, navegando a gestión de pagos');
      
      // Si es un pago rechazado que se está reenviando, loguear para debug
      if (isPagoRechazado) {
        console.log('Actualizando pago rechazado correctamente');
      }
      
      // Navegación más directa y rápida para evitar problemas
      router.replace(`/payment/manage?reservationId=${reservationId}`);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al registrar el pago');
      console.error(error);
    }
  };

  const handleVerifyPayment = async (approved) => {
    const action = approved ? 'verificar' : 'rechazar';
    Alert.alert(
      `Confirmar ${action}`,
      `¿Estás seguro de que quieres ${action} este pago?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const { success, error } = await verifyPaymentAsOwner(paymentDetails.id, approved);
            if (success) {
              Alert.alert('Éxito', `El pago ha sido ${action}do.`);
              loadData(); // Refresh data
            } else {
              Alert.alert('Error', `No se pudo ${action} el pago: ${error}`);
            }
          },
        },
      ]
    );
  };
  
  if (isLoadingReservation) {
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
  
  if (existingPayment && paymentDetails) {
    // Show existing payment details
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={18} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del Pago</Text>
        </View>
        
        <View style={styles.paymentCard}>
          <View style={[
            styles.statusBadge,
            paymentDetails.estado_pago === 'pendiente' ? styles.pendingBadge :
            paymentDetails.estado_pago === 'verificado' ? styles.verifiedBadge :
            paymentDetails.estado_pago === 'pendiente_registro' ? styles.pendingRegBadge :
            styles.rejectedBadge
          ]}>
            <Text style={styles.statusText}>
              {paymentDetails.estado_pago === 'pendiente' ? 'Pendiente de verificación' :
               paymentDetails.estado_pago === 'verificado' ? 'Verificado' :
               paymentDetails.estado_pago === 'pendiente_registro' ? 'Pendiente de registro' :
               'Rechazado'}
            </Text>
          </View>
          
          <View style={styles.paymentDetails}>
            <Text style={styles.detailLabel}>Método de pago:</Text>
            <Text style={styles.detailValue}>{paymentDetails.metodo_pago}</Text>
          </View>
          
          <View style={styles.paymentDetails}>
            <Text style={styles.detailLabel}>Monto pagado:</Text>
            <Text style={styles.detailValue}>${paymentDetails.monto_pagado.toLocaleString()}</Text>
          </View>
          
          <View style={styles.paymentDetails}>
            <Text style={styles.detailLabel}>Fecha de registro:</Text>
            <Text style={styles.detailValue}>
              {new Date(paymentDetails.created_at).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.paymentDetails}>
            <Text style={styles.detailLabel}>Mes de pago:</Text>
            <Text style={styles.detailValue}>{paymentDetails.mes_numero}</Text>
          </View>
          
          <Text style={styles.proofTitle}>Comprobante de pago:</Text>
          {paymentDetails.url_comprobante_pago ? (
            <Image 
              source={{ uri: paymentDetails.url_comprobante_pago }} 
              style={styles.proofImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noProofContainer}>
              <FontAwesome name="file-image-o" size={40} color={COLORS.lightGray} />
              <Text style={styles.noProofText}>No se ha subido un comprobante.</Text>
            </View>
          )}
          {isOwner && paymentDetails?.estado_pago === 'pendiente' && (
            <View style={styles.ownerActionsContainer}>
              <TouchableOpacity 
                style={[styles.ownerButton, styles.approveButton]}
                onPress={() => handleVerifyPayment(true)}
              >
                <FontAwesome name="check" size={16} color={COLORS.white} />
                <Text style={styles.ownerButtonText}>Verificar Pago</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.ownerButton, styles.rejectButton]}
                onPress={() => handleVerifyPayment(false)}
              >
                <FontAwesome name="times" size={16} color={COLORS.white} />
                <Text style={styles.ownerButtonText}>Rechazar Pago</Text>
              </TouchableOpacity>
            </View>
          )}
          {(paymentDetails?.estado_pago === 'rechazado' || paymentDetails?.estado_pago === 'pendiente_registro') && !isOwner && (
            <TouchableOpacity
              style={styles.newPaymentButton}
              onPress={() => {
                setExistingPayment(false);
                setMetodoPago('');
                setMontoPagado('');
                setComprobantePago(null);
              }}
            >
              <Text style={styles.newPaymentButtonText}>
                {paymentDetails?.estado_pago === 'rechazado' ? 'Reenviar pago' : 'Registrar pago'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }
  
  if (isOwner) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={18} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del Pago</Text>
        </View>
        <View style={styles.paymentCard}>
          <Text style={styles.detailLabel}>El estudiante aún no ha registrado un pago para esta reserva.</Text>
        </View>
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
        <Text style={styles.headerTitle}>{isPagoRechazado ? 'Actualizar Pago Rechazado' : 'Registrar Pago'}</Text>
      </View>
      
      <View style={styles.reservationCard}>
        <Text style={styles.propertyTitle}>
          {selectedReservation?.properties?.titulo}
        </Text>
        <Text style={styles.reservationInfo}>
          Mes {currentMonth} de {selectedReservation?.duration_months || 1}
        </Text>
        
        {isPagoRechazado && (
          <View style={styles.rejectionInfo}>
            <Text style={styles.rejectionTitle}>Motivo del rechazo:</Text>
            <Text style={styles.rejectionText}>{motivoRechazo}</Text>
            <Text style={styles.rejectionHint}>Por favor actualiza tu comprobante de pago y envíalo nuevamente.</Text>
          </View>
        )}
      </View>
      
      <View style={styles.reservationCard}>
        <Text style={styles.reservationTitle}>Detalles de la reserva</Text>
        <View style={styles.reservationDetails}>
          <Text style={styles.propertyName}>
            {selectedReservation.properties?.titulo || 'Propiedad'}
          </Text>
          <Text style={styles.reservationDates}>
            {new Date(selectedReservation.fecha_llegada).toLocaleDateString()} - {new Date(selectedReservation.fecha_salida).toLocaleDateString()}
          </Text>
          <Text style={styles.reservationAmount}>
            Monto total: ${selectedReservation.costo_total.toLocaleString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Información del pago</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Método de pago *</Text>
          <View style={styles.paymentMethodsContainer}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodButton,
                  metodoPago === method && styles.selectedMethod
                ]}
                onPress={() => setMetodoPago(method)}
              >
                <Text style={[
                  styles.methodText,
                  metodoPago === method && styles.selectedMethodText
                ]}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Monto pagado (fijo)</Text>
          <View style={[styles.amountInput, { backgroundColor: COLORS.background }]}>
            <Text style={styles.amountPrefix}>$</Text>
            <Text style={styles.amountValue}>{monthlyAmount.toLocaleString()}</Text>
          </View>
          <Text style={styles.helperText}>
            El monto mensual es fijo y se calcula automáticamente
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Comprobante de pago *</Text>
          {comprobantePago ? (
            <View style={styles.proofContainer}>
              <Image 
                source={{ uri: comprobantePago }} 
                style={styles.proofPreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.changeProofButton}
                onPress={handleSelectImage}
              >
                <Text style={styles.changeProofText}>Cambiar imagen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleSelectImage}
            >
              <FontAwesome name="upload" size={24} color={COLORS.darkGray} />
              <Text style={styles.uploadText}>Seleccionar comprobante</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.helperText}>
            Sube una foto clara del comprobante de transferencia o depósito.
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Mes de pago (fijo)</Text>
          <View style={[styles.monthInput, { backgroundColor: COLORS.background }]}>
            <Text style={styles.monthValue}>Mes {currentMonth}</Text>
          </View>
          <Text style={styles.helperText}>
            El mes de pago es fijo y se determina automáticamente
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmitPayment}
        disabled={isLoadingPayment}
      >
        {isLoadingPayment ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitButtonText}>Registrar Pago</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.disclaimer}>
        <FontAwesome name="info-circle" size={16} color={COLORS.darkGray} />
        <Text style={styles.disclaimerText}>
          El propietario verificará tu pago y confirmará la reserva una vez validado el comprobante.
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
  rejectionInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  rejectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 5,
  },
  rejectionText: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 8,
  },
  rejectionHint: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#616161',
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
    marginLeft: -30,
  },
  reservationCard: {
    backgroundColor: COLORS.white,
    margin: 15,
    padding: 15,
    borderRadius: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  reservationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  reservationDetails: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  reservationDates: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  reservationAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    margin: 15,
    marginBottom: 0,
    padding: 15,
    borderRadius: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  methodButton: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedMethod: {
    backgroundColor: COLORS.primary,
  },
  methodText: {
    color: COLORS.text,
  },
  selectedMethodText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 12,
  },
  amountPrefix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 5,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: 'dashed',
  },
  uploadText: {
    color: COLORS.darkGray,
    marginTop: 8,
  },
  proofContainer: {
    alignItems: 'center',
  },
  proofPreview: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  changeProofButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  changeProofText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.darkGray,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 15,
    marginTop: 0,
  },
  disclaimerText: {
    marginLeft: 8,
    color: COLORS.darkGray,
    fontSize: 14,
    flex: 1,
  },
  
  // Existing payment view styles
  paymentCard: {
    backgroundColor: COLORS.white,
    margin: 15,
    padding: 15,
    borderRadius: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning,
  },
  pendingRegBadge: {
    backgroundColor: COLORS.lightGray,
  },
  verifiedBadge: {
    backgroundColor: COLORS.success,
  },
  rejectedBadge: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    color: COLORS.white,
    fontWeight: '500',
    fontSize: 12,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 15,
  },
  proofImage: {
    width: '100%',
    height: 250,
    borderRadius: 5,
  },
  noProofContainer: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProofText: {
    marginTop: 10,
    color: COLORS.darkGray,
  },
  newPaymentButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  newPaymentButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  ownerActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  ownerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  approveButton: {
    backgroundColor: COLORS.secondary,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  ownerButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  monthInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 12,
  },
  monthTextInput: {
    flex: 1,
    fontSize: 16,
  },
  monthValue: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 5,
    fontWeight: '500',
  },
  amountValue: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 5,
    fontWeight: '500',
  },
});
