# 🚀 i18n Quick Reference - Cheat Sheet

## ⚡ Quick Start (3 Steps)

### 1. Import the Hook

```tsx
import { useLanguage } from "@/src/contexts/LanguageContext";
```

### 2. Use in Component

```tsx
const { t } = useLanguage();
```

### 3. Replace Text

```tsx
// Before:
<Text>Welcome</Text>

// After:
<Text>{t('welcome.title')}</Text>
```

---

## 📋 Most Common Translation Keys

```tsx
// Buttons & Actions
t("common.back"); // Back
t("common.next"); // Next
t("common.save"); // Save
t("common.cancel"); // Cancel
t("common.loading"); // Loading...

// Welcome Screen
t("welcome.title"); // Smart Cattle Recognition
t("welcome.subtitle"); // AI-powered breed identification...
t("welcome.getStarted"); // Get Started
t("welcome.login"); // Sign In

// Authentication
t("auth.email"); // Email
t("auth.password"); // Password
t("auth.login"); // Sign In
t("auth.signup"); // Create Account

// Home Screen
t("home.greeting"); // Hello
t("home.identifyBreed"); // Identify Breed
t("home.aiAssistant"); // AI Assistant
t("home.settings"); // Settings

// Upload
t("upload.takePhoto"); // Take Photo
t("upload.chooseGallery"); // Choose from Gallery
t("upload.analyzing"); // Analyzing...

// Chatbot
t("chatbot.title"); // AI Cattle Assistant
t("chatbot.placeholder"); // Ask about cattle care...

// Settings
t("settings.title"); // Settings
t("settings.language"); // Language
t("settings.logout"); // Logout
```

---

## 🎯 Copy-Paste Templates

### Basic Screen Template

```tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function MyScreen() {
  const { t } = useLanguage();

  return (
    <View>
      <Text>{t("section.key")}</Text>
      <TouchableOpacity>
        <Text>{t("common.next")}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Screen with Language Switcher

```tsx
import React from "react";
import { View } from "react-native";
import { LanguageSelector } from "@/src/components/LanguageSelector";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function SettingsScreen() {
  const { t, language } = useLanguage();

  return (
    <View>
      <Text>{t("settings.language")}</Text>
      <Text>Current: {language}</Text>
      <LanguageSelector />
    </View>
  );
}
```

### Programmatic Language Change

```tsx
const { changeLanguage } = useLanguage();

// Change to Hindi
await changeLanguage("hi");

// Change to Gujarati
await changeLanguage("gu");
```

---

## 🌍 Language Codes

| Code | Language  | Native  |
| ---- | --------- | ------- |
| `en` | English   | English |
| `hi` | Hindi     | हिन्दी  |
| `gu` | Gujarati  | ગુજરાતી |
| `ta` | Tamil     | தமிழ்   |
| `te` | Telugu    | తెలుగు  |
| `mr` | Marathi   | मराठी   |
| `bn` | Bengali   | বাংলা   |
| `kn` | Kannada   | ಕನ್ನಡ   |
| `ml` | Malayalam | മലയാളം  |
| `pa` | Punjabi   | ਪੰਜਾਬੀ  |
| `ur` | Urdu      | اردو    |
| `or` | Odia      | ଓଡ଼ିଆ   |

...and 11 more!

---

## 🔥 Pro Tips

1. **Always use translation keys** instead of hardcoded text
2. **Group related translations** using dot notation (e.g., `home.title`, `home.subtitle`)
3. **Use LanguageSelector** component in Settings for easy language switching
4. **Fallback to English** is automatic if translation is missing
5. **Test in multiple languages** before deployment

---

## 📱 Test Your Translations

```bash
# Start the app
npm start

# Then:
# 1. Open Settings screen
# 2. Use LanguageSelector to switch language
# 3. Navigate through all screens
# 4. Verify all text changes language
```

---

## ✅ Translation Checklist

- [ ] Import `useLanguage` hook
- [ ] Get `t` function: `const { t } = useLanguage();`
- [ ] Replace all hardcoded text with `t('key')`
- [ ] Add LanguageSelector to Settings
- [ ] Test in at least 3 languages (English, Hindi, one regional)
- [ ] Check if all buttons and labels are translated

---

## 🎯 Your Next Action

**Update these screens with i18n:**

1. ✅ `app/index.tsx` - Welcome Screen (Done!)
2. 🔲 `app/login.tsx` - Login Screen
3. 🔲 `app/signup.tsx` - Signup Screen
4. 🔲 `app/(tabs)/index.tsx` - Home Screen
5. 🔲 `app/upload.tsx` - Upload Screen
6. 🔲 `app/chatbot.tsx` - Chatbot Screen
7. 🔲 `app/settings.tsx` - Settings Screen
8. 🔲 `app/result.tsx` - Result Screen

**For detailed guide, see:** `I18N_INTEGRATION_GUIDE.md`

---

**Made with ❤️ for SIH 2025**
