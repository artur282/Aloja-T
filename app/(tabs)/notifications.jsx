import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import { COLORS } from '../../utils/constants';

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const { 
    notifications, 
    unreadCount,
    fetchNotifications, 
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
    isLoading,
    lastNotification 
  } = useNotificationStore();
  
  // Local state for refresh control
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
    }
  }, [user]);
  
  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    if (user) {
      setRefreshing(true);
      await fetchNotifications(user.id);
      setRefreshing(false);
    }
  }, [user, fetchNotifications]);
  
  // Listen for changes in the lastNotification
  useEffect(() => {
    if (lastNotification && user) {
      // Refresh the list when a new notification comes in
      fetchNotifications(user.id);
    }
  }, [lastNotification, user]);

  const handleNotificationPress = async (notification) => {
    // Mark as read when clicked
    if (!notification.estado_lectura) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.payload_id) {
      if (notification.tipo_notificacion === 'nueva_reserva' || 
          notification.tipo_notificacion === 'reserva_aceptada' ||
          notification.tipo_notificacion === 'reserva_rechazada' ||
          notification.tipo_notificacion === 'reserva_cancelada') {
        router.push(`/reservation/${notification.payload_id}`);
      } else if (notification.tipo_notificacion === 'pago_verificado' ||
                notification.tipo_notificacion === 'pago_rechazado') {
        router.push(`/payment/${notification.payload_id}`);
      }
    }
  };

  const handleMarkAllAsRead = () => {
    if (user && unreadCount > 0) {
      markAllAsRead(user.id);
    }
  };
  
  const handleDeleteAllNotifications = () => {
    if (user && notifications.length > 0) {
      Alert.alert(
        'Vaciar notificaciones',
        '¿Estás seguro de que quieres eliminar todas tus notificaciones? Esta acción no se puede deshacer.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar todas', 
            style: 'destructive',
            onPress: () => deleteAllNotifications(user.id)
          }
        ]
      );
    }
  };

  const renderNotificationItem = ({ item }) => {
    // Choose icon based on notification type
    let icon;
    let iconColor;
    
    switch (item.tipo_notificacion) {
      case 'nueva_reserva':
        icon = 'calendar-plus-o';
        iconColor = COLORS.accent;
        break;
      case 'reserva_aceptada':
        icon = 'check-circle';
        iconColor = COLORS.secondary;
        break;
      case 'reserva_rechazada':
      case 'reserva_cancelada':
        icon = 'times-circle';
        iconColor = COLORS.error;
        break;
      case 'pago_verificado':
        icon = 'money';
        iconColor = COLORS.secondary;
        break;
      case 'pago_rechazado':
        icon = 'exclamation-circle';
        iconColor = COLORS.error;
        break;
      default:
        icon = 'bell';
        iconColor = COLORS.primary;
    }
    
    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem,
          !item.estado_lectura && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <FontAwesome name={icon} size={20} color={iconColor} />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationMessage}>
            {item.mensaje}
          </Text>
          <Text style={styles.notificationTime}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        
        {!item.estado_lectura && (
          <View style={styles.unreadIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificaciones</Text>
        <View style={styles.headerButtons}>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.buttonText}>Marcar como leídas</Text>
            </TouchableOpacity>
          )}
          
          {notifications.length > 0 && (
            <TouchableOpacity 
              style={[styles.headerButton, styles.clearButton]}
              onPress={handleDeleteAllNotifications}
            >
              <Text style={[styles.buttonText, styles.clearButtonText]}>Vaciar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary, COLORS.secondary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={50} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No tienes notificaciones</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 5,
    backgroundColor: COLORS.primary + '15',
  },
  buttonText: {
    color: COLORS.primary,
    fontWeight: '500',
    fontSize: 13,
  },
  clearButton: {
    backgroundColor: COLORS.error + '15',
  },
  clearButtonText: {
    color: COLORS.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  unreadNotification: {
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});
