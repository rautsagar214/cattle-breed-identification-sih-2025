# 🌍 i18n (Internationalization) Integration Guide

## ✅ What's Already Set Up

Your cattle breed app now has a complete i18n system with:

- ✅ **23 Languages**: English + 22 Indian languages (Hindi, Gujarati, Tamil, Telugu, Marathi, etc.)
- ✅ **Auto-detection**: Detects device language automatically
- ✅ **Persistent storage**: Saves user's language preference
- ✅ **React Context**: Global language state management
- ✅ **Translation files**: JSON files for all languages in `src/i18n/locales/`

---

## 📁 File Structure

```
src/
├── i18n/
│   ├── index.tsx                    # i18n configuration
│   ├── languages.tsx                # Legacy translation helper (optional)
│   └── locales/
│       ├── en.json                  # English translations
│       ├── hi.json                  # Hindi translations
│       ├── gu.json                  # Gujarati translations
│       └── ... (20 more languages)
├── contexts/
│   └── LanguageContext.tsx          # Language provider & hook
└── components/
    └── LanguageSelector.tsx         # Language picker component
```

---

## 🚀 How to Use i18n in Your Components

### Step 1: Import the Hook

```tsx
import { useLanguage } from "@/src/contexts/LanguageContext";
```

### Step 2: Use the Translation Function

```tsx
export default function MyScreen() {
  const { t, language, changeLanguage } = useLanguage();

  return (
    <View>
      <Text>{t("welcome.title")}</Text>
      <Text>{t("home.greeting")}</Text>
      <Button title={t("common.next")} />
    </View>
  );
}
```

### Available Functions

| Function               | Description               | Example                |
| ---------------------- | ------------------------- | ---------------------- |
| `t(key)`               | Get translation for a key | `t('welcome.title')`   |
| `language`             | Current language code     | `'en'`, `'hi'`, `'gu'` |
| `changeLanguage(code)` | Change app language       | `changeLanguage('hi')` |

---

## 📝 Available Translation Keys

### Welcome Screen (`welcome.*`)

```tsx
t("welcome.title"); // "Smart Cattle Recognition"
t("welcome.subtitle"); // "AI-powered breed identification..."
t("welcome.badge"); // "SIH 2025"
t("welcome.getStarted"); // "Get Started"
t("welcome.login"); // "Sign In"
t("welcome.footer"); // "Made in India"

// Features
t("welcome.features.aiScan"); // "AI Scan"
t("welcome.features.aiScanDesc"); // "Instant breed detection"
t("welcome.features.expertAI"); // "Expert AI"
t("welcome.features.expertAIDesc"); // "24/7 cattle care assistant"
t("welcome.features.offline"); // "Offline Mode"
t("welcome.features.offlineDesc"); // "Works without internet"
t("welcome.features.multiLang"); // "Multi-Language"
t("welcome.features.multiLangDesc"); // "Hindi, Gujarati & more"
```

### Authentication (`auth.*`)

```tsx
t("auth.login"); // "Sign In"
t("auth.signup"); // "Create Account"
t("auth.email"); // "Email"
t("auth.password"); // "Password"
t("auth.confirmPassword"); // "Confirm Password"
t("auth.fullName"); // "Full Name"
t("auth.forgotPassword"); // "Forgot password?"
t("auth.noAccount"); // "New to CattleAI?"
t("auth.hasAccount"); // "Already have an account?"
t("auth.welcomeBack"); // "Welcome Back"
t("auth.signInSubtitle"); // "Sign in to continue..."
```

### Home Screen (`home.*`)

```tsx
t("home.greeting"); // "Hello"
t("home.tagline"); // "Let's identify your cattle"
t("home.online"); // "Online"
t("home.offline"); // "Offline"
t("home.identifyBreed"); // "Identify Breed"
t("home.identifyDesc"); // "Take or upload a photo"
t("home.aiAssistant"); // "AI Assistant"
t("home.aiAssistantDesc"); // "Ask questions"
t("home.settings"); // "Settings"
t("home.settingsDesc"); // "Manage account"
t("home.syncPending"); // "Pending Uploads"
t("home.popularBreeds"); // "Popular Indian Breeds"
```

### Upload Screen (`upload.*`)

```tsx
t("upload.title"); // "Identify Breed"
t("upload.takePhoto"); // "Take Photo"
t("upload.chooseGallery"); // "Choose from Gallery"
t("upload.analyzing"); // "Analyzing..."
t("upload.permissions"); // "Camera permission required"
t("upload.error"); // "Failed to process image"
```

### Chatbot (`chatbot.*`)

```tsx
t("chatbot.title"); // "AI Cattle Assistant"
t("chatbot.subtitle"); // "Ask me anything!"
t("chatbot.placeholder"); // "Ask about cattle care..."
t("chatbot.quickQuestions"); // "Quick Questions"
t("chatbot.thinking"); // "Thinking..."
t("chatbot.welcome"); // "Hello! I am your cattle care assistant..."
```

### Settings (`settings.*`)

```tsx
t("settings.title"); // "Settings"
t("settings.profile"); // "Profile"
t("settings.language"); // "Language"
t("settings.notifications"); // "Notifications"
t("settings.offline"); // "Offline Mode"
t("settings.about"); // "About"
t("settings.logout"); // "Logout"
t("settings.version"); // "Version"
```

### Cattle Breeds (`breeds.*`)

```tsx
t("breeds.gir"); // "Gir"
t("breeds.sahiwal"); // "Sahiwal"
t("breeds.redSindhi"); // "Red Sindhi"
t("breeds.rathi"); // "Rathi"
t("breeds.tharparkar"); // "Tharparkar"
t("breeds.kankrej"); // "Kankrej"
```

### Common Words (`common.*`)

```tsx
t("common.back"); // "Back"
t("common.next"); // "Next"
t("common.done"); // "Done"
t("common.cancel"); // "Cancel"
t("common.save"); // "Save"
t("common.delete"); // "Delete"
t("common.confirm"); // "Confirm"
t("common.yes"); // "Yes"
t("common.no"); // "No"
t("common.loading"); // "Loading..."
t("common.error"); // "Error"
t("common.success"); // "Success"
```

---

## 🎨 Complete Screen Examples

### Example 1: Welcome Screen (Already Updated)

```tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <View>
      <Text>{t("welcome.title")}</Text>
      <Text>{t("welcome.subtitle")}</Text>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text>{t("welcome.getStarted")}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text>{t("welcome.login")}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Example 2: Login Screen

```tsx
import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function LoginScreen() {
  const { t } = useLanguage();

  return (
    <View>
      <Text>{t("auth.welcomeBack")}</Text>
      <Text>{t("auth.signInSubtitle")}</Text>

      <TextInput placeholder={t("auth.email")} />
      <TextInput placeholder={t("auth.password")} secureTextEntry />

      <TouchableOpacity>
        <Text>{t("auth.login")}</Text>
      </TouchableOpacity>

      <Text>{t("auth.forgotPassword")}</Text>
      <Text>{t("auth.noAccount")}</Text>
    </View>
  );
}
```

### Example 3: Settings Screen with Language Selector

```tsx
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { LanguageSelector } from "@/src/components/LanguageSelector";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function SettingsScreen() {
  const { t, language } = useLanguage();

  return (
    <ScrollView>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        {t("settings.title")}
      </Text>

      <Text style={{ fontSize: 16, marginTop: 20 }}>
        {t("settings.language")}
      </Text>
      <Text style={{ fontSize: 12, color: "gray" }}>
        Current: {language.toUpperCase()}
      </Text>

      {/* Language selector with all 23 languages */}
      <LanguageSelector />
    </ScrollView>
  );
}
```

### Example 4: Home Screen

```tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <View>
      <Text>{t("home.greeting")}!</Text>
      <Text>{t("home.tagline")}</Text>

      <TouchableOpacity onPress={() => router.push("/upload")}>
        <Text>{t("home.identifyBreed")}</Text>
        <Text>{t("home.identifyDesc")}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/chatbot")}>
        <Text>{t("home.aiAssistant")}</Text>
        <Text>{t("home.aiAssistantDesc")}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/settings")}>
        <Text>{t("home.settings")}</Text>
        <Text>{t("home.settingsDesc")}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Example 5: Upload Screen

```tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLanguage } from "@/src/contexts/LanguageContext";
import * as ImagePicker from "expo-image-picker";

export default function UploadScreen() {
  const { t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    // ... handle result
  };

  return (
    <View>
      <Text>{t("upload.title")}</Text>

      <TouchableOpacity onPress={takePhoto}>
        <Text>{t("upload.takePhoto")}</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text>{t("upload.chooseGallery")}</Text>
      </TouchableOpacity>

      {analyzing && (
        <View>
          <ActivityIndicator />
          <Text>{t("upload.analyzing")}</Text>
        </View>
      )}
    </View>
  );
}
```

---

## 🔧 Advanced Usage

### 1. Get Current Language

```tsx
const { language } = useLanguage();
console.log(language); // 'en', 'hi', 'gu', etc.
```

### 2. Change Language Programmatically

```tsx
const { changeLanguage } = useLanguage();

// Change to Hindi
await changeLanguage("hi");

// Change to Gujarati
await changeLanguage("gu");
```

### 3. Dynamic Translation Keys

```tsx
const breedKey = "gir"; // from API
const translatedName = t(`breeds.${breedKey}`);
```

### 4. Conditional Rendering Based on Language

```tsx
const { language } = useLanguage();

return (
  <View>
    {language === "hi" && <Text>हिंदी विशेष सामग्री</Text>}
    {language === "en" && <Text>English-specific content</Text>}
  </View>
);
```

---

## 📝 Adding New Translations

### Step 1: Add to English file (`src/i18n/locales/en.json`)

```json
{
  "myNewSection": {
    "title": "My New Title",
    "description": "My description"
  }
}
```

### Step 2: Add to all other language files

Update `hi.json`, `gu.json`, `ta.json`, etc. with translations:

```json
{
  "myNewSection": {
    "title": "मेरा नया शीर्षक",
    "description": "मेरा विवरण"
  }
}
```

### Step 3: Use in components

```tsx
<Text>{t('myNewSection.title')}</Text>
<Text>{t('myNewSection.description')}</Text>
```

---

## 🌐 Supported Languages

Your app supports **23 languages**:

| Code  | Language  | Native Name | Region         |
| ----- | --------- | ----------- | -------------- |
| `en`  | English   | English     | International  |
| `hi`  | Hindi     | हिन्दी      | North India    |
| `gu`  | Gujarati  | ગુજરાતી     | Gujarat        |
| `bn`  | Bengali   | বাংলা       | West Bengal    |
| `te`  | Telugu    | తెలుగు      | Andhra Pradesh |
| `mr`  | Marathi   | मराठी       | Maharashtra    |
| `ta`  | Tamil     | தமிழ்       | Tamil Nadu     |
| `ur`  | Urdu      | اردو        | North India    |
| `kn`  | Kannada   | ಕನ್ನಡ       | Karnataka      |
| `ml`  | Malayalam | മലയാളം      | Kerala         |
| `or`  | Odia      | ଓଡ଼ିଆ       | Odisha         |
| `pa`  | Punjabi   | ਪੰਜਾਬੀ      | Punjab         |
| `as`  | Assamese  | অসমীয়া     | Assam          |
| `mai` | Maithili  | मैथिली      | Bihar          |
| `sa`  | Sanskrit  | संस्कृतम्   | Classical      |
| `ks`  | Kashmiri  | कॉशुर       | Kashmir        |
| `ne`  | Nepali    | नेपाली      | Sikkim         |
| `sd`  | Sindhi    | सिन्धी      | Western India  |
| `kok` | Konkani   | कोंकणी      | Goa            |
| `doi` | Dogri     | डोगरी       | J&K            |
| `mni` | Manipuri  | মৈতৈলোন্    | Manipur        |
| `sat` | Santali   | ᱥᱟᱱᱛᱟᱲᱤ     | Jharkhand      |
| `bo`  | Bodo      | बड़ो        | Assam          |

---

## ✅ Next Steps for Your Project

### **Priority 1: Update All Screens**

1. ✅ **Welcome Screen** - Already updated!
2. 🔲 **Login Screen** (`app/login.tsx`)
3. 🔲 **Signup Screen** (`app/signup.tsx`)
4. 🔲 **Home Screen** (`app/(tabs)/index.tsx`)
5. 🔲 **Upload Screen** (`app/upload.tsx`)
6. 🔲 **Chatbot Screen** (`app/chatbot.tsx`)
7. 🔲 **Settings Screen** (`app/settings.tsx`)
8. 🔲 **Result Screen** (`app/result.tsx`)

### **Priority 2: Test Language Switching**

1. Run the app: `npm start`
2. Navigate to Settings
3. Use the LanguageSelector component
4. Test all screens in different languages

### **Priority 3: Add Missing Translations**

Some screens might need additional translation keys. Add them to:

- `src/i18n/locales/en.json` (and all other language files)

---

## 🐛 Troubleshooting

### Issue: "t is not a function"

**Solution**: Make sure you're inside a component wrapped by `LanguageProvider` (already done in `app/_layout.tsx`)

### Issue: Translation shows key instead of text

**Solution**: Check if the key exists in `en.json`. If missing, add it.

### Issue: Language doesn't change

**Solution**: Make sure AsyncStorage is working. Clear app data and try again.

### Issue: Some translations are missing

**Solution**: Not all language files may have complete translations. You can:

1. Use Google Translate API to fill missing translations
2. Or fallback to English (already configured)

---

## 📚 Resources

- **i18next Documentation**: https://www.i18next.com/
- **React i18next**: https://react.i18next.com/
- **Expo Localization**: https://docs.expo.dev/versions/latest/sdk/localization/

---

## 🎉 You're All Set!

Your cattle breed app now supports **23 languages** out of the box! Just update your screens to use the `t()` function instead of hardcoded text.

**Happy Coding!** 🚀
