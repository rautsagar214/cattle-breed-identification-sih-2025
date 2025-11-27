// App-wide constants and configuration

interface ApiConfig {
  GEMINI_API_KEY: string;
  FIREBASE_API_KEY: string;
  BASE_URL: string;
}

interface Screens {
  HOME: string;
  UPLOAD: string;
  RESULT: string;
  CHATBOT: string;
  SETTINGS: string;
  HISTORY: string;
}

interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  white: string;
  black: string;
  textPrimary: string;
  textSecondary: string;
  textLight: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  [key: string]: string;
}

interface FontSizes {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  huge: number;
}

interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

interface Radius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  round: number;
}

interface BreedInfo {
  name: string;
  scientificName: string;
  origin: string;
  type: string;
  avgMilk: string;
  color: string;
}

interface CattleBreeds {
  [key: string]: BreedInfo;
}

interface ModelConfig {
  INPUT_SIZE: number[];
  CONFIDENCE_THRESHOLD: number;
  MAX_PREDICTIONS: number;
  MODEL_PATH: string;
}

interface ImageConfig {
  MAX_SIZE: number;
  QUALITY: number;
  ALLOWED_FORMATS: string[];
}

interface ChatConfig {
  MAX_MESSAGE_LENGTH: number;
  TYPING_DELAY: number;
  MAX_HISTORY: number;
}

interface StorageKeys {
  LANGUAGE: string;
  THEME: string;
  USER_DATA: string;
  DETECTION_HISTORY: string;
  SETTINGS: string;
}

interface Messages {
  [key: string]: string;
}

interface AppConfig {
  NAME: string;
  VERSION: string;
  BUILD: number;
  STORE_URL: {
    ios: string;
    android: string;
  };
}

interface Features {
  ENABLE_CHATBOT: boolean;
  ENABLE_HISTORY: boolean;
  ENABLE_DARK_MODE: boolean;
  ENABLE_OFFLINE_MODE: boolean;
}

/**
 * API Endpoints
 */
export const API_CONFIG: ApiConfig = {
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY',
  FIREBASE_API_KEY: 'YOUR_FIREBASE_API_KEY',
  BASE_URL: 'https://your-api.com/api',
};

/**
 * Screen Names (for navigation)
 */
export const SCREENS: Screens = {
  HOME: 'Home',
  UPLOAD: 'Upload',
  RESULT: 'Result',
  CHATBOT: 'Chatbot',
  SETTINGS: 'Settings',
  HISTORY: 'History',
};

/**
 * Color Palette
 */
export const COLORS: Colors = {
  // Primary Colors
  primary: '#3498db',
  secondary: '#9b59b6',
  accent: '#27ae60',
  
  // Background
  background: '#f5f5f5',
  white: '#ffffff',
  black: '#000000',
  
  // Text
  textPrimary: '#2c3e50',
  textSecondary: '#7f8c8d',
  textLight: '#95a5a6',
  
  // Status Colors
  success: '#27ae60',
  error: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
  
  // Grayscale
  gray100: '#f8f9fa',
  gray200: '#ecf0f1',
  gray300: '#d5d8dc',
  gray400: '#bdc3c7',
  gray500: '#95a5a6',
  gray600: '#7f8c8d',
  gray700: '#566573',
  gray800: '#34495e',
  gray900: '#2c3e50',
};

/**
 * Font Sizes
 */
export const FONT_SIZES: FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

/**
 * Spacing
 */
export const SPACING: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border Radius
 */
export const RADIUS: Radius = {
  sm: 5,
  md: 10,
  lg: 15,
  xl: 20,
  round: 50,
};

/**
 * Indian Cattle Breeds Information
 */
export const CATTLE_BREEDS: CattleBreeds = {
  GIR: {
    name: 'Gir',
    scientificName: 'Bos indicus',
    origin: 'Gujarat, India',
    type: 'Dairy',
    avgMilk: '10-12 liters/day',
    color: 'Red to yellow-brown with white patches',
  },
  SAHIWAL: {
    name: 'Sahiwal',
    scientificName: 'Bos indicus',
    origin: 'Punjab, Pakistan/India',
    type: 'Dairy',
    avgMilk: '8-10 liters/day',
    color: 'Light red to dark brown',
  },
  RED_SINDHI: {
    name: 'Red Sindhi',
    scientificName: 'Bos indicus',
    origin: 'Sindh, Pakistan',
    type: 'Dairy',
    avgMilk: '6-8 liters/day',
    color: 'Deep red',
  },
  THARPARKAR: {
    name: 'Tharparkar',
    scientificName: 'Bos indicus',
    origin: 'Rajasthan, India',
    type: 'Dual Purpose',
    avgMilk: '6-8 liters/day',
    color: 'White to gray',
  },
  HARIANA: {
    name: 'Hariana',
    scientificName: 'Bos indicus',
    origin: 'Haryana, India',
    type: 'Dual Purpose',
    avgMilk: '5-7 liters/day',
    color: 'White to gray',
  },
};

/**
 * Model Configuration
 */
export const MODEL_CONFIG: ModelConfig = {
  INPUT_SIZE: [224, 224],
  CONFIDENCE_THRESHOLD: 0.5, // Minimum confidence to show result
  MAX_PREDICTIONS: 3, // Number of top predictions to show
  MODEL_PATH: '../../assets/models/cattle_model.tflite',
};

/**
 * Image Configuration
 */
export const IMAGE_CONFIG: ImageConfig = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  QUALITY: 0.8, // 80% quality
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png'],
};

/**
 * Chat Configuration
 */
export const CHAT_CONFIG: ChatConfig = {
  MAX_MESSAGE_LENGTH: 500,
  TYPING_DELAY: 1000, // ms
  MAX_HISTORY: 50, // Maximum messages to store
};

/**
 * Storage Keys (AsyncStorage/SecureStore)
 */
export const STORAGE_KEYS: StorageKeys = {
  LANGUAGE: '@app_language',
  THEME: '@app_theme',
  USER_DATA: '@user_data',
  DETECTION_HISTORY: '@detection_history',
  SETTINGS: '@app_settings',
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES: Messages = {
  NO_IMAGE: 'Please select an image first',
  IMAGE_TOO_LARGE: 'Image size should be less than 5MB',
  INVALID_FORMAT: 'Invalid image format. Use JPG, JPEG, or PNG',
  NETWORK_ERROR: 'Network error. Please check your connection',
  MODEL_ERROR: 'Failed to load AI model',
  PERMISSION_DENIED: 'Permission denied. Please enable in settings',
};

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES: Messages = {
  RESULT_SAVED: 'Result saved successfully',
  CACHE_CLEARED: 'Cache cleared successfully',
  SETTINGS_UPDATED: 'Settings updated',
};

/**
 * App Configuration
 */
export const APP_CONFIG: AppConfig = {
  NAME: 'Cattle Breed App',
  VERSION: '1.0.0',
  BUILD: 1,
  STORE_URL: {
    ios: 'https://apps.apple.com/app/cattle-breed',
    android: 'https://play.google.com/store/apps/details?id=com.cattlebreed',
  },
};

/**
 * Feature Flags
 */
export const FEATURES: Features = {
  ENABLE_CHATBOT: true,
  ENABLE_HISTORY: true,
  ENABLE_DARK_MODE: false, // Coming soon
  ENABLE_OFFLINE_MODE: false, // Coming soon
};

// Export all constants
export default {
  API_CONFIG,
  SCREENS,
  COLORS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  CATTLE_BREEDS,
  MODEL_CONFIG,
  IMAGE_CONFIG,
  CHAT_CONFIG,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APP_CONFIG,
  FEATURES,
};
