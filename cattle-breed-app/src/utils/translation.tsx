/**
 * Real-time Translation Utilities
 * Handles translation of dynamic backend data with caching and fallback strategies
 */

import { translateText } from '../services/gemini';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation cache to avoid repeated API calls
const translationCache = new Map<string, string>();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_PREFIX = '@translation_cache_';

interface CachedTranslation {
  text: string;
  timestamp: number;
}

/**
 * Get cached translation from memory or AsyncStorage
 */
const getCachedTranslation = async (
  originalText: string,
  targetLanguage: string
): Promise<string | null> => {
  const cacheKey = `${originalText}_${targetLanguage}`;

  // Check memory cache first (fastest)
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Check persistent storage
  try {
    const storageKey = CACHE_KEY_PREFIX + cacheKey;
    const cached = await AsyncStorage.getItem(storageKey);

    if (cached) {
      const parsed: CachedTranslation = JSON.parse(cached);

      // Check if cache is still valid
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
        translationCache.set(cacheKey, parsed.text);
        return parsed.text;
      } else {
        // Cache expired, remove it
        await AsyncStorage.removeItem(storageKey);
      }
    }
  } catch (error) {
    console.warn('Cache read error:', error);
  }

  return null;
};

/**
 * Save translation to cache
 */
const saveCachedTranslation = async (
  originalText: string,
  targetLanguage: string,
  translatedText: string
): Promise<void> => {
  const cacheKey = `${originalText}_${targetLanguage}`;

  // Save to memory cache
  translationCache.set(cacheKey, translatedText);

  // Save to persistent storage
  try {
    const storageKey = CACHE_KEY_PREFIX + cacheKey;
    const data: CachedTranslation = {
      text: translatedText,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Cache write error:', error);
  }
};

/**
 * Translate a single text string with caching
 */
export const translateWithCache = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  // Return original text if target is English
  if (targetLanguage === 'en') {
    return text;
  }

  // Check if text is empty
  if (!text || text.trim() === '') {
    return text;
  }

  // Check cache first
  const cached = await getCachedTranslation(text, targetLanguage);
  if (cached) {
    console.log('✅ Using cached translation');
    return cached;
  }

  // Translate using Gemini API
  console.log('🌐 Translating:', text.substring(0, 50) + '...');
  try {
    const translated = await translateText(text, targetLanguage);
    await saveCachedTranslation(text, targetLanguage, translated);
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text as fallback
  }
};

/**
 * Translate multiple texts in a batch (more efficient)
 */
export const translateBatch = async (
  texts: string[],
  targetLanguage: string
): Promise<string[]> => {
  if (targetLanguage === 'en') {
    return texts;
  }

  const results: string[] = [];

  // Process each text
  for (const text of texts) {
    const translated = await translateWithCache(text, targetLanguage);
    results.push(translated);
  }

  return results;
};

/**
 * Translate array items (e.g., characteristics, care tips)
 */
export const translateArray = async (
  items: string[],
  targetLanguage: string
): Promise<string[]> => {
  if (targetLanguage === 'en' || !items || items.length === 0) {
    return items;
  }

  return await translateBatch(items, targetLanguage);
};

/**
 * Translate object properties
 */
export const translateObject = async <T extends Record<string, any>>(
  obj: T,
  fieldsToTranslate: (keyof T)[],
  targetLanguage: string
): Promise<T> => {
  if (targetLanguage === 'en') {
    return obj;
  }

  const translated = { ...obj };

  for (const field of fieldsToTranslate) {
    const value = obj[field];

    if (typeof value === 'string') {
      translated[field] = await translateWithCache(value, targetLanguage);
    } else if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      translated[field] = await translateArray(value, targetLanguage);
    }
  }

  return translated;
};

/**
 * Clear translation cache (useful for testing or managing storage)
 */
export const clearTranslationCache = async (): Promise<void> => {
  translationCache.clear();

  try {
    const keys = await AsyncStorage.getAllKeys();
    const translationKeys = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(translationKeys);
    console.log('✅ Translation cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (): Promise<{
  memorySize: number;
  storageSize: number;
}> => {
  const memorySize = translationCache.size;

  let storageSize = 0;
  try {
    const keys = await AsyncStorage.getAllKeys();
    storageSize = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX)).length;
  } catch (error) {
    console.error('Error getting cache stats:', error);
  }

  return { memorySize, storageSize };
};

/**
 * Hook for translating breed data from backend
 */
export interface BreedData {
  breedName: string;
  description: string;
  characteristics: string[];
  careTips: string[];
  origin?: string;
  milkProduction?: string;
}

export const translateBreedData = async (
  breedData: BreedData,
  targetLanguage: string
): Promise<BreedData> => {
  console.log('🔄 Translating breed data to', targetLanguage);

  const translated = await translateObject(breedData, 
    ['breedName', 'description', 'origin', 'milkProduction'], 
    targetLanguage
  );

  // Translate array fields
  translated.characteristics = await translateArray(
    breedData.characteristics,
    targetLanguage
  );
  translated.careTips = await translateArray(breedData.careTips, targetLanguage);

  console.log('✅ Breed data translated');
  return translated;
};
