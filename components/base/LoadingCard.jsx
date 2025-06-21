import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../utils/themeContext';

const LoadingCard = ({
  type = 'property', // 'property', 'list', 'profile', 'custom'
  style,
  animated = true,
}) => {
  const { currentTheme } = useTheme();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [animated]);

  const getShimmerStyle = (width = '100%', height = 20) => {
    const opacity = animated
      ? shimmerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.7],
        })
      : 0.3;

    return {
      width,
      height,
      backgroundColor: currentTheme.textSecondary,
      borderRadius: 4,
      opacity,
    };
  };

  const renderPropertySkeleton = () => (
    <View style={[styles.propertyCard, { backgroundColor: currentTheme.surface }]}>
      {/* Image placeholder */}
      <Animated.View
        style={[
          getShimmerStyle('100%', 200),
          { borderRadius: 8, marginBottom: 12 }
        ]}
      />
      
      {/* Title */}
      <Animated.View
        style={[
          getShimmerStyle('80%', 18),
          { marginBottom: 8 }
        ]}
      />
      
      {/* Location */}
      <Animated.View
        style={[
          getShimmerStyle('60%', 14),
          { marginBottom: 8 }
        ]}
      />
      
      {/* Price and details row */}
      <View style={styles.row}>
        <Animated.View
          style={getShimmerStyle('40%', 16)}
        />
        <Animated.View
          style={getShimmerStyle('30%', 16)}
        />
      </View>
      
      {/* Amenities */}
      <View style={[styles.row, { marginTop: 8 }]}>
        <Animated.View
          style={[getShimmerStyle(60, 24), { borderRadius: 12, marginRight: 8 }]}
        />
        <Animated.View
          style={[getShimmerStyle(80, 24), { borderRadius: 12, marginRight: 8 }]}
        />
        <Animated.View
          style={[getShimmerStyle(70, 24), { borderRadius: 12 }]}
        />
      </View>
    </View>
  );

  const renderListSkeleton = () => (
    <View style={[styles.listItem, { backgroundColor: currentTheme.surface }]}>
      <Animated.View
        style={[
          getShimmerStyle(60, 60),
          { borderRadius: 8, marginRight: 12 }
        ]}
      />
      <View style={styles.listContent}>
        <Animated.View
          style={[getShimmerStyle('90%', 16), { marginBottom: 6 }]}
        />
        <Animated.View
          style={[getShimmerStyle('70%', 14), { marginBottom: 4 }]}
        />
        <Animated.View
          style={getShimmerStyle('50%', 12)}
        />
      </View>
    </View>
  );

  const renderProfileSkeleton = () => (
    <View style={[styles.profileCard, { backgroundColor: currentTheme.surface }]}>
      {/* Profile image */}
      <Animated.View
        style={[
          getShimmerStyle(80, 80),
          { borderRadius: 40, alignSelf: 'center', marginBottom: 16 }
        ]}
      />
      
      {/* Name */}
      <Animated.View
        style={[
          getShimmerStyle('60%', 18),
          { alignSelf: 'center', marginBottom: 8 }
        ]}
      />
      
      {/* Email */}
      <Animated.View
        style={[
          getShimmerStyle('80%', 14),
          { alignSelf: 'center', marginBottom: 16 }
        ]}
      />
      
      {/* Info rows */}
      {[1, 2, 3].map((item) => (
        <View key={item} style={[styles.row, { marginBottom: 12 }]}>
          <Animated.View
            style={getShimmerStyle('30%', 14)}
          />
          <Animated.View
            style={getShimmerStyle('50%', 14)}
          />
        </View>
      ))}
    </View>
  );

  const renderCustomSkeleton = () => (
    <View style={[styles.customCard, { backgroundColor: currentTheme.surface }]}>
      <Animated.View
        style={[getShimmerStyle('100%', 20), { marginBottom: 12 }]}
      />
      <Animated.View
        style={[getShimmerStyle('80%', 16), { marginBottom: 8 }]}
      />
      <Animated.View
        style={getShimmerStyle('60%', 16)}
      />
    </View>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'property':
        return renderPropertySkeleton();
      case 'list':
        return renderListSkeleton();
      case 'profile':
        return renderProfileSkeleton();
      case 'custom':
        return renderCustomSkeleton();
      default:
        return renderPropertySkeleton();
    }
  };

  return (
    <View style={style}>
      {renderSkeleton()}
    </View>
  );
};

const styles = StyleSheet.create({
  propertyCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  listContent: {
    flex: 1,
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
  },
  customCard: {
    padding: 16,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default LoadingCard;
