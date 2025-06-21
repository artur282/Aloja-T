import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import usePropertyStore from "../../store/propertyStore";
import { SPACING, BORDER_RADIUS } from "../../utils/constants";
import { useTheme } from "../../utils/themeContext";
import AdvancedFilters from "../../components/AdvancedFilters";

import {
  GradientHeader,
  ModernPropertyCard,
  FloatingCard,
  ModernEmptyState,
  ModernListSkeleton,
} from "../../components/base";
import ciudadesData from "../../data/ciudades.json";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [suggestedCities, setSuggestedCities] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { properties, fetchProperties, isLoading, searchProperties } =
    usePropertyStore();
  const { currentTheme } = useTheme();

  // Ciudades sugeridas para autocompletado - extraídas del archivo JSON
  const SUGGESTED_CITIES = Object.values(ciudadesData).flat();

  // Load properties on component mount
  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [fetchProperties])
  );

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);

    if (text.length > 0) {
      const filtered = SUGGESTED_CITIES.filter((city) =>
        city.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5);
      setSuggestedCities(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestedCities([]);
      setShowSuggestions(false);
    }
  }, []);

  // Select suggested city
  const selectCity = (city) => {
    setSearchQuery(city);
    setSuggestedCities([]);
    setShowSuggestions(false);

    const searchParams = {
      ciudad: city,
      type: selectedType,
      ...currentFilters,
    };
    searchProperties(searchParams);
  };

  const handleSearch = () => {
    const searchParams = {
      ciudad: searchQuery,
      type: selectedType,
      ...currentFilters,
    };
    searchProperties(searchParams);
    setShowSuggestions(false);
  };

  const handleAdvancedFilters = (filters) => {
    setCurrentFilters(filters);
    const filtersCount = Object.values(filters).filter(
      (value) =>
        value !== null &&
        value !== "" &&
        value !== 0 &&
        (Array.isArray(value) ? value.length > 0 : true)
    ).length;
    setActiveFiltersCount(filtersCount);

    const searchParams = {
      ciudad: searchQuery,
      type: selectedType,
      ...filters,
    };
    searchProperties(searchParams);
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setCurrentFilters({});
    setActiveFiltersCount(0);
    fetchProperties();
  };

  const handlePropertyPress = (propertyId) => {
    router.push(`/property/${propertyId}`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  }, [fetchProperties]);

  // Optimized render function
  const renderPropertyItem = useCallback(
    ({ item }) => (
      <ModernPropertyCard
        property={{
          ...item,
          imagenes: item.galeria_fotos,
          precio_noche: item.precio_noche,
          tipo_propiedad: item.tipo_propiedad || "Propiedad",
        }}
        onPress={() => handlePropertyPress(item.id)}
        showRating={true}
        overlayInfo={true}
      />
    ),
    []
  );

  // Skeleton loading component
  const renderSkeletonItem = useCallback(
    ({ index }) => (
      <ModernListSkeleton key={`skeleton-${index}`} count={1} type="property" />
    ),
    []
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const renderFloatingSearchBar = () => (
    <View>
      <FloatingCard
        style={styles.floatingSearchContainer}
        shadowLevel="medium"
        padding="sm"
      >
        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search"
            size={20}
            color={currentTheme.textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: currentTheme.onBackground }]}
            placeholder="¿A dónde quieres ir?"
            placeholderTextColor={currentTheme.textSecondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowAdvancedFilters(true)}
          >
            <Ionicons name="options" size={20} color={currentTheme.primary} />
            {activeFiltersCount > 0 && (
              <View
                style={[
                  styles.filterBadge,
                  { backgroundColor: currentTheme.primary },
                ]}
              >
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </FloatingCard>

      {/* Results count inside gradient header */}
      {properties.length > 0 && (
        <View style={styles.resultsHeaderInGradient}>
          <Text style={styles.resultsCountInGradient}>
            {properties.length} propiedad
            {properties.length > 1 ? "es" : ""} encontrada
            {properties.length > 1 ? "s" : ""}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      {/* Modern Gradient Header */}
      <GradientHeader height={90}>{renderFloatingSearchBar()}</GradientHeader>

      {/* City Suggestions */}
      {showSuggestions && (
        <FloatingCard style={styles.suggestionsContainer} shadowLevel="large">
          <ScrollView style={{ maxHeight: 200 }}>
            {suggestedCities.map((city, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => selectCity(city)}
              >
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={currentTheme.textSecondary}
                  style={styles.suggestionIcon}
                />
                <Text
                  style={[
                    styles.suggestionText,
                    { color: currentTheme.onBackground },
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </FloatingCard>
      )}

      {/* Results */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <FlatList
            data={Array(6).fill({})}
            renderItem={renderSkeletonItem}
            keyExtractor={(_, index) => `skeleton-${index}`}
            contentContainerStyle={styles.propertiesList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderPropertyItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.propertiesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[currentTheme.primary]}
              tintColor={currentTheme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading && (
              <ModernEmptyState
                icon="search"
                title="No se encontraron propiedades"
                subtitle="Intenta ajustar tus filtros de búsqueda"
                actionText="Mostrar todas"
                onActionPress={handleClearAllFilters}
              />
            )
          }
        />
      )}

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        visible={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={handleAdvancedFilters}
        initialFilters={currentFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingSearchContainer: {
    position: "absolute",
    bottom: SPACING.md, // Ajustado para el header más pequeño
    left: SPACING.sm, // Reducido para hacer la barra más larga
    right: SPACING.sm, // Reducido para hacer la barra más larga
    zIndex: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md, // Reducido para barra más compacta
    paddingVertical: SPACING.xs, // Muy reducido para hacer la barra más pequeña
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
  },
  filterButton: {
    position: "relative",
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  suggestionsContainer: {
    position: "absolute",
    top: 100, // Ajustado para la nueva altura del header (90) + padding
    left: SPACING.sm, // Coincide con la barra de búsqueda
    right: SPACING.sm, // Coincide con la barra de búsqueda
    zIndex: 100,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  suggestionIcon: {
    marginRight: SPACING.sm,
  },
  suggestionText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: SPACING.md, // Reducido ya que el header es más compacto
  },
  propertiesList: {
    paddingTop: SPACING.md, // Reducido ya que el header es más compacto
    paddingBottom: SPACING.xl,
  },
  skeletonCard: {
    marginBottom: SPACING.lg,
    marginHorizontal: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  resetButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsHeaderInGradient: {
    marginTop: SPACING.xs, // Reducido para menos espacio
    paddingHorizontal: SPACING.md, // Reducido para ser más compacto
  },
  resultsCountInGradient: {
    fontSize: 12, // Reducido para ocupar menos espacio
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)", // Texto blanco semi-transparente para el fondo naranja
    textAlign: "center",
  },
});
