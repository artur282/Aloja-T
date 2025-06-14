import { create } from 'zustand';
import supabase from '../services/supabaseClient';
import usePropertyStore from './propertyStore';

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
      // Primero verificamos si el usuario ya tiene una solicitud pendiente para esta propiedad
      const { data: existingReservations, error: checkError } = await supabase
        .from('reservations')
        .select('id, estado_reserva')
        .eq('id_usuario', reservationData.id_usuario)
        .eq('id_propiedad', reservationData.id_propiedad)
        .eq('estado_reserva', 'pendiente');
      
      if (checkError) throw checkError;
      
      // Si ya existe una solicitud pendiente, no permitir crear otra
      if (existingReservations && existingReservations.length > 0) {
        set({ isLoading: false });
        return { 
          error: {
            message: 'Ya tienes una solicitud de reserva pendiente para esta propiedad. Debes esperar a que sea procesada o cancelarla antes de crear otra.'
          } 
        };
      }
      
      // Incluimos todos los campos necesarios, incluido duration_months
      const completeReservationData = {
        id_usuario: reservationData.id_usuario,
        id_propiedad: reservationData.id_propiedad,
        fecha_llegada: reservationData.fecha_llegada,
        fecha_salida: reservationData.fecha_salida,
        costo_total: reservationData.costo_total,
        estado_reserva: reservationData.estado_reserva,
        estado_pago: reservationData.estado_pago,
        duration_months: reservationData.duration_months || 1 // Aseguramos que siempre tenga un valor
      };
      
      // Insertar la reserva con todos los campos necesarios
      const { data, error } = await supabase
        .from('reservations')
        .insert([completeReservationData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Si por alguna razón no se guardó el duration_months en la BD,
      // intentamos actualizarlo explícitamente
      if (data && !data.duration_months && reservationData.duration_months) {
        const { data: updatedData, error: updateError } = await supabase
          .from('reservations')
          .update({ duration_months: reservationData.duration_months })
          .eq('id', data.id)
          .select()
          .single();
          
        if (!updateError && updatedData) {
          // Usar los datos actualizados
          Object.assign(data, updatedData);
        }
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
      
      /* --- Actualizar estado de la propiedad --- */
      let nuevoEstadoPropiedad = null;
      if (newStatus === 'aceptada') {
        nuevoEstadoPropiedad = 'reservado';
      } else if (newStatus === 'rechazada' || newStatus === 'cancelada') {
        nuevoEstadoPropiedad = 'disponible';
      }
      
      if (nuevoEstadoPropiedad) {
        const { data: updatedProperty, error: propError } = await supabase
          .from('properties')
          .update({ estado: nuevoEstadoPropiedad })
          .eq('id', data.id_propiedad)
          .select()
          .single();
        
        if (!propError && updatedProperty) {
          // Sincronizar tienda de propiedades
          usePropertyStore.setState((prev) => {
            const updateArray = (arr) =>
              arr.map((p) => (p.id === updatedProperty.id ? updatedProperty : p));
            
            return {
              userProperties: updateArray(prev.userProperties || []),
              properties: updateArray(prev.properties || []),
              selectedProperty:
                prev.selectedProperty && prev.selectedProperty.id === updatedProperty.id
                  ? updatedProperty
                  : prev.selectedProperty,
            };
          });
        }
      }
      
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
  },
  
  // Eliminar reservas canceladas o rechazadas
  clearCanceledAndRejectedReservations: async (userId, isOwner) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Limpiando reservas... Usuario:', userId, 'Es propietario:', isOwner);
      let reservationsToDelete = [];
      
      if (isOwner) {
        // Para propietarios: obtener IDs de sus propiedades
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('id')
          .eq('id_propietario', userId);
        
        if (propertiesError) throw propertiesError;
        
        if (properties.length === 0) {
          set({ isLoading: false });
          return { data: { count: 0 } };
        }
        
        // Obtener reservas canceladas o rechazadas para esas propiedades con más detalles
        const propertyIds = properties.map(property => property.id);
        const { data: reservations, error: fetchError } = await supabase
          .from('reservations')
          .select('id')
          .in('id_propiedad', propertyIds)
          .in('estado_reserva', ['cancelada', 'rechazada']);
          
        if (fetchError) throw fetchError;
        reservationsToDelete = reservations || [];
        
        if (reservationsToDelete.length === 0) {
          set({ isLoading: false });
          return { data: { count: 0 } };
        }
      } else {
        // Para usuarios regulares: obtener sus propias reservas canceladas/rechazadas
        const { data: reservations, error: fetchError } = await supabase
          .from('reservations')
          .select('id')
          .eq('id_usuario', userId)
          .in('estado_reserva', ['cancelada', 'rechazada']);
          
        if (fetchError) throw fetchError;
        reservationsToDelete = reservations || [];
        
        if (reservationsToDelete.length === 0) {
          set({ isLoading: false });
          return { data: { count: 0 } };
        }
      }
      
      const reservationIds = reservationsToDelete.map(r => r.id);
      const totalCount = reservationIds.length;
      
      // PASO 1: Eliminar primero los pagos asociados
      const { error: paymentsDeleteError } = await supabase
        .from('payments')
        .delete()
        .in('id_reserva', reservationIds);
        
      if (paymentsDeleteError) throw paymentsDeleteError;
      
      // PASO 2: Ahora sí eliminar las reservas
      const { error: reservationsDeleteError } = await supabase
        .from('reservations')
        .delete()
        .in('id', reservationIds);
        
      if (reservationsDeleteError) throw reservationsDeleteError;
      
      // Actualizar el estado local
      if (isOwner) {
        const updatedReservations = get().propertyReservations.filter(
          r => !reservationIds.includes(r.id)
        );
        
        set({ 
          propertyReservations: updatedReservations, 
          isLoading: false 
        });
      } else {
        const updatedReservations = get().userReservations.filter(
          r => !reservationIds.includes(r.id)
        );
        
        set({ 
          userReservations: updatedReservations, 
          isLoading: false 
        });
      }
      
      return { data: { count: totalCount } };
    } catch (error) {
      console.error('Error eliminando reservas:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  }
}));

export default useReservationStore;
