import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import usePropertyStore from '../../store/propertyStore';
import { COLORS, PROPERTY_TYPES } from '../../utils/constants';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const { properties, fetchProperties, isLoading, searchProperties } = usePropertyStore();

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

  const handleSearch = () => {
    searchProperties({ 
      location: searchQuery, 
      type: selectedType 
    });
  };

  const handlePropertyPress = (propertyId) => {
    router.push(`/property/${propertyId}`);
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
          <FontAwesome name="map-marker" size={14} color={COLORS.darkGray} /> {item.direccion}
        </Text>
        <View style={styles.propertyDetails}>
          <Text style={styles.propertyType}>
            {item.tipo_propiedad || 'Propiedad'}
          </Text>
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
        <View style={styles.inputContainer}>
          <FontAwesome name="search" size={18} color={COLORS.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por ubicación..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        
        <View style={styles.typesContainer}>
          <TouchableOpacity 
            style={[styles.typeButton, selectedType === '' && styles.typeButtonActive]}
            onPress={() => setSelectedType('')}
          >
            <Text style={selectedType === '' ? styles.typeTextActive : styles.typeText}>
              Todos
            </Text>
          </TouchableOpacity>
          
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity 
              key={type}
              style={[styles.typeButton, selectedType === type && styles.typeButtonActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={selectedType === type ? styles.typeTextActive : styles.typeText}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedType('');
                  fetchProperties();
                }}
              >
                <Text style={styles.resetButtonText}>Mostrar todas</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  propertyType: {
    fontSize: 12,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: COLORS.darkGray,
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
});
