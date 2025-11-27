# Multilingual Support - Quick Implementation Guide

## ✅ Setup Complete!

The app now supports **English, Hindi, and Gujarati** with easy setup.

## 📦 What's Installed

- `i18next` - Translation framework
- `react-i18next` - React bindings
- `expo-localization` - Auto-detect device language

## 🎯 How to Use in Any Screen

### 1. Import the hook:

```tsx
import { useLanguage } from "../src/contexts/LanguageContext";
```

### 2. Use in your component:

```tsx
export default function MyScreen() {
  const { t } = useLanguage();

  return (
    <View>
      <Text>{t("welcome.title")}</Text>
      <Text>{t("auth.login")}</Text>
    </View>
  );
}
```

## 📝 Quick Examples

### Welcome Screen Example:

```tsx
import { useLanguage } from "../src/contexts/LanguageContext";

export default function WelcomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <View>
      <Text>{t("welcome.title")}</Text>
      <Text>{t("welcome.subtitle")}</Text>
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text>{t("welcome.login")}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Home Screen Example:

```tsx
import { useLanguage } from "../src/contexts/LanguageContext";

export default function HomeScreen() {
  const { t } = useLanguage();

  return (
    <View>
      <Text>{t("home.greeting")} 👋</Text>
      <Text>{t("home.tagline")}</Text>
      <Text>{t("home.identifyBreed")}</Text>
    </View>
  );
}
```

## 🎨 Language Selector Component

Already created! Just import and use:

```tsx
import { LanguageSelector } from "../src/components/LanguageSelector";

export default function SettingsScreen() {
  return (
    <View>
      <LanguageSelector />
    </View>
  );
}
```

## 📚 Available Translation Keys

### Common Keys:

- `welcome.title` - "Smart Cattle Recognition"
- `welcome.subtitle` - App description
- `auth.login` - "Sign In"
- `auth.signup` - "Create Account"
- `home.greeting` - "Hello"
- `home.identifyBreed` - "Identify Breed"
- `chatbot.title` - "AI Cattle Assistant"
- `settings.language` - "Language"
- `common.back` - "Back"
- `common.next` - "Next"
- `common.loading` - "Loading..."

See full list in: `src/i18n/locales/en.json`

## 🌍 Supported Languages

1. **English (en)** - Default
2. **Hindi (hi)** - हिन्दी
3. **Gujarati (gu)** - ગુજરાતી

## ➕ Adding New Language

1. Create new file: `src/i18n/locales/mr.json` (for Marathi)
2. Copy `en.json` and translate all values
3. Update `src/i18n/index.tsx`:

```tsx
import mr from "./locales/mr.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  gu: { translation: gu },
  mr: { translation: mr }, // Add this
};
```

4. Update `LanguageSelector.tsx` to add option

## ⚡ Auto-Detection

The app automatically detects the device's language on first launch!

## 💾 Language Persistence

User's language choice is saved and restored on app restart using AsyncStorage.

## 🔄 Changing Language Programmatically

```tsx
const { changeLanguage } = useLanguage();

// Change to Hindi
await changeLanguage("hi");

// Change to Gujarati
await changeLanguage("gu");
```

## 🎯 Best Practices

1. **Always use translation keys**, never hardcode text
2. **Keep keys organized** by screen/feature
3. **Test all languages** before releasing
4. **Use placeholders** for dynamic content:

```tsx
{
  t("home.syncDesc", { count: 5 });
}
```

## 📱 Where to Add Language Selector

Recommended places:

- ✅ Settings Screen (primary location)
- Welcome Screen (first-time setup)
- Profile/Account Screen

## 🚀 Quick Migration Guide

To convert existing hardcoded text:

**Before:**

```tsx
<Text>Welcome Back</Text>
```

**After:**

```tsx
const { t } = useLanguage();
<Text>{t("auth.welcomeBack")}</Text>;
```

## ✨ Features

- ✅ 3 languages (English, Hindi, Gujarati)
- ✅ Auto-detect device language
- ✅ Persist user preference
- ✅ Beautiful language selector UI
- ✅ Easy to add more languages
- ✅ Works offline
- ✅ Zero performance impact

## 🎓 Example: Full Screen with Translations

```tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLanguage } from "../src/contexts/LanguageContext";

export default function LoginScreen() {
  const { t } = useLanguage();

  return (
    <View>
      <Text>{t("auth.welcomeBack")}</Text>
      <Text>{t("auth.signInSubtitle")}</Text>

      <TextInput placeholder={t("auth.email")} />
      <TextInput placeholder={t("auth.password")} />

      <TouchableOpacity>
        <Text>{t("auth.login")}</Text>
      </TouchableOpacity>

      <Text>{t("auth.noAccount")}</Text>
      <TouchableOpacity>
        <Text>{t("auth.signup")}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 🎯 Next Steps

1. Add `useLanguage()` to each screen
2. Replace hardcoded text with `t('key')`
3. Add LanguageSelector to Settings screen
4. Test all 3 languages
5. Add more languages as needed

**That's it!** Your app now supports multiple languages! 🎉
