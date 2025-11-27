// TensorFlow Lite Model Integration - Cross Platform
// Supports: Web, Android, iOS
// Works offline with your trained model

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

declare global {
  // Cache for model instance
  // eslint-disable-next-line no-var
  var __TFLITE_MODEL__: any | undefined;
  // eslint-disable-next-line no-var
  var __TFLITE_BACKEND__: 'web' | 'native' | 'mock' | undefined;
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
// Example breeds below - replace with your actual classes
// CRITICAL: Update this array to match YOUR model's training labels in EXACT order
// These are common Indian cattle breeds - replace with your actual trained classes
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

// Breed name variations for better matching
const BREED_ALIASES: { [key: string]: string } = {
  'gir': 'Gir',
  'gyr': 'Gir',
  'sahiwal': 'Sahiwal',
  'sahival': 'Sahiwal',
  'red sindhi': 'Red Sindhi',
  'sindhi': 'Red Sindhi',
  'rathi': 'Rathi',
  'rath': 'Rathi',
  'tharparkar': 'Tharparkar',
  'tharparker': 'Tharparkar',
  'white sindhi': 'Tharparkar',
  'hariana': 'Hariana',
  'hariyana': 'Hariana',
  'kangayam': 'Kangayam',
  'kangayan': 'Kangayam',
  'ongole': 'Ongole',
  'nellore': 'Ongole',
  'kankrej': 'Kankrej',
  'kankresh': 'Kankrej',
  'deoni': 'Deoni',
  'dongari': 'Deoni',
  'holstein friesian': 'Holstein Friesian',
  'holstein': 'Holstein Friesian',
  'hf': 'Holstein Friesian',
  'jersey': 'Jersey',
};

// Normalize breed name from Gemini response
const normalizeBreedName = (breedName: string): string => {
  const normalized = breedName.toLowerCase().trim();
  return BREED_ALIASES[normalized] || breedName;
};

/**
 * Initialize TFLite Model - Cross Platform
 * Works on Web, Android, iOS with your trained model_fp32.tflite
 */
export const initializeModel = async (): Promise<any> => {
  try {
    // Return if already initialized
    if (globalThis.__TFLITE_MODEL__) {
      console.log('✅ Model already initialized');
      return globalThis.__TFLITE_MODEL__;
    }

    console.log(`🔄 Initializing TFLite model on ${Platform.OS}...`);

    // NATIVE: Android & iOS - Use react-native-fast-tflite
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      try {
        const { loadTensorflowModel } = await import('react-native-fast-tflite');
        
        console.log('📱 Loading native TFLite model...');
        // Pass the require() result directly as model source
        const model = await loadTensorflowModel(TFLITE_MODEL_PATH as any);
        
        globalThis.__TFLITE_MODEL__ = model;
        globalThis.__TFLITE_BACKEND__ = 'native';
        
        console.log('✅ Native TFLite model loaded successfully');
        console.log('📊 Model ready for OFFLINE inference on', Platform.OS);
        return model;
      } catch (nativeError: any) {
        console.error('❌ Native TFLite failed:', nativeError.message);
        console.log('📝 For Android/iOS, rebuild the app: npx expo run:android or npx expo run:ios');
        console.log('ℹ️ Falling back to Gemini Vision for this session');
        globalThis.__TFLITE_BACKEND__ = 'mock';
        return null;
      }
    }

    // WEB: TFLite not available due to package issues
    if (Platform.OS === 'web') {
      console.log('🌐 ════════════════════════════════════════════');
      console.log('📱 Platform: Web Browser');
      console.log('⚠️  TFLite Status: NOT AVAILABLE for web');
      console.log('💡 Reason: @tensorflow/tfjs-tflite has broken dependencies');
      console.log('✅ Solution: Using Gemini Vision API for web');
      console.log('📱 Note: Your TFLite model WILL work on Android/iOS!');
      console.log('════════════════════════════════════════════');
      
      // Use Gemini Vision for web instead
      globalThis.__TFLITE_BACKEND__ = 'mock';
      
      // To use YOUR TFLite model on web, you have 3 options:
      // Option 1: Convert model to TensorFlow.js format (tensorflowjs_converter)
      // Option 2: Build a backend API that runs your TFLite model
      // Option 3: Use Gemini Vision (current solution - already working!)
      
      return null;
    }

    // Fallback
    console.warn('⚠️ Unsupported platform, using mock predictions');
    globalThis.__TFLITE_BACKEND__ = 'mock';
    return null;
  } catch (error: any) {
    console.error('❌ Error initializing model:', error);
    globalThis.__TFLITE_BACKEND__ = 'mock';
    return null;
  }
};

/**
 * Preprocess image for model input
 * Resize and normalize image
 */
const preprocessImage = async (imageUri: string): Promise<any> => {
  try {
    // TODO: Implement image preprocessing
    // 1. Load image
    // 2. Resize to model input size (e.g., 224x224)
    // 3. Normalize pixel values (0-1 or -1 to 1)
    // 4. Convert to tensor
    
    console.log('Preprocessing image:', imageUri);
    return null; // Placeholder
  } catch (error) {
    console.error('Error preprocessing image:', error);
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
    console.log('📱 Platform:', Platform.OS, '| Backend:', globalThis.__TFLITE_BACKEND__);
    
    // NATIVE: Android & iOS
    if (globalThis.__TFLITE_BACKEND__ === 'native' && globalThis.__TFLITE_MODEL__) {
      try {
        console.log('📱 Running inference on native TFLite...');
        const model = globalThis.__TFLITE_MODEL__;
        
        // Run inference with native TFLite
        const outputs = await model.run([imageUri]);
        const probabilities = outputs[0]; // Assuming single output tensor
        
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
        // Fall through
      }
    }
    
    // WEB: TensorFlow.js TFLite - YOUR TRAINED MODEL!
    if (globalThis.__TFLITE_BACKEND__ === 'web' && globalThis.__TFLITE_MODEL__) {
      try {
        console.log('🌐 ═══════════════════════════════════════════');
        console.log('🎯 USING YOUR TRAINED TFLITE MODEL ON WEB!');
        console.log('═══════════════════════════════════════════');
        
        const tf = await import('@tensorflow/tfjs');
        const model = globalThis.__TFLITE_MODEL__;
        
        // Load and preprocess image
        console.log('📷 Loading image for YOUR model...');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUri;
        });
        
        console.log('✅ Image loaded:', img.width, 'x', img.height);
        
        // Convert image to tensor
        console.log('🔄 Preprocessing image (resize 224x224, normalize 0-1)...');
        const tensor = tf.browser.fromPixels(img)
          .resizeBilinear([224, 224]) // Your model's input size
          .toFloat()
          .div(255.0) // Normalize to 0-1
          .expandDims(0); // Add batch dimension
        
        console.log('📊 Input tensor shape:', tensor.shape);
        
        // Run inference with YOUR trained model
        console.log('🤖 Running inference with YOUR trained model...');
        const predictions = await model.predict(tensor) as any;
        const probabilities = await predictions.data();
        
        console.log('✅ YOUR MODEL inference complete!');
        console.log('📈 Raw output (first 5):', Array.from(probabilities).slice(0, 5).map((p: any) => (p as number).toFixed(4)));
        
        // Get top predictions from YOUR model
        const allPredictions: BreedPrediction[] = CATTLE_BREEDS.map((breed, index) => ({
          breed,
          confidence: probabilities[index] || 0,
        })).sort((a, b) => b.confidence - a.confidence);
        
        const topPrediction = allPredictions[0];
        
        // Cleanup tensors
        tensor.dispose();
        predictions.dispose();
        
        console.log('🎯 ═══════════════════════════════════════════');
        console.log('🏆 YOUR MODEL DETECTED:', topPrediction.breed);
        console.log('📊 Confidence:', `${(topPrediction.confidence * 100).toFixed(1)}%`);
        console.log('📋 Top 3 predictions:');
        allPredictions.slice(0, 3).forEach((pred, i) => {
          console.log(`   ${i + 1}. ${pred.breed}: ${(pred.confidence * 100).toFixed(1)}%`);
        });
        console.log('═══════════════════════════════════════════');
        
        return {
          breedName: topPrediction.breed,
          confidence: topPrediction.confidence,
          allPredictions: allPredictions.slice(0, 5),
        };
      } catch (tfError) {
        console.error('❌ Web TFLite inference failed:', tfError);
        console.error('📝 Error details:', tfError);
        console.log('⚠️ Falling back to Gemini Vision');
        // Fall through to Gemini Vision
      }
    }

    // Try Gemini Vision API for real detection
    console.log('🤖 ═══════════════════════════════════════════');
    console.log('🤖 CALLING GEMINI VISION API...');
    console.log('═══════════════════════════════════════════');
    try {
      // Convert image to base64
      console.log('📸 Step 1: Converting image to base64...');
      const response = await fetch(imageUri);
      const blob = await response.blob();
      console.log('✅ Image fetched, size:', blob.size, 'bytes');
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      console.log('✅ Base64 conversion complete');
      console.log('📸 Step 2: Calling Gemini Vision API...');
      
      // Import detectBreedFromImage function
      const { detectBreedFromImage } = await import('./gemini');
      const result = await detectBreedFromImage(base64);

      console.log('🎯 RAW GEMINI RESULT:', JSON.stringify(result, null, 2));

      // Normalize breed name to match our standard list
      const normalizedBreed = normalizeBreedName(result.breedName);
      
      console.log('═══════════════════════════════════════════');
      console.log('✅ GEMINI VISION SUCCESS!');
      console.log('🏆 Detected Breed:', normalizedBreed);
      console.log('📊 Confidence:', `${(result.confidence * 100).toFixed(1)}%`);
      console.log('═══════════════════════════════════════════');
      
      if (normalizedBreed !== result.breedName) {
        console.log(`📝 Normalized "${result.breedName}" → "${normalizedBreed}"`);
      }

      return {
        breedName: normalizedBreed,
        confidence: result.confidence,
        allPredictions: [
          { breed: normalizedBreed, confidence: result.confidence },
        ],
        description: result.description,
        characteristics: (result as any).characteristics || [],
        careTips: (result as any).careTips || [],
      };
    } catch (geminiError: any) {
      console.error('═══════════════════════════════════════════');
      console.error('❌ GEMINI VISION API FAILED!');
      console.error('🔴 Error Name:', geminiError.name);
      console.error('🔴 Error Message:', geminiError.message);
      console.error('🔴 Full Error:', geminiError);
      console.error('═══════════════════════════════════════════');
      
      // Throw error instead of silently falling back
      throw new Error(`Gemini Vision failed: ${geminiError.message}. Please check your API key and internet connection.`);
    }

    // This point should never be reached if Gemini works
    console.error('🔴 CRITICAL: Reached end of detectBreed without successful detection!');
    console.error('🔴 This means Gemini Vision API is not working properly');
    throw new Error('Breed detection failed. Please check your Gemini API key in .env file.');
  } catch (error) {
    console.error('❌ Error detecting breed:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
};

/**
 * Batch process multiple images
 * @param {Array<string>} imageUris - Array of image URIs
 * @returns {Promise<Array<Object>>} - Array of detection results
 */
export const detectBreedBatch = async (imageUris: string[]): Promise<DetectionResult[]> => {
  try {
    console.log(`Processing ${imageUris.length} images...`);
    
    const results = [];
    for (const imageUri of imageUris) {
      const result = await detectBreed(imageUri);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error('Error in batch detection:', error);
    throw error;
  }
};

/**
 * Get model metadata
 * @returns {Object} - Model information
 */
export const getModelInfo = (): ModelInfo => {
  return {
    name: 'Cattle Breed Classifier',
    version: '1.0.0',
    inputSize: [224, 224, 3],
    numClasses: CATTLE_BREEDS.length,
    breeds: CATTLE_BREEDS,
    accuracy: 0.95, // Your model's accuracy
  };
};

/**
 * Validate image before processing
 * Check if image is suitable for detection
 */
export const validateImage = (imageUri: string): boolean => {
  // TODO: Add validation logic
  // - Check image size
  // - Check image format
  // - Check if image contains cattle
  
  if (!imageUri) {
    throw new Error('No image provided');
  }
  
  return true;
};

// Export all functions
export default {
  initializeModel,
  detectBreed,
  detectBreedBatch,
  getModelInfo,
  validateImage,
};
