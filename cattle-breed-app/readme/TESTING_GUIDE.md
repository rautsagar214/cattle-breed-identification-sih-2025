# 🧪 Testing Guide for Cattle Breed App

## ✅ Complete App Architecture

Your app now follows a proper authentication-first architecture:

```
Welcome Screen (index.tsx)
    ↓
Login/Signup Screens
    ↓
Main App (Protected Routes)
    ↓
Home → Upload → Result → Chatbot → Settings
```

---

## 📱 How to Test the Complete Flow

### 1️⃣ Start the App

```powershell
# If Metro bundler is not running:
cd C:\Users\Gauri\Desktop\SIH\cattle-breed-app
npx expo start
```

Scan the QR code with **Expo Go** app on your phone.

---

### 2️⃣ Test Authentication Flow

#### **A. Welcome Screen** (`app/index.tsx`)

- ✅ See green gradient background
- ✅ See app logo 🐄 and title
- ✅ See 4 features listed
- ✅ Tap "Get Started" → Should navigate to Signup
- ✅ Tap "I Already Have an Account" → Should navigate to Login

#### **B. Signup Screen** (`app/signup.tsx`)

1. Try to submit empty form → Should show validation error
2. Enter name less than 2 characters → Should show error
3. Enter invalid email format → Should show error
4. Enter password less than 6 characters → Should show error
5. Enter non-matching passwords → Should show error
6. Enter valid details:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm: `password123`
7. Tap "Create Account" → Should:
   - Create Firebase account
   - Navigate to Home screen (tabs)
   - Show success or error message

#### **C. Login Screen** (`app/login.tsx`)

1. After logout, try logging in with:
   - Email: `test@example.com`
   - Password: `password123`
2. Should navigate to Home screen
3. Try wrong password → Should show Firebase error

---

### 3️⃣ Test Main App Features

#### **D. Home Screen** (`app/(tabs)/index.tsx`)

- ✅ See green header "🐄 Cattle Breed Identifier"
- ✅ See welcome message
- ✅ See 3 feature cards:
  1. Upload Photo
  2. Ask AI Chatbot
  3. Settings
- ✅ See "Firebase Connected" info card
- ✅ See list of 12 supported breeds
- ✅ Tap each card to navigate to respective screen

#### **E. Upload Screen** (`app/upload.tsx`)

1. **Test Camera Access:**

   - Tap "Take Photo" button
   - Grant camera permission when prompted
   - Take a photo of any cattle (or object for testing)
   - See image preview
   - Tap "Upload & Analyze" → Should:
     - Upload to Firebase Storage
     - Show analyzing steps (Upload → Analyze → Save)
     - Mock detection: "Gir" breed
     - Navigate to Result screen

2. **Test Gallery Access:**

   - Tap "Choose from Gallery"
   - Grant media library permission
   - Select an image
   - See preview and upload

3. **Test Validation:**
   - Try to upload without selecting image → Should show alert
   - Tap "Remove Image" → Should clear preview

#### **F. Result Screen** (`app/result.tsx`)

- ✅ See detected breed name "Gir"
- ✅ See confidence score badge (95%)
- ✅ See uploaded/sample image
- ✅ See 6 characteristics listed
- ✅ See 8 care tips listed
- ✅ Tap "Ask AI About This Breed" → Navigate to Chatbot
- ✅ Tap "Analyze Another Image" → Navigate back to Upload
- ✅ Tap "Back to Home" → Navigate to Home

#### **G. Chatbot Screen** (`app/chatbot.tsx`)

1. **Test Quick Questions:**

   - Tap "Tell me about Gir cattle" → Should show bot response
   - Tap "What should I feed my cattle?" → Should show feeding tips
   - Tap "Common cattle diseases?" → Should show disease info
   - Tap "Vaccination schedule?" → Should show vaccine schedule

2. **Test Manual Input:**

   - Type: "Hello" → Should get welcome response
   - Type: "How much milk does Gir give?" → Should get info
   - Type: random text → Should get default response

3. **Test UI:**
   - ✅ See typing indicator when bot is responding
   - ✅ See message timestamps
   - ✅ User messages on right (blue)
   - ✅ Bot messages on left (green)
   - ✅ Auto-scroll to latest message

#### **H. Settings Screen** (`app/settings.tsx`)

1. **Test Profile Section:**

   - ✅ See user email
   - ✅ See user initial in profile icon

2. **Test Language Selection:**

   - Tap each language (English, Hindi, Gujarati, Marathi, Tamil)
   - ✅ Should show checkmark on selected language

3. **Test Preferences:**

   - Toggle "Notifications" switch → Should toggle on/off
   - Toggle "Dark Mode" switch → Disabled (coming soon)

4. **Test About Section:**

   - Tap "Help & Support" → Should show alert
   - Tap "Privacy Policy" → Should show alert
   - Tap "Terms of Service" → Should show alert
   - ✅ See app version "1.0.0"

5. **Test Logout:**
   - Tap "🚪 Logout" button
   - Should show confirmation alert
   - Tap "Logout" → Should:
     - Sign out from Firebase
     - Navigate back to Login screen
     - Clear authentication state

---

## 🔍 Check Firebase Console

### Authentication

1. Go to: https://console.firebase.google.com/
2. Select project: `cattle-breed-app`
3. Go to "Authentication" → "Users"
4. ✅ Should see your registered email

### Firestore Database

1. Go to "Firestore Database"
2. Look for collections:
   - `users` → User profiles
   - `results` → Breed detection results
3. Check if documents are being saved

### Storage

1. Go to "Storage"
2. Look for folder: `cattle-images/`
3. ✅ Should see uploaded images with UUID filenames

---

## 🐛 Common Issues & Fixes

### Issue 1: "Metro bundler not found"

```powershell
cd C:\Users\Gauri\Desktop\SIH\cattle-breed-app
npx expo start --clear
```

### Issue 2: "Firebase credentials not working"

- Check `.env` file exists
- Verify all Firebase keys are correct
- Restart Metro bundler

### Issue 3: "Camera/Gallery not working"

- Grant permissions in phone settings
- Test on physical device (camera doesn't work on simulator)

### Issue 4: "Navigation not working"

- Check `app/_layout.tsx` has all routes defined
- Verify screen names match file names
- Clear cache: `npx expo start --clear`

### Issue 5: "TypeScript errors"

```powershell
npx tsc --noEmit
```

---

## 📊 Current Implementation Status

| Feature         | Status      | Notes                        |
| --------------- | ----------- | ---------------------------- |
| Authentication  | ✅ Complete | Firebase Auth working        |
| Welcome Screen  | ✅ Complete | Gradient design              |
| Login Screen    | ✅ Complete | Email/password validation    |
| Signup Screen   | ✅ Complete | User registration            |
| Home Screen     | ✅ Complete | Dashboard with feature cards |
| Upload Screen   | ✅ Complete | Camera + Gallery working     |
| Result Screen   | ✅ Complete | Shows mock breed data        |
| Chatbot Screen  | ✅ Complete | Mock AI responses            |
| Settings Screen | ✅ Complete | Profile, language, logout    |
| Navigation      | ✅ Complete | All routes configured        |
| TypeScript      | ✅ Complete | Zero compilation errors      |

---

## 🚀 Next Steps (Future Enhancements)

### 1. Integrate Gemini API

Replace mock chatbot responses in `app/chatbot.tsx` with real Gemini API:

```typescript
// src/services/gemini.tsx already exists
import { askGemini } from "../src/services/gemini";

const getBotResponse = async (question: string) => {
  try {
    const response = await askGemini(question);
    return response;
  } catch (error) {
    return "I'm having trouble connecting. Please try again.";
  }
};
```

### 2. Integrate TFLite Model

Replace mock breed detection in `app/upload.tsx` with real TFLite:

```typescript
// src/services/tflite.tsx already exists
import { classifyImage } from "../src/services/tflite";

const analyzeImage = async (imageUri: string) => {
  const predictions = await classifyImage(imageUri);
  const topPrediction = predictions[0]; // Highest confidence

  return {
    breed: topPrediction.label,
    confidence: topPrediction.confidence,
  };
};
```

### 3. Add Internationalization (i18n)

Use `src/i18n/` folder to add translations for 5 languages:

- English
- Hindi (हिन्दी)
- Gujarati (ગુજરાતી)
- Marathi (मराठी)
- Tamil (தமிழ்)

### 4. Improve UI/UX

- Add loading skeletons
- Add animations (Reanimated)
- Improve error handling
- Add offline support
- Add image caching

### 5. Security

Update Firebase rules in Firebase Console:

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /results/{resultId} {
      allow read, write: if request.auth != null;
    }
  }
}

// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cattle-images/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

---

## 🎉 Congratulations!

You now have a **complete, production-ready authentication flow** with:

- ✅ Professional Welcome/Login/Signup screens
- ✅ Protected routes with AuthContext
- ✅ 5 main feature screens (Home, Upload, Result, Chatbot, Settings)
- ✅ Firebase integration (Auth, Firestore, Storage)
- ✅ TypeScript with zero errors
- ✅ Proper navigation architecture
- ✅ Mock AI/ML ready for real implementations

**Ready for Smart India Hackathon 2025!** 🏆
