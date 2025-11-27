# 🏗️ App Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CATTLE BREED APP                         │
│                  Smart India Hackathon 2025                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  AuthContext (src/contexts/AuthContext.tsx)                 │
│  ├─ onAuthStateChanged listener                             │
│  ├─ User state management                                   │
│  ├─ isAuthenticated flag                                    │
│  └─ useAuth() hook for components                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    NAVIGATION FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [1] Welcome Screen (app/index.tsx)                         │
│       ├─ Green gradient design                              │
│       ├─ App introduction                                   │
│       ├─ "Get Started" → Signup                             │
│       └─ "Login" → Login Screen                             │
│                                                              │
│  [2] Authentication Screens                                 │
│       ├─ Login (app/login.tsx)                              │
│       │   ├─ Email/Password validation                      │
│       │   ├─ Firebase Authentication                        │
│       │   └─ Navigate to Home on success                    │
│       │                                                      │
│       └─ Signup (app/signup.tsx)                            │
│           ├─ Name, Email, Password validation               │
│           ├─ Password confirmation                          │
│           ├─ Firebase User Registration                     │
│           └─ Navigate to Home on success                    │
│                                                              │
│  [3] Main App (Protected Routes)                            │
│       │                                                      │
│       ├─ Home (app/(tabs)/index.tsx)                        │
│       │   ├─ Dashboard with feature cards                   │
│       │   ├─ Firebase connection status                     │
│       │   └─ Supported breeds list                          │
│       │                                                      │
│       ├─ Upload (app/upload.tsx)                            │
│       │   ├─ Camera capture (expo-camera)                   │
│       │   ├─ Gallery picker (expo-image-picker)             │
│       │   ├─ Image preview & validation                     │
│       │   ├─ Firebase Storage upload                        │
│       │   ├─ Mock breed detection (TFLite ready)            │
│       │   └─ Navigate to Result screen                      │
│       │                                                      │
│       ├─ Result (app/result.tsx)                            │
│       │   ├─ Display detected breed                         │
│       │   ├─ Confidence score badge                         │
│       │   ├─ Characteristics list (6 items)                 │
│       │   ├─ Care tips list (8 items)                       │
│       │   └─ Action buttons:                                │
│       │       ├─ Ask AI → Chatbot                           │
│       │       ├─ Analyze Another → Upload                   │
│       │       └─ Back to Home                               │
│       │                                                      │
│       ├─ Chatbot (app/chatbot.tsx)                          │
│       │   ├─ Message interface (user/bot)                   │
│       │   ├─ Quick question buttons (4 presets)             │
│       │   ├─ Mock AI responses (Gemini ready)               │
│       │   ├─ Typing indicator                               │
│       │   └─ Auto-scroll chat history                       │
│       │                                                      │
│       └─ Settings (app/settings.tsx)                        │
│           ├─ User profile display                           │
│           ├─ Language selection (5 languages)               │
│           ├─ Notification toggle                            │
│           ├─ Theme switch (dark mode)                       │
│           ├─ About section (version, help, privacy)         │
│           └─ Logout button with confirmation                │
│                                                              │
└─────────────────────────────────────────────────────────────┘

```

---

## 📂 Project Structure

```
cattle-breed-app/
├── app/                          # Expo Router screens
│   ├── index.tsx                 # Welcome/Onboarding screen
│   ├── login.tsx                 # Login screen
│   ├── signup.tsx                # Signup screen
│   ├── upload.tsx                # Image upload screen
│   ├── chatbot.tsx               # AI chatbot screen
│   ├── result.tsx                # Breed detection results
│   ├── settings.tsx              # App settings screen
│   ├── _layout.tsx               # Root layout with AuthProvider
│   └── (tabs)/
│       ├── index.tsx             # Home screen (main dashboard)
│       └── _layout.tsx           # Tab navigation layout
│
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx       # Global authentication state
│   │
│   ├── services/
│   │   ├── firebase.tsx          # Firebase SDK (Auth, Firestore, Storage)
│   │   ├── gemini.tsx            # Gemini AI integration (ready)
│   │   └── tflite.tsx            # TFLite model integration (ready)
│   │
│   ├── models/
│   │   └── types.ts              # TypeScript interfaces
│   │
│   ├── utils/
│   │   └── helpers.ts            # Utility functions
│   │
│   └── i18n/
│       └── translations.ts       # Multi-language support (ready)
│
├── .env                          # Firebase credentials
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── TESTING_GUIDE.md              # Comprehensive testing guide
└── ARCHITECTURE.md               # This file
```

---

## 🔄 Data Flow

### User Registration Flow

```
User enters credentials
    ↓
signup.tsx validates input
    ↓
firebase.registerUser() called
    ↓
Firebase creates user account
    ↓
AuthContext updates user state
    ↓
Navigate to Home screen (tabs)
```

### User Login Flow

```
User enters credentials
    ↓
login.tsx validates input
    ↓
firebase.loginUser() called
    ↓
Firebase authenticates user
    ↓
AuthContext updates user state (onAuthStateChanged)
    ↓
Navigate to Home screen (tabs)
```

### Image Upload & Analysis Flow

```
User selects image (camera/gallery)
    ↓
upload.tsx validates image
    ↓
firebase.uploadImage() → Firebase Storage
    ↓
Mock TFLite analysis (returns "Gir" breed)
    ↓
firebase.saveResult() → Firestore
    ↓
Navigate to Result screen with data
```

### Chatbot Interaction Flow

```
User types question OR taps quick button
    ↓
chatbot.tsx processes input
    ↓
getBotResponse() with mock AI
    (ready to replace with gemini.askGemini())
    ↓
Display bot response with typing indicator
    ↓
Auto-scroll to latest message
```

### Logout Flow

```
User taps Logout in Settings
    ↓
Confirmation alert shown
    ↓
firebase.logoutUser() called
    ↓
Firebase signs out user
    ↓
AuthContext clears user state
    ↓
Navigate back to Login screen
```

---

## 🛠️ Technology Stack

### Frontend

- **React Native**: 0.81.5
- **React**: 19.1.0
- **TypeScript**: 5.9.3
- **Expo SDK**: 54.0.24
- **Expo Router**: 6.0.15 (file-based navigation)

### UI Libraries

- **expo-linear-gradient**: Gradient backgrounds
- **expo-image-picker**: Image selection from gallery
- **expo-camera**: Camera access for photos
- **@react-navigation/native**: Navigation foundation

### Backend Services

- **Firebase Authentication**: User sign-up/login
- **Firebase Firestore**: NoSQL database for results
- **Firebase Storage**: Cloud storage for images
- **Firebase Analytics**: Usage tracking

### AI/ML (Ready for Integration)

- **Google Gemini API**: Chatbot AI (mock responses currently)
- **TensorFlow Lite**: Breed detection model (mock detection currently)

---

## 🔐 Security Architecture

### Authentication

1. **Email/Password Authentication**: Firebase Auth handles password hashing and security
2. **AuthContext**: Single source of truth for user state
3. **Protected Routes**: All main app screens require authentication
4. **Auto-logout**: On token expiry or manual logout

### Data Security

1. **Environment Variables**: Firebase credentials in `.env` file
2. **Firestore Rules**: (To be implemented in Firebase Console)
   - Users can only read/write their own data
   - Results are private to authenticated users
3. **Storage Rules**: (To be implemented in Firebase Console)
   - Only authenticated users can upload
   - Max file size: 5MB
   - Only image files allowed

### Input Validation

- Email format validation (regex)
- Password minimum length (6 characters)
- Password confirmation matching
- Name length validation (2+ characters)
- Image size and type validation

---

## 📊 State Management

### Global State (AuthContext)

```typescript
interface AuthContextType {
  user: User | null; // Current Firebase user
  loading: boolean; // Auth state loading
  isAuthenticated: boolean; // Quick auth check
}
```

### Local State (Component-level)

- **Login/Signup**: Form fields, loading, errors
- **Upload**: Selected image, upload progress, permissions
- **Chatbot**: Messages array, input text, typing indicator
- **Result**: Breed data, confidence score
- **Settings**: Language selection, preferences toggles

---

## 🎯 API Endpoints (Firebase)

### Authentication

```typescript
registerUser(email, password, name) → Promise<UserCredential>
loginUser(email, password) → Promise<UserCredential>
logoutUser() → Promise<void>
getCurrentUser() → User | null
```

### Firestore Database

```typescript
saveResult(userId, breedData) → Promise<void>
getResults(userId) → Promise<QuerySnapshot>
```

### Storage

```typescript
uploadImage(imageUri, userId) → Promise<string> // Returns download URL
```

### Analytics (Future)

```typescript
logEvent(eventName, params) → void
setUserProperties(properties) → void
```

---

## 🚀 Scalability Considerations

### Current Architecture (MVP)

- ✅ Single authentication provider (Email/Password)
- ✅ Mock AI responses (hardcoded)
- ✅ Mock breed detection (returns "Gir")
- ✅ 5 supported languages (UI only, no translation yet)

### Future Enhancements

1. **Authentication**: Add Google Sign-In, Phone Auth
2. **AI Integration**: Replace mock with real Gemini API
3. **ML Model**: Integrate trained TFLite model for 12 breeds
4. **Internationalization**: Full i18n with react-native-i18n
5. **Offline Support**: Local database with SQLite
6. **Push Notifications**: Firebase Cloud Messaging
7. **Analytics**: Track user behavior, feature usage
8. **Performance**: Image caching, lazy loading, code splitting

---

## 🧪 Testing Strategy

### Unit Testing (Future)

- Test Firebase service functions
- Test validation logic
- Test utility functions

### Integration Testing

- Test authentication flow (manual)
- Test navigation between screens (manual)
- Test Firebase operations (manual)

### End-to-End Testing

- Full user journey: Signup → Login → Upload → Result → Chatbot → Settings → Logout
- See `TESTING_GUIDE.md` for detailed steps

---

## 📈 Performance Optimization

### Current Optimizations

- ✅ Lazy loading of Firebase services
- ✅ Image compression before upload
- ✅ Efficient state updates with useState
- ✅ Memoization where needed
- ✅ TypeScript for compile-time error catching

### Future Optimizations

- [ ] Image caching with expo-image
- [ ] Virtual lists for large datasets (FlatList optimization)
- [ ] Code splitting with React.lazy()
- [ ] Background image uploads with expo-task-manager
- [ ] Redux for complex state management (if needed)

---

## 🎨 Design Patterns Used

1. **Context Pattern**: AuthContext for global auth state
2. **Service Layer**: Separate files for Firebase, Gemini, TFLite
3. **Component Composition**: Reusable UI components
4. **Hooks Pattern**: useAuth, useState, useEffect, useRouter
5. **File-based Routing**: Expo Router for navigation
6. **TypeScript Interfaces**: Type safety throughout

---

## 📝 Environment Configuration

### Required Environment Variables (.env)

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDjXP6mS-h_Lcwbc-i3uSdoonZJcPZTRRw
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=cattle-breed-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=cattle-breed-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=cattle-breed-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
EXPO_PUBLIC_FIREBASE_APP_ID=<your-app-id>
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-92BZGNPC19
```

---

## 🏆 Smart India Hackathon 2025 Ready!

Your app now has:

- ✅ Professional authentication flow
- ✅ Complete feature implementation
- ✅ Firebase backend integration
- ✅ TypeScript type safety
- ✅ Proper navigation architecture
- ✅ Mock AI/ML ready for real integration
- ✅ 5 language support (UI ready)
- ✅ Clean, maintainable code structure

**Next Steps**: Test the app thoroughly, integrate real AI/ML models, and deploy to production! 🚀
