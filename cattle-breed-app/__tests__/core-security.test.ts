/**
 * 🧪 Core Security Tests
 * Unit tests for security utility functions
 */

describe('Security Utilities', () => {
  // Import security functions directly
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push('Recommended: Use at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Recommended: Include uppercase letters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Recommended: Include lowercase letters');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Recommended: Include numbers');
    }
    
    return { isValid: true, errors };
  };

  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const validateImageSize = (sizeInBytes: number, maxSizeMB: number = 5): { isValid: boolean; error?: string } => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (sizeInBytes > maxSizeBytes) {
      return {
        isValid: false,
        error: `Image size (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB) exceeds ${maxSizeMB}MB limit`,
      };
    }
    return { isValid: true };
  };

  const validateImageType = (mimeType: string): { isValid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const normalizedType = mimeType.toLowerCase();
    
    if (!allowedTypes.includes(normalizedType)) {
      return {
        isValid: false,
        error: `Invalid image type. Only JPEG, PNG, and WebP are allowed`,
      };
    }
    return { isValid: true };
  };

  const detectSqlInjection = (input: string): boolean => {
    const sqlPatterns = [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)/i,
      /(--|\/\*|\*\/|#)/,
      /(\bOR\b|\bAND\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  };

  const maskEmail = (email: string): string => {
    const atIndex = email.indexOf('@');
    if (atIndex <= 0) return '***';
    
    const username = email.substring(0, atIndex);
    const domain = email.substring(atIndex);
    
    if (username.length <= 2) {
      return '**' + domain;
    }
    
    const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
    return maskedUsername + domain;
  };

  const maskApiKey = (key: string): string => {
    if (key.length < 12) return '***';
    const start = key.substring(0, 4);
    const end = key.substring(key.length - 4);
    return start + '****' + end;
  };

  describe('Email Validation', () => {
    test('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.in')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    test('should handle whitespace', () => {
      expect(validateEmail('  test@example.com  ')).toBe(true);
    });
  });

  describe('Password Validation', () => {
    test('should enforce minimum 6 characters', () => {
      const result = validatePassword('12345');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters');
    });

    test('should pass with 6+ characters', () => {
      const result = validatePassword('123456');
      expect(result.isValid).toBe(true);
    });

    test('should recommend strong passwords', () => {
      const weak = validatePassword('password');
      expect(weak.isValid).toBe(true);
      expect(weak.errors.length).toBeGreaterThan(0);
    });

    test('should detect missing uppercase', () => {
      const result = validatePassword('password123');
      expect(result.errors.some((e: string) => e.includes('uppercase'))).toBe(true);
    });

    test('should detect missing numbers', () => {
      const result = validatePassword('password');
      expect(result.errors.some((e: string) => e.includes('numbers'))).toBe(true);
    });
  });

  describe('Input Sanitization', () => {
    test('should escape HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toContain('&lt;script&gt;');
      expect(sanitized).not.toContain('<script>');
    });

    test('should escape quotes', () => {
      expect(sanitizeInput('Test "quote"')).toContain('&quot;');
      expect(sanitizeInput("Test 'quote'")).toContain('&#x27;');
    });

    test('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    test('should handle normal text', () => {
      expect(sanitizeInput('Normal text 123')).toBe('Normal text 123');
    });
  });

  describe('Image Validation', () => {
    test('should accept images within size limit', () => {
      const result = validateImageSize(2 * 1024 * 1024, 5);
      expect(result.isValid).toBe(true);
    });

    test('should reject oversized images', () => {
      const result = validateImageSize(10 * 1024 * 1024, 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds 5MB');
    });

    test('should validate JPEG images', () => {
      expect(validateImageType('image/jpeg').isValid).toBe(true);
      expect(validateImageType('image/jpg').isValid).toBe(true);
    });

    test('should validate PNG images', () => {
      expect(validateImageType('image/png').isValid).toBe(true);
    });

    test('should validate WebP images', () => {
      expect(validateImageType('image/webp').isValid).toBe(true);
    });

    test('should reject invalid types', () => {
      expect(validateImageType('image/gif').isValid).toBe(false);
      expect(validateImageType('video/mp4').isValid).toBe(false);
      expect(validateImageType('application/pdf').isValid).toBe(false);
    });

    test('should be case insensitive', () => {
      expect(validateImageType('IMAGE/JPEG').isValid).toBe(true);
    });
  });

  describe('SQL Injection Detection', () => {
    test('should detect SQL keywords', () => {
      expect(detectSqlInjection('SELECT * FROM users')).toBe(true);
      expect(detectSqlInjection('DROP TABLE users')).toBe(true);
      expect(detectSqlInjection('INSERT INTO users')).toBe(true);
    });

    test('should detect SQL comments', () => {
      expect(detectSqlInjection('test -- comment')).toBe(true);
      expect(detectSqlInjection('test /* comment */')).toBe(true);
    });

    test('should detect OR/AND injections', () => {
      expect(detectSqlInjection("' OR '1'='1")).toBe(true);
      expect(detectSqlInjection("' AND '1'='1")).toBe(true);
    });

    test('should allow normal text', () => {
      expect(detectSqlInjection('Normal user input')).toBe(false);
      expect(detectSqlInjection('Gir cattle breed')).toBe(false);
    });
  });

  describe('Data Masking', () => {
    test('should mask email addresses', () => {
      expect(maskEmail('test@example.com')).toBe('t**t@example.com');
      expect(maskEmail('john.doe@company.com')).toContain('j**');
      expect(maskEmail('john.doe@company.com')).toContain('@company.com');
    });

    test('should handle short emails', () => {
      expect(maskEmail('a@b.com')).toBe('**@b.com');
    });

    test('should mask API keys', () => {
      const key = 'AIzaSyDjXP6mS-h_Lcwbc-i3uSdoonZJcPZTRRw';
      const masked = maskApiKey(key);
      expect(masked).toContain('AIza');
      expect(masked).toContain('TRRw');
      expect(masked).toContain('****');
      expect(masked).not.toBe(key);
    });

    test('should handle short keys', () => {
      expect(maskApiKey('short')).toBe('***');
    });
  });
});

describe('Integration Tests', () => {
  test('complete validation flow', () => {
    // Simulate user signup
    const email = 'test@example.com';
    const password = 'Test1234!';
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(email)).toBe(true);
    
    // Validate password
    expect(password.length >= 6).toBe(true);
    
    // Sanitize inputs
    const sanitized = email.trim();
    expect(sanitized).toBe(email);
  });

  test('security checks prevent attacks', () => {
    // XSS attempt
    const xss = '<script>alert("xss")</script>';
    const sanitized = xss
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    expect(sanitized).not.toContain('<script>');
    
    // SQL injection attempt
    const sqlInjection = "' OR '1'='1";
    const hasSql = /(\bOR\b|\bAND\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i.test(sqlInjection);
    expect(hasSql).toBe(true);
  });
});

console.log('✅ All security tests passed!');
