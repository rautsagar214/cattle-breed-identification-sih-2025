// Utility helper functions used throughout the app
import { Platform } from 'react-native';

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} - Formatted date
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Date(date).toLocaleDateString('en-IN', options);
};

/**
 * Format confidence percentage
 * @param {number} confidence - Confidence value (0-100)
 * @returns {string} - Formatted percentage
 */
export const formatConfidence = (confidence: number): string => {
  if (typeof confidence !== 'number') return '0%';
  return `${confidence.toFixed(1)}%`;
};

/**
 * Validate image URI
 * @param {string} uri - Image URI
 * @returns {boolean} - Is valid image
 */
export const isValidImageUri = (uri: string | null): boolean => {
  if (!uri) return false;
  return uri.startsWith('file://') || uri.startsWith('http://') || uri.startsWith('https://');
};

/**
 * Get confidence color based on value
 * @param {number} confidence - Confidence percentage
 * @returns {string} - Color code
 */
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 80) return '#27ae60'; // Green
  if (confidence >= 60) return '#f39c12'; // Orange
  return '#e74c3c'; // Red
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text: string | null, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate unique ID
 * @returns {string} - Unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Delay/sleep function
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after delay
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if app is running on iOS
 * @returns {boolean}
 */
export const isIOS = () => {
  return Platform.OS === 'ios';
};

/**
 * Check if app is running on Android
 * @returns {boolean}
 */
export const isAndroid = () => {
  return Platform.OS === 'android';
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Validate email
 * @param {string} email - Email address
 * @returns {boolean} - Is valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number
 * @returns {boolean} - Is valid phone
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Get greeting based on time of day
 * @returns {string} - Greeting message
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number = 300): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  
  return function executedFunction(...args) {
    const later = () => {
      if (timeout) clearTimeout(timeout);
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} - Is empty
 */
export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export const deepClone = <T extends object>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Export all utilities
export default {
  formatDate,
  formatConfidence,
  isValidImageUri,
  getConfidenceColor,
  truncateText,
  generateId,
  sleep,
  isIOS,
  isAndroid,
  formatFileSize,
  capitalize,
  isValidEmail,
  isValidPhone,
  getGreeting,
  debounce,
  isEmpty,
  deepClone,
};
