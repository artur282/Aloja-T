import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import usePropertyStore from '../../store/propertyStore';
import { COLORS, PROPERTY_TYPES, SORT_OPTIONS } from '../../utils/constants';
import AdvancedFilters from '../../components/AdvancedFilters';
import ciudadesData from '../../data/ciudades.json';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [suggestedCities, setSuggestedCities] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { properties, fetchProperties, isLoading, searchProperties } = usePropertyStore();
  
  // Lista plana de todas las ciudades
  const todasLasCiudades = Object.values(ciudadesData).flat();

  // Fetch properties when component mounts
  useEffect(() => {
    fetchProperties();
  }, []);
  
  // Refresh properties whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchProperties();
      return () => {};
    }, [])
  );

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (currentFilters.location) count++;
    if (currentFilters.estado) count++;
    if (currentFilters.ciudad) count++;
    if (currentFilters.type) count++;
    if (currentFilters.minPrice) count++;
    if (currentFilters.maxPrice && currentFilters.maxPrice < 50000) count++;
    if (currentFilters.capacity && currentFilters.capacity > 1) count++;
    if (currentFilters.amenities && currentFilters.amenities.length > 0) count++;
    if (currentFilters.sortBy && currentFilters.sortBy !== 'newest') count++;
    setActiveFiltersCount(count);
  }, [currentFilters]);

  // Filtrar ciudades basado en el texto ingresado
  const filterCities = (text) => {
    if (!text) {
      setSuggestedCities([]);
      setShowSuggestions(false);
      return;
    }
    
    const filtered = todasLasCiudades.filter(city => 
      city.toLowerCase().includes(text.toLowerCase())
    ).slice(0, 5); // Limitar a 5 sugerencias
    
    setSuggestedCities(filtered);
    setShowSuggestions(filtered.length > 0);
  };
  
  // Manejar cambio en el texto de búsqueda
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    filterCities(text);
  };
  
  // Seleccionar una ciudad sugerida
  const selectCity = (city) => {
    setSearchQuery(city);
    setSuggestedCities([]);
    setShowSuggestions(false);
    
    // Buscar automáticamente con la ciudad seleccionada
    const searchParams = {
      ciudad: city,
      type: selectedType,
      ...currentFilters
    };
    searchProperties(searchParams);
  };
  
  const handleSearch = () => {
    const searchParams = {
      ciudad: searchQuery, // Cambiar location por ciudad
      type: selectedType,
      ...currentFilters
    };
    searchProperties(searchParams);
    setShowSuggestions(false);
  };

  const handleAdvancedFilters = (filters) => {
    setCurrentFilters(filters);
    setSearchQuery(filters.ciudad || ''); // Cambiar location por ciudad
    setSelectedType(filters.type || '');
    
    // Apply the filters immediately
    searchProperties(filters);
    setShowSuggestions(false);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setCurrentFilters({});
    fetchProperties();
  };

  const handlePropertyPress = (propertyId) => {
    router.push(`/property/${propertyId}`);
  };

  const getCurrentSortLabel = () => {
    const sortOption = SORT_OPTIONS.find(option => option.value === currentFilters.sortBy);
    return sortOption ? sortOption.label : 'Más recientes';
  };

  const renderPropertyItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.propertyCard}
      onPress={() => handlePropertyPress(item.id)}
    >
      <View style={styles.imageContainer}>
        {item.galeria_fotos && item.galeria_fotos.length > 0 ? (
          <Image 
            source={{ uri: item.galeria_fotos[0] }} 
            style={styles.propertyImage} 
            contentFit="cover"
            transition={200}
            placeholder={{uri: null}}
            cachePolicy="memory-disk"
            onError={() => console.log(`Error loading image for property ${item.id}`)}
          />
        ) : (
          <View style={styles.noImageContainer}>
            <FontAwesome name="home" size={40} color={COLORS.lightGray} />
            <Text style={styles.noImageText}>Sin imagen</Text>
          </View>
        )}
      </View>
      
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {item.titulo}
        </Text>
        <Text style={styles.propertyLocation} numberOfLines={1}>
          <FontAwesome name="map-marker" size={14} color={COLORS.darkGray} /> 
          {item.ciudad ? `${item.ciudad} - ` : ""}{item.direccion}
        </Text>
        <View style={styles.propertyDetails}>
          <View style={styles.propertyMeta}>
            <Text style={styles.propertyType}>
              {item.tipo_propiedad || 'Propiedad'}
            </Text>
            {item.capacidad && (
              <Text style={styles.propertyCapacity}>
                <FontAwesome name="users" size={12} color={COLORS.darkGray} /> {item.capacidad}
              </Text>
            )}
          </View>
          <Text style={styles.propertyPrice}>
            ${item.precio_noche.toLocaleString()} <Text style={styles.perNight}>/ Mes</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {/* Barra de búsqueda con botón de filtros */}
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por ciudad..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowAdvancedFilters(true)}
          >
            <FontAwesome name="filter" size={16} color={COLORS.primary} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Sugerencias de ciudades */}
        {showSuggestions && (
          <View style={styles.suggestionsContainer}>
            {suggestedCities.map((city, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.suggestionItem}
                onPress={() => selectCity(city)}
              >
                <FontAwesome name="map-marker" size={14} color={COLORS.darkGray} style={styles.suggestionIcon} />
                <Text style={styles.suggestionText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <View style={styles.activeFiltersContainer}>
            <View style={styles.activeFiltersInfo}>
              <Text style={styles.activeFiltersText}>
                {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} activo{activeFiltersCount > 1 ? 's' : ''}
              </Text>
              {currentFilters.sortBy && (
                <Text style={styles.sortInfo}>• {getCurrentSortLabel()}</Text>
              )}
            </View>
            <TouchableOpacity onPress={handleClearAllFilters}>
              <Text style={styles.clearFiltersText}>Limpiar todo</Text>
            </TouchableOpacity>
          </View>
        )}


      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Buscando propiedades...</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.propertiesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome name="search" size={50} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No se encontraron propiedades</Text>
              <Text style={styles.emptySubtext}>
                Intenta ajustar tus filtros de búsqueda
              </Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleClearAllFilters}
              >
                <Text style={styles.resetButtonText}>Mostrar todas</Text>
              </TouchableOpacity>
            </View>
          }
          ListHeaderComponent={
            properties.length > 0 ? (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                  {properties.length} propiedad{properties.length > 1 ? 'es' : ''} encontrada{properties.length > 1 ? 's' : ''}
                </Text>
              </View>
            ) : null
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
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  inputIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    elevation: 0,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeText: {
    color: COLORS.darkGray,
    fontSize: 14,
  },
  typeTextActive: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  activeFiltersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFiltersText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 5,
  },
  sortInfo: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  clearFiltersText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 10,
  },
  propertiesList: {
    padding: 15,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 15,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 120,
    height: 120,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: COLORS.darkGray,
    marginTop: 5,
    fontSize: 12,
  },
  propertyInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  propertyLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginVertical: 5,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  propertyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyType: {
    fontSize: 12,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: COLORS.darkGray,
  },
  propertyCapacity: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginLeft: 5,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  perNight: {
    fontSize: 12,
    fontWeight: 'normal',
    color: COLORS.darkGray,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 5,
  },
  resetButton: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  resetButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  resultsHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  resultsCount: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: 15,
    right: 15,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 100,
    maxHeight: 200,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.text,
  },
});
