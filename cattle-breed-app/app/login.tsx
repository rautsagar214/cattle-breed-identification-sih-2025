import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '../src/services/authService';
import { validateEmail, RateLimiter } from '../src/utils/security';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useAuth } from '../src/contexts/AuthContext';
import { ServiceHealthIndicator } from '../src/components/ServiceHealthIndicator';

// Rate limiter for login attempts
const loginLimiter = new RateLimiter();

export default function LoginScreen(): React.JSX.Element {
  const router = useRouter();
  const { t } = useLanguage();
  const { setUser, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log('🔘 Login button pressed');
    if (!email || !password) {
      console.log('⚠️ Empty fields detected');
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Trim whitespace
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Validate email format
    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    // Check rate limiting (5 attempts per minute)
    if (!loginLimiter.isAllowed(`login:${trimmedEmail}`, 5, 60000)) {
      Alert.alert(
        'Too Many Attempts',
        'You have exceeded the maximum login attempts. Please wait 1 minute before trying again.'
      );
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Attempting login...');
      const user = await loginUser(trimmedEmail, trimmedPassword);
      console.log('✅ Login successful!', user.id);

      // Update auth context
      setUser(user);

      // Navigate to home
      setTimeout(() => {
        console.log('🚀 Navigating to home...');
        router.replace('/(tabs)');
      }, 100);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← {t('common.back')}</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Text style={styles.headerIcon}>🐄</Text>
          </View>
          <Text style={styles.headerTitle}>{t('auth.welcomeBack')}</Text>
          <Text style={styles.headerSubtitle}>{t('auth.signInSubtitle')}</Text>
        </View>

        {/* Service Health Indicator */}
        <ServiceHealthIndicator />

        {/* Login Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.email')}
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <View>
              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => Alert.alert(t('auth.forgotPassword'), 'Feature coming soon!')}
          >
            <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>{t('auth.login')}</Text>
                <Text style={styles.loginArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>{t('auth.noAccount')} </Text>
          <TouchableOpacity onPress={() => router.push('/signup' as any)}>
            <Text style={styles.signupLink}>{t('auth.signup')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
  },
  backBtnText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 60,
  },
  iconBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    fontSize: 48,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1a1a1a',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 28,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 28,
    marginTop: 4,
  },
  forgotText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#667eea',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtn: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  loginArrow: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dee2e6',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#7f8c8d',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
    color: '#6b7280',
  },
  signupLink: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '700',
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
});
