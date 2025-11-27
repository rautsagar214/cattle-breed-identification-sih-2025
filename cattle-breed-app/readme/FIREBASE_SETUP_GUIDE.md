# 🔥 Firebase Setup Guide for Expo App (Complete Beginner's Guide)

## 📋 Table of Contents

1. [Create Firebase Project](#step-1-create-firebase-project)
2. [Enable Firebase Services](#step-2-enable-firebase-services)
3. [Get Firebase Config Keys](#step-3-get-firebase-config-keys)
4. [Add Config to Your App](#step-4-add-config-to-your-app)
5. [Test Authentication](#step-5-test-authentication)
6. [Common Mistakes](#common-mistakes)

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console

- Open your browser and go to: **https://console.firebase.google.com/**
- Sign in with your Google account

### 1.2 Create New Project

1. Click **"Add project"** button
2. Enter project name: `cattle-breed-app` (or any name you like)
3. Click **"Continue"**
4. **Google Analytics**: You can disable it for now (not needed for beginners)
5. Click **"Create project"**
6. Wait 30-60 seconds for Firebase to create your project
7. Click **"Continue"** when done

✅ **Your Firebase project is created!**

---

## Step 2: Enable Firebase Services

### 2.1 Enable Authentication (Email/Password)

1. In Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"** button
3. Click on **"Email/Password"** in the Sign-in providers list
4. Toggle **"Enable"** to ON (blue)
5. Click **"Save"**

✅ **Email/Password authentication is now enabled!**

### 2.2 Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"** button
3. Select **"Start in test mode"** (for development)
   - ⚠️ Test mode allows anyone to read/write for 30 days (good for learning)
   - You'll secure it later with rules
4. Click **"Next"**
5. Choose location: **"asia-south1 (Mumbai)"** (closest to India)
6. Click **"Enable"**
7. Wait for Firestore to initialize

✅ **Firestore database is ready!**

### 2.3 Enable Firebase Storage

1. In Firebase Console, click **"Storage"** in the left sidebar
2. Click **"Get started"** button
3. Select **"Start in test mode"** (for development)
4. Click **"Next"**
5. Choose location: **"asia-south1 (Mumbai)"**
6. Click **"Done"**

✅ **Firebase Storage is configured!**

---

## Step 3: Get Firebase Config Keys

### 3.1 Register Your App

1. In Firebase Console, click the **⚙️ gear icon** (Settings) → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click the **"Web"** icon `</>`
4. Enter app nickname: `cattle-breed-web-app`
5. **DO NOT** check "Also set up Firebase Hosting"
6. Click **"Register app"**

### 3.2 Copy Your Config Keys

You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "cattle-breed-app.firebaseapp.com",
  projectId: "cattle-breed-app",
  storageBucket: "cattle-breed-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};
```

**📝 IMPORTANT:** Copy these values! You'll need them in the next step.

---

## Step 4: Add Config to Your App

### 4.1 Create Environment File

Create a new file: `c:\Users\Gauri\Desktop\SIH\cattle-breed-app\.env`

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=cattle-breed-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=cattle-breed-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=cattle-breed-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**Replace the values above with YOUR actual Firebase config values!**

⚠️ **IMPORTANT NOTES:**

- Each value starts with `EXPO_PUBLIC_` (required for Expo)
- No spaces around `=` sign
- No quotes around values
- Keep this file SECRET (it's already in .gitignore)

### 4.2 Firebase Config Already Set Up!

Good news! I've already updated your `src/services/firebase.tsx` file with the complete Firebase configuration. It's ready to use with your `.env` file.

---

## Step 5: Test Authentication

### 5.1 Test User Registration

I'll create a simple test screen for you. Create this file:

`src/screens/TestAuthScreen.tsx`

```typescript
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { registerUser } from "../services/firebase";

export default function TestAuthScreen(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(email, password);
      Alert.alert("Success! 🎉", `Account created for: ${user.email}`);
      console.log("User registered:", user);
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Test Firebase Auth</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min 6 chars)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating Account..." : "Register User"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
```

### 5.2 How to Test

1. **Start your app:** `npm start`
2. **Navigate to the test screen** (you'll need to add it to your navigation)
3. **Enter test email:** `test@example.com`
4. **Enter password:** `password123` (at least 6 characters)
5. **Click "Register User"**
6. **Check Firebase Console:**
   - Go to Authentication → Users
   - You should see your new user listed!

---

## Common Mistakes (and How to Fix Them)

### ❌ Mistake 1: Wrong Import Statement

```typescript
// ❌ WRONG - This is for react-native-firebase (not Expo!)
import auth from "@react-native-firebase/auth";

// ✅ CORRECT - Use Firebase Web SDK
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
```

### ❌ Mistake 2: Forgot to Enable Authentication

**Error:** "This operation is not allowed"

**Fix:**

- Go to Firebase Console → Authentication
- Click "Sign-in method"
- Enable "Email/Password"

### ❌ Mistake 3: Wrong Environment Variable Names

```env
# ❌ WRONG - Won't work in Expo
FIREBASE_API_KEY=xxx

# ✅ CORRECT - Must start with EXPO_PUBLIC_
EXPO_PUBLIC_FIREBASE_API_KEY=xxx
```

### ❌ Mistake 4: Firebase Not Initialized

**Error:** "Firebase: No Firebase App '[DEFAULT]' has been created"

**Fix:**

- Make sure you import `firebase.tsx` before using auth/firestore
- Check that your `.env` file has all required variables

### ❌ Mistake 5: Firestore Rules Too Strict

**Error:** "Missing or insufficient permissions"

**Fix:**

- Go to Firebase Console → Firestore Database → Rules
- For testing, use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

⚠️ This allows anyone to read/write until Dec 31, 2025 (good for learning)

### ❌ Mistake 6: Using Wrong Firebase SDK Version

**Fix:**

- Always use the latest version: `npm install firebase`
- Current version: 11.x (works perfectly with Expo)

### ❌ Mistake 7: iOS/Android Restrictions

**Error:** "API key not valid. Please pass a valid API key."

**Fix for iOS:**

- Go to Firebase Console → Project Settings → iOS apps
- Add your iOS bundle ID: `com.yourname.cattlebreedapp`

**Fix for Android:**

- Go to Firebase Console → Project Settings → Android apps
- Add your Android package name: `com.yourname.cattlebreedapp`
- Download `google-services.json` (may be needed for advanced features)

### ❌ Mistake 8: Forgot to Restart Metro Bundler

**After adding `.env` file, you MUST restart:**

```powershell
# Stop the current server (Ctrl+C)
# Then restart
npm start -- --clear
```

---

## 🎯 Quick Reference: Firebase Functions

### Authentication

```typescript
import { registerUser, loginUser, logoutUser } from "./services/firebase";

// Register new user
const user = await registerUser("test@example.com", "password123");

// Login existing user
const user = await loginUser("test@example.com", "password123");

// Logout
await logoutUser();

// Get current user
import { auth } from "./services/firebase";
const currentUser = auth.currentUser;
```

### Firestore (Database)

```typescript
import { saveResult, getResults } from "./services/firebase";

// Save detection result
const resultId = await saveResult(userId, result);

// Get all results for a user
const results = await getResults(userId);
```

### Storage (Images)

```typescript
import { uploadImage } from "./services/firebase";

// Upload image
const imageUrl = await uploadImage(userId, imageUri, "cattle_photos");
```

---

## 🚀 Next Steps

1. ✅ Create `.env` file with your Firebase config
2. ✅ Test user registration with `TestAuthScreen`
3. ✅ Check Firebase Console to see your new user
4. 📝 Build your actual login/signup screens
5. 🔒 Learn about Firebase Security Rules (later)
6. 🎨 Add error handling and loading states

---

## 📚 Helpful Resources

- **Firebase Documentation:** https://firebase.google.com/docs/web/setup
- **Expo Environment Variables:** https://docs.expo.dev/guides/environment-variables/
- **Firebase Authentication Docs:** https://firebase.google.com/docs/auth/web/start
- **Firestore Getting Started:** https://firebase.google.com/docs/firestore/quickstart

---

## 💡 Tips for Beginners

1. **Start with test mode** for Firestore and Storage (easy to learn)
2. **Use descriptive error messages** in your catch blocks
3. **Check Firebase Console** after each operation (see data in real-time)
4. **Use `console.log()`** to debug authentication issues
5. **Keep your API key secret** (don't commit `.env` to Git)
6. **Test on real device** using Expo Go app for best results

---

**You're all set! 🎉** Follow this guide step-by-step, and you'll have Firebase working in no time.
