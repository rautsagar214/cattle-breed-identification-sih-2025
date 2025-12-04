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
import * as Location from 'expo-location';
import { useAuth } from '../../src/contexts/AuthContext';
import { useNetwork } from '../../src/contexts/NetworkContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import {
    saveImageLocally,
    saveResultOffline,
    addToPendingQueue,
} from '../../src/services/offline';
import { validateImageSize, validateImageType } from '../../src/utils/security';
import { detectBreed, detectMultipleBreeds, initializeModel } from '../../src/services/tflite';
import { GuidanceAnimation } from '../../src/components/GuidanceAnimation';
import { initDatabase, saveScanResult } from '../../src/services/db';
import { syncPendingScans } from '../../src/services/SyncService';

export default function UploadScreen(): React.JSX.Element {
    const router = useRouter();
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const { isOnline, refreshPendingCount } = useNetwork();
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [detectionResult, setDetectionResult] = useState({});

    // Initialize DB on mount
    React.useEffect(() => {
        initDatabase().catch(err => console.error('DB Init Error:', err));
    }, []);

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

    const pickImageFromCamera = async () => {
        if (selectedImages.length >= 3) {
            Alert.alert('Limit Reached', 'You can only upload up to 3 images.');
            return;
        }

        const hasPermission = await requestCameraPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
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
            setSelectedImages([...selectedImages, image.uri]);
        }
    };

    const pickImageFromGallery = async () => {
        if (selectedImages.length >= 3) {
            Alert.alert('Limit Reached', 'You can only upload up to 3 images.');
            return;
        }

        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
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

            setSelectedImages([...selectedImages, image.uri]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...selectedImages];
        newImages.splice(index, 1);
        setSelectedImages(newImages);
    };



    const analyzeImage = async () => {
        if (selectedImages.length === 0) {
            Alert.alert('No Image', 'Please select at least one photo');
            return;
        }

        // Guest check removed to allow analysis without login
        // if (user?.id === -1) { ... }

        setIsAnalyzing(true);
        try {
            // Step 2: Offline Mode - Run TFLite
            setUploadProgress(t('upload.initializing') || 'Initializing model...');
            await initializeModel(); // no-op if already initialized

            setUploadProgress(t('upload.analyzing') || 'Analyzing breeds...');

            // Use new multi-image detection
            const detection = await detectMultipleBreeds(selectedImages);

            // Offline: Use basic info (will be translated if cached)
            const breedData = {
                breedName: detection.breedName,
                description: `Detected with ${(detection.confidence * 100).toFixed(1)}% confidence.`,
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
                allPredictions: detection.allPredictions, // Pass all predictions
            } as const;

            setDetectionResult(breedData);

            setDetectionResult(breedData);

            // Save images to permanent storage (ONLY FOR LOGGED IN USERS)
            const permanentImageUris: string[] = [];
            let locationData: { latitude: number; longitude: number; name?: string } | undefined = undefined;

            if (user?.id !== -1) {
                try {
                    for (const uri of selectedImages) {
                        const savedUri = await saveImageLocally(uri, String(user?.id));
                        permanentImageUris.push(savedUri);
                    }
                } catch (saveError) {
                    console.error('Failed to save images locally:', saveError);
                    // Fallback to original URIs if saving fails
                    permanentImageUris.push(...selectedImages);
                }

                // Save to SQLite DB (ONLY FOR LOGGED IN USERS)
                try {
                    // Fetch location
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status === 'granted') {
                        const location = await Location.getCurrentPositionAsync({});
                        let locationName = undefined;

                        // Reverse geocode
                        try {
                            const address = await Location.reverseGeocodeAsync({
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude
                            });
                            if (address && address.length > 0) {
                                const addr = address[0];
                                locationName = `${addr.city || ''}, ${addr.region || ''}, ${addr.country || ''}`.replace(/^, /, '').replace(/, $/, '');
                            }
                        } catch (geoError) {
                            console.log('Reverse geocoding failed:', geoError);
                        }

                        locationData = {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            name: locationName
                        };
                    }

                    await saveScanResult(
                        permanentImageUris,
                        analysisResult.allPredictions.slice(0, 3),
                        locationData,
                        user?.id?.toString(),
                        user?.role
                    );
                    console.log('💾 Result saved to history DB with location');

                    // Trigger sync immediately if online
                    syncPendingScans();
                } catch (dbError) {
                    console.error('Failed to save to DB:', dbError);
                }
            } else {
                // Guest: Use temporary URIs
                permanentImageUris.push(...selectedImages);
            }

            // Navigate directly to result screen with params
            console.log('✅ Analysis complete, navigating to results...');
            router.push({
                pathname: '/result',
                params: {
                    breedName: analysisResult.breedName,
                    confidence: analysisResult.confidence,
                    imageUrl: permanentImageUris[0], // Pass the first image as main
                    allImages: JSON.stringify(permanentImageUris), // Pass all images
                    allPredictions: JSON.stringify(analysisResult.allPredictions), // Pass top predictions
                    characteristics: JSON.stringify(analysisResult.characteristics),
                    careTips: JSON.stringify(analysisResult.careTips),
                    description: breedData.description || `${analysisResult.breedName} cattle breed detected`,
                    isGuest: user?.id === -1 ? 'true' : 'false', // Pass guest status
                    // Pass location data
                    latitude: locationData?.latitude,
                    longitude: locationData?.longitude,
                    locationName: locationData?.name,
                    timestamp: Date.now(),
                }
            } as any);

            setSelectedImages([]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to analyze image');
            console.error('Analysis error:', error);
        } finally {
            setIsAnalyzing(false);
            setUploadProgress('');
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>← {t('common.back')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('upload.title')}</Text>
                    <Text style={styles.subtitle}>Take or choose a photo to identify the breed</Text>
                </View>

                {/* Animated Guidance - Shows step based on number of images uploaded */}
                <GuidanceAnimation step={Math.min(selectedImages.length, 2)} />

                {/* Image Preview Grid */}
                <View style={styles.gridContainer}>
                    {selectedImages.map((uri, index) => (
                        <View key={index} style={styles.gridItem}>
                            <Image source={{ uri }} style={styles.gridImage} />
                            <TouchableOpacity
                                style={styles.gridRemoveBtn}
                                onPress={() => removeImage(index)}
                            >
                                <Text style={styles.gridRemoveText}>✕</Text>
                            </TouchableOpacity>
                            <View style={styles.gridBadge}>
                                <Text style={styles.gridBadgeText}>{index + 1}</Text>
                            </View>
                        </View>
                    ))}

                    {selectedImages.length < 3 && (
                        <TouchableOpacity
                            style={styles.addMoreBtn}
                            onPress={pickImageFromGallery}
                        >
                            <Text style={styles.addMoreIcon}>+</Text>
                            <Text style={styles.addMoreText}>Add Photo</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Upload Buttons */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={pickImageFromCamera}
                        disabled={isAnalyzing}
                    >
                        <Text style={styles.buttonIcon}>📷</Text>
                        <Text style={styles.buttonText}>{t('upload.takePhoto') || 'Take Photo'}</Text>
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
                {selectedImages.length > 0 && (
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

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 120, // Extra padding for bottom tab bar
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
    // Removed old guidance styles
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    gridItem: {
        width: '31%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridRemoveBtn: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(231, 76, 60, 0.9)',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridRemoveText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    gridBadge: {
        position: 'absolute',
        bottom: 5,
        left: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    gridBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    addMoreBtn: {
        width: '31%',
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#bdc3c7',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
    },
    addMoreIcon: {
        fontSize: 32,
        color: '#bdc3c7',
        marginBottom: 5,
    },
    addMoreText: {
        fontSize: 12,
        color: '#95a5a6',
        fontWeight: '600',
    },
});
