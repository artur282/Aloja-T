import supabase from './supabaseClient';

// Simplified payment approach without Mercado Pago integration
// This is a client-side implementation for demonstration purposes

// Record payment in database after user submits payment proof
export const recordPayment = async (paymentData) => {
  try {
    // Set default status to 'pendiente' (pending verification)
    const paymentWithStatus = {
      ...paymentData,
      estado_pago: 'pendiente'
    };

    const { data, error } = await supabase
      .from('payments')
      .insert([paymentWithStatus])
      .select()
      .single();
      
    if (error) throw error;
    
    // The reservation's payment status will be updated only upon verification.
    
    return { success: true, data };
  } catch (error) {
    console.error('Error recording payment:', error);
    return { success: false, error: error.message };
  }
};

// Verify payment by property owner
export const verifyPaymentByOwner = async (paymentId, approved = true, rejectionReason = null) => {
  try {
    // First get the payment to verify it exists
    const { data: paymentData, error: fetchError } = await supabase
      .from('payments')
      .select('id, id_reserva')
      .eq('id', paymentId)
      .single();
    
    if (fetchError) throw fetchError;
    if (!paymentData) throw new Error('Pago no encontrado');
    
    // Update the payment status
    const newStatus = approved ? 'verificado' : 'rechazado';
    
    const updateData = { 
      estado_pago: newStatus,
      verificado_por_propietario: true,
      fecha_verificacion: new Date().toISOString()
    };
    
    // Add rejection reason if applicable
    if (!approved && rejectionReason) {
      updateData.motivo_rechazo = rejectionReason;
    }
    
    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();
      
    if (error) throw error;
    
    // Update the reservation payment status as well
    const reservationStatus = approved ? true : false;
    const { error: reservationError } = await supabase
      .from('reservations')
      .update({ estado_pago: reservationStatus })
      .eq('id', paymentData.id_reserva);
    
    if (reservationError) throw reservationError;
    
    // Create notification for the student
    await createPaymentVerificationNotification(paymentData.id_reserva, approved);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to create notification for the student when payment is verified
const createPaymentVerificationNotification = async (reservationId, approved) => {
  try {
    // Get reservation data with user info
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select(`
        id,
        id_usuario,
        id_propiedad,
        properties(id, id_propietario, titulo)
      `)
      .eq('id', reservationId)
      .single();
      
    if (reservationError) throw reservationError;
    
    // Create notification message
    const titulo = approved 
      ? 'Pago verificado' 
      : 'Pago rechazado';
      
    const mensaje = approved
      ? `Tu pago para la reserva en "${reservation.properties.titulo}" ha sido verificado.`
      : `Tu pago para la reserva en "${reservation.properties.titulo}" ha sido rechazado. Por favor revisa los detalles.`;
    
    // Insert notification
    await supabase
      .from('notifications')
      .insert({
        titulo,
        mensaje,
        tipo: 'pago',
        id_usuario_destinatario: reservation.id_usuario,
        id_referencia: reservationId,
        tipo_referencia: 'reservacion'
      });
      
  } catch (error) {
    console.error('Error creating payment notification:', error);
  }
};

// Check if user is the property owner for a reservation
export const isPropertyOwner = async (userId, reservationId) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        properties(id, id_propietario)
      `)
      .eq('id', reservationId)
      .single();
    
    if (error) throw error;
    
    return data?.properties?.id_propietario === userId;
  } catch (error) {
    console.error('Error checking property owner:', error);
    return false;
  }
};

// Process refund request
export const processRefundRequest = async (paymentId, reason) => {
  try {
    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, id_reserva')
      .eq('id', paymentId)
      .single();
      
    if (paymentError) throw paymentError;
    
    // Update payment record with refund request
    const { data, error } = await supabase
      .from('payments')
      .update({ 
        estado_pago: 'reembolso_solicitado',
        motivo_reembolso: reason,
        fecha_solicitud_reembolso: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Create notification for property owner
    await createRefundRequestNotification(payment.id_reserva, reason);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error requesting refund:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to create notification for the property owner when refund is requested
const createRefundRequestNotification = async (reservationId, reason) => {
  try {
    // Get reservation data with property and owner info
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select(`
        id,
        id_usuario,
        id_propiedad,
        properties(id, id_propietario, titulo),
        users(id, nombre, apellido)
      `)
      .eq('id', reservationId)
      .single();
      
    if (reservationError) throw reservationError;
    
    // Create notification for property owner
    await supabase
      .from('notifications')
      .insert({
        titulo: 'Solicitud de reembolso',
        mensaje: `${reservation.users.nombre} ${reservation.users.apellido} ha solicitado un reembolso para su reserva en "${reservation.properties.titulo}".`,
        tipo: 'reembolso',
        id_usuario_destinatario: reservation.properties.id_propietario,
        id_referencia: reservationId,
        tipo_referencia: 'reservacion'
      });
      
  } catch (error) {
    console.error('Error creating refund notification:', error);
  }
};
