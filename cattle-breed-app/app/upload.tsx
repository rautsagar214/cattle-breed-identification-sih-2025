import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/contexts/AuthContext';
import { useNetwork } from '../src/contexts/NetworkContext';
import { useLanguage } from '../src/contexts/LanguageContext';
import {
  saveImageLocally,
  saveResultOffline,
  addToPendingQueue,
} from '../src/services/offline';
import { validateImageSize, validateImageType } from '../src/utils/security';
import { detectBreed, initializeModel } from '../src/services/tflite';
import { getBreedInfo } from '../src/services/gemini';
import { translateBreedData, BreedData } from '../src/utils/translation';

export default function UploadScreen(): React.JSX.Element {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { isOnline, refreshPendingCount } = useNetwork();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [detectionResult, setDetectionResult] = useState<BreedData | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload photos');
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take photos');
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7, // Compress to 70% quality for faster upload
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const image = result.assets[0];

      // Validate image size (max 5MB)
      if (image.fileSize) {
        const sizeCheck = validateImageSize(image.fileSize, 5);
        if (!sizeCheck.isValid) {
          Alert.alert('Image Too Large', sizeCheck.error + '\n\nPlease choose a smaller image or compress it.');
          return;
        }
      }

      // Validate image type
      if (image.mimeType) {
        const typeCheck = validateImageType(image.mimeType);
        if (!typeCheck.isValid) {
          Alert.alert('Invalid Image Type', typeCheck.error + '\n\nPlease select a JPEG, PNG, or WebP image.');
          return;
        }
      }

      setSelectedImage(image.uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Compress for faster upload
    });

    if (!result.canceled && result.assets[0]) {
      const image = result.assets[0];

      // Validate image size (max 5MB)
      if (image.fileSize) {
        const sizeCheck = validateImageSize(image.fileSize, 5);
        if (!sizeCheck.isValid) {
          Alert.alert('Image Too Large', sizeCheck.error + '\n\nPlease try taking the photo again with lower quality.');
          return;
        }
      }

      // Validate image type
      if (image.mimeType) {
        const typeCheck = validateImageType(image.mimeType);
        if (!typeCheck.isValid) {
          Alert.alert('Invalid Image Type', typeCheck.error);
          return;
        }
      }

      setSelectedImage(image.uri);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select or take a photo first');
      return;
    }

    if (!user) {
      Alert.alert('Not Logged In', 'Please login to analyze images');
      router.push('/login' as any);
      return;
    }

    setIsAnalyzing(true);
    setIsAnalyzing(true);
    try {
      // Step 1: Check Network Status
      // If Online: Show alert and STOP (as per user request)
      if (isOnline) {
        Alert.alert(
          'Online Mode',
          'Breed detection is currently disabled in online mode.\n\nPlease disconnect from internet to use the offline TFLite model.',
          [{ text: 'OK' }]
        );
        setIsAnalyzing(false);
        return;
      }

      // Step 2: Offline Mode - Run TFLite
      setUploadProgress(t('upload.initializing') || 'Initializing model...');
      await initializeModel(); // no-op if already initialized

      setUploadProgress(t('upload.analyzing') || 'Analyzing breed...');
      const detection = await detectBreed(selectedImage);

      // Offline: Use basic info (will be translated if cached)
      const breedData: BreedData = {
        breedName: detection.breedName,
        description: `Detected with ${(detection.confidence * 100).toFixed(1)}% confidence. Connect to internet for detailed information.`,
        characteristics: [
          'Physical characteristics identified by AI model',
          'Breed-specific features detected',
        ],
        careTips: [
          'Provide clean water daily',
          'Feed balanced diet with minerals',
          'Regular veterinary checkups',
        ],
      };

      const analysisResult = {
        breedName: breedData.breedName,
        confidence: detection.confidence,
        characteristics: breedData.characteristics,
        careTips: breedData.careTips,
      } as const;

      setDetectionResult(breedData);

      // ALWAYS Save locally first
      setUploadProgress('Saving result...');

      // Save image to local storage
      const localImagePath = await saveImageLocally(selectedImage, String(user.id));

      // Create result object
      const resultId = `result_${Date.now()}`;
      const resultObj = {
        id: resultId,
        userId: String(user.id),
        breedName: analysisResult.breedName,
        confidence: analysisResult.confidence,
        imageUri: localImagePath,
        characteristics: analysisResult.characteristics,
        careTips: analysisResult.careTips,
        timestamp: new Date().toISOString(),
        synced: false,
      };

      // Save result offline
      await saveResultOffline(resultObj);

      await refreshPendingCount();

      // Store result for display on result screen
      await AsyncStorage.setItem('latestResult', JSON.stringify({
        breedName: analysisResult.breedName,
        confidence: analysisResult.confidence,
        imageUrl: localImagePath,
        characteristics: analysisResult.characteristics,
        careTips: analysisResult.careTips,
        description: breedData.description || `${analysisResult.breedName} cattle breed detected`,
      }));

      // Navigate directly to result screen
      console.log('✅ Analysis complete, navigating to results...');
      router.push('/result' as any);

      setSelectedImage(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze image');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
      setUploadProgress('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('upload.title')}</Text>
          <Text style={styles.subtitle}>Take or choose a photo to identify the breed</Text>
        </View>

        {/* Image Preview */}
        <View style={styles.imageContainer}>
          {selectedImage ? (
            <>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.removeButtonText}>✕ Remove</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderText}>No image selected</Text>
              <Text style={styles.placeholderSubtext}>
                Choose an option below to get started
              </Text>
            </View>
          )}
        </View>

        {/* Upload Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={takePhoto}
            disabled={isAnalyzing}
          >
            <Text style={styles.buttonIcon}>📷</Text>
            <Text style={styles.buttonText}>{t('upload.takePhoto')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={pickImageFromGallery}
            disabled={isAnalyzing}
          >
            <Text style={styles.buttonIcon}>🖼️</Text>
            <Text style={styles.buttonText}>{t('upload.chooseGallery')}</Text>
          </TouchableOpacity>
        </View>

        {/* Analyze Button */}
        {selectedImage && (
          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={analyzeImage}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <ActivityIndicator color="white" />
                <Text style={styles.analyzeButtonText}>{uploadProgress || t('upload.analyzing')}</Text>
              </>
            ) : (
              <Text style={styles.analyzeButtonText}>🔍 Analyze Breed</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>📝 Tips for Best Results:</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Take clear, well-lit photos</Text>
            <Text style={styles.tipItem}>• Show the full body of the cattle</Text>
            <Text style={styles.tipItem}>• Avoid blurry or distant shots</Text>
            <Text style={styles.tipItem}>• Capture distinctive features (horns, color, hump)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  imageContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  placeholderContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
  },
  placeholderIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 5,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#95a5a6',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#9b59b6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#2ecc71',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipsContainer: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
