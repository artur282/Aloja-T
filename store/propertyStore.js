import { create } from 'zustand';
import supabase from '../services/supabaseClient';

const usePropertyStore = create((set, get) => ({
  properties: [],
  userProperties: [],
  selectedProperty: null,
  isLoading: false,
  error: null,
  
  // Fetch all available properties
  fetchProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, users:id_propietario(nombre_completo, numero_telefono, url_foto_perfil)')
        .eq('estado', 'disponible')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ properties: data, isLoading: false });
      return { data };
    } catch (error) {
      console.error('Error fetching properties:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Fetch a specific property by ID
  fetchPropertyById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, users:id_propietario(nombre_completo, numero_telefono, url_foto_perfil)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      set({ selectedProperty: data, isLoading: false });
      return { data };
    } catch (error) {
      console.error('Error fetching property:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Fetch properties owned by the current user
  fetchUserProperties: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id_propietario', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ userProperties: data, isLoading: false });
      return { data };
    } catch (error) {
      console.error('Error fetching user properties:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Create a new property
  createProperty: async (propertyData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the userProperties list
      const userProperties = get().userProperties;
      set({ 
        userProperties: [data, ...userProperties],
        isLoading: false 
      });
      return { data };
    } catch (error) {
      console.error('Error creating property:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Update a property
  updateProperty: async (id, propertyData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the local state
      const userProperties = get().userProperties.map(prop => 
        prop.id === id ? data : prop
      );
      
      const properties = get().properties.map(prop => 
        prop.id === id ? data : prop
      );
      
      set({ 
        userProperties,
        properties,
        selectedProperty: data,
        isLoading: false 
      });
      
      return { data };
    } catch (error) {
      console.error('Error updating property:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Delete a property
  deleteProperty: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state
      const userProperties = get().userProperties.filter(prop => prop.id !== id);
      const properties = get().properties.filter(prop => prop.id !== id);
      
      set({ 
        userProperties,
        properties,
        selectedProperty: null,
        isLoading: false 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting property:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Upload property images
  uploadPropertyImages: async (propertyId, imageUris) => {
    set({ isLoading: true, error: null });
    try {
      const uploadPromises = imageUris.map(async (uri, index) => {
        const filePath = `${propertyId}/${Date.now()}_${index}.jpg`;
        
        // Upload the image to Supabase Storage
        const { data, error } = await supabase
          .storage
          .from('property_galleries')
          .upload(filePath, {
            uri,
            type: 'image/jpeg',
          });
        
        if (error) throw error;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('property_galleries')
          .getPublicUrl(filePath);
          
        return publicUrl;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Get current property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('galeria_fotos')
        .eq('id', propertyId)
        .single();
      
      if (propertyError) throw propertyError;
      
      // Combine existing gallery with new images
      const existingGallery = property.galeria_fotos || [];
      const updatedGallery = [...existingGallery, ...uploadedUrls];
      
      // Update the property with the new gallery
      const { data, error } = await supabase
        .from('properties')
        .update({
          galeria_fotos: updatedGallery,
        })
        .eq('id', propertyId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      if (get().selectedProperty && get().selectedProperty.id === propertyId) {
        set({ selectedProperty: data });
      }
      
      set({ isLoading: false });
      return { urls: uploadedUrls };
    } catch (error) {
      console.error('Error uploading property images:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Search properties
  searchProperties: async (searchParams) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('properties')
        .select('*, users:id_propietario(nombre_completo, numero_telefono, url_foto_perfil)')
        .eq('estado', 'disponible');
      
      // Location filters - search in direccion and ciudad
      if (searchParams.location) {
        query = query.or(`direccion.ilike.%${searchParams.location}%,ciudad.ilike.%${searchParams.location}%`);
      }
      
      if (searchParams.ciudad) {
        query = query.ilike('ciudad', `%${searchParams.ciudad}%`);
      }
      
      // Property type filter
      if (searchParams.type) {
        query = query.eq('tipo_propiedad', searchParams.type);
      }
      
      // Price range filters
      if (searchParams.minPrice) {
        query = query.gte('precio_noche', searchParams.minPrice);
      }
      
      if (searchParams.maxPrice) {
        query = query.lte('precio_noche', searchParams.maxPrice);
      }
      
      // Capacity filter
      if (searchParams.capacity) {
        query = query.gte('capacidad', searchParams.capacity);
      }
      
      // Amenities filter
      if (searchParams.amenities && searchParams.amenities.length > 0) {
        // Filter properties that contain all selected amenities
        const amenitiesConditions = searchParams.amenities.map(amenity => 
          `servicios.cs.{${amenity}}`
        ).join(',');
        query = query.or(amenitiesConditions);
      }
      
      // Apply sorting
      let orderColumn = 'created_at';
      let ascending = false;
      
      if (searchParams.sortBy === 'price_asc') {
        orderColumn = 'precio_noche';
        ascending = true;
      } else if (searchParams.sortBy === 'price_desc') {
        orderColumn = 'precio_noche';
        ascending = false;
      } else if (searchParams.sortBy === 'newest') {
        orderColumn = 'created_at';
        ascending = false;
      } else if (searchParams.sortBy === 'oldest') {
        orderColumn = 'created_at';
        ascending = true;
      }
      
      const { data, error } = await query.order(orderColumn, { ascending });
      
      if (error) throw error;
      
      set({ properties: data, isLoading: false });
      return { data };
    } catch (error) {
      console.error('Error searching properties:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
}));

export default usePropertyStore;
