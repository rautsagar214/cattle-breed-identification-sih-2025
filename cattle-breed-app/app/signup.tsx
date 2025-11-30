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
import { registerUser } from '../src/services/authService';
import { validateEmail, validatePassword } from '../src/utils/security';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useAuth } from '../src/contexts/AuthContext';
import { ServiceHealthIndicator } from '../src/components/ServiceHealthIndicator';

export default function SignupScreen(): React.JSX.Element {
  const router = useRouter();
  const { t } = useLanguage();
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    console.log('🔘 Signup button pressed');
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      console.log('⚠️ Empty fields detected');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Trim whitespace from inputs
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (trimmedName.length < 2) {
      Alert.alert('Error', 'Please enter a valid name (at least 2 characters)');
      return;
    }

    // Validate email format
    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    // Simple password check - just minimum length
    if (trimmedPassword.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    await proceedWithSignup(trimmedEmail, trimmedPassword);
  };

  const proceedWithSignup = async (finalEmail?: string, finalPassword?: string) => {
    const emailToUse = finalEmail || email.trim().toLowerCase();
    const passwordToUse = finalPassword || password.trim();
    const nameToUse = name.trim();

    setLoading(true);
    try {
      console.log('🔐 Signing up:', emailToUse);
      const user = await registerUser(emailToUse, passwordToUse, nameToUse);
      console.log('✅ Success! User ID:', user.id);

      // Update auth context
      setUser(user);

      // Navigate to home
      setTimeout(() => {
        console.log('🚀 Navigating to home...');
        router.replace('/(tabs)');
      }, 100);
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      Alert.alert('Signup Failed', error.message || 'Please try again');
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
          <Text style={styles.headerTitle}>{t('auth.getStarted')}</Text>
          <Text style={styles.headerSubtitle}>{t('auth.signupSubtitle')}</Text>
        </View>

        {/* Service Health Indicator */}
        <ServiceHealthIndicator />

        {/* Signup Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.fullName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.fullName')}
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

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
                placeholder="Min 6 characters"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
            <View>
              <TextInput
                style={styles.input}
                placeholder={t('auth.confirmPassword')}
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signupBtn, loading && styles.signupBtnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text style={styles.signupBtnText}>{t('auth.signup')}</Text>
                <Text style={styles.signupArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>{t('auth.hasAccount')} </Text>
          <TouchableOpacity onPress={() => router.push('/login' as any)}>
            <Text style={styles.loginLink}>{t('auth.login')}</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Welcome */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
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
    paddingTop: 50,
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
    marginBottom: 40,
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
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputContainer: {
    marginBottom: 18,
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
  signupButton: {
    backgroundColor: '#667eea',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  signupBtn: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupBtnDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  signupArrow: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
  },
  termsLink: {
    color: '#667eea',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: '#6b7280',
  },
  loginLink: {
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
