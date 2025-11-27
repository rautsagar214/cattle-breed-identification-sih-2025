/**
 * 🔒 Security Utility Functions
 * Provides input validation, sanitization, and security helpers
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * Min 6 chars (Firebase requirement)
 * Recommended: 8+ chars with mix of letters, numbers, symbols
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (password.length < 8) {
    errors.push('Recommended: Use 8+ characters for better security');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Recommended: Include lowercase letters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Recommended: Include uppercase letters');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Recommended: Include numbers');
  }
  
  return {
    isValid: password.length >= 6,
    errors,
  };
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate image file size (prevent DoS attacks via large files)
 */
export const validateImageSize = (sizeInBytes: number, maxSizeMB: number = 5): {
  isValid: boolean;
  error?: string;
} => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  
  if (sizeInBytes > maxBytes) {
    return {
      isValid: false,
      error: `Image size exceeds ${maxSizeMB}MB limit`,
    };
  }
  
  return { isValid: true };
};

/**
 * Validate image type
 */
export const validateImageType = (mimeType: string): {
  isValid: boolean;
  error?: string;
} => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(mimeType.toLowerCase())) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed',
    };
  }
  
  return { isValid: true };
};

/**
 * Rate limiting helper (client-side protection)
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  /**
   * Check if action is allowed
   * @param key - Unique identifier (e.g., 'login:user@email.com')
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   */
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filter attempts within time window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
  
  /**
   * Clear attempts for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Mask sensitive data for logging
 */
export const maskEmail = (email: string): string => {
  const [user, domain] = email.split('@');
  if (!user || !domain) return '***';
  
  const maskedUser = user.length > 2
    ? `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}`
    : '**';
  
  return `${maskedUser}@${domain}`;
};

/**
 * Mask API keys for logging
 */
export const maskApiKey = (key: string): string => {
  if (key.length < 8) return '***';
  return `${key.substring(0, 4)}${'*'.repeat(key.length - 8)}${key.substring(key.length - 4)}`;
};

/**
 * Validate user input length (prevent buffer overflow)
 */
export const validateInputLength = (
  input: string,
  maxLength: number = 500
): { isValid: boolean; error?: string } => {
  if (input.length > maxLength) {
    return {
      isValid: false,
      error: `Input exceeds maximum length of ${maxLength} characters`,
    };
  }
  return { isValid: true };
};

/**
 * Check for SQL injection patterns (defense in depth)
 */
export const detectSqlInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\#|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Secure random string generator
 */
export const generateSecureId = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
};

/**
 * Debounce function to prevent rapid API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  waitMs: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  };
};

export default {
  validateEmail,
  validatePassword,
  sanitizeInput,
  validateImageSize,
  validateImageType,
  RateLimiter,
  maskEmail,
  maskApiKey,
  validateInputLength,
  detectSqlInjection,
  generateSecureId,
  debounce,
};
