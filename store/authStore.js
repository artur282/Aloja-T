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
        // Primero verificamos si hay usuario por ID
        let { data: profileById, error: errorById } = await supabase
          .from('users')
          .select('id, email, rol, nombre_completo, numero_telefono, url_foto_perfil, documento_identidad, estado_verificacion')
          .eq('id', session.user.id)
          .limit(1);
          
        if (errorById) {
          console.error('Error al buscar perfil por ID:', errorById.message);
        }
        
        // Si no encontramos por ID, buscamos por email (podría haber sido creado con otro método)
        if (!profileById || profileById.length === 0) {
          const { data: profileByEmail, error: errorByEmail } = await supabase
            .from('users')
            .select('id, email, rol, nombre_completo, numero_telefono, url_foto_perfil, documento_identidad, estado_verificacion')
            .eq('email', session.user.email)
            .limit(1);
            
          if (errorByEmail) {
            console.error('Error al buscar perfil por email:', errorByEmail.message);
          }
          
          if (profileByEmail && profileByEmail.length > 0) {
            // Existe un perfil con este email pero diferente ID (raro pero posible)
            console.log('Encontrado perfil con el mismo email pero diferente ID');
            
            // Actualizamos el perfil para que coincida con el ID de Auth
            const { error: updateError } = await supabase
              .from('users')
              .update({ id: session.user.id })
              .eq('email', session.user.email);
              
            if (updateError) {
              console.error('Error al actualizar ID del perfil:', updateError.message);
            } else {
              console.log('ID del perfil actualizado correctamente');
              profileById = profileByEmail;
            }
          }
        }
        
        // Si todavía no hay perfil, intentamos crearlo
        if (!profileById || profileById.length === 0) {
          console.log('No se encontró perfil para el usuario, intentando crear uno nuevo...');
          
          try {
            // Intento de crear un perfil de usuario
            const { data: insertData, error: insertError } = await supabase
              .from('users')
              .insert([
                { 
                  id: session.user.id, 
                  email: session.user.email,
                  rol: 'propietario', // Rol por defecto
                  nombre_completo: session.user.user_metadata?.nombre_completo || ''
                }
              ])
              .select();
              
            if (insertError) {
              console.error('Error al crear perfil:', insertError.message);
              // Si falla la creación, podría ser porque ya existe pero no lo encontramos
              // Intentamos obtener el rol directamente
              const { data: userData } = await supabase
                .from('users')
                .select('rol')
                .or(`id.eq.${session.user.id},email.eq.${session.user.email}`)
                .limit(1);
                
              // Establecemos un objeto con datos mínimos y rol predeterminado
              set({ 
                session, 
                user: { 
                  ...session.user, 
                  rol: userData?.[0]?.rol || 'propietario',
                  nombre_completo: session.user.user_metadata?.nombre_completo || ''
                }, 
                isLoading: false 
              });
              return;
            }
            
            if (insertData && insertData.length > 0) {
              console.log('Perfil creado con éxito:', JSON.stringify(insertData[0], null, 2));
              set({ session, user: { ...session.user, ...insertData[0] }, isLoading: false });
            }
          } catch (insertErr) {
            console.error('Error al insertar perfil:', insertErr);
            // Establecemos datos mínimos para que la aplicación funcione
            set({ 
              session, 
              user: { 
                ...session.user, 
                rol: 'propietario' 
              }, 
              isLoading: false 
            });
          }
        } else {
          // Usar el perfil existente
          const profile = profileById[0];
          console.log('Perfil recuperado:', JSON.stringify(profile, null, 2));
          console.log('Rol del usuario:', profile.rol);
          
          set({ session, user: { ...session.user, ...profile }, isLoading: false });
        }
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
      
      // Primera búsqueda: por ID
      let { data: profileById, error: errorById } = await supabase
        .from('users')
        .select('id, email, rol, nombre_completo, numero_telefono, url_foto_perfil, documento_identidad, estado_verificacion')
        .eq('id', user.id)
        .limit(1);
        
      if (errorById) {
        console.error('Error al buscar perfil por ID:', errorById.message);
      }
      
      // Segunda búsqueda: por email si la primera no da resultados
      if (!profileById || profileById.length === 0) {
        const { data: profileByEmail, error: errorByEmail } = await supabase
          .from('users')
          .select('id, email, rol, nombre_completo, numero_telefono, url_foto_perfil, documento_identidad, estado_verificacion')
          .eq('email', email)
          .limit(1);
          
        if (errorByEmail) {
          console.error('Error al buscar perfil por email:', errorByEmail.message);
        }
        
        // Si encontramos por email pero no por ID, actualizar el registro
        if (profileByEmail && profileByEmail.length > 0) {
          console.log('Encontrado perfil con el mismo email pero diferente ID');
          
          // Actualizamos el ID para que coincida con Auth
          const { error: updateError } = await supabase
            .from('users')
            .update({ id: user.id })
            .eq('email', email);
            
          if (updateError) {
            console.error('Error al actualizar ID:', updateError.message);
          } else {
            console.log('ID actualizado correctamente');
            profileById = profileByEmail;
          }
        }
      }
      
      // Si todavía no hay perfil, intentamos crearlo con manejo de errores
      if (!profileById || profileById.length === 0) {
        console.log('No se encontró perfil, intentando crear uno nuevo...');
        
        try {
          // Intentar insertar nuevo perfil
          const { data: insertedProfile, error: insertError } = await supabase
            .from('users')
            .insert([
              { 
                id: user.id, 
                email: email,
                rol: 'propietario', // Valor por defecto
                nombre_completo: user.user_metadata?.nombre_completo || ''
              }
            ])
            .select();
            
          if (insertError) {
            console.warn('No se pudo crear perfil:', insertError.message);
            
            // Si falla, intentamos un último recurso: obtener perfil existente o crear uno en memoria
            const { data: anyProfile } = await supabase
              .from('users')
              .select('rol, nombre_completo, numero_telefono')
              .eq('email', email)
              .limit(1);
              
            // Usamos un perfil temporal sin insertar en la BD
            const tempProfile = anyProfile?.[0] || { 
              rol: 'propietario',
              nombre_completo: user.user_metadata?.nombre_completo || ''
            };
            
            set({ 
              session, 
              user: { ...user, ...tempProfile }, 
              isLoading: false 
            });
            
            return { user: { ...user, ...tempProfile }, session };
          }
          
          if (insertedProfile && insertedProfile.length > 0) {
            console.log('Perfil creado:', JSON.stringify(insertedProfile[0], null, 2));
            set({ session, user: { ...user, ...insertedProfile[0] }, isLoading: false });
            return { user: { ...user, ...insertedProfile[0] }, session };
          }
        } catch (createError) {
          console.error('Error en proceso de creación:', createError);
          // Fallback para no romper el flujo de login
          set({ 
            session, 
            user: { 
              ...user, 
              rol: 'propietario' 
            }, 
            isLoading: false 
          });
          return { user: { ...user, rol: 'propietario' }, session };
        }
      } else {
        // Usar perfil existente
        const profile = profileById[0];
        console.log('Perfil recuperado:', JSON.stringify(profile, null, 2));
        console.log('Rol del usuario:', profile.rol);
        
        set({ session, user: { ...user, ...profile }, isLoading: false });
        return { user: { ...user, ...profile }, session };
      }
      
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
      // Log para depuración
      console.log('Actualizando perfil con datos:', JSON.stringify(profileData, null, 2));
      console.log('ID de usuario actual:', user.id);
      
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select();
        
      if (error) {
        console.error('Error específico de Supabase:', error.message, error.details, error.hint);
        throw error;
      }
      
      // Verificar que los datos se actualizaron correctamente
      const { data: updatedUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (fetchError) {
        console.error('Error al verificar actualización:', fetchError.message);
      } else {
        console.log('Datos actualizados en DB:', JSON.stringify(updatedUser, null, 2));
      }
      
      // Actualizar el estado con los datos más recientes de la BD
      const updatedUserData = updatedUser || {};
      
      set({ 
        user: { ...user, ...updatedUserData }, 
        isLoading: false 
      });
      
      console.log('Estado actualizado del usuario:', JSON.stringify({ ...user, ...updatedUserData }, null, 2));
      
      return { success: true, user: { ...user, ...updatedUserData } };
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
      console.log('Iniciando carga de foto de perfil...');
      console.log('URI de la foto:', photoUri);
      
      // Generate a unique file path
      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}.jpg`;
      console.log('Ruta del archivo en storage:', filePath);
      
      // Upload the photo to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('profile_photos')
        .upload(filePath, {
          uri: photoUri,
          type: 'image/jpeg',
        });
      
      if (error) {
        console.error('Error al subir archivo:', error.message);
        throw error;
      }
      
      console.log('Foto subida correctamente, obteniendo URL pública...');
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('profile_photos')
        .getPublicUrl(filePath);
      
      console.log('URL pública obtenida:', publicUrl);
      
      // Asegurarse de que la URL es compatible con expo/react-native
      // Añadiendo un parámetro de timestamp para evitar el caché
      const finalUrl = `${publicUrl}?t=${timestamp}`;
      console.log('URL final con timestamp:', finalUrl);
      
      // Update user's profile with the new photo URL
      const { error: updateError } = await supabase
        .from('users')
        .update({
          url_foto_perfil: finalUrl,
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error al actualizar perfil:', updateError.message);
        throw updateError;
      }
      
      console.log('Perfil actualizado con nueva URL de foto');
      
      // Recuperar el usuario actualizado para confirmar
      const { data: updatedUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (fetchError) {
        console.error('Error al verificar actualización:', fetchError.message);
      } else {
        console.log('URL en base de datos:', updatedUser.url_foto_perfil);
      }
      
      // Actualizar el estado local
      set({ 
        user: { ...user, url_foto_perfil: finalUrl }, 
        isLoading: false,
      });
      
      console.log('Estado actualizado con la nueva URL');
      
      return { publicUrl: finalUrl };
    } catch (error) {
      console.error('Error uploading profile photo:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Request password reset
  requestPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://starlit-hummingbird-f58616.netlify.app/",
      });
      if (error) throw error;
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Error requesting password reset:', error.message);
      set({ isLoading: false, error: error.message });
      return { success: false, error };
    }
  },
  
  // Update password
  updatePassword: async (newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      set({ isLoading: false, user: data.user });
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error.message);
      set({ isLoading: false, error: error.message });
      return { success: false, error };
    }
  },
}));

export default useAuthStore;
