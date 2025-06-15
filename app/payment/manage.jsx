import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl 
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import useReservationStore from '../../store/reservationStore';
import usePaymentStore from '../../store/paymentStore';
import useAuthStore from '../../store/authStore';
import supabase from '../../services/supabaseClient';
import { COLORS } from '../../utils/constants';

export default function PaymentManageScreen() {
  const { reservationId } = useLocalSearchParams();
  const { selectedReservation, fetchReservationById, isLoading: isLoadingReservation } = useReservationStore();
  const { 
    verifyPaymentAsOwner,
    checkIsPropertyOwner,
    getAllPaymentsByReservation,
    isLoading: isLoadingPayment
  } = usePaymentStore();
  const { user } = useAuthStore();
  
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Usar useFocusEffect para recargar datos cuando la pantalla recibe el foco
  useFocusEffect(
    React.useCallback(() => {
      if (reservationId) {
        loadData();
      }
    }, [reservationId])
  );
  
  // Mantener el useEffect original para compatibilidad
  useEffect(() => {
    if (reservationId) {
      loadData();
    }
  }, [reservationId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar datos de la reserva
      await fetchReservationById(reservationId);
      
      // Verificar si el usuario es propietario
      if (user) {
        const ownerCheck = await checkIsPropertyOwner(user.id, reservationId);
        setIsOwner(ownerCheck);
      }
      
      // Cargar todos los pagos de la reserva
      await loadMonthlyPayments();
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMonthlyPayments = async () => {
    try {
      // Primero obtener datos de la reserva
      if (!selectedReservation) {
        await fetchReservationById(reservationId);
      }
      
      // Hacer una consulta directa a la base de datos para asegurarse de tener datos frescos
      // IMPORTANTE: No usamos el store para evitar problemas de caché
      const { data: freshPayments, error: freshError } = await supabase
        .from('payments')
        .select('*')
        .eq('id_reserva', reservationId)
        .order('mes_numero', { ascending: true });
        
      if (freshError) {
        console.error('Error fetching fresh payments:', freshError);
        throw freshError;
      }
      
      console.log('Pagos cargados directamente de la BD:', freshPayments);
      
      // Crear estructura completa de pagos mensuales
      const reservation = selectedReservation;
      const totalMonths = reservation?.duration_months || 1;
      const monthlyAmount = reservation?.properties?.precio_noche || 0;
      
      const payments = [];
      const paymentMap = new Map();
      
      // Mapear pagos existentes con datos frescos
      freshPayments.forEach(payment => {
        // Usar el mes como clave para mapear correctamente
        paymentMap.set(payment.mes_numero, payment);
        console.log(`Mes ${payment.mes_numero}: Estado: ${payment.estado_pago}`);
      });

      // Crear estructura para todos los meses
      for (let month = 1; month <= totalMonths; month++) {
        const existingPayment = paymentMap.get(month);
        const dueDate = new Date(reservation.fecha_llegada);
        dueDate.setMonth(dueDate.getMonth() + (month - 1));

        // Garantizar que se use el estado correcto del objeto de pago
        const paymentStatus = existingPayment ? existingPayment.estado_pago : 'pendiente_registro';
        
        payments.push({
          month,
          dueDate: dueDate.toISOString().split('T')[0],
          amount: monthlyAmount,
          status: paymentStatus,  // Este es el estado que se usa para mostrar el color y texto
          payment: existingPayment,
          isOverdue: new Date() > dueDate && (paymentStatus === 'pendiente' || paymentStatus === 'pendiente_registro')
        });
      }

      console.log(`Total de pagos procesados: ${payments.length}`);
      console.log('Estructura de pagos creada:', payments);
      setMonthlyPayments(payments);
      
    } catch (error) {
      console.error('Error loading monthly payments:', error);
      
      // Si hay un error al cargar los pagos, intenta crear una estructura básica
      const reservation = selectedReservation;
      
      // Verificar que la reserva existe y tiene una fecha de llegada válida
      if (reservation && reservation.fecha_llegada) {
        const totalMonths = reservation.duration_months || 1;
        const monthlyAmount = reservation.properties?.precio_noche || 0;
        const payments = [];
        
        try {
          for (let month = 1; month <= totalMonths; month++) {
            const dueDate = new Date(reservation.fecha_llegada);
            dueDate.setMonth(dueDate.getMonth() + (month - 1));

            payments.push({
              month,
              dueDate: dueDate.toISOString().split('T')[0],
              amount: monthlyAmount,
              status: 'pendiente_registro',
              payment: null,
              isOverdue: new Date() > dueDate
            });
          }
          setMonthlyPayments(payments);
        } catch (innerError) {
          console.error('Error al crear estructura básica de pagos:', innerError);
          setMonthlyPayments([]);
        }
      } else {
        console.warn('La reserva es nula o no tiene fecha de llegada, no se pueden generar pagos mensuales');
        setMonthlyPayments([]);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleVerifyPayment = async (paymentId, approved, rejectionReason = null) => {
    try {
      const result = await verifyPaymentAsOwner(paymentId, approved, rejectionReason);
      
      if (result.success) {
        Alert.alert(
          'Éxito', 
          approved ? 'Pago verificado correctamente' : 'Pago rechazado',
          [{ text: 'OK', onPress: () => loadMonthlyPayments() }]
        );
      } else {
        Alert.alert('Error', result.error || 'No se pudo procesar la verificación');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al verificar el pago');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    Alert.alert(
      "Rechazar Pago",
      "¿Está seguro que desea rechazar este pago?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Rechazar",
          style: "destructive",
          onPress: async () => {
            // Práctica temporal: usar un motivo genérico
            const motivo = "Comprobante incorrecto o ilegible";
            
            try {
              setIsLoading(true);
              await verifyPaymentAsOwner(paymentId, false, motivo);
              Alert.alert("Éxito", "Pago rechazado correctamente");
              // Importante: Recargamos datos para reflejar el cambio
              await loadMonthlyPayments();
            } catch (error) {
              Alert.alert("Error", "No se pudo rechazar el pago");
              console.error(error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const navigateToPaymentRecord = (month) => {
    console.log(`Navegando a pantalla de registro para el mes ${month}, reserva ${reservationId}`);
  
    // Usando router.push y además asegurando que los parámetros están bien formados
    const url = `/payment/record?reservationId=${reservationId}&month=${month}`;
    console.log('URL de navegación:', url);
  
    // Forzar navegación explícita
    router.push(url);
  };

  // Función para obtener el color basado en el estado
  const getStatusColor = (status) => {
    // Debug - mostrar el estado recibido
    console.log('getStatusColor recibió:', status);
    
    // Normalizar el estado para manejar cualquier formato inesperado
    const normalizedStatus = String(status).toLowerCase().trim();
    
    // Usar colores fijos en lugar de referencias a COLORS para evitar problemas
    if (normalizedStatus.includes('verifi') || normalizedStatus === 'verificado') {
      return '#4CAF50'; // Verde
    } else if (normalizedStatus.includes('pend') && !normalizedStatus.includes('registro')) {
      return '#FF9800'; // Naranja
    } else if (normalizedStatus.includes('recha') || normalizedStatus === 'rechazado') {
      return '#F44336'; // Rojo
    } else if (normalizedStatus.includes('registro') || normalizedStatus === 'pendiente_registro') {
      return '#E0E0E0'; // Gris claro
    } else {
      console.log('Estado no reconocido:', status);
      return '#E0E0E0'; // Gris claro por defecto
    }
  };
  
  // Función para obtener el texto de estado
  const getStatusText = (status) => {
    // Debug - mostrar el estado recibido
    console.log('getStatusText recibió:', status);
    
    // Normalizar el estado para manejar cualquier formato inesperado
    const normalizedStatus = String(status).toLowerCase().trim();
    
    if (normalizedStatus.includes('verifi') || normalizedStatus === 'verificado') {
      return 'Verificado';
    } else if (normalizedStatus.includes('pend') && !normalizedStatus.includes('registro')) {
      return 'Pendiente';
    } else if (normalizedStatus.includes('recha') || normalizedStatus === 'rechazado') {
      return 'Rechazado';
    } else if (normalizedStatus.includes('registro') || normalizedStatus === 'pendiente_registro') {
      return 'Pendiente de registro';
    } else {
      console.log('Estado de texto no reconocido:', status);
      return 'Estado desconocido';
    }
  };

  const renderPaymentCard = (paymentData) => {
    const { month, dueDate, amount, status, payment, isOverdue } = paymentData;
    
    // Debug: mostrar información de estado en consola
    console.log(`Renderizando tarjeta mes ${month}:`, { 
      status, 
      paymentId: payment?.id,
      paymentStatus: payment?.estado_pago
    });
    
    // Forzar el uso correcto del estado de pago con un orden de prioridad explícita
    let displayStatus;
    
    // Si tenemos un objeto de pago, siempre usar su estado_pago como fuente de verdad
    if (payment && payment.estado_pago) {
      displayStatus = payment.estado_pago;
      console.log(`Mes ${month} - Usando estado desde payment.estado_pago: ${displayStatus}`);
    } 
    // Si no hay objeto de pago pero tenemos un status, usarlo
    else if (status) {
      displayStatus = status;
      console.log(`Mes ${month} - Usando estado desde status: ${displayStatus}`);
    }
    // Valor por defecto
    else {
      displayStatus = 'pendiente_registro';
      console.log(`Mes ${month} - Usando estado por defecto: ${displayStatus}`);
    }
    
    // Normalizar el estado para comparaciones más robustas
    const normalizedStatus = displayStatus.toLowerCase().trim();
    console.log(`Mes ${month} - Estado normalizado: ${normalizedStatus}`);
    
    // Determinar color y texto de forma explícita según el estado
    let statusColor;
    let statusText;
    
    // Flag para marcar explícitamente si el pago está rechazado
    let isRejected = false;
    
    if (normalizedStatus === 'rechazado' || normalizedStatus.includes('rechaz')) {
      statusColor = '#F44336'; // Rojo
      statusText = 'Rechazado';
      isRejected = true;
      console.log(`Mes ${month} - DETECTADO COMO RECHAZADO`);
    }
    else if (normalizedStatus === 'verificado' || normalizedStatus.includes('verif')) {
      statusColor = '#4CAF50'; // Verde
      statusText = 'Verificado';
    }
    else if (normalizedStatus === 'pendiente' || normalizedStatus.includes('pend')) {
      statusColor = '#FF9800'; // Naranja
      statusText = 'Pendiente';
    }
    else {
      statusColor = '#E0E0E0'; // Gris claro
      statusText = 'Pendiente de registro';
    }
    
    console.log(`Mes ${month} - Estado final: ${displayStatus}, Color: ${statusColor}, Texto: ${statusText}`);
    
    return (
      <View key={month} style={[styles.paymentCard, isOverdue && styles.overdueCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.monthTitle}>Mes {month}</Text>
          <View 
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: statusColor,
              borderWidth: 1,
              borderColor: displayStatus === 'pendiente_registro' ? '#757575' : 'transparent'
            }}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: displayStatus === 'pendiente_registro' ? '#757575' : '#FFFFFF'
            }}>
              {statusText}
            </Text>
          </View>
        </View>
        
        <View style={styles.paymentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de pago:</Text>
            <Text style={[styles.infoValue, isOverdue && styles.overdueText]}>
              {new Date(dueDate).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monto:</Text>
            <Text style={styles.infoValue}>${amount.toFixed(2)}</Text>
          </View>
          
          {payment && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Método de pago:</Text>
                <Text style={styles.infoValue}>{payment.metodo_pago}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Monto pagado:</Text>
                <Text style={styles.infoValue}>${payment.monto_pagado}</Text>
              </View>
              
              {payment.fecha_verificacion && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Fecha verificación:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(payment.fecha_verificacion).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              {payment.motivo_rechazo && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Motivo rechazo:</Text>
                  <Text style={[styles.infoValue, styles.rejectionReason]}>
                    {payment.motivo_rechazo}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
        <View style={styles.cardActions}>
          {/* Mostrar botón de registro/reenvío SOLO para estudiantes (no propietarios) 
              y solo cuando faltan 2 días o menos para la fecha de vencimiento */}
          {!isOwner && (normalizedStatus === 'pendiente_registro' || displayStatus === 'pendiente_registro') ? (
            (() => {
              // Obtener la fecha actual
              const currentDate = new Date();
              // Convertir dueDate a objeto Date si no lo es ya
              const paymentDueDate = new Date(dueDate);
              // Calcular diferencia en días
              const timeDiff = paymentDueDate.getTime() - currentDate.getTime();
              const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
              
              // Solo mostrar si faltan 2 días o menos (o ya está vencido)
              return (daysDiff <= 2) ? (
                <TouchableOpacity 
                  style={styles.recordButton}
                  onPress={() => navigateToPaymentRecord(month)}
                >
                  <FontAwesome name="plus" size={16} color={COLORS.white} />
                  <Text style={styles.buttonText}>Registrar Pago</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.infoRow, {marginTop: 5}]}>
                  <Text style={[styles.infoValue, {textAlign: 'center', flex: 1, fontStyle: 'italic', color: COLORS.darkGray}]}>
                    Registro de pago disponible 2 días antes de la fecha de pago
                  </Text>
                </View>
              );
            })()
          ) : !isOwner && isRejected ? (
            <TouchableOpacity 
              style={[styles.recordButton, {backgroundColor: COLORS.accent}]}
              onPress={() => navigateToPaymentRecord(month)}
            >
              <FontAwesome name="refresh" size={16} color={COLORS.black} />
              <Text style={[styles.buttonText, {color: COLORS.black}]}>Reenviar Pago</Text>
            </TouchableOpacity>
          ) : null}
          
          {isOwner && displayStatus === 'pendiente' && payment && (
            <View style={styles.ownerActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleVerifyPayment(payment.id, true)}
              >
                <FontAwesome name="check" size={16} color={COLORS.white} />
                <Text style={styles.buttonText}>Aprobar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRejectPayment(payment.id)}
              >
                <FontAwesome name="times" size={16} color={COLORS.white} />
                <Text style={styles.buttonText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {payment && payment.url_comprobante_pago && (
            <TouchableOpacity 
              style={styles.viewProofButton}
              onPress={() => router.push(`/payment/proof?url=${encodeURIComponent(payment.url_comprobante_pago)}`)}
            >
              <FontAwesome name="eye" size={16} color={COLORS.primary} />
              <Text style={styles.viewProofText}>Ver Comprobante</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading || isLoadingReservation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando información de pagos...</Text>
      </View>
    );
  }

  if (!selectedReservation) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>No se pudo cargar la información de la reserva</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Pagos</Text>
        <Text style={styles.subtitle}>
          {selectedReservation.properties?.titulo}
        </Text>
        <Text style={styles.reservationInfo}>
          Duración: {selectedReservation.duration_months} meses
        </Text>
        <Text style={styles.reservationInfo}>
          Total: ${selectedReservation.costo_total}
        </Text>
      </View>
      
      {monthlyPayments.map(renderPaymentCard)}
      

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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 10,
  },
  reservationInfo: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    margin: 10,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  paymentInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  overdueText: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  rejectionReason: {
    color: COLORS.error,
    fontStyle: 'italic',
  },
  cardActions: {
    gap: 10,
  },
  recordButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 5,
    gap: 8,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 5,
    gap: 8,
  },
  approveButton: {
    backgroundColor: COLORS.secondary,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewProofButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  viewProofText: {
    color: COLORS.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontStyle: 'italic',
  },
});
