import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { registerUser, loginUser, getCurrentUser } from '../services/firebase';

/**
 * 🧪 Test Authentication Screen
 * 
 * This is a test screen to verify Firebase Authentication works correctly.
 * Use this to test user registration and login before building your real UI.
 * 
 * Features:
 * - Register new user with email/password
 * - Login existing user
 * - Show current logged-in user
 * - Detailed error messages
 * 
 * How to use:
 * 1. Make sure you've set up your .env file (see FIREBASE_SETUP_GUIDE.md)
 * 2. Restart your Metro bundler: npm start -- --clear
 * 3. Navigate to this screen
 * 4. Try registering a new user
 * 5. Check Firebase Console → Authentication → Users
 */
export default function TestAuthScreen(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  /**
   * Handle user registration
   */
  const handleRegister = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long');
      return;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(email, password);
      setCurrentUser(getCurrentUser());
      
      Alert.alert(
        'Success! 🎉', 
        `Account created successfully!\n\nEmail: ${user.email}\nUser ID: ${user.uid}\n\nCheck Firebase Console to see your new user.`,
        [{ text: 'OK' }]
      );
      
      // Clear form
      setEmail('');
      setPassword('');
      
      console.log('✅ Registration successful:', user);
    } catch (error: any) {
      Alert.alert('Registration Failed ❌', error.message);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user login
   */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password);
      setCurrentUser(getCurrentUser());
      
      Alert.alert(
        'Login Successful! ✅', 
        `Welcome back!\n\nEmail: ${user.email}\nUser ID: ${user.uid}`,
        [{ text: 'OK' }]
      );
      
      // Clear form
      setEmail('');
      setPassword('');
      
      console.log('✅ Login successful:', user);
    } catch (error: any) {
      Alert.alert('Login Failed ❌', error.message);
      console.error('Login error:', error);
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🔥 Firebase Auth Test</Text>
          <Text style={styles.subtitle}>Test your Firebase integration</Text>
        </View>

        {/* Current User Status */}
        {currentUser && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoTitle}>✅ Logged In</Text>
            <Text style={styles.userInfoText}>Email: {currentUser.email}</Text>
            <Text style={styles.userInfoText}>UID: {currentUser.uid}</Text>
          </View>
        )}

        {!currentUser && (
          <View style={[styles.userInfo, styles.userInfoLoggedOut]}>
            <Text style={styles.userInfoTitle}>❌ Not Logged In</Text>
            <Text style={styles.userInfoText}>Register or login below</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />

          {/* Buttons */}
          <TouchableOpacity 
            style={[styles.button, styles.registerButton, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>📝 Register New User</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.loginButton, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>🔑 Login Existing User</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📖 How to Test:</Text>
          <Text style={styles.instructionsText}>
            1️⃣ Enter a test email (e.g., test@example.com){'\n'}
            2️⃣ Enter a password (min 6 characters){'\n'}
            3️⃣ Click "Register" to create account{'\n'}
            4️⃣ Go to Firebase Console → Authentication{'\n'}
            5️⃣ You should see your new user listed!
          </Text>
          
          <Text style={styles.instructionsTitle}>⚠️ Common Issues:</Text>
          <Text style={styles.instructionsText}>
            • "Firebase config incomplete" → Check .env file{'\n'}
            • "Operation not allowed" → Enable Email/Password in Firebase{'\n'}
            • "Email already in use" → Try logging in instead{'\n'}
            • After adding .env, restart: npm start -- --clear
          </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  userInfo: {
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  userInfoLoggedOut: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  userInfoText: {
    fontSize: 14,
    color: '#495057',
    marginTop: 4,
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 8,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButton: {
    backgroundColor: '#3498db',
  },
  loginButton: {
    backgroundColor: '#2ecc71',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 12,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 22,
  },
});
