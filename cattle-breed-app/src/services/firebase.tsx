/**
 * 🔥 Firebase Configuration for Expo (Web SDK)
 * 
 * This file sets up Firebase services for your Expo app:
 * - Authentication (Email/Password, Google, etc.)
 * - Firestore Database (NoSQL cloud database)
 * - Firebase Storage (Image/file uploads)
 * 
 * IMPORTANT: Expo uses Firebase Web SDK, NOT react-native-firebase!
 * 
 * Setup Instructions:
 * 1. Install: npm install firebase
 * 2. Create .env file with your Firebase config
 * 3. Follow FIREBASE_SETUP_GUIDE.md for complete setup
 */

import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { 
  getAuth, 
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  User,
  initializeAuth as firebaseInitializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { 
  getFirestore, 
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

// ==========================================
// TypeScript Interfaces
// ==========================================

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface DetectionResult {
  breedName: string;
  confidence: number;
  imageUrl?: string;
  timestamp?: Date;
  userId?: string;
  characteristics?: string[];
  careTips?: string[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

// ==========================================
// Firebase Configuration
// ==========================================

/**
 * Firebase config from environment variables
 * Create a .env file in your project root with:
 * 
 * EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
 * EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 * EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
 * EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 * EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
 * EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
 */
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Validate configuration
const isConfigValid = Object.values(firebaseConfig).every(value => value && value !== '');

console.log('🔥 ════════════════════════════════════════');
console.log('🔥 Firebase Configuration Check');
console.log('════════════════════════════════════════');
console.log('- API Key:', firebaseConfig.apiKey ? '✅ Set' : '❌ Missing');
console.log('- Auth Domain:', firebaseConfig.authDomain ? '✅ Set' : '❌ Missing');
console.log('- Project ID:', firebaseConfig.projectId ? '✅ Set' : '❌ Missing');
console.log('- Storage Bucket:', firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing');
console.log('- App ID:', firebaseConfig.appId ? '✅ Set' : '❌ Missing');
console.log('- Overall Status:', isConfigValid ? '✅ VALID' : '❌ INVALID');
console.log('════════════════════════════════════════');

if (!isConfigValid) {
  console.error('⚠️ ════════════════════════════════════════');
  console.error('⚠️  FIREBASE CONFIG IS INCOMPLETE!');
  console.error('⚠️ ════════════════════════════════════════');
  console.error('Missing fields:', Object.entries(firebaseConfig)
    .filter(([_, v]) => !v || v === '')
    .map(([k]) => k)
    .join(', '));
  console.error('');
  console.error('📝 TO FIX:');
  console.error('1. Check if .env file exists in project root');
  console.error('2. Verify all EXPO_PUBLIC_FIREBASE_* variables are set');
  console.error('3. Restart Metro: npx expo start --clear');
  console.error('4. See FIREBASE_SETUP_GUIDE.md for setup instructions');
  console.error('════════════════════════════════════════');
}

// ==========================================
// Initialize Firebase
// ==========================================

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

// Helper function to get or initialize auth
const getAuthInstance = (): Auth | null => {
  if (auth) return auth;
  if (!app) return null;
  
  console.log('🔄 Getting Auth instance...');
  console.log('📱 Platform:', Platform.OS);
  
  try {
    // On web, we can use getAuth() safely
    // On mobile, we must use initializeAuth() the first time
    if (Platform.OS === 'web') {
      try {
        auth = getAuth(app);
        console.log('✅ Got existing Auth instance (web)');
      } catch (e) {
        auth = firebaseInitializeAuth(app, {
          persistence: [indexedDBLocalPersistence, browserLocalPersistence]
        });
        console.log('✅ Auth initialized with browser persistence');
      }
    } else {
      // Mobile: Always use initializeAuth with AsyncStorage
      auth = firebaseInitializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log('✅ Auth initialized with AsyncStorage persistence');
    }
    return auth;
  } catch (initError: any) {
    console.error('❌ Failed to initialize auth:', initError);
    console.error('Error code:', initError.code);
    console.error('Error message:', initError.message);
    return null;
  }
};

if (isConfigValid) {
  try {
    // Initialize Firebase app
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized');
    } else {
      app = getApps()[0];
      console.log('✅ Using existing Firebase app');
    }
    
    // Don't initialize auth here - let getAuthInstance() do it lazily
    // This prevents "already initialized" errors
    console.log('⏳ Auth will be initialized on first use');
    
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Initialize Analytics (only works on web platform)
    // Note: Analytics won't work in Expo Go, only in web builds or production apps
    isSupported().then(supported => {
      if (supported) {
        try {
          analytics = getAnalytics(app!);
          console.log('✅ Firebase Analytics initialized!');
        } catch (analyticsError) {
          console.warn('⚠️ Firebase Analytics not available (normal for mobile dev)');
        }
      } else {
        console.warn('⚠️ Firebase Analytics not supported in this environment');
      }
    }).catch((err) => {
      console.warn('⚠️ Error checking Analytics support:', err);
    });
    
    console.log('✅ Firebase initialized successfully!');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.warn('⚠️ App will continue without Firebase. Some features may not work.');
  }
} else {
  console.warn('⚠️ Firebase not initialized - config incomplete');
}

// Export Firebase services (may be null if config is invalid)
export { auth, db, storage, analytics };

// ==========================================
// Authentication Functions
// ==========================================

/**
 * Register a new user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password (min 6 characters)
 * @returns User object with uid, email, etc.
 * 
 * Example:
 * ```typescript
 * const user = await registerUser('test@example.com', 'password123');
 * console.log('User created:', user.email);
 * ```
 */
export const registerUser = async (email: string, password: string): Promise<UserProfile> => {
  const authInstance = getAuthInstance();
  if (!authInstance) {
    throw new Error('Firebase Auth is not initialized. Please configure Firebase in your .env file.');
  }
  
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    const user: User = userCredential.user;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  } catch (error: any) {
    console.error('Firebase auth error:', error.code);
    
    // Handle common Firebase Auth errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('This email is already registered. Try logging in instead.');
      case 'auth/invalid-email':
        throw new Error('Invalid email address format.');
      case 'auth/weak-password':
        throw new Error('Password must be at least 6 characters long.');
      case 'auth/operation-not-allowed':
        throw new Error('Email/password authentication is not enabled. Contact support.');
      case 'auth/network-request-failed':
        throw new Error('Network error. Please check your internet connection and try again.');
      case 'auth/too-many-requests':
        throw new Error('Too many requests. Please wait a few minutes and try again.');
      case 'auth/configuration-not-found':
      case 'auth/invalid-api-key':
        throw new Error('App configuration error. Please contact support.');
      default:
        throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }
};

/**
 * Login an existing user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns User object
 * 
 * Example:
 * ```typescript
 * const user = await loginUser('test@example.com', 'password123');
 * console.log('Logged in:', user.email);
 * ```
 */
export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
  const authInstance = getAuthInstance();
  if (!authInstance) {
    throw new Error('Firebase Auth is not initialized. Please configure Firebase in your .env file.');
  }
  
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(authInstance, email, password);
    const user: User = userCredential.user;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  } catch (error: any) {
    console.error('Firebase auth error:', error.code);
    
    // Firebase v10+ uses 'auth/invalid-credential' for wrong email/password
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      case 'auth/invalid-email':
        throw new Error('Invalid email address format.');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled. Contact support.');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please wait a few minutes and try again.');
      case 'auth/network-request-failed':
        throw new Error('Network error. Please check your internet connection and try again.');
      case 'auth/configuration-not-found':
      case 'auth/invalid-api-key':
        throw new Error('App configuration error. Please contact support.');
      default:
        throw new Error(error.message || 'Login failed. Please try again.');
    }
  }
};

/**
 * Logout the current user
 * 
 * Example:
 * ```typescript
 * await logoutUser();
 * console.log('User logged out');
 * ```
 */
export const logoutUser = async (): Promise<void> => {
  const authInstance = getAuthInstance();
  if (!authInstance) {
    throw new Error('Firebase Auth is not initialized.');
  }
  
  try {
    await signOut(authInstance);
    console.log('User logged out successfully');
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(`Logout failed: ${error.message}`);
  }
};

/**
 * Get current logged-in user
 * 
 * @returns Current user or null if not logged in
 * 
 * Example:
 * ```typescript
 * const user = getCurrentUser();
 * if (user) {
 *   console.log('Current user:', user.email);
 * }
 * ```
 */
export const getCurrentUser = (): User | null => {
  const authInstance = getAuthInstance();
  if (!authInstance) {
    return null;
  }
  return authInstance.currentUser;
};

// ==========================================
// Firestore Database Functions
// ==========================================

/**
 * Save cattle breed detection result to Firestore
 * 
 * @param userId - User's unique ID
 * @param result - Detection result object
 * @returns Document ID of saved result
 * 
 * Example:
 * ```typescript
 * const resultId = await saveResult('user123', {
 *   breedName: 'Gir',
 *   confidence: 0.95,
 *   imageUrl: 'https://...'
 * });
 * ```
 */
export const saveResult = async (userId: string, result: DetectionResult): Promise<string> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Results will be saved locally only.');
  }
  
  try {
    const docRef = await addDoc(collection(db, 'detectionResults'), {
      userId,
      breedName: result.breedName,
      confidence: result.confidence,
      imageUrl: result.imageUrl || null,
      characteristics: result.characteristics || [],
      careTips: result.careTips || [],
      timestamp: Timestamp.now(),
      createdAt: new Date().toISOString(),
    });
    
    console.log('Result saved with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving result:', error);
    throw new Error(`Failed to save result: ${error.message}`);
  }
};

/**
 * Get all detection results for a specific user
 * 
 * @param userId - User's unique ID
 * @returns Array of detection results
 * 
 * Example:
 * ```typescript
 * const results = await getResults('user123');
 * console.log(`Found ${results.length} results`);
 * ```
 */
export const getResults = async (userId: string): Promise<DetectionResult[]> => {
  if (!db) {
    console.warn('Firestore not initialized. Returning empty results.');
    return [];
  }
  
  try {
    const q = query(
      collection(db, 'detectionResults'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const results: DetectionResult[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        breedName: data.breedName,
        confidence: data.confidence,
        imageUrl: data.imageUrl,
        timestamp: data.timestamp?.toDate(),
        userId: data.userId,
        characteristics: data.characteristics || [],
        careTips: data.careTips || [],
      };
    });
    
    console.log(`Retrieved ${results.length} results for user:`, userId);
    return results;
  } catch (error: any) {
    console.error('Error fetching results:', error);
    throw new Error(`Failed to fetch results: ${error.message}`);
  }
};

// ==========================================
// Firebase Storage Functions
// ==========================================

/**
 * Store image as base64 in Firestore (temporary solution)
 * 
 * NOTE: This stores images directly in Firestore as base64 strings.
 * Firestore has 1MB document limit, so this is only suitable for small images.
 * For production, migrate to Firebase Storage.
 * 
 * @param userId - User's unique ID
 * @param imageUri - Local URI of the image
 * @param folderName - Not used in Firestore implementation
 * @returns Base64 data URL of the image
 * 
 * Example:
 * ```typescript
 * const imageData = await uploadImage('user123', 'file:///path/to/image.jpg');
 * console.log('Image stored as base64');
 * ```
 */
export const uploadImage = async (
  userId: string, 
  imageUri: string, 
  folderName: string = 'cattle_images'
): Promise<string> => {
  try {
    console.log('Converting image to base64 for Firestore storage...');
    
    // Fetch the image as a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Convert blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    console.log('Image converted to base64 (size: ~' + Math.round(base64.length / 1024) + 'KB)');
    console.warn('WARNING: Storing images in Firestore is not recommended for production. Consider migrating to Firebase Storage.');
    
    return base64;
  } catch (error: any) {
    console.error('Error converting image:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

// ==========================================
// Default Export
// ==========================================

export default {
  // Auth
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  
  // Firestore
  saveResult,
  getResults,
  
  // Storage
  uploadImage,
  
  // Services
  auth,
  db,
  storage,
  analytics,
};
