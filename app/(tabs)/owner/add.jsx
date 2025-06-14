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
  Image 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import useAuthStore from '../../../store/authStore';
import usePropertyStore from '../../../store/propertyStore';
import { COLORS, PROPERTY_TYPES, AMENITIES } from '../../../utils/constants';

export default function AddPropertyScreen() {
  const { user } = useAuthStore();
  const { createProperty, uploadPropertyImages, isLoading } = usePropertyStore();
  
  // Protección de ruta: solo propietarios pueden acceder
  useEffect(() => {
    if (user && user.rol !== 'propietario') {
      // Si no es propietario, redirigir a la página principal
      Alert.alert(
        'Acceso restringido',
        'Esta sección está disponible solo para usuarios propietarios.',
        [{ text: 'Entendido', onPress: () => router.replace('/') }]
      );
    }
  }, [user]);
  
  // Form state
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [precioMes, setPrecioMes] = useState('');
  const [tipoPropiedad, setTipoPropiedad] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [images, setImages] = useState([]);
  
  const handleSelectImages = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la galería de fotos');
        return;
      }
      
      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        selectionLimit: 5,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Add new images to existing ones (max 5)
        const newImages = [...images, ...result.assets.map(asset => asset.uri)];
        setImages(newImages.slice(0, 5));
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al seleccionar las imágenes');
      console.error(error);
    }
  };
  
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
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
  
  const handleCreateProperty = async () => {
    if (!validateForm()) return;
    
    try {
      // Create property data
      const propertyData = {
        id_propietario: user.id,
        titulo,
        descripcion,
        direccion,
        precio_noche: parseFloat(precioMes),
        tipo_propiedad: tipoPropiedad,
        servicios: selectedAmenities,
        capacidad: capacidad ? parseInt(capacidad) : null,
        estado: 'disponible'
      };
      
      // Create property first
      const { data: property, error } = await createProperty(propertyData);
      
      if (error) {
        Alert.alert('Error', 'No se pudo crear la propiedad');
        return;
      }
      
      // If images were selected, upload them
      if (images.length > 0) {
        const { error: uploadError } = await uploadPropertyImages(property.id, images);
        
        if (uploadError) {
          Alert.alert('Advertencia', 'Propiedad creada pero hubo un error al subir las imágenes');
        }
      }
      
      // Clear all form fields
      setTitulo('');
      setDescripcion('');
      setDireccion('');
      setPrecioMes('');
      setTipoPropiedad('');
      setCapacidad('');
      setSelectedAmenities([]);
      setImages([]);
      
      Alert.alert(
        'Éxito', 
        'Propiedad creada correctamente. Puedes agregar otra o volver a la lista de propiedades.',
        [
          { text: 'Agregar otra', style: 'default' },
          { text: 'Volver a la lista', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al crear la propiedad');
      console.error(error);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agregar Propiedad</Text>
      </View>
      
      <View style={styles.formContainer}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Título de la propiedad"
              value={titulo}
              onChangeText={setTitulo}
              maxLength={50}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe tu propiedad..."
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección *</Text>
            <TextInput
              style={styles.input}
              placeholder="Dirección completa"
              value={direccion}
              onChangeText={setDireccion}
            />
          </View>
        </View>
        
        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles de la Propiedad</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Precio por mes</Text>
            <View style={styles.priceInput}>
              <Text style={styles.priceCurrency}>$</Text>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, paddingLeft: 0 }]}
                placeholder="0.00"
                value={precioMes}
                onChangeText={setPrecioMes}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de propiedad</Text>
            <View style={styles.optionsContainer}>
              {PROPERTY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    tipoPropiedad === type && styles.selectedOption
                  ]}
                  onPress={() => setTipoPropiedad(type)}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      tipoPropiedad === type && styles.selectedOptionText
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Capacidad (personas)</Text>
            <TextInput
              style={styles.input}
              placeholder="Número de personas"
              value={capacidad}
              onChangeText={setCapacidad}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios disponibles</Text>
          <View style={styles.amenitiesContainer}>
            {AMENITIES.map((amenity) => (
              <TouchableOpacity
                key={amenity}
                style={[
                  styles.amenityButton,
                  selectedAmenities.includes(amenity) && styles.selectedAmenity
                ]}
                onPress={() => toggleAmenity(amenity)}
              >
                <Text 
                  style={[
                    styles.amenityText,
                    selectedAmenities.includes(amenity) && styles.selectedAmenityText
                  ]}
                >
                  {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotos de la propiedad</Text>
          
          <View style={styles.photosContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <FontAwesome name="times" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handleSelectImages}
              >
                <FontAwesome name="plus" size={24} color={COLORS.darkGray} />
                <Text style={styles.addPhotoText}>Agregar foto</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.photoHelperText}>
            Puedes agregar hasta 5 fotos. La primera será la principal.
          </Text>
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateProperty}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <FontAwesome name="check" size={16} color={COLORS.white} />
              <Text style={styles.createButtonText}>Crear Propiedad</Text>
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
  createButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
