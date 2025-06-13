import { create } from 'zustand';
import supabase from '../services/supabaseClient';
import { verifyPaymentByOwner, isPropertyOwner } from '../services/paymentService';

const usePaymentStore = create((set, get) => ({
  paymentDetails: null,
  isLoading: false,
  error: null,
  
  // Create a new payment record
  createPayment: async (paymentData) => {
    set({ isLoading: true, error: null });
    try {
      /*
        Nueva lógica de pagos mensuales:
        1. Obtenemos la reserva para conocer la duración (duration_months).
        2. Recuperamos todos los pagos existentes de esa reserva.
        3. Identificamos el siguiente mes pendiente (o rechazado) a pagar.
        4. Si existe un pago rechazado para ese mes, lo actualizamos; en caso contrario insertamos uno nuevo.
      */

      // 1. Traer datos de la reserva para saber cuántos meses dura
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select('id, duration_months')
        .eq('id', paymentData.id_reserva)
        .single();

      if (reservationError) throw reservationError;

      const totalMonths = reservation?.duration_months || 1; // fallback por seguridad

      // 2. Traer todos los pagos existentes para la reserva
      const { data: existingPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('id_reserva', paymentData.id_reserva);

      if (paymentsError) throw paymentsError;

      // Crear un mapa mes -> pago existente
      const monthMap = new Map();
      existingPayments.forEach((p) => {
        monthMap.set(p.mes_numero, p);
      });

      let targetMonth = null;
      // 3. Buscar el primer mes sin pago verificado o pendiente
      for (let m = 1; m <= totalMonths; m++) {
        const pay = monthMap.get(m);
        if (!pay) {
          targetMonth = m; // mes sin registro
          break;
        }
        if (pay.estado_pago === 'rechazado') {
          targetMonth = m; // mes con pago rechazado (se puede reintentar)
          break;
        }
      }

      if (!targetMonth) {
        throw new Error('Todos los meses de la reserva ya tienen pagos registrados.');
      }

      let data;
      const existingForMonth = monthMap.get(targetMonth);
      const commonFields = {
        ...paymentData,
        mes_numero: targetMonth,
        estado_pago: 'pendiente',
        verificado_por_propietario: null,
        fecha_verificacion: null,
        motivo_rechazo: null,
      };

      if (existingForMonth && existingForMonth.estado_pago === 'rechazado') {
        // 4.a Actualizar pago rechazado con la nueva info
        const { data: updated, error: updateError } = await supabase
          .from('payments')
          .update(commonFields)
          .eq('id', existingForMonth.id)
          .select()
          .single();
        if (updateError) throw updateError;
        data = updated;
      } else {
        // 4.b Insertar nuevo pago para el mes
        const { data: inserted, error: insertError } = await supabase
          .from('payments')
          .insert([commonFields])
          .select()
          .single();
        if (insertError) throw insertError;
        data = inserted;
      }

      set({ paymentDetails: data, isLoading: false });
      return { data };
    } catch (error) {
      console.error('Error creating payment:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Upload payment proof
  uploadPaymentProof: async (reservationId, imageUri) => {
    set({ isLoading: true, error: null });
    try {
      const filePath = `${reservationId}/${Date.now()}.jpg`;
      
      // Upload the image to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('payment_proofs')
        .upload(filePath, {
          uri: imageUri,
          type: 'image/jpeg',
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('payment_proofs')
        .getPublicUrl(filePath);
        
      set({ isLoading: false });
      return { publicUrl };
    } catch (error) {
      console.error('Error uploading payment proof:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Get payment by reservation ID
  getPaymentByReservationId: async (reservationId) => {
    set({ isLoading: true, error: null });
    try {
      // Obtenemos el último pago (mayor mes_numero) para mostrarlo en la UI
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id_reserva', reservationId)
        .order('mes_numero', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      set({ paymentDetails: data || null, isLoading: false });
      return { data };
    } catch (error) {
      console.error('Error fetching payment:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Update payment status (for property owners/admins)
  updatePaymentStatus: async (paymentId, newStatus) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({ estado_pago: newStatus })
        .eq('id', paymentId)
        .select()
        .single();
      
      if (error) throw error;
      
      set({ paymentDetails: data, isLoading: false });
      return { data };
    } catch (error) {
      console.error('Error updating payment status:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Verify payment as property owner
  verifyPaymentAsOwner: async (paymentId, approved, rejectionReason = null) => {
    set({ isLoading: true, error: null });
    try {
      const { success, data, error } = await verifyPaymentByOwner(paymentId, approved, rejectionReason);
      
      if (!success) throw new Error(error);
      
      set({ paymentDetails: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error verifying payment:', error.message);
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },
  
  // Check if user is the property owner for a reservation
  checkIsPropertyOwner: async (userId, reservationId) => {
    try {
      return await isPropertyOwner(userId, reservationId);
    } catch (error) {
      console.error('Error checking property owner:', error.message);
      return false;
    }
  }
}));

export default usePaymentStore;
