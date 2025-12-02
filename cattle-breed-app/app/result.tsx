import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useLanguage } from '../src/contexts/LanguageContext';

interface BreedResult {
  breedName: string;
  confidence: number;
  imageUrl?: string;
  characteristics: string[];
  careTips: string[];
  description?: string;
}

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
  });

  // Load actual result data from AsyncStorage
  useEffect(() => {
    const loadResult = async () => {
      try {
        const resultJson = await AsyncStorage.getItem('latestResult');
        if (resultJson) {
          const result = JSON.parse(resultJson);
          console.log('📊 Loaded result from storage:', result);
          let finalImageUrl = result.imageUrl;

          // Check if image is stored locally (starts with @cattle_image)
          if (result.imageUrl && result.imageUrl.startsWith('@cattle_image:')) {
            try {
              const base64Image = await AsyncStorage.getItem(result.imageUrl);
              if (base64Image) {
                finalImageUrl = base64Image;
              }
            } catch (err) {
              console.error('Error loading local image:', err);
            }
          }

          setOriginalResult({
            breedName: result.breedName || 'Unknown',
            confidence: result.confidence || 0,
            imageUrl: finalImageUrl,
            characteristics: result.characteristics || [],
            careTips: result.careTips || [],
            description: result.description,
          });
        } else {
          console.warn('⚠️ No result data found in storage');
          // Fallback to mock data
          setOriginalResult({
            breedName: 'Gir',
            confidence: 0.95,
            imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800',
            characteristics: [
              'Distinctive lyre-shaped horns',
              'Prominent forehead hump',
              'White to reddish-brown coat',
            ],
            careTips: [
              'Provide clean water daily',
              'Feed balanced diet',
              'Regular health checkups',
            ],
          });
        }
      } catch (error) {
        console.error('❌ Error loading result:', error);
        // Set fallback data on error
        setOriginalResult({
          breedName: 'Error',
          confidence: 0,
          imageUrl: undefined,
          characteristics: ['Failed to load data'],
          careTips: ['Please try again'],
        });
      } finally {
        setLoading(false);
      }
    };
    loadResult();
  }, []);

  // Convert to BreedData format - always non-null (memoized for performance)
  const breedData = React.useMemo(() => ({
    breedName: originalResult.breedName,
    description: originalResult.description || `${originalResult.breedName} is one of the finest indigenous dairy breeds from India. Known for excellent characteristics.`,
    characteristics: originalResult.characteristics,
    careTips: originalResult.careTips,
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
        {result.imageUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: result.imageUrl }} style={styles.image} />
          </View>
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
        </View>

        {/* Characteristics */}
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

        {/* Care Tips */}
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

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.push('/chatbot' as any)}
          >
            <Text style={styles.actionText}>Ask AI About This Breed</Text>
          </TouchableOpacity>

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
});

export default React.memo(ResultScreen);
