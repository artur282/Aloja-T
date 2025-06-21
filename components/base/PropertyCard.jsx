import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../utils/themeContext";

const PropertyCard = ({ property, onPress, style }) => {
  const { currentTheme } = useTheme();

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

  // Press animation
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

  const formatPrice = (price) => {
    return `$${price?.toLocaleString() || "0"}/mes`;
  };

  const getMainImage = () => {
    if (property.imagenes && property.imagenes.length > 0) {
      return property.imagenes[0];
    }
    return null;
  };

  const renderAmenities = () => {
    if (!property.servicios || property.servicios.length === 0) return null;

    const displayAmenities = property.servicios.slice(0, 3);
    const remainingCount = property.servicios.length - 3;

    return (
      <View style={styles.amenitiesContainer}>
        {displayAmenities.map((amenity, index) => (
          <View
            key={index}
            style={[
              styles.amenityTag,
              { backgroundColor: `${currentTheme.primary}15` },
            ]}
          >
            <Text style={[styles.amenityText, { color: currentTheme.primary }]}>
              {amenity}
            </Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View
            style={[
              styles.amenityTag,
              { backgroundColor: `${currentTheme.textSecondary}15` },
            ]}
          >
            <Text
              style={[
                styles.amenityText,
                { color: currentTheme.textSecondary },
              ]}
            >
              +{remainingCount}
            </Text>
          </View>
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
      <TouchableOpacity
        style={[styles.container, { backgroundColor: currentTheme.surface }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getMainImage() }}
            style={styles.image}
            contentFit="cover"
            placeholder="https://via.placeholder.com/400x200/CCCCCC/FFFFFF?text=Imagen+no+disponible"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text
            style={[styles.title, { color: currentTheme.onBackground }]}
            numberOfLines={2}
          >
            {property.titulo}
          </Text>

          {/* Location */}
          <View style={styles.locationContainer}>
            <MaterialIcons
              name="location-on"
              size={14}
              color={currentTheme.textSecondary}
            />
            <Text
              style={[styles.location, { color: currentTheme.textSecondary }]}
              numberOfLines={1}
            >
              {property.ciudad}, {property.direccion}
            </Text>
          </View>

          {/* Price and Details */}
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: currentTheme.primary }]}>
              {formatPrice(property.precio)}
            </Text>
            <View style={styles.detailsContainer}>
              {property.capacidad && (
                <View style={styles.detail}>
                  <FontAwesome
                    name="users"
                    size={12}
                    color={currentTheme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    {property.capacidad}
                  </Text>
                </View>
              )}
              {property.tipo && (
                <View style={styles.detail}>
                  <FontAwesome
                    name="home"
                    size={12}
                    color={currentTheme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    {property.tipo}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Amenities */}
          {renderAmenities()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
  },
  detailsContainer: {
    flexDirection: "row",
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  amenityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 10,
    fontWeight: "500",
  },
});

export default PropertyCard;
