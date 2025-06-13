import { create } from 'zustand';
import supabase from '../services/supabaseClient';
import notificationService from '../services/notificationService';
import { Alert } from 'react-native';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  activeSubscription: null,
  lastNotification: null,
  
  // Initialize real-time notifications for a user
  initializeRealTimeNotifications: (userId) => {
    try {
      // Clean up any existing subscription
      const currentSub = get().activeSubscription;
      if (currentSub) {
        try {
          currentSub.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from existing subscription:', error);
        }
      }
      
      // Create a new subscription
      const subscription = notificationService.subscribeToUserNotifications(
        userId,
        (newNotification) => {
          try {
            // Update notifications list
            const { fetchNotifications } = get();
            fetchNotifications(userId);
            
            // Store the last notification for alert purposes
            set({ lastNotification: newNotification });
            
            // Show an alert for the new notification
            Alert.alert(
              'Nueva Notificación',
              newNotification.mensaje,
              [{ text: 'Ver', onPress: () => {} }, { text: 'OK' }]
            );
          } catch (callbackError) {
            console.error('Error in notification callback:', callbackError);
          }
        }
      );
      
      set({ activeSubscription: subscription });
      return subscription;
    } catch (error) {
      console.error('Error initializing real-time notifications:', error);
      return null;
    }
  },
  
  // Clean up real-time subscriptions
  cleanupSubscriptions: () => {
    const currentSub = get().activeSubscription;
    if (currentSub) {
      currentSub.unsubscribe();
      set({ activeSubscription: null });
    }
    
    // Also clean up any other subscriptions in the service
    notificationService.unsubscribeAll();
  },
  
  // Fetch user notifications
  fetchNotifications: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id_usuario_destinatario', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const unreadCount = data.filter(notif => !notif.estado_lectura).length;
      
      set({ 
        notifications: data, 
        unreadCount,
        isLoading: false 
      });
      
      return { data };
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Add a notification to the local state (without needing a fetch) 
  addNotification: (notification) => {
    const notifications = [notification, ...get().notifications];
    const unreadCount = notifications.filter(notif => !notif.estado_lectura).length;
    
    set({
      notifications,
      unreadCount,
      lastNotification: notification
    });
  },
  
  // Mark notification as read
  markAsRead: async (notificationId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ estado_lectura: true })
        .eq('id', notificationId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const notifications = get().notifications.map(notif => 
        notif.id === notificationId ? data : notif
      );
      
      const unreadCount = notifications.filter(notif => !notif.estado_lectura).length;
      
      set({ 
        notifications, 
        unreadCount,
        isLoading: false 
      });
      
      return { data };
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ estado_lectura: true })
        .eq('id_usuario_destinatario', userId)
        .eq('estado_lectura', false);
      
      if (error) throw error;
      
      // Update local state
      const notifications = get().notifications.map(notif => ({
        ...notif,
        estado_lectura: true
      }));
      
      set({ 
        notifications, 
        unreadCount: 0,
        isLoading: false 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  },
  
  // Eliminar todas las notificaciones del usuario
  deleteAllNotifications: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id_usuario_destinatario', userId);
      
      if (error) throw error;
      
      // Actualizar el estado local
      set({ 
        notifications: [], 
        unreadCount: 0,
        isLoading: false 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error eliminando notificaciones:', error.message);
      set({ error: error.message, isLoading: false });
      return { error };
    }
  }
}));

export default useNotificationStore;
