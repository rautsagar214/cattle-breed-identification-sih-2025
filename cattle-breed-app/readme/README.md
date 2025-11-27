# 🐄 Cattle Breed Identifier App

**Smart India Hackathon 2025** - AI-Powered Cattle Breed Detection System

[![Made with Expo](https://img.shields.io/badge/Made%20with-Expo-000020.svg?style=flat&logo=expo&labelColor=4630EB&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6.0-FFCA28?style=flat&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=flat&logo=react&logoColor=white)](https://reactnative.dev/)

---

## 📖 Overview

An intelligent mobile application that helps farmers and cattle owners identify cattle breeds using AI-powered image recognition. The app provides detailed information about breeds, their characteristics, care tips, and an AI chatbot for instant answers.

### ✨ Key Features

- 🔐 **Secure Authentication** - Email/Password signup and login with Firebase
- 📸 **Image Upload** - Capture photos or choose from gallery
- 🤖 **AI Breed Detection** - Identify cattle breeds with confidence scores
- 💬 **AI Chatbot** - Get instant answers about cattle care, health, and breeding
- 🌍 **Multi-language Support** - 5 Indian languages (English, Hindi, Gujarati, Marathi, Tamil)
- ⚙️ **Customizable Settings** - Language selection, notifications, and preferences
- 📊 **Detailed Results** - Breed characteristics and care tips

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18+ ([Download](https://nodejs.org/))
- **Expo Go**: Install on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))
- **Firebase Project**: Create at [Firebase Console](https://console.firebase.google.com/)

### Installation

1. **Clone the repository** (or navigate to the project folder):

   ```powershell
   cd C:\Users\Gauri\Desktop\SIH\cattle-breed-app
   ```

2. **Install dependencies**:

   ```powershell
   npm install
   ```

3. **Configure Firebase**:

   - Create a Firebase project at https://console.firebase.google.com/
   - Enable **Authentication** (Email/Password)
   - Enable **Firestore Database**
   - Enable **Storage**
   - Copy your Firebase credentials to `.env` file:

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. **Start the development server**:

   ```powershell
   npx expo start
   ```

5. **Open on your phone**:
   - Scan the QR code with **Expo Go** app
   - Wait for JavaScript bundle to load
   - App will open automatically

---

## 📱 App Screens

### 1️⃣ Welcome Screen

- Beautiful green gradient design
- App introduction and features
- "Get Started" button → Signup
- "Login" button → Login

### 2️⃣ Authentication

**Signup Screen:**

- Name, Email, Password, Confirm Password
- Input validation and error handling
- Firebase user registration
- Navigate to Home on success

**Login Screen:**

- Email and Password inputs
- "Forgot Password?" link
- Firebase authentication
- Navigate to Home on success

### 3️⃣ Main App Features

**Home Screen:**

- Welcome message and dashboard
- 3 feature cards (Upload, Chatbot, Settings)
- Firebase connection status
- List of 12 supported breeds

**Upload Screen:**

- Camera capture button
- Gallery picker button
- Image preview
- Upload progress indicators
- Mock breed detection → Navigate to Result

**Result Screen:**

- Detected breed name (e.g., "Gir")
- Confidence score badge (95%)
- 6 key characteristics
- 8 care tips
- Action buttons:
  - Ask AI About This Breed
  - Analyze Another Image
  - Back to Home

**Chatbot Screen:**

- AI-powered Q&A interface
- Quick question buttons (4 presets)
- User messages (blue) vs Bot messages (green)
- Typing indicator
- Auto-scroll chat history

**Settings Screen:**

- User profile display
- Language selection (5 languages)
- Notification toggle
- Dark mode switch (coming soon)
- About section (version, help, privacy)
- Logout button with confirmation

---

## 🛠️ Technology Stack

### Frontend

- **React Native**: 0.81.5
- **React**: 19.1.0
- **TypeScript**: 5.9.3
- **Expo SDK**: 54.0.24
- **Expo Router**: 6.0.15

### Libraries

- `expo-linear-gradient` - Gradient backgrounds
- `expo-image-picker` - Image selection
- `expo-camera` - Camera access
- `@react-navigation/native` - Navigation

### Backend

- **Firebase Authentication** - User management
- **Firebase Firestore** - NoSQL database
- **Firebase Storage** - Cloud storage for images
- **Firebase Analytics** - Usage tracking

### AI/ML (Ready for Integration)

- **Google Gemini API** - Chatbot responses (currently mock)
- **TensorFlow Lite** - Breed detection model (currently mock)

---

## 📂 Project Structure

```
cattle-breed-app/
├── app/                          # Expo Router screens
│   ├── index.tsx                 # Welcome screen
│   ├── login.tsx                 # Login screen
│   ├── signup.tsx                # Signup screen
│   ├── upload.tsx                # Upload screen
│   ├── chatbot.tsx               # Chatbot screen
│   ├── result.tsx                # Result screen
│   ├── settings.tsx              # Settings screen
│   ├── _layout.tsx               # Root layout
│   └── (tabs)/
│       └── index.tsx             # Home screen
│
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx       # Global auth state
│   ├── services/
│   │   ├── firebase.tsx          # Firebase SDK
│   │   ├── gemini.tsx            # Gemini AI (ready)
│   │   └── tflite.tsx            # TFLite (ready)
│   ├── models/
│   │   └── types.ts              # TypeScript types
│   ├── utils/
│   │   └── helpers.ts            # Utilities
│   └── i18n/
│       └── translations.ts       # Translations (ready)
│
├── .env                          # Firebase credentials
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── TESTING_GUIDE.md              # Testing instructions
├── ARCHITECTURE.md               # Architecture docs
└── README.md                     # This file
```

---

## 🧪 Testing

### Manual Testing

Follow the comprehensive testing guide in [`TESTING_GUIDE.md`](./TESTING_GUIDE.md):

- ✅ Authentication flow (Welcome → Signup → Login)
- ✅ Image upload (Camera + Gallery)
- ✅ Breed detection results
- ✅ Chatbot interactions
- ✅ Settings and logout

### TypeScript Validation

```powershell
npx tsc --noEmit
```

**Current Status**: ✅ Zero TypeScript errors

### Firebase Verification

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Check **Authentication** → Users
3. Check **Firestore Database** → Collections
4. Check **Storage** → Uploaded images

---

## 🔐 Security

### Current Implementation

- ✅ Email/Password authentication with Firebase
- ✅ Input validation (email format, password length, etc.)
- ✅ Environment variables for credentials
- ✅ Protected routes (authentication required)

### Firebase Security Rules (To Implement)

**Firestore Rules:**

```javascript
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
```

**Storage Rules:**

```javascript
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

## 🚧 Current Implementation Status

| Feature          | Status      | Notes                           |
| ---------------- | ----------- | ------------------------------- |
| Authentication   | ✅ Complete | Firebase Auth working           |
| Welcome Screen   | ✅ Complete | Gradient design                 |
| Login/Signup     | ✅ Complete | Full validation                 |
| Home Screen      | ✅ Complete | Dashboard UI                    |
| Upload Screen    | ✅ Complete | Camera + Gallery                |
| Result Screen    | ✅ Complete | Mock breed data                 |
| Chatbot          | ✅ Complete | Mock AI responses               |
| Settings         | ✅ Complete | Profile + preferences           |
| Navigation       | ✅ Complete | All routes configured           |
| TypeScript       | ✅ Complete | Zero errors                     |
| **Gemini AI**    | 🔄 Pending  | Service ready, needs API key    |
| **TFLite Model** | 🔄 Pending  | Service ready, needs model file |
| **Translations** | 🔄 Pending  | 5 languages UI ready            |

---

## 🎯 Supported Cattle Breeds (12)

1. **Gir** - Gujarat origin, excellent milk yield
2. **Sahiwal** - Punjab origin, heat tolerant
3. **Red Sindhi** - Sindh origin, hardy breed
4. **Tharparkar** - Rajasthan origin, drought resistant
5. **Rathi** - Rajasthan origin, dual purpose
6. **Kankrej** - Gujarat origin, strong draught
7. **Ongole** - Andhra Pradesh origin, large size
8. **Hariana** - Haryana origin, good milker
9. **Kangayam** - Tamil Nadu origin, draught breed
10. **Hallikar** - Karnataka origin, agricultural work
11. **Khillari** - Maharashtra origin, fast moving
12. **Deoni** - Maharashtra origin, dual purpose

---

## 🌟 Future Enhancements

### Phase 1 (Immediate)

- [ ] Integrate real Gemini AI API for chatbot
- [ ] Integrate TFLite model for breed detection
- [ ] Add internationalization (i18n) for 5 languages
- [ ] Implement Firebase security rules

### Phase 2 (Short-term)

- [ ] Add Google Sign-In authentication
- [ ] Add phone number authentication
- [ ] Implement image caching
- [ ] Add offline support with SQLite
- [ ] Push notifications for results

### Phase 3 (Long-term)

- [ ] Add more cattle breeds (20+ total)
- [ ] Cattle health diagnosis feature
- [ ] Vaccination reminder system
- [ ] Community forum for farmers
- [ ] Marketplace for cattle trading
- [ ] Veterinary doctor consultation

---

## 🐛 Troubleshooting

### Metro Bundler Issues

```powershell
npx expo start --clear
```

### Firebase Connection Issues

- Verify `.env` file exists
- Check Firebase credentials are correct
- Restart Metro bundler

### Camera/Gallery Not Working

- Grant permissions in phone settings
- Test on physical device (not simulator)

### TypeScript Errors

```powershell
npx tsc --noEmit
```

### Module Not Found Errors

```powershell
npm install
npx expo install --check
```

---

## 📄 Documentation

- **Architecture**: See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for system design details
- **Testing Guide**: See [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) for complete testing instructions
- **Firebase Setup**: See [Firebase Documentation](https://firebase.google.com/docs)
- **Expo Router**: See [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

---

## 👥 Team

**Smart India Hackathon 2025**

- Developed for cattle breed identification
- Built with ❤️ for farmers and cattle owners

---

## 📞 Support

For issues or questions:

1. Check [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) for common solutions
2. Review [`ARCHITECTURE.md`](./ARCHITECTURE.md) for technical details
3. Check Firebase Console for backend issues
4. Run `npx tsc --noEmit` to check TypeScript errors

---

## 📜 License

This project is developed for **Smart India Hackathon 2025**.

---

## 🎉 Acknowledgments

- **Expo Team** - For the amazing framework
- **Firebase Team** - For backend services
- **React Native Community** - For libraries and support
- **Smart India Hackathon** - For the opportunity

---

## 🚀 Ready to Test!

Your app is now **complete and ready** for the Smart India Hackathon 2025!

1. Start the app: `npx expo start`
2. Scan QR code with Expo Go
3. Test authentication flow
4. Upload cattle images
5. Use AI chatbot
6. Explore all features

**Good luck with your presentation! 🏆**
