# 🔥 Firebase Quick Reference Card

## 📦 Installation

```powershell
npm install firebase
```

## 🔧 Setup Checklist

- [ ] Create Firebase project
- [ ] Enable Email/Password auth
- [ ] Enable Firestore (test mode)
- [ ] Enable Storage (test mode)
- [ ] Create `.env` file with config
- [ ] Restart: `npm start -- --clear`

## 🎯 Import Statements

```typescript
// Authentication
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "./services/firebase";

// Database
import { saveResult, getResults } from "./services/firebase";

// Storage
import { uploadImage } from "./services/firebase";

// Direct access to services
import { auth, db, storage } from "./services/firebase";
```

## 🔐 Authentication

### Register User

```typescript
try {
  const user = await registerUser("email@example.com", "password123");
  console.log("User ID:", user.uid);
  console.log("Email:", user.email);
} catch (error) {
  console.error(error.message);
}
```

### Login User

```typescript
try {
  const user = await loginUser("email@example.com", "password123");
  console.log("Logged in:", user.email);
} catch (error) {
  console.error(error.message);
}
```

### Logout User

```typescript
await logoutUser();
```

### Get Current User

```typescript
const currentUser = getCurrentUser();
if (currentUser) {
  console.log("Email:", currentUser.email);
  console.log("UID:", currentUser.uid);
} else {
  console.log("Not logged in");
}
```

## 💾 Firestore Database

### Save Detection Result

```typescript
const result = {
  breedName: "Gir",
  confidence: 0.95,
  imageUrl: "https://...",
  characteristics: ["Humped", "White"],
  careTips: ["Regular feeding"],
};

const resultId = await saveResult(currentUser.uid, result);
console.log("Saved with ID:", resultId);
```

### Get User's Results

```typescript
const results = await getResults(currentUser.uid);
console.log(`Found ${results.length} results`);

results.forEach((result) => {
  console.log(`Breed: ${result.breedName}`);
  console.log(`Confidence: ${result.confidence * 100}%`);
  console.log(`Date: ${result.timestamp}`);
});
```

## 📤 Firebase Storage

### Upload Image

```typescript
const imageUrl = await uploadImage(
  currentUser.uid, // User ID
  "file:///path/image.jpg", // Local image URI
  "cattle_photos" // Folder name (optional)
);
console.log("Uploaded to:", imageUrl);
```

## 🚨 Error Handling

### Authentication Errors

```typescript
try {
  await registerUser(email, password);
} catch (error) {
  switch (error.message) {
    case "This email is already registered...":
      // User exists, try login instead
      break;
    case "Invalid email address format.":
      // Show email validation error
      break;
    case "Password is too weak...":
      // Show password strength error
      break;
  }
}
```

### Common Error Messages

- `"This email is already registered"` → Email/password already exists
- `"Invalid email address"` → Bad email format
- `"Password is too weak"` → Less than 6 characters
- `"No account found"` → User doesn't exist
- `"Incorrect password"` → Wrong password

## 📝 Complete Example

```typescript
import React, { useState } from "react";
import { Alert } from "react-native";
import {
  registerUser,
  getCurrentUser,
  uploadImage,
  saveResult,
} from "./services/firebase";

const MyComponent = () => {
  const [loading, setLoading] = useState(false);

  const handleSignup = async (email, password) => {
    setLoading(true);
    try {
      const user = await registerUser(email, password);
      Alert.alert("Success!", `Welcome ${user.email}`);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAndSave = async (imageUri, breedData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      Alert.alert("Error", "Please login first");
      return;
    }

    try {
      // Upload image
      const imageUrl = await uploadImage(currentUser.uid, imageUri);

      // Save to database
      const resultId = await saveResult(currentUser.uid, {
        ...breedData,
        imageUrl,
      });

      Alert.alert("Success!", "Data saved successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return null; // Your UI here
};
```

## 🔧 Environment Variables

### `.env` file format:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Important:

- Must start with `EXPO_PUBLIC_`
- No spaces around `=`
- No quotes
- Restart after changes: `npm start -- --clear`

## 🐛 Debugging Tips

### Check if Firebase is initialized:

```typescript
import { auth } from "./services/firebase";
console.log("Auth initialized:", !!auth);
```

### Check current user:

```typescript
import { getCurrentUser } from "./services/firebase";
const user = getCurrentUser();
console.log("Current user:", user?.email || "Not logged in");
```

### Check environment variables:

```typescript
console.log("API Key exists:", !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
console.log("Project ID:", process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
```

## 📚 Resources

- **Setup Guide:** `FIREBASE_SETUP_GUIDE.md`
- **Full Documentation:** `FIREBASE_INTEGRATION_SUMMARY.md`
- **Test Screen:** `src/screens/TestAuthScreen.tsx`
- **Firebase Service:** `src/services/firebase.tsx`
- **Firebase Console:** https://console.firebase.google.com/

## 🆘 Quick Troubleshooting

| Problem                      | Solution                                  |
| ---------------------------- | ----------------------------------------- |
| "Firebase config incomplete" | Create `.env` file, restart Metro         |
| "Operation not allowed"      | Enable Email/Password in Firebase Console |
| "Email already in use"       | Use loginUser() instead                   |
| "Missing permissions"        | Set Firestore to test mode                |
| Changes not working          | Restart: `npm start -- --clear`           |

---

**Pro Tip:** Keep this file open while coding for quick reference!
