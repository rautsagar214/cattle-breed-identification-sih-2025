import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../src/contexts/LanguageContext';

interface BreedPrediction {
  breed: string;
  confidence: number;
}

interface BreedResult {
  breedName: string;
  confidence: number;
  imageUrl?: string;
  characteristics: string[];
  careTips: string[];
  description?: string;
  allPredictions?: BreedPrediction[];
  allImages?: string[];
  timestamp?: number;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  isGuest?: boolean;
}

const { width } = Dimensions.get('window');

function ResultScreen(): React.JSX.Element {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);

  // Initialize with default data to avoid null
  const [originalResult, setOriginalResult] = useState<BreedResult>({
    breedName: 'Loading...',
    confidence: 0,
    imageUrl: undefined,
    characteristics: [],
    careTips: [],
    allPredictions: [],
    allImages: [],
    timestamp: undefined,
    locationName: undefined,
    latitude: undefined,
    longitude: undefined,
    isGuest: false,
  });

  const [activeSlide, setActiveSlide] = useState(0);

  const params = useLocalSearchParams();

  // Load result data from params
  useEffect(() => {
    if (params.breedName) {
      try {
        setOriginalResult({
          breedName: params.breedName as string,
          confidence: Number(params.confidence),
          imageUrl: params.imageUrl as string,
          characteristics: params.characteristics ? JSON.parse(params.characteristics as string) : [],
          careTips: params.careTips ? JSON.parse(params.careTips as string) : [],
          description: params.description as string,
          allPredictions: params.allPredictions ? JSON.parse(params.allPredictions as string) : [],
          allImages: params.allImages ? JSON.parse(params.allImages as string) : [params.imageUrl],
          timestamp: params.timestamp ? Number(params.timestamp) : undefined,
          locationName: params.locationName as string,
          latitude: params.latitude ? Number(params.latitude) : undefined,
          longitude: params.longitude ? Number(params.longitude) : undefined,
          isGuest: params.isGuest === 'true',
        });
      } catch (e) {
        console.error('Error parsing params:', e);
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback for direct access or testing
      setLoading(false);
    }
  }, [params]);

  // Convert to BreedData format - always non-null (memoized for performance)
  const breedData = React.useMemo(() => ({
    breedName: originalResult.breedName,
    description: originalResult.description || `${originalResult.breedName} is one of the finest indigenous dairy breeds from India. Known for excellent characteristics.`,
    characteristics: originalResult.characteristics,
    careTips: originalResult.careTips,
    allPredictions: originalResult.allPredictions,
    allImages: originalResult.allImages,
    timestamp: originalResult.timestamp,
    locationName: originalResult.locationName,
    latitude: originalResult.latitude,
    longitude: originalResult.longitude,
    isGuest: originalResult.isGuest,
  }), [originalResult]);

  // Show loading state AFTER all hooks are called
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#7f8c8d' }}>Loading results...</Text>
      </View>
    );
  }

  // Use translated data if available, otherwise original
  const displayData = breedData;
  const result: BreedResult = {
    ...originalResult,
    breedName: displayData.breedName,
    characteristics: displayData.characteristics,
    careTips: displayData.careTips,
    allPredictions: displayData.allPredictions,
    isGuest: displayData.isGuest,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detection Results</Text>
        </View>

        {/* Image */}
        {/* Image Slider */}
        {result.allImages && result.allImages.length > 0 ? (
          <View style={styles.sliderContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={({ nativeEvent }) => {
                const slide = Math.ceil(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width);
                if (slide !== activeSlide) {
                  setActiveSlide(slide);
                }
              }}
              scrollEventThrottle={16}
              style={styles.slider}
            >
              {result.allImages.map((img, index) => (
                <Image key={index} source={{ uri: img }} style={styles.sliderImage} />
              ))}
            </ScrollView>
            {/* Pagination Dots */}
            {result.allImages.length > 1 && (
              <View style={styles.pagination}>
                {result.allImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      activeSlide === index ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          result.imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: result.imageUrl }} style={styles.image} />
            </View>
          )
        )}

        {/* Breed Info Card */}
        <View style={styles.resultCard}>
          <View style={styles.breedHeader}>
            <Text style={styles.breedName}>{result.breedName}</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {(result.confidence * 100).toFixed(1)}% Match
              </Text>
            </View>
          </View>

          <Text style={styles.breedDescription}>
            {displayData.description}
          </Text>

          {/* Location and Date Info (HIDDEN FOR GUESTS) */}
          {!result.isGuest && (result.timestamp || result.locationName) && (
            <View style={styles.metaInfoContainer}>
              {result.timestamp && (
                <Text style={styles.metaText}>
                  📅 {new Date(result.timestamp).toLocaleDateString()} {new Date(result.timestamp).toLocaleTimeString()}
                </Text>
              )}
              {result.locationName && (
                <Text style={styles.metaText}>
                  📍 {result.locationName}
                </Text>
              )}
              {result.latitude && result.longitude && !result.locationName && (
                <Text style={styles.metaText}>
                  📍 {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* GUEST MESSAGE */}
        {result.isGuest && (
          <View style={styles.guestMessageContainer}>
            <Text style={styles.guestMessageTitle}>🔒 Detailed Report Locked</Text>
            <Text style={styles.guestMessageText}>
              Log in to view top matches, characteristics, care tips, and save your scan history.
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/' as any)}
            >
              <Text style={styles.loginButtonText}>Log In Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Top Matches (HIDDEN FOR GUESTS) */}
        {!result.isGuest && result.allPredictions && result.allPredictions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Top Matches</Text>
            <View style={styles.card}>
              {result.allPredictions.slice(0, 3).map((pred, index) => (
                <View key={index} style={styles.matchItem}>
                  <View style={styles.matchRow}>
                    <Text style={styles.matchBreed}>{pred.breed}</Text>
                    <Text style={styles.matchScore}>{(pred.confidence * 100).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${pred.confidence * 100}%`, backgroundColor: index === 0 ? '#2ecc71' : '#3498db' }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Characteristics (HIDDEN FOR GUESTS) */}
        {!result.isGuest && result.characteristics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Key Characteristics</Text>
            <View style={styles.card}>
              {result.characteristics.map((char, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{char}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Care Tips (HIDDEN FOR GUESTS) */}
        {!result.isGuest && result.careTips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💚 Care Tips</Text>
            <View style={styles.card}>
              {result.careTips.map((tip, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>✓</Text>
                  <Text style={styles.listText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>


          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => router.push('/upload' as any)}
          >
            <Text style={styles.secondaryActionText}>📸 Analyze Another Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryAction}
            onPress={() => router.push('/(tabs)' as any)}
          >
            <Text style={styles.tertiaryActionText}>🏠 {t('common.back')} to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            WARNING: AI predictions are for reference only. Please consult a veterinary expert
            for accurate identification and professional advice.
          </Text>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  sliderContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  slider: {
    width: '100%',
    height: 300,
  },
  sliderImage: {
    width: width - 40, // Container padding is 20 on each side, so width is window width - 40
    height: 300,
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 20,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  resultCard: {
    backgroundColor: '#2ecc71',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  breedName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  breedDescription: {
    fontSize: 15,
    color: 'white',
    lineHeight: 22,
  },
  metaInfoContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  metaText: {
    color: 'white',
    fontSize: 13,
    marginBottom: 4,
    opacity: 0.9,
  },
  translatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  translatingText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 14,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#2ecc71',
    marginRight: 10,
    fontWeight: 'bold',
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 22,
  },
  actionsContainer: {
    marginTop: 10,
    gap: 12,
  },
  primaryAction: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryAction: {
    backgroundColor: '#9b59b6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tertiaryAction: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  tertiaryActionText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
    textAlign: 'center',
  },
  matchItem: {
    marginBottom: 15,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  matchBreed: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  matchScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  guestMessageContainer: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  guestMessageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  guestMessageText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default React.memo(ResultScreen);
