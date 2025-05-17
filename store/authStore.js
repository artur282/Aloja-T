import { create } from 'zustand';
import supabase from '../services/supabaseClient';

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  error: null,
  
  // Initialize the auth store with session data
  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        // Get the user profile data from the users table
        // Use limit(1) instead of single() to handle the case where multiple rows might be returned
        const { data: profiles, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .limit(1);
          
        if (profileError) throw profileError;
        
        // If no profile is found, use just the auth user data
        const profile = profiles && profiles.length > 0 ? profiles[0] : {};
        
        set({ session, user: { ...session.user, ...profile }, isLoading: false });
      } else {
        set({ session: null, user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error.message);
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Sign in with email and password
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session, user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Get the user profile data from the users table
      // Use .maybeSingle() instead of .single() to handle the case where no rows are returned
      // and limit to 1 to handle the case where multiple rows are returned
      const { data: profiles, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .limit(1);
        
      if (profileError) throw profileError;
      
      // If no profile is found, use just the auth user data
      const profile = profiles && profiles.length > 0 ? profiles[0] : {};
      
      set({ session, user: { ...user, ...profile }, isLoading: false });
      return { user, session };
    } catch (error) {
      console.error('Error signing in:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Sign up with email and password
  signUp: async (email, password, userData) => {
    set({ isLoading: true, error: null });
    try {
      // Create auth user
      const { data: { user, session }, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            { 
              id: user.id, 
              email: user.email,
              nombre_completo: userData.nombreCompleto || null,
              numero_telefono: userData.numeroTelefono || null,
              rol: userData.rol || 'estudiante',
            }
          ]);
          
        if (profileError) throw profileError;
        
        set({ 
          session, 
          user: { 
            ...user, 
            ...userData,
            nombre_completo: userData.nombreCompleto,
            numero_telefono: userData.numeroTelefono,
            rol: userData.rol || 'estudiante'
          }, 
          isLoading: false 
        });
        return { user, session };
      }
    } catch (error) {
      console.error('Error signing up:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Sign out
  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, isLoading: false });
    } catch (error) {
      console.error('Error signing out:', error.message);
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    const { user } = get();
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      set({ 
        user: { ...user, ...profileData }, 
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Upload profile photo
  uploadProfilePhoto: async (photoUri) => {
    const { user } = get();
    set({ isLoading: true, error: null });
    
    try {
      // Generate a unique file path
      const filePath = `${user.id}/${Date.now()}.jpg`;
      
      // Upload the photo to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('profile_photos')
        .upload(filePath, {
          uri: photoUri,
          type: 'image/jpeg',
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('profile_photos')
        .getPublicUrl(filePath);
      
      // Update user's profile with the new photo URL
      const { error: updateError } = await supabase
        .from('users')
        .update({
          url_foto_perfil: publicUrl,
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      set({ 
        user: { ...user, url_foto_perfil: publicUrl }, 
        isLoading: false,
      });
      
      return { publicUrl };
    } catch (error) {
      console.error('Error uploading profile photo:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
}));

export default useAuthStore;
