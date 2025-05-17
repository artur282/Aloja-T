import { create } from 'zustand';
import supabase from '../services/supabaseClient';

const usePaymentStore = create((set, get) => ({
  paymentDetails: null,
  isLoading: false,
  error: null,
  
  // Create a new payment record
  createPayment: async (paymentData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the reservation payment status
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({ estado_pago: true })
        .eq('id', paymentData.id_reserva);
      
      if (reservationError) throw reservationError;
      
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
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id_reserva', reservationId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
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
  }
}));

export default usePaymentStore;
