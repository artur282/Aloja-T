import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * Reusable notification badge component to display unread notification count
 * @param {number} count - Number of unread notifications
 * @param {Object} style - Additional style for the badge container
 * @param {boolean} showZero - Whether to show the badge when count is zero
 */
const NotificationBadge = ({ count, style, showZero = false }) => {
  // Don't render if count is 0 and showZero is false
  if (count === 0 && !showZero) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    position: 'absolute',
    top: -5,
    right: -10,
  },
  text: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
