import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../utils/themeContext";
import { BORDER_RADIUS, SPACING, MODERN_SHADOWS } from "../../utils/constants";
import FloatingCard from "./FloatingCard";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth - SPACING.lg * 2;

const ModernPropertyCard = ({
  property,
  onPress,
  style,
  imageHeight = 250,
  showRating = true,
  overlayInfo = true,
}) => {
  const { currentTheme } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Press animations
  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress(property);
    } else {
      router.push(`/property/${property.id}`);
    }
  };

  const images = property.imagenes || [];
  const totalImages = images.length;

  const renderImageCounter = () => {
    if (totalImages <= 1) return null;

    return (
      <View
        style={{
          position: "absolute",
          top: SPACING.md,
          right: SPACING.md,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
          borderRadius: BORDER_RADIUS.medium,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {currentImageIndex + 1} / {totalImages}
        </Text>
      </View>
    );
  };

  const renderRating = () => {
    if (!showRating || !property.rating) return null;

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: SPACING.xs,
        }}
      >
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: currentTheme.onBackground,
            marginLeft: SPACING.xs,
          }}
        >
          {property.rating}
        </Text>
        {property.reviewCount && (
          <Text
            style={{
              fontSize: 14,
              color: currentTheme.textSecondary,
              marginLeft: SPACING.xs,
            }}
          >
            ({property.reviewCount} reseñas)
          </Text>
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeValue,
          transform: [{ scale: scaleValue }],
        },
        style,
      ]}
    >
      <FloatingCard
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          width: cardWidth,
          marginHorizontal: SPACING.lg,
          marginBottom: SPACING.lg,
        }}
        padding="xs"
        shadowLevel="medium"
      >
        {/* Image Container */}
        <View
          style={{
            position: "relative",
            borderRadius: BORDER_RADIUS.large,
            overflow: "hidden",
            marginBottom: SPACING.md,
          }}
        >
          <Image
            source={{
              uri:
                images[currentImageIndex] ||
                images[0] ||
                "https://via.placeholder.com/400x250",
            }}
            style={{
              width: "100%",
              height: imageHeight,
            }}
            contentFit="cover"
            transition={200}
          />

          {renderImageCounter()}

          {/* Overlay Info */}
          {overlayInfo && property.estado && (
            <View
              style={{
                position: "absolute",
                bottom: SPACING.md,
                left: SPACING.md,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                paddingHorizontal: SPACING.sm,
                paddingVertical: SPACING.xs,
                borderRadius: BORDER_RADIUS.small,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {property.estado}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{ padding: SPACING.sm }}>
          {/* Title and Location */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: currentTheme.onBackground,
              marginBottom: SPACING.xs,
            }}
            numberOfLines={1}
          >
            {property.titulo}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: currentTheme.textSecondary,
              marginBottom: SPACING.sm,
            }}
            numberOfLines={1}
          >
            {property.ciudad ? `${property.ciudad} - ` : ""}
            {property.direccion}
          </Text>

          {/* Property Type and Capacity */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: SPACING.sm,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: currentTheme.textSecondary,
                textTransform: "capitalize",
              }}
            >
              {property.tipo_propiedad || "Propiedad"}
            </Text>
            {property.capacidad && (
              <>
                <Text
                  style={{
                    fontSize: 14,
                    color: currentTheme.textSecondary,
                    marginHorizontal: SPACING.xs,
                  }}
                >
                  •
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: currentTheme.textSecondary,
                  }}
                >
                  {property.capacidad}{" "}
                  {property.capacidad === 1 ? "persona" : "personas"}
                </Text>
              </>
            )}
          </View>

          {renderRating()}

          {/* Price */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginTop: SPACING.sm,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: currentTheme.onBackground,
                }}
              >
                ${property.precio_noche?.toLocaleString() || "N/A"}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: currentTheme.textSecondary,
                  marginLeft: SPACING.xs,
                }}
              >
                / mes
              </Text>
            </View>
          </View>
        </View>
      </FloatingCard>
    </Animated.View>
  );
};

export default ModernPropertyCard;
