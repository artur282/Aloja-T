import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/themeContext';
import { SPACING } from '../../utils/constants';

const RatingStars = ({
  rating = 0,
  maxRating = 5,
  size = 12,
  showRating = true,
  showReviewCount = true,
  reviewCount = 0,
  style,
  starColor = '#FFD700',
  emptyStarColor,
}) => {
  const { currentTheme } = useTheme();
  const defaultEmptyStarColor = emptyStarColor || currentTheme.border;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons
          key={`full-${i}`}
          name="star"
          size={size}
          color={starColor}
          style={{ marginRight: 1 }}
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <Ionicons
          key="half"
          name="star-half"
          size={size}
          color={starColor}
          style={{ marginRight: 1 }}
        />
      );
    }

    // Empty stars
    const emptyStars = maxRating - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={size}
          color={defaultEmptyStarColor}
          style={{ marginRight: 1 }}
        />
      );
    }

    return stars;
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {/* Stars */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {renderStars()}
      </View>

      {/* Rating Number */}
      {showRating && rating > 0 && (
        <Text
          style={{
            fontSize: size + 2,
            fontWeight: '600',
            color: currentTheme.onBackground,
            marginLeft: SPACING.xs,
          }}
        >
          {rating.toFixed(1)}
        </Text>
      )}

      {/* Review Count */}
      {showReviewCount && reviewCount > 0 && (
        <Text
          style={{
            fontSize: size + 2,
            color: currentTheme.textSecondary,
            marginLeft: SPACING.xs,
          }}
        >
          ({reviewCount} reseña{reviewCount !== 1 ? 's' : ''})
        </Text>
      )}
    </View>
  );
};

export default RatingStars;
