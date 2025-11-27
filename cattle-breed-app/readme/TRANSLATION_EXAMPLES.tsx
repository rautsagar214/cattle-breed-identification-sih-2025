/**
 * Example: How to use real-time translation in your screens
 * Copy-paste these patterns into your components
 */

// ============================================
// EXAMPLE 1: Complete Screen with Translation
// ============================================

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useTranslatedBreedData } from '../src/hooks/useTranslatedData';
import { BreedData } from '../src/utils/translation';

export default function MyBreedScreen() {
  const { language } = useLanguage();

  // Your backend data (from Firebase, API, etc.)
  const backendData: BreedData = {
    breedName: 'Sahiwal',
    description: 'Sahiwal is a zebu dairy breed from Pakistan',
    characteristics: [
      'Reddish-brown color',
      'Loose skin',
      'High milk yield',
    ],
    careTips: [
      'Provide shade in summer',
      'Regular health checkups',
    ],
  };

  // 🎯 THIS IS THE MAGIC LINE - Auto-translates when language changes!
  const { data: translatedData, loading } = useTranslatedBreedData(
    backendData,
    language
  );

  return (
    <View>
      {loading ? (
        // Show loading indicator while translating
        <View>
          <ActivityIndicator />
          <Text>Translating...</Text>
        </View>
      ) : (
        // Display translated data
        <View>
          <Text>{translatedData?.breedName}</Text>
          <Text>{translatedData?.description}</Text>
          
          {translatedData?.characteristics.map((char, idx) => (
            <Text key={idx}>• {char}</Text>
          ))}
          
          {translatedData?.careTips.map((tip, idx) => (
            <Text key={idx}>✓ {tip}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================
// EXAMPLE 2: Translate Just One Field
// ============================================

import { useTranslatedText } from '../src/hooks/useTranslatedData';

function BreedNameCard({ name }: { name: string }) {
  const { language } = useLanguage();
  
  const { data: translatedName, loading } = useTranslatedText(name, language);

  return <Text>{loading ? '...' : translatedName}</Text>;
}

// ============================================
// EXAMPLE 3: Translate an Array
// ============================================

import { useTranslatedArray } from '../src/hooks/useTranslatedData';

function TipsList({ tips }: { tips: string[] }) {
  const { language } = useLanguage();
  
  const { data: translatedTips, loading } = useTranslatedArray(tips, language);

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      {translatedTips?.map((tip, idx) => (
        <Text key={idx}>• {tip}</Text>
      ))}
    </View>
  );
}

// ============================================
// EXAMPLE 4: Fetch from Firebase + Translate
// ============================================

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../src/services/firebase';

function BreedDetailScreen({ breedId }: { breedId: string }) {
  const { language } = useLanguage();
  const [breedData, setBreedData] = React.useState<BreedData | null>(null);

  React.useEffect(() => {
    const fetchBreed = async () => {
      const docRef = doc(db, 'breeds', breedId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setBreedData({
          breedName: data.name,
          description: data.description,
          characteristics: data.characteristics,
          careTips: data.care_tips,
        });
      }
    };

    fetchBreed();
  }, [breedId]);

  // Auto-translate when data arrives or language changes
  const { data: translatedData, loading } = useTranslatedBreedData(
    breedData,
    language
  );

  if (!breedData) return <Text>Loading breed data...</Text>;

  return (
    <View>
      {loading && <Text>Translating to {language}...</Text>}
      <Text>{translatedData?.breedName}</Text>
      <Text>{translatedData?.description}</Text>
    </View>
  );
}

// ============================================
// EXAMPLE 5: Manual Translation (Without Hook)
// ============================================

import { translateWithCache, translateArray } from '../src/utils/translation';

async function manualTranslationExample() {
  const { language } = useLanguage();

  // Translate single text
  const breedName = await translateWithCache('Gir', language);
  console.log(breedName); // "गिर" if Hindi

  // Translate array
  const tips = ['Provide water', 'Feed well', 'Vaccinate annually'];
  const translatedTips = await translateArray(tips, language);
  console.log(translatedTips); // ["पानी प्रदान करें", ...] if Hindi
}

// ============================================
// EXAMPLE 6: Progressive Loading (Show Original First)
// ============================================

function ProgressiveBreedCard({ breedData }: { breedData: BreedData }) {
  const { language } = useLanguage();
  
  const { data: translatedData, loading } = useTranslatedBreedData(
    breedData,
    language
  );

  // Show original data immediately, fade to translated
  const displayData = translatedData || breedData;

  return (
    <View style={{ opacity: loading ? 0.6 : 1 }}>
      <Text>{displayData.breedName}</Text>
      <Text>{displayData.description}</Text>
      {loading && <ActivityIndicator size="small" />}
    </View>
  );
}

// ============================================
// EXAMPLE 7: Error Handling
// ============================================

function SafeTranslatedCard({ breedData }: { breedData: BreedData }) {
  const { language } = useLanguage();
  
  const { data, loading, error } = useTranslatedBreedData(breedData, language);

  if (error) {
    console.error('Translation error:', error);
    // Fallback to original data
    return (
      <View>
        <Text>Translation failed, showing original:</Text>
        <Text>{breedData.breedName}</Text>
      </View>
    );
  }

  return (
    <View>
      {loading ? <ActivityIndicator /> : <Text>{data?.breedName}</Text>}
    </View>
  );
}

// ============================================
// EXAMPLE 8: Cache Management
// ============================================

import { getCacheStats, clearTranslationCache } from '../src/utils/translation';

async function cacheManagementExample() {
  // Check cache size
  const stats = await getCacheStats();
  console.log(`Memory cache: ${stats.memorySize} items`);
  console.log(`Storage cache: ${stats.storageSize} items`);

  // Clear cache if needed (e.g., in settings screen)
  await clearTranslationCache();
  console.log('Cache cleared!');
}

// ============================================
// EXAMPLE 9: Upload Screen Integration
// ============================================

function UploadScreenWithTranslation() {
  const { language } = useLanguage();
  const [detectedBreed, setDetectedBreed] = React.useState<BreedData | null>(null);

  const handleImageUpload = async (imageUri: string) => {
    // Step 1: Detect breed
    const breedName = await detectBreedFromML(imageUri);

    // Step 2: Fetch from backend (English data)
    const response = await fetch(`/api/breeds/${breedName}`);
    const data = await response.json();

    setDetectedBreed({
      breedName: data.name,
      description: data.description,
      characteristics: data.characteristics,
      careTips: data.care_tips,
    });
  };

  // Auto-translate detected breed
  const { data: translatedBreed, loading } = useTranslatedBreedData(
    detectedBreed,
    language
  );

  return (
    <View>
      <Button title="Upload Image" onPress={handleImageUpload} />

      {detectedBreed && (
        <View>
          {loading && <Text>Translating to {language}...</Text>}
          <Text>Detected: {translatedBreed?.breedName}</Text>
          <Text>{translatedBreed?.description}</Text>
        </View>
      )}
    </View>
  );
}

// ============================================
// EXAMPLE 10: Settings Screen - Clear Cache
// ============================================

import { Alert } from 'react-native';

function SettingsScreen() {
  const handleClearCache = async () => {
    Alert.alert(
      'Clear Translation Cache',
      'This will remove all cached translations. They will be re-downloaded when needed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            await clearTranslationCache();
            Alert.alert('Success', 'Translation cache cleared!');
          },
        },
      ]
    );
  };

  const showCacheStats = async () => {
    const stats = await getCacheStats();
    Alert.alert(
      'Cache Statistics',
      `Memory: ${stats.memorySize} items\nStorage: ${stats.storageSize} items`
    );
  };

  return (
    <View>
      <Button title="Show Cache Stats" onPress={showCacheStats} />
      <Button title="Clear Translation Cache" onPress={handleClearCache} />
    </View>
  );
}

// ============================================
// 🎯 QUICK REFERENCE
// ============================================

/*

1. IMPORT HOOK:
   import { useTranslatedBreedData } from '../src/hooks/useTranslatedData';

2. GET LANGUAGE:
   const { language } = useLanguage();

3. APPLY HOOK:
   const { data, loading } = useTranslatedBreedData(breedData, language);

4. DISPLAY:
   {loading ? <Spinner /> : <Text>{data.breedName}</Text>}

THAT'S IT! Translation happens automatically when:
- User switches language in Settings
- New data is loaded
- Component re-renders

CACHING: 
- First time: ~2-3 seconds (API call)
- Subsequent: <10ms (instant from cache)

LANGUAGES SUPPORTED: 23 Indian languages
- English, Hindi, Gujarati, Bengali, Telugu, Marathi, Tamil, Urdu,
  Kannada, Malayalam, Odia, Punjabi, Assamese, Maithili, Sanskrit,
  Kashmiri, Nepali, Sindhi, Konkani, Dogri, Manipuri, Santali, Bodo

*/
