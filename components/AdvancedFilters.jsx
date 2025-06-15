import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Switch,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { 
  COLORS, 
  PROPERTY_TYPES, 
  AMENITIES, 
  SORT_OPTIONS, 
  PRICE_RANGES, 
  CAPACITY_OPTIONS 
} from '../utils/constants';
import estadosCiudades from '../data/ciudades.json';

const AdvancedFilters = ({ visible, onClose, onApplyFilters, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    location: initialFilters.location || '',
    ciudad: initialFilters.ciudad || '',
    type: initialFilters.type || '',
    sortBy: initialFilters.sortBy || 'newest',
    priceRange: initialFilters.priceRange || null,
    minPrice: initialFilters.minPrice || 0,
    maxPrice: initialFilters.maxPrice || 500, // Adjusted for USD
    capacity: initialFilters.capacity || 1,
    amenities: initialFilters.amenities || [],
    useCustomPriceRange: initialFilters.useCustomPriceRange || false,
  });
  
  // Estados para el modal de selección de ciudad
  const [showCitiesModal, setShowCitiesModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Obtener todas las ciudades de todos los estados
  const todasLasCiudades = useMemo(() => {
    const ciudades = [];
    Object.values(estadosCiudades).forEach(ciudadesArray => {
      ciudades.push(...ciudadesArray);
    });
    return [...new Set(ciudades)].sort();
  }, []);

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handlePriceRangeSelect = (range) => {
    setFilters(prev => ({
      ...prev,
      priceRange: range,
      minPrice: range.min,
      maxPrice: range.max || 500, // Adjusted for USD, assuming 'Más de X' means up to a reasonable max
      useCustomPriceRange: false,
    }));
  };

  const handleCustomPriceToggle = (value) => {
    setFilters(prev => ({
      ...prev,
      useCustomPriceRange: value,
      priceRange: value ? null : prev.priceRange,
    }));
  };

  const handleApply = () => {
    const searchParams = {
      location: filters.location,
      ciudad: filters.ciudad,
      type: filters.type,
      sortBy: filters.sortBy,
      minPrice: filters.minPrice > 0 ? filters.minPrice : null,
      maxPrice: filters.maxPrice < 500 ? filters.maxPrice : null, // Adjusted for USD
      capacity: filters.capacity > 1 ? filters.capacity : null,
      amenities: filters.amenities.length > 0 ? filters.amenities : null,
    };
    
    onApplyFilters(searchParams);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      location: '',
      ciudad: '',
      type: '',
      sortBy: 'newest',
      priceRange: null,
      minPrice: 0,
      maxPrice: 500, // Adjusted for USD
      capacity: 1,
      amenities: [],
      useCustomPriceRange: false,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <FontAwesome name="times" size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtros de Búsqueda</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Ubicación General */}


          {/* Ciudad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ciudad</Text>
            
            <TouchableOpacity 
              style={styles.selector}
              onPress={() => {
                setSearchText('');
                setShowCitiesModal(true);
              }}
            >
              <Text style={filters.ciudad ? styles.selectorText : styles.selectorPlaceholder}>
                {filters.ciudad || 'Seleccionar ciudad'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>

          {/* Tipo de Propiedad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Propiedad</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, filters.type === '' && styles.typeButtonActive]}
                onPress={() => setFilters(prev => ({ ...prev, type: '' }))}
              >
                <Text style={[styles.typeText, filters.type === '' && styles.typeTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              {PROPERTY_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, filters.type === type && styles.typeButtonActive]}
                  onPress={() => setFilters(prev => ({ ...prev, type }))}
                >
                  <Text style={[styles.typeText, filters.type === type && styles.typeTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ordenamiento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ordenar por</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.sortBy}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                style={styles.picker}
              >
                {SORT_OPTIONS.map(option => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Rango de Precios */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Precio por Mes</Text>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Rango personalizado</Text>
              <Switch
                value={filters.useCustomPriceRange}
                onValueChange={handleCustomPriceToggle}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            {!filters.useCustomPriceRange ? (
              <View style={styles.priceRangeContainer}>
                {PRICE_RANGES.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.priceRangeButton,
                      filters.priceRange === range && styles.priceRangeButtonActive
                    ]}
                    onPress={() => handlePriceRangeSelect(range)}
                  >
                    <Text style={[
                      styles.priceRangeText,
                      filters.priceRange === range && styles.priceRangeTextActive
                    ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.customPriceContainer}>
                <Text style={styles.priceLabel}>
                  Precio: ${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()}
                </Text>
                
                <Text style={styles.fieldLabel}>Precio mínimo</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={500} // Adjusted for USD
                  step={10} // Adjusted for USD
                  value={filters.minPrice}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, minPrice: value }))}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.lightGray}
                  thumbStyle={{ backgroundColor: COLORS.primary }}
                />
                
                <Text style={styles.fieldLabel}>Precio máximo</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={filters.minPrice}
                  maximumValue={500} // Adjusted for USD
                  step={10} // Adjusted for USD
                  value={filters.maxPrice}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, maxPrice: value }))}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.lightGray}
                  thumbStyle={{ backgroundColor: COLORS.primary }}
                />
              </View>
            )}
          </View>

          {/* Capacidad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Capacidad</Text>
            <View style={styles.capacityContainer}>
              {CAPACITY_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.capacityButton,
                    filters.capacity === option.value && styles.capacityButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, capacity: option.value }))}
                >
                  <Text style={[
                    styles.capacityText,
                    filters.capacity === option.value && styles.capacityTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Servicios */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
            <View style={styles.amenitiesContainer}>
              {AMENITIES.map(amenity => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.amenityButton,
                    filters.amenities.includes(amenity) && styles.amenityButtonActive
                  ]}
                  onPress={() => handleAmenityToggle(amenity)}
                >
                  <Text style={[
                    styles.amenityText,
                    filters.amenities.includes(amenity) && styles.amenityTextActive
                  ]}>
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Selección de Ciudad */}
      <Modal
        visible={showCitiesModal}
        animationType="slide"
        transparent={true}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccione una ciudad</Text>
              <TouchableOpacity onPress={() => setShowCitiesModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput 
                style={styles.searchInput}
                placeholder="Buscar ciudad..."
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <MaterialIcons name="close" size={20} color={COLORS.darkGray} />
                </TouchableOpacity>
              ) : (
                <MaterialIcons name="search" size={20} color={COLORS.darkGray} />
              )}
            </View>
            
            <FlatList
              data={todasLasCiudades.filter(city => 
                city.toLowerCase().includes(searchText.toLowerCase())
              )}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setFilters(prev => ({ ...prev, ciudad: item }));
                    setShowCitiesModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {filters.ciudad === item && (
                    <MaterialIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyList}>
                  No se encontraron ciudades con "{searchText}"
                </Text>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    margin: 15,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  emptyList: {
    padding: 20,
    textAlign: 'center',
    color: COLORS.darkGray,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resetText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 50,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    color: COLORS.darkGray,
    fontSize: 14,
  },
  typeTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  priceRangeContainer: {
    gap: 10,
  },
  priceRangeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  priceRangeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priceRangeText: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 14,
  },
  priceRangeTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  customPriceContainer: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 10,
  },
  capacityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  capacityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  capacityButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  capacityText: {
    color: COLORS.text,
    fontSize: 14,
  },
  capacityTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  amenityButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  amenityText: {
    color: COLORS.text,
    fontSize: 12,
  },
  amenityTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdvancedFilters;
