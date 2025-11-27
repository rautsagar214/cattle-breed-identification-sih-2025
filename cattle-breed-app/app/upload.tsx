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
import { uploadImage, saveResult } from '../src/services/firebase';
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
    try {
      // Step 1: Analyze with TFLite (works offline when model added)
      setUploadProgress(t('upload.initializing') || 'Initializing model...');
      await initializeModel(); // no-op if already initialized

      setUploadProgress(t('upload.analyzing') || 'Analyzing breed...');
      const detection = await detectBreed(selectedImage);

      // Step 2: Get detailed breed info with AI (if online) or use basic info
      let breedData: BreedData;
      let aiBreedInfo = ''; // Declare outside to make it accessible later
      
      if (isOnline) {
        try {
          setUploadProgress(t('upload.fetchingDetails') || 'Fetching breed details...');
          
          // IMPORTANT: Use Vision API data directly if available (image-specific!)
          // This ensures info matches the actual cow in the image
          console.log('📊 Detection data:', {
            hasCharacteristics: !!detection.characteristics,
            hasCareTips: !!detection.careTips,
            hasDescription: !!detection.description,
          });
          
          // Only fetch generic breed info if Vision API didn't provide it
          if (!detection.characteristics || !detection.careTips) {
            console.log('⚠️ Vision API incomplete, fetching generic breed info');
            aiBreedInfo = await getBreedInfo(detection.breedName, language);
          } else {
            console.log('✅ Using image-specific data from Vision API');
          }
          
          // Parse AI response to extract characteristics and care tips
          const parseBreedInfo = (text: string) => {
            const characteristics: string[] = [];
            const careTips: string[] = [];
            
            // Try to extract sections from the AI response
            const lines = text.split('\n');
            
            let currentSection = '';
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;
              
              // Detect section headers (multilingual) - includes numbered sections
              if (trimmedLine.match(/\*\*\s*\d*\.?\s*(शारीरिक|Physical|Characteristics|विशेषताएं|Features)/i)) {
                currentSection = 'characteristics';
                console.log('📋 Found characteristics section');
                continue;
              } else if (trimmedLine.match(/\*\*\s*\d*\.?\s*(देखभाल|Care|Requirements|आवश्यकताएं|Feed|Health)/i)) {
                currentSection = 'careTips';
                console.log('💚 Found care tips section');
                continue;
              } else if (trimmedLine.match(/\*\*\s*\d*\.?\s*(दूध|Milk|Production|उत्पादन)/i)) {
                currentSection = 'characteristics'; // Milk production as characteristic
                continue;
              } else if (trimmedLine.match(/\*\*\s*\d*\.?\s*(उपयुक्त|Suitable|Climate|जलवायु|Origin|उत्पत्ति)/i)) {
                currentSection = 'characteristics'; // Climate/origin info as characteristic
                continue;
              }
              
              // Extract bullet points - Handle various formats
              // Format 1: - Point text
              if (trimmedLine.startsWith('-') && !trimmedLine.startsWith('--')) {
                const cleanedLine = trimmedLine.substring(1).trim();
                if (cleanedLine && cleanedLine.length > 5) {
                  if (currentSection === 'characteristics') {
                    characteristics.push(cleanedLine);
                  } else if (currentSection === 'careTips') {
                    careTips.push(cleanedLine);
                  }
                }
                continue;
              }
              
              // Format 2: * Point text or bullet
              if (trimmedLine.match(/^[\*•]/)) {
                const cleanedLine = trimmedLine.replace(/^[\*•]+\s*/, '').replace(/\*\*/g, '').trim();
                if (cleanedLine && cleanedLine.length > 5) {
                  if (currentSection === 'characteristics') {
                    characteristics.push(cleanedLine);
                  } else if (currentSection === 'careTips') {
                    careTips.push(cleanedLine);
                  }
                }
                continue;
              }
              
              // Format 3: numbered items (1. , 2. , etc)
              if (trimmedLine.match(/^\d+[\.\)]\s/)) {
                const cleanedLine = trimmedLine.replace(/^\d+[\.\)]\s*/, '').trim();
                if (cleanedLine && cleanedLine.length > 5) {
                  if (currentSection === 'characteristics') {
                    characteristics.push(cleanedLine);
                  } else if (currentSection === 'careTips') {
                    careTips.push(cleanedLine);
                  }
                }
              }
            }
            
            console.log(`✅ Parsed ${characteristics.length} characteristics, ${careTips.length} care tips`);
            return { characteristics, careTips };
          };
          
          // Parse generic breed info if we fetched it
          const parsed = aiBreedInfo ? parseBreedInfo(aiBreedInfo) : { characteristics: [], careTips: [] };
          
          // Prepare default fallbacks
          const getDefaultCharacteristics = () => {
            if (language === 'hi') {
              return [
                'विशिष्ट शारीरिक विशेषताएं',
                'अच्छी दूध उत्पादन क्षमता',
                'रोग प्रतिरोधक क्षमता',
                'स्थानीय जलवायु के अनुकूल',
              ];
            }
            return [
              'Distinctive physical features',
              'Good milk production capacity',
              'Disease resistance',
              'Adapted to local climate',
            ];
          };
          
          const getDefaultCareTips = () => {
            if (language === 'hi') {
              return [
                'प्रतिदिन स्वच्छ पानी प्रदान करें',
                'संतुलित आहार और हरा चारा दें',
                'नियमित टीकाकरण करवाएं',
                'स्वच्छ आवास की व्यवस्था करें',
              ];
            }
            return [
              'Provide clean water daily',
              'Feed balanced diet with green fodder',
              'Regular vaccinations required',
              'Maintain clean shelter',
            ];
          };
          
          // Prioritize Vision API data (image-specific), fallback to generic/defaults
          const finalCharacteristics = 
            detection.characteristics && detection.characteristics.length > 0 
              ? detection.characteristics
              : parsed.characteristics.length > 0 
                ? parsed.characteristics 
                : getDefaultCharacteristics();
                
          const finalCareTips = 
            detection.careTips && detection.careTips.length > 0
              ? detection.careTips
              : parsed.careTips.length > 0
                ? parsed.careTips
                : getDefaultCareTips();
                
          const finalDescription = 
            detection.description || aiBreedInfo || `Detected with ${(detection.confidence * 100).toFixed(1)}% confidence`;
          
          breedData = {
            breedName: detection.breedName,
            description: finalDescription,
            characteristics: finalCharacteristics,
            careTips: finalCareTips,
          };
          
          console.log('📦 Final breedData:', {
            breed: breedData.breedName,
            chars: breedData.characteristics.length,
            tips: breedData.careTips.length,
            source: detection.characteristics ? '✨ IMAGE-SPECIFIC (Vision API)' : parsed.characteristics.length > 0 ? '📚 Generic (Breed Info)' : '🔧 Defaults',
          });
        } catch (aiError) {
          console.warn('AI breed info failed, using detection data or basic info:', aiError);
          // Fallback to detection data or basic info
          breedData = {
            breedName: detection.breedName,
            description: detection.description || `Detected with ${(detection.confidence * 100).toFixed(1)}% confidence`,
            characteristics: detection.characteristics || [
              'Physical characteristics identified by AI model',
              'Breed-specific features detected',
            ],
            careTips: detection.careTips || [
              'Provide clean water daily',
              'Feed balanced diet with minerals',
              'Regular veterinary checkups',
            ],
          };
        }
      } else {
        // Offline: Use basic info (will be translated if cached)
        breedData = {
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
      }

      // Step 3: Skip translation - Gemini already responded in user's language
      // The getBreedInfo already got data in the requested language
      console.log('⚡ Skipping translation - already in correct language');

      const analysisResult = {
        breedName: breedData.breedName,
        confidence: detection.confidence,
        characteristics: breedData.characteristics,
        careTips: breedData.careTips,
      } as const;

      setDetectionResult(breedData);

      if (isOnline) {
        // ONLINE MODE: Upload to Firebase
        setUploadProgress('Uploading to cloud...');
        const imageUrl = await uploadImage(user.uid, selectedImage, 'cattle_photos');
        
        setUploadProgress('Saving result...');
        await saveResult(user.uid, {
          ...analysisResult,
          imageUrl: imageUrl,
        });

        // Store result for display on result screen
        await AsyncStorage.setItem('latestResult', JSON.stringify({
          breedName: analysisResult.breedName,
          confidence: analysisResult.confidence,
          imageUrl: imageUrl,
          characteristics: analysisResult.characteristics,
          careTips: analysisResult.careTips,
          description: breedData.description || aiBreedInfo || `${analysisResult.breedName} cattle breed`,
        }));

        // Navigate directly to result screen
        console.log('✅ Analysis complete, navigating to results...');
        router.push('/result' as any);
      } else {
        // OFFLINE MODE: Save locally
        setUploadProgress('Saving offline...');
        
        // Save image to local storage
        const localImagePath = await saveImageLocally(selectedImage, user.uid);
        
        // Create offline result
        const offlineResult = {
          id: `offline_${Date.now()}`,
          userId: user.uid,
          breedName: analysisResult.breedName,
          confidence: analysisResult.confidence,
          imageUri: localImagePath,
          characteristics: analysisResult.characteristics,
          careTips: analysisResult.careTips,
          timestamp: new Date().toISOString(),
          synced: false,
        };
        
        // Save result offline
        await saveResultOffline(offlineResult);
        
        // Add to pending upload queue
        await addToPendingQueue({
          id: offlineResult.id,
          userId: user.uid,
          imageUri: localImagePath,
          result: offlineResult,
          timestamp: new Date().toISOString(),
        });
        
        await refreshPendingCount();

        // Store result for display on result screen
        await AsyncStorage.setItem('latestResult', JSON.stringify({
          breedName: analysisResult.breedName,
          confidence: analysisResult.confidence,
          imageUrl: localImagePath,
          characteristics: analysisResult.characteristics,
          careTips: analysisResult.careTips,
          description: breedData.description || `${analysisResult.breedName} cattle breed detected offline`,
        }));

        // Navigate directly to result screen (offline mode)
        console.log('✅ Analysis complete (offline), navigating to results...');
        router.push('/result' as any);
      }

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
