// TensorFlow Lite Model Integration - Cross Platform
// Supports: Android, iOS (Offline Only)
// Online/Web: Detection disabled (Mock/Log only)

import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as jpeg from 'jpeg-js';

declare global {
  // Cache for model instance
  // eslint-disable-next-line no-var
  var __TFLITE_MODEL__: any | undefined;
  // eslint-disable-next-line no-var
  var __TFLITE_BACKEND__: 'native' | 'mock' | undefined;
}

interface BreedPrediction {
  breed: string;
  confidence: number; // 0..1
}

interface DetectionResult {
  breedName: string;
  confidence: number; // 0..1
  allPredictions: BreedPrediction[];
  description?: string;
  characteristics?: string[];
  careTips?: string[];
}

interface ModelInfo {
  name: string;
  version: string;
  inputSize: number[];
  numClasses: number;
  breeds: string[];
  accuracy: number;
}

// Your trained TFLite model
const TFLITE_MODEL_PATH = require('../../assets/models/model_fp32.tflite');

// Indian Cattle Breeds
// CRITICAL: Update this array to match YOUR model's training labels in EXACT order
const CATTLE_BREEDS: string[] = [
  'Gir',
  'Sahiwal',
  'Red Sindhi',
  'Rathi',
  'Tharparkar',
  'Hariana',
  'Kangayam',
  'Ongole',
  'Kankrej',
  'Deoni',
  'Holstein Friesian',
  'Jersey',
];

/**
 * Initialize TFLite Model
 * Loads model ONLY for Native (Android/iOS) Offline use.
 */
export const initializeModel = async (): Promise<any> => {
  try {
    // Return if already initialized
    if (globalThis.__TFLITE_MODEL__) {
      console.log('✅ Model already initialized');
      return globalThis.__TFLITE_MODEL__;
    }

    console.log(`🔄 Initializing TFLite model on ${Platform.OS}...`);

    // WEB: Not supported / Disabled
    if (Platform.OS === 'web') {
      console.log('🌐 Web Platform: TFLite detection is disabled.');
      globalThis.__TFLITE_BACKEND__ = 'mock';
      return null;
    }

    // NATIVE: Android & iOS - Use react-native-fast-tflite
    try {
      const { loadTensorflowModel } = await import('react-native-fast-tflite');

      console.log('📱 Loading native TFLite model...');
      // Pass the require() result directly as model source
      const model = await loadTensorflowModel(TFLITE_MODEL_PATH as any);

      globalThis.__TFLITE_MODEL__ = model;
      globalThis.__TFLITE_BACKEND__ = 'native';

      console.log('✅ Native TFLite model loaded successfully');
      return model;
    } catch (nativeError: any) {
      console.error('❌ Native TFLite failed:', nativeError.message);
      console.log('📝 For Android/iOS, rebuild the app: npx expo run:android or npx expo run:ios');
      globalThis.__TFLITE_BACKEND__ = 'mock';
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error initializing model:', error);
    globalThis.__TFLITE_BACKEND__ = 'mock';
    return null;
  }
  return null;
};



/**
 * Convert image URI to Float32Array tensor (224x224x3)
 */
const imageToTensor = async (uri: string): Promise<Float32Array> => {
  try {
    console.log('🔄 Preprocessing image...');

    // 1. Resize image to 224x224
    const manipResult = await manipulateAsync(
      uri,
      [{ resize: { width: 300, height: 300 } }],
      { format: SaveFormat.JPEG, base64: true }
    );

    if (!manipResult.base64) {
      throw new Error('Failed to get image base64 data');
    }

    // 2. Decode JPEG to raw RGB
    // jpeg-js expects a Buffer-like object. In RN, we can pass the base64 string directly 
    // if we convert it to a buffer, but jpeg-js decode accepts a buffer.
    // However, jpeg-js pure JS implementation might need a Uint8Array.
    // Let's convert base64 to Uint8Array.
    const binaryString = atob(manipResult.base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const rawImageData = jpeg.decode(bytes, { useTArray: true });

    // 3. Normalize to Float32Array (0-1)
    const { data } = rawImageData;
    const float32Data = new Float32Array(300 * 300 * 3);

    let offset = 0;
    for (let i = 0; i < data.length; i += 4) {
      // RGB only, ignore Alpha
      float32Data[offset++] = data[i];     // R
      float32Data[offset++] = data[i + 1]; // G
      float32Data[offset++] = data[i + 2]; // B
    }

    console.log('✅ Image preprocessed to tensor');
    return float32Data;
  } catch (error) {
    console.error('❌ Error preprocessing image:', error);
    throw error;
  }
};

/**
 * Run inference on image
 * @param {string} imageUri - Image URI from camera/gallery
 * @returns {Promise<Object>} - Detection result with breed and confidence
 */
export const detectBreed = async (imageUri: string): Promise<DetectionResult> => {
  try {
    console.log('🔍 Detecting breed from image:', imageUri);

    // 1. Check Platform - Web
    if (Platform.OS === 'web') {
      console.log('⚠️ Using TFLite model on web: Detection DISABLED.');
      return {
        breedName: 'Unknown (Web)',
        confidence: 0,
        allPredictions: [],
        description: 'Breed detection is not available on Web.',
      };
    }

    // 2. Check Network - Online check removed to allow TFLite usage online
    // const netState = await NetInfo.fetch();
    // if (netState.isConnected && netState.isInternetReachable !== false) { ... }

    // 3. Offline Mode - Run Native TFLite
    console.log('📱 Offline Mode: Running native TFLite inference...');

    if (globalThis.__TFLITE_BACKEND__ === 'native' && globalThis.__TFLITE_MODEL__) {
      try {
        const model = globalThis.__TFLITE_MODEL__;

        // Preprocess image to tensor
        const inputTensor = await imageToTensor(imageUri);

        // Run inference with native TFLite
        const outputs = await model.run([inputTensor]);
        const rawLogits = outputs[0];

        // Apply Softmax to convert logits to probabilities
        const softmax = (logits: any): number[] => {
          const arr = Array.from(logits) as number[];
          const maxLogit = Math.max(...arr);
          const exps = arr.map(l => Math.exp(l - maxLogit));
          const sumExps = exps.reduce((a, b) => a + b, 0);
          return exps.map(e => e / sumExps);
        };

        const probabilities = softmax(rawLogits);

        // Get top predictions
        const allPredictions: BreedPrediction[] = CATTLE_BREEDS.map((breed, index) => ({
          breed,
          confidence: probabilities[index] || 0,
        })).sort((a, b) => b.confidence - a.confidence);

        const topPrediction = allPredictions[0];
        console.log('✅ Native detection complete:', topPrediction.breed, `${(topPrediction.confidence * 100).toFixed(1)}%`);

        return {
          breedName: topPrediction.breed,
          confidence: topPrediction.confidence,
          allPredictions: allPredictions.slice(0, 5),
        };
      } catch (nativeError) {
        console.error('❌ Native inference failed:', nativeError);
        throw nativeError;
      }
    }

    throw new Error('Model not initialized or backend not supported');
  } catch (error: any) {
    console.error('❌ Error detecting breed:', error);
    throw error;
  }
};

/**
 * Get model metadata
 */
export const getModelInfo = (): ModelInfo => {
  return {
    name: 'Cattle Breed Classifier',
    version: '1.0.0',
    inputSize: [300, 300, 3],
    numClasses: CATTLE_BREEDS.length,
    breeds: CATTLE_BREEDS,
    accuracy: 0.95,
  };
};

export default {
  initializeModel,
  detectBreed,
  getModelInfo,
};
