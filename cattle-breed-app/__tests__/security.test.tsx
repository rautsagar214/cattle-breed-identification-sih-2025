/**
 * 🧪 Security Utility Tests
 * Tests for security functions to ensure app protection
 */

import {
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
} from '../src/utils/security';

// Mock timers for rate limiter tests
jest.useFakeTimers();

describe('Security Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.in')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('  test@example.com  ')).toBe(true); // Should trim
      expect(validateEmail('test..@example.com')).toBe(true); // Allowed by regex
    });
  });

  describe('validatePassword', () => {
    it('should validate minimum password length', () => {
      const result1 = validatePassword('12345');
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Password must be at least 6 characters');

      const result2 = validatePassword('123456');
      expect(result2.isValid).toBe(true);
    });

    it('should recommend strong passwords', () => {
      const weakPassword = validatePassword('password');
      expect(weakPassword.errors.length).toBeGreaterThan(0);

      const strongPassword = validatePassword('Test1234!@#');
      expect(strongPassword.isValid).toBe(true);
    });

    it('should detect missing character types', () => {
      const noNumbers = validatePassword('password');
      expect(noNumbers.errors.some((e: string) => e.includes('numbers'))).toBe(true);

      const noUppercase = validatePassword('password123');
      expect(noUppercase.errors.some((e: string) => e.includes('uppercase'))).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML special characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should escape quotes', () => {
      expect(sanitizeInput('Test "quote" here')).toBe('Test &quot;quote&quot; here');
      expect(sanitizeInput("Test 'quote' here")).toBe('Test &#x27;quote&#x27; here');
    });

    it('should handle normal text', () => {
      expect(sanitizeInput('Normal text 123')).toBe('Normal text 123');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });
  });

  describe('validateImageSize', () => {
    it('should allow images within size limit', () => {
      const result = validateImageSize(2 * 1024 * 1024, 5); // 2MB
      expect(result.isValid).toBe(true);
    });

    it('should reject images exceeding size limit', () => {
      const result = validateImageSize(10 * 1024 * 1024, 5); // 10MB
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds 5MB limit');
    });

    it('should use default 5MB limit', () => {
      const result = validateImageSize(6 * 1024 * 1024);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateImageType', () => {
    it('should allow valid image types', () => {
      expect(validateImageType('image/jpeg').isValid).toBe(true);
      expect(validateImageType('image/jpg').isValid).toBe(true);
      expect(validateImageType('image/png').isValid).toBe(true);
      expect(validateImageType('image/webp').isValid).toBe(true);
    });

    it('should reject invalid image types', () => {
      expect(validateImageType('image/gif').isValid).toBe(false);
      expect(validateImageType('video/mp4').isValid).toBe(false);
      expect(validateImageType('application/pdf').isValid).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(validateImageType('IMAGE/JPEG').isValid).toBe(true);
    });
  });

  describe('RateLimiter', () => {
    it('should allow attempts within limit', () => {
      const limiter = new RateLimiter();
      expect(limiter.isAllowed('test-key', 3, 10000)).toBe(true);
      expect(limiter.isAllowed('test-key', 3, 10000)).toBe(true);
      expect(limiter.isAllowed('test-key', 3, 10000)).toBe(true);
    });

    it('should block attempts exceeding limit', () => {
      const limiter = new RateLimiter();
      limiter.isAllowed('test-key', 2, 10000);
      limiter.isAllowed('test-key', 2, 10000);
      expect(limiter.isAllowed('test-key', 2, 10000)).toBe(false);
    });

    it('should reset after time window', () => {
      const limiter = new RateLimiter();
      limiter.isAllowed('test-key', 2, 1000);
      limiter.isAllowed('test-key', 2, 1000);
      
      jest.advanceTimersByTime(1100);
      
      expect(limiter.isAllowed('test-key', 2, 1000)).toBe(true);
    });

    it('should handle different keys independently', () => {
      const limiter = new RateLimiter();
      limiter.isAllowed('key1', 2, 10000);
      limiter.isAllowed('key1', 2, 10000);
      
      expect(limiter.isAllowed('key2', 2, 10000)).toBe(true);
    });

    it('should reset specific key', () => {
      const limiter = new RateLimiter();
      limiter.isAllowed('test-key', 2, 10000);
      limiter.isAllowed('test-key', 2, 10000);
      
      limiter.reset('test-key');
      
      expect(limiter.isAllowed('test-key', 2, 10000)).toBe(true);
    });
  });

  describe('maskEmail', () => {
    it('should mask email correctly', () => {
      expect(maskEmail('test@example.com')).toBe('t**t@example.com');
      expect(maskEmail('john.doe@company.com')).toBe('j******e@company.com');
    });

    it('should handle short emails', () => {
      expect(maskEmail('a@b.com')).toBe('**@b.com');
    });

    it('should handle invalid emails', () => {
      expect(maskEmail('invalid')).toBe('***');
    });
  });

  describe('maskApiKey', () => {
    it('should mask long API keys', () => {
      const key = 'AIzaSyDjXP6mS-h_Lcwbc-i3uSdoonZJcPZTRRw';
      const masked = maskApiKey(key);
      expect(masked).toContain('AIza');
      expect(masked).toContain('TRRw');
      expect(masked).toContain('***');
    });

    it('should handle short keys', () => {
      expect(maskApiKey('short')).toBe('***');
    });
  });

  describe('validateInputLength', () => {
    it('should allow input within limit', () => {
      const result = validateInputLength('Short text', 100);
      expect(result.isValid).toBe(true);
    });

    it('should reject input exceeding limit', () => {
      const longText = 'a'.repeat(600);
      const result = validateInputLength(longText, 500);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds maximum length');
    });

    it('should use default 500 character limit', () => {
      const longText = 'a'.repeat(600);
      expect(validateInputLength(longText).isValid).toBe(false);
    });
  });

  describe('detectSqlInjection', () => {
    it('should detect SQL keywords', () => {
      expect(detectSqlInjection('SELECT * FROM users')).toBe(true);
      expect(detectSqlInjection('DROP TABLE users')).toBe(true);
      expect(detectSqlInjection('INSERT INTO users')).toBe(true);
      expect(detectSqlInjection('UPDATE users SET')).toBe(true);
      expect(detectSqlInjection('DELETE FROM users')).toBe(true);
    });

    it('should detect SQL comments', () => {
      expect(detectSqlInjection('test -- comment')).toBe(true);
      expect(detectSqlInjection('test /* comment */')).toBe(true);
      expect(detectSqlInjection('test # comment')).toBe(true);
    });

    it('should detect OR/AND injections', () => {
      expect(detectSqlInjection("' OR '1'='1")).toBe(true);
      expect(detectSqlInjection("' AND '1'='1")).toBe(true);
    });

    it('should allow normal text', () => {
      expect(detectSqlInjection('Normal user input')).toBe(false);
      expect(detectSqlInjection('Gir cattle breed')).toBe(false);
    });
  });

  describe('generateSecureId', () => {
    it('should generate ID of correct length', () => {
      const id = generateSecureId(16);
      expect(id.length).toBe(16);
    });

    it('should generate unique IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });

    it('should only contain alphanumeric characters', () => {
      const id = generateSecureId(32);
      expect(/^[A-Za-z0-9]+$/.test(id)).toBe(true);
    });
  });
});
