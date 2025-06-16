import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';

const { width, height } = Dimensions.get('window');

export default function PaymentProofScreen() {
  const { url } = useLocalSearchParams();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleDownload = async () => {
    try {
      // Solicitar permisos para guardar archivos (solo necesario en Android)
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permiso denegado',
            'Se necesitan permisos para guardar el comprobante en tu dispositivo.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      // Mostrar indicador de descarga
      Alert.alert(
        'Descargando',
        'Descargando comprobante...',
      );
      
      // Descargar la imagen
      const decodedUrl = decodeURIComponent(url);
      const fileName = `comprobante_pago_${Date.now()}.jpg`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      const downloadResult = await FileSystem.downloadAsync(decodedUrl, fileUri);
      
      if (downloadResult.status !== 200) {
        throw new Error('Error al descargar el archivo');
      }
      
      // Guardar en la galería si estamos en un dispositivo móvil
      if (Platform.OS !== 'web') {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('Aloja-T', asset, false);
      }
      
      Alert.alert(
        'Descarga completa',
        'El comprobante se ha guardado correctamente en tu galería.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error al descargar:', error);
      Alert.alert(
        'Error',
        'No se pudo descargar el comprobante. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  // Ya no necesitamos esta función porque eliminamos el botón de compartir

  if (!url) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>No se proporcionó una URL válida</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color={COLORS.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Comprobante de Pago</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleDownload}
          >
            <FontAwesome name="download" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando comprobante...</Text>
          </View>
        )}
        
        {imageError ? (
          <View style={styles.errorImageContainer}>
            <FontAwesome name="image" size={80} color={COLORS.darkGray} />
            <Text style={styles.errorImageText}>
              No se pudo cargar el comprobante
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setImageError(false);
                setImageLoading(true);
              }}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Image
            source={{ uri: decodeURIComponent(url) }}
            style={styles.proofImage}
            onLoad={handleImageLoad}
            onError={handleImageError}
            resizeMode="contain"
          />
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Toca y mantén presionado para guardar la imagen
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerActions: {
    flexDirection: 'row',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  errorImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorImageText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  proofImage: {
    width: width,
    height: height - 120, // Ajustar por header y footer
  },
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.white,
    textAlign: 'center',
  },
});
