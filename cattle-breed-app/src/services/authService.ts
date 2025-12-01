/**
 * Authentication Service - Backend API Integration
 * 
 * This service handles all authentication operations with the backend API:
 * - User registration
 * - User login
 * - Token management
 * - User profile operations
 */

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Get API URL from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const AUTH_ENDPOINT = `${API_URL}/api/auth`;

// User interface
export interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  created_at?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  bio?: string;
  avatar_url?: string;
}

// API response interfaces
interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: AUTH_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear stored data
      await clearAuth();
    }
    return Promise.reject(error);
  }
);

/**
 * Register a new user
 */
export const registerUser = async (
  email: string,
  password: string,
  name?: string,
  phone?: string
): Promise<User> => {
  try {
    const response = await api.post<AuthResponse>('/register', {
      email,
      password,
      name,
      phone,
    });

    const { user, token } = response.data.data;

    // Store token and user data
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

    console.log('✅ User registered successfully:', user.email);
    return user;
  } catch (error: any) {
    console.error('❌ Registration error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      'Registration failed. Please try again.'
    );
  }
};

/**
 * Login user
 */
/**
 * Send OTP to phone number
 */
export const sendOtp = async (phone: string): Promise<void> => {
  try {
    await api.post('/send-otp', { phone });
    console.log('✅ OTP sent successfully to:', phone);
  } catch (error: any) {
    console.error('❌ Send OTP error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      'Failed to send OTP. Please try again.'
    );
  }
};

/**
 * Verify OTP and Login/Register
 */
export const verifyOtp = async (phone: string, otp: string): Promise<User> => {
  try {
    const response = await api.post<AuthResponse>('/verify-otp', {
      phone,
      otp,
    });

    const { user, token } = response.data.data;

    // Store token
    await AsyncStorage.setItem(TOKEN_KEY, token);

    // Fetch full user profile to ensure we have all details
    let fullUser = user;
    try {
      const profileResponse = await api.get<UserResponse>('/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      fullUser = profileResponse.data.data.user;
    } catch (profileError) {
      console.warn('⚠️ Could not fetch full profile, using login data', profileError);
    }

    // Store user data
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(fullUser));

    console.log('✅ User logged in successfully:', fullUser.phone);
    return fullUser;
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      'Invalid OTP. Please try again.'
    );
  }
};

/**
 * Get current user from token
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (!token) {
      return null;
    }

    const response = await api.get<UserResponse>('/me');
    const user = response.data.data.user;

    // Update stored user data
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  } catch (error: any) {
    console.error('❌ Get current user error:', error.response?.data || error.message);

    // If unauthorized, clear auth data
    if (error.response?.status === 401) {
      await clearAuth();
    }

    return null;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  name?: string,
  phone?: string
): Promise<User> => {
  try {
    const response = await api.put<UserResponse>('/update', {
      name,
      phone,
    });

    const user = response.data.data.user;

    // Update stored user data
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

    console.log('✅ Profile updated successfully');
    return user;
  } catch (error: any) {
    console.error('❌ Update profile error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      'Failed to update profile. Please try again.'
    );
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  await clearAuth();
  console.log('✅ User logged out successfully');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token !== null;
};

/**
 * Get stored token
 */
export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

/**
 * Get stored user data
 */
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Error getting stored user:', error);
    return null;
  }
};

/**
 * Clear authentication data
 */
const clearAuth = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};

/**
 * Export axios instance for custom API calls
 */
export const authApi = api;
