import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../utils/themeContext';
import { BORDER_RADIUS, SPACING } from '../../utils/constants';
import FloatingCard from './FloatingCard';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - (SPACING.lg * 2);

const SkeletonPlaceholder = ({ width, height, borderRadius = BORDER_RADIUS.small, style }) => {
  const { currentTheme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [currentTheme.border, currentTheme.borderLight],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

const ModernPropertyCardSkeleton = ({ style }) => {
  return (
    <FloatingCard
      style={[
        {
          width: cardWidth,
          marginHorizontal: SPACING.lg,
          marginBottom: SPACING.lg,
        },
        style,
      ]}
      padding="xs"
      shadowLevel="small"
    >
      {/* Image Skeleton */}
      <SkeletonPlaceholder
        width="100%"
        height={250}
        borderRadius={BORDER_RADIUS.large}
        style={{ marginBottom: SPACING.md }}
      />

      {/* Content Skeleton */}
      <View style={{ padding: SPACING.sm }}>
        {/* Title */}
        <SkeletonPlaceholder
          width="80%"
          height={20}
          style={{ marginBottom: SPACING.xs }}
        />

        {/* Location */}
        <SkeletonPlaceholder
          width="60%"
          height={16}
          style={{ marginBottom: SPACING.sm }}
        />

        {/* Property Type and Capacity */}
        <View style={{ flexDirection: 'row', marginBottom: SPACING.sm }}>
          <SkeletonPlaceholder
            width={80}
            height={16}
            style={{ marginRight: SPACING.md }}
          />
          <SkeletonPlaceholder
            width={60}
            height={16}
          />
        </View>

        {/* Rating */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
          <SkeletonPlaceholder
            width={12}
            height={12}
            borderRadius={6}
            style={{ marginRight: SPACING.xs }}
          />
          <SkeletonPlaceholder
            width={100}
            height={16}
          />
        </View>

        {/* Price */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonPlaceholder
            width={120}
            height={20}
          />
        </View>
      </View>
    </FloatingCard>
  );
};

const ModernListSkeleton = ({ count = 6, type = 'property' }) => {
  const skeletons = Array.from({ length: count }, (_, index) => {
    switch (type) {
      case 'property':
        return <ModernPropertyCardSkeleton key={index} />;
      default:
        return <ModernPropertyCardSkeleton key={index} />;
    }
  });

  return <>{skeletons}</>;
};

export { SkeletonPlaceholder, ModernPropertyCardSkeleton, ModernListSkeleton };
export default ModernListSkeleton;
