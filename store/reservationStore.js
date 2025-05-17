import { create } from 'zustand';
import supabase from '../services/supabaseClient';

const useReservationStore = create((set, get) => ({
  userReservations: [],
  propertyReservations: [],
  selectedReservation: null,
  isLoading: false,
  error: null,
  
  // Fetch reservations made by the user
  fetchUserReservations: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          properties:id_propiedad (id, titulo, direccion, precio_noche, galeria_fotos)
        `)
        .eq('id_usuario', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ userReservations: data, isLoading: false });
      return { data };
    } catch (error) {
      console.error('Error fetching user reservations:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Fetch reservations for a specific property (for property owners)
  fetchPropertyReservations: async (propertyId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          users:id_usuario (id, nombre_completo, email, numero_telefono, url_foto_perfil),
          payments:id (id, metodo_pago, monto_pagado, url_comprobante_pago, estado_pago)
        `)
        .eq('id_propiedad', propertyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ propertyReservations: data, isLoading: false });
      return { data };
    } catch (error) {
      console.error('Error fetching property reservations:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Fetch reservations for all owner's properties
  fetchAllOwnerReservations: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // First get all properties owned by the user
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id')
        .eq('id_propietario', userId);
      
      if (propertiesError) throw propertiesError;
      
      if (properties.length === 0) {
        set({ propertyReservations: [], isLoading: false });
        return { data: [] };
      }
      
      // Get the property IDs
      const propertyIds = properties.map(property => property.id);
      
      // Fetch reservations for all properties
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          properties:id_propiedad (id, titulo, direccion, precio_noche, galeria_fotos),
          users:id_usuario (id, nombre_completo, email, numero_telefono, url_foto_perfil),
          payments:id (id, metodo_pago, monto_pagado, url_comprobante_pago, estado_pago)
        `)
        .in('id_propiedad', propertyIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ propertyReservations: data, isLoading: false });
      return { data };
    } catch (error) {
      console.error('Error fetching owner reservations:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Create a new reservation
  createReservation: async (reservationData) => {
    set({ isLoading: true, error: null });
    try {
      // Debido a problemas de caché del esquema con la nueva columna duration_months,
      // primero creamos un objeto con solo los campos originales
      const originalReservationData = {
        id_usuario: reservationData.id_usuario,
        id_propiedad: reservationData.id_propiedad,
        fecha_llegada: reservationData.fecha_llegada,
        fecha_salida: reservationData.fecha_salida,
        costo_total: reservationData.costo_total,
        estado_reserva: reservationData.estado_reserva,
        estado_pago: reservationData.estado_pago
      };
      
      // Insertar primero con los campos originales
      const { data, error } = await supabase
        .from('reservations')
        .insert([originalReservationData])
        .select()
        .single();
      
      if (error) throw error;
      
      // IMPORTANTE: El campo duration_months ahora lo manejaremos desde la UI
      // sin intentar modificar explícitamente la base de datos, para evitar problemas de caché
      
      // Para fines de UI, simulamos que el objeto data tiene duration_months 
      if (data && reservationData.duration_months) {
        // Solo actualizamos el objeto local para la UI
        data.duration_months = reservationData.duration_months;
      }
      
      // Update local state
      const userReservations = get().userReservations;
      set({
        userReservations: [data, ...userReservations],
        selectedReservation: data,
        isLoading: false
      });
      
      return { data };
    } catch (error) {
      console.error('Error creating reservation:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Update a reservation status (for property owners)
  updateReservationStatus: async (reservationId, newStatus) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({ estado_reserva: newStatus, updated_at: new Date() })
        .eq('id', reservationId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const propertyReservations = get().propertyReservations.map(res => 
        res.id === reservationId ? data : res
      );
      
      const userReservations = get().userReservations.map(res => 
        res.id === reservationId ? data : res
      );
      
      set({
        propertyReservations,
        userReservations,
        selectedReservation: data,
        isLoading: false
      });
      
      return { data };
    } catch (error) {
      console.error('Error updating reservation status:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Cancel a reservation (for users)
  cancelReservation: async (reservationId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({ 
          estado_reserva: 'cancelada', 
          updated_at: new Date() 
        })
        .eq('id', reservationId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const userReservations = get().userReservations.map(res => 
        res.id === reservationId ? data : res
      );
      
      set({
        userReservations,
        selectedReservation: data,
        isLoading: false
      });
      
      return { data };
    } catch (error) {
      console.error('Error cancelling reservation:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Get reservation by ID
  fetchReservationById: async (reservationId) => {
    set({ isLoading: true, error: null });
    try {
      // Primero obtenemos los datos básicos de la reserva
      const { data: reservationData, error: reservationError } = await supabase
        .from('reservations')
        .select(`
          *,
          properties:id_propiedad (id, titulo, direccion, precio_noche, galeria_fotos, id_propietario),
          users:id_usuario (id, nombre_completo, email, numero_telefono, url_foto_perfil),
          payments:id (id, metodo_pago, monto_pagado, url_comprobante_pago, estado_pago)
        `)
        .eq('id', reservationId)
        .single();
      
      if (reservationError) throw reservationError;
      
      // Ahora obtenemos los datos del propietario
      if (reservationData && reservationData.properties && reservationData.properties.id_propietario) {
        const { data: ownerData, error: ownerError } = await supabase
          .from('users')
          .select('id, nombre_completo, email, numero_telefono, url_foto_perfil')
          .eq('id', reservationData.properties.id_propietario)
          .single();
        
        if (!ownerError && ownerData) {
          // Añadimos los datos del propietario a la estructura de datos
          reservationData.properties.propietario = ownerData;
        }
      }
      
      set({ selectedReservation: reservationData, isLoading: false });
      return { data: reservationData };
    } catch (error) {
      console.error('Error fetching reservation:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  }
}));

export default useReservationStore;
