import supabase from "./supabaseClient";

class NotificationService {
  // Store active subscriptions to manage them
  subscriptions = [];

  // Subscribe to notifications for a specific user
  subscribeToUserNotifications(userId, onNewNotification) {
    if (!userId) return null;

    try {
      // Create a channel subscription with filter for the specific user
      const subscription = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `id_usuario_destinatario=eq.${userId}`,
          },
          (payload) => {
            // Call the callback with the new notification
            if (onNewNotification) {
              onNewNotification(payload.new);
            }
          }
        )
        .subscribe();

      // Store the subscription for cleanup
      this.subscriptions.push(subscription);
      return subscription;
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      return null;
    }
  }

  // Subscribe to reservation status changes (for property owners)
  subscribeToReservationChanges(propertyIds, onReservationUpdate) {
    if (!propertyIds || propertyIds.length === 0) return null;

    try {
      // Create a filter condition for all owned properties
      const filterCondition = propertyIds
        .map((id) => `id_propiedad=eq.${id}`)
        .join(",");

      const subscription = supabase
        .channel("reservations:owner")
        .on(
          "postgres_changes",
          {
            event: "*", // Listen for all changes (INSERT, UPDATE, DELETE)
            schema: "public",
            table: "reservations",
            filter: filterCondition,
          },
          (payload) => {
            if (onReservationUpdate) {
              onReservationUpdate(payload);
            }
          }
        )
        .subscribe();

      this.subscriptions.push(subscription);
      return subscription;
    } catch (error) {
      console.error("Error subscribing to reservation changes:", error);
      return null;
    }
  }

  // Subscribe to payment updates
  subscribeToPaymentChanges(userId, isOwner, propertyIds, onPaymentUpdate) {
    if (!userId) return null;

    try {
      let filterCondition;

      if (isOwner && propertyIds && propertyIds.length > 0) {
        // For property owners, subscribe to payments for their properties
        // This requires a more complex query to join reservations and properties
        // Will be handled via triggers and notifications instead
      } else {
        // For students, subscribe to their own payment updates
        // This also gets handled via the notification system
      }

      const subscription = supabase
        .channel("payments:updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "payments",
            // Filter will be applied via notifications table instead
          },
          (payload) => {
            if (onPaymentUpdate) {
              onPaymentUpdate(payload);
            }
          }
        )
        .subscribe();

      this.subscriptions.push(subscription);
      return subscription;
    } catch (error) {
      console.error("Error subscribing to payment changes:", error);
      return null;
    }
  }

  // Clean up all subscriptions
  unsubscribeAll() {
    try {
      this.subscriptions.forEach((subscription) => {
        if (subscription) {
          try {
            subscription.unsubscribe();
          } catch (subError) {
            console.error("Error unsubscribing from subscription:", subError);
          }
        }
      });
    } catch (error) {
      console.error("Error unsubscribing from all subscriptions:", error);
    } finally {
      this.subscriptions = [];
    }
  }
}

export default new NotificationService();
