import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import useAuthStore from '../../../../store/authStore';
import usePropertyStore from '../../../../store/propertyStore';
import { COLORS, PROPERTY_TYPES, AMENITIES } from '../../../../utils/constants';

export default function EditPropertyScreen() {
  const { id: propertyId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const {
    selectedProperty,
    fetchPropertyById,
    updateProperty,
    uploadPropertyImages,
    isLoading,
  } = usePropertyStore();

  // Protección de ruta: solo propietarios pueden acceder
  useEffect(() => {
    if (user && user.rol !== 'propietario') {
      Alert.alert(
        'Acceso restringido',
        'Esta sección está disponible solo para usuarios propietarios.',
        [{ text: 'Entendido', onPress: () => router.replace('/') }]
      );
    }
  }, [user]);

  // Fetch property data
  useEffect(() => {
    if (propertyId) {
      fetchPropertyById(propertyId);
    }
  }, [propertyId]);

  // Local form state
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [precioMes, setPrecioMes] = useState('');
  const [tipoPropiedad, setTipoPropiedad] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [newImages, setNewImages] = useState([]);

  // Populate form when property fetched
  useEffect(() => {
    if (selectedProperty) {
      setTitulo(selectedProperty.titulo || '');
      setDescripcion(selectedProperty.descripcion || '');
      setDireccion(selectedProperty.direccion || '');
      setPrecioMes(selectedProperty.precio_noche ? String(selectedProperty.precio_noche) : '');
      setTipoPropiedad(selectedProperty.tipo_propiedad || '');
      setCapacidad(selectedProperty.capacidad ? String(selectedProperty.capacidad) : '');
      setSelectedAmenities(selectedProperty.servicios || []);
    }
  }, [selectedProperty]);

  const handleSelectImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la galería de fotos');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        selectionLimit: 5,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imgs = [...newImages, ...result.assets.map((a) => a.uri)];
        setNewImages(imgs.slice(0, 5));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al seleccionar las imágenes');
    }
  };

  const handleRemoveNewImage = (index) => {
    const imgs = [...newImages];
    imgs.splice(index, 1);
    setNewImages(imgs);
  };

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const validateForm = () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return false;
    }
    if (!direccion.trim()) {
      Alert.alert('Error', 'La dirección es obligatoria');
      return false;
    }
    if (!precioMes.trim() || isNaN(parseFloat(precioMes))) {
      Alert.alert('Error', 'El precio por mes debe ser un número válido');
      return false;
    }
    return true;
  };

  const handleUpdateProperty = async () => {
    if (!validateForm()) return;
    try {
      const propertyData = {
        titulo,
        descripcion,
        direccion,
        precio_noche: parseFloat(precioMes),
        tipo_propiedad: tipoPropiedad,
        servicios: selectedAmenities,
        capacidad: capacidad ? parseInt(capacidad) : null,
      };
      const { error } = await updateProperty(propertyId, propertyData);
      if (error) {
        Alert.alert('Error', 'No se pudo actualizar la propiedad');
        return;
      }
      if (newImages.length > 0) {
        await uploadPropertyImages(propertyId, newImages);
      }
      Alert.alert('Éxito', 'Propiedad actualizada correctamente', [
        { text: 'Aceptar', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Ocurrió un error al actualizar la propiedad');
    }
  };

  if (!selectedProperty && isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Propiedad</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Datos básicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información básica</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              value={descripcion}
              onChangeText={setDescripcion}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección</Text>
            <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Precio por mes</Text>
            <View style={styles.priceInput}>
              <Text style={styles.priceCurrency}>$</Text>
              <TextInput
                style={{ flex: 1 }}
                value={precioMes}
                onChangeText={setPrecioMes}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Tipo y capacidad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo y capacidad</Text>
          {/* Tipo */}
          <View style={styles.optionsContainer}>
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  tipoPropiedad === type && styles.selectedOption,
                ]}
                onPress={() => setTipoPropiedad(type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    tipoPropiedad === type && styles.selectedOptionText,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Capacidad */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Capacidad (número de huéspedes)</Text>
            <TextInput
              style={styles.input}
              value={capacidad}
              onChangeText={setCapacidad}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Servicios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios</Text>
          <View style={styles.amenitiesContainer}>
            {AMENITIES.map((amenity) => (
              <TouchableOpacity
                key={amenity}
                style={[
                  styles.amenityButton,
                  selectedAmenities.includes(amenity) && styles.selectedAmenity,
                ]}
                onPress={() => toggleAmenity(amenity)}
              >
                <Text
                  style={[
                    styles.amenityText,
                    selectedAmenities.includes(amenity) && styles.selectedAmenityText,
                  ]}
                >
                  {amenity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Galería de fotos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Galería de fotos</Text>
          <View style={styles.photosContainer}>
            {/* Fotos existentes */}
            {selectedProperty?.galeria_fotos?.map((url, idx) => (
              <View key={`existing-${idx}`} style={styles.photoContainer}>
                <Image source={{ uri: url }} style={styles.photo} />
              </View>
            ))}
            {/* Nuevas fotos */}
            {newImages.map((uri, idx) => (
              <View key={`new-${idx}`} style={styles.photoContainer}>
                <Image source={{ uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemoveNewImage(idx)}
                >
                  <FontAwesome name="close" size={12} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
            {/* Añadir foto */}
            {selectedProperty?.galeria_fotos?.length + newImages.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handleSelectImages}
              >
                <FontAwesome name="plus" size={20} color={COLORS.darkGray} />
                <Text style={styles.addPhotoText}>Agregar Foto</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.photoHelperText}>
            Puedes agregar hasta 5 fotos. La primera será la principal.
          </Text>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleUpdateProperty}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <FontAwesome name="save" size={16} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  formContainer: {
    padding: 15,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    paddingHorizontal: 12,
  },
  priceCurrency: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 5,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.text,
  },
  selectedOptionText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedAmenity: {
    backgroundColor: COLORS.primary,
  },
  amenityText: {
    color: COLORS.text,
  },
  selectedAmenityText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  addPhotoText: {
    color: COLORS.darkGray,
    fontSize: 12,
    marginTop: 5,
  },
  photoHelperText: {
    color: COLORS.darkGray,
    fontSize: 12,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
