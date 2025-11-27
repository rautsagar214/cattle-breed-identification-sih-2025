# Dynamic Translation Guide

This guide explains how dynamic content (AI responses and backend data) is translated in the cattle breed app to support 23 Indian languages.

## Overview

The app handles two types of dynamic content:

1. **AI-Generated Content**: Chatbot responses from Gemini API
2. **Backend Data**: Breed characteristics, care tips from Firebase

## Strategy: Language-Aware AI Prompts

Instead of translating AI responses after generation (slow, expensive), we instruct the AI to respond **directly in the user's language**.

### How It Works

#### 1. Chatbot Responses

**Implementation in `src/services/gemini.tsx`:**

```typescript
const getSystemPrompt = (languageCode: string = "en"): string => {
  const languageName = LANGUAGE_NAMES[languageCode] || "English";

  if (languageCode === "en") {
    return `You are an expert cattle farming assistant specialized in Indian cattle breeds...`;
  }

  return `You are an expert cattle farming assistant specialized in Indian cattle breeds.
IMPORTANT: The user speaks ${languageName}. You MUST respond in ${languageName} language.
Write your ENTIRE response in ${languageName}, not English...`;
};

export const sendMessageToGemini = async (
  userMessage: string,
  chatHistory: ChatMessage[] = [],
  languageCode: string = "en"
): Promise<string> => {
  // System prompt instructs AI to respond in user's language
  let contextMessage = getSystemPrompt(languageCode) + "\n\n";
  // ... rest of implementation
};
```

**Usage in `app/chatbot.tsx`:**

```typescript
const { t, language } = useLanguage();

// Pass language code to API
const responseText = await sendMessageToGemini(
  questionText,
  chatHistory,
  language
);
```

**Result**: AI automatically responds in Hindi if user selected Hindi, Gujarati if user selected Gujarati, etc.

#### 2. Breed Information Queries

**Implementation in `src/services/gemini.tsx`:**

```typescript
export const getBreedInfo = async (
  breedName: string,
  languageCode: string = "en"
): Promise<string> => {
  const languageName = LANGUAGE_NAMES[languageCode] || "English";
  let prompt = `Give me detailed information about ${breedName} cattle breed...`;

  if (languageCode !== "en") {
    prompt += `\n\nIMPORTANT: Write your entire response in ${languageName} language.`;
  }

  const response = await sendMessageToGemini(prompt, [], languageCode);
  return response;
};
```

**Usage Example:**

```typescript
// In result screen or breed detail screen
const { language } = useLanguage();
const breedInfo = await getBreedInfo("Gir", language); // Returns info in user's language
```

#### 3. Care Advice

```typescript
export const getCareAdvice = async (
  question: string,
  languageCode: string = "en"
): Promise<string> => {
  const languageName = LANGUAGE_NAMES[languageCode] || "English";
  let prompt = `As a cattle farming expert, answer this question: ${question}...`;

  if (languageCode !== "en") {
    prompt += `\n\nIMPORTANT: Write your entire response in ${languageName} language.`;
  }

  const response = await sendMessageToGemini(prompt, [], languageCode);
  return response;
};
```

## Backend Data Translation

For breed data stored in Firebase (characteristics, care tips):

### Option 1: Store Pre-Translated Data (Recommended)

Store translations in Firebase for each language:

```json
{
  "breeds": {
    "gir": {
      "en": {
        "name": "Gir",
        "characteristics": ["Lyre-shaped horns", "White coat", ...],
        "careTips": ["Provide clean water", ...]
      },
      "hi": {
        "name": "गिर",
        "characteristics": ["वीणा के आकार के सींग", "सफेद रंग", ...],
        "careTips": ["स्वच्छ पानी प्रदान करें", ...]
      },
      "gu": {
        "name": "ગીર",
        "characteristics": ["વીણા આકારના શિંગડા", "સફેદ રંગ", ...],
        "careTips": ["સ્વચ્છ પાણી આપો", ...]
      }
    }
  }
}
```

**Implementation:**

```typescript
// In upload screen or result screen
const { language } = useLanguage();

const getBreedData = async (breedName: string, lang: string) => {
  const docRef = doc(db, "breeds", breedName);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Return language-specific data, fallback to English
    return data[lang] || data["en"];
  }
  return null;
};

const breedData = await getBreedData("gir", language);
```

### Option 2: On-Demand Translation (Fallback)

If pre-translated data not available, use AI translation:

```typescript
export const translateText = async (
  text: string,
  targetLanguageCode: string
): Promise<string> => {
  const targetLanguageName = LANGUAGE_NAMES[targetLanguageCode] || "English";
  const prompt = `Translate the following text to ${targetLanguageName}: "${text}"\n\nProvide only the translation, nothing else.`;

  const response = await sendMessageToGemini(prompt, [], "en");
  return response.trim();
};
```

**Usage:**

```typescript
// If breed data only available in English
const englishDescription = breedData.description;
const { language } = useLanguage();

if (language !== "en") {
  const translatedDescription = await translateText(
    englishDescription,
    language
  );
  // Use translatedDescription
}
```

### Option 3: Hybrid Approach (Best)

Combine pre-translated common data with AI for dynamic content:

```typescript
const getBreedDetails = async (breedName: string, languageCode: string) => {
  // Try to fetch pre-translated data first
  const preTranslated = await getBreedData(breedName, languageCode);

  if (preTranslated) {
    return preTranslated; // Use stored translation
  }

  // Fallback: Generate using AI in user's language
  return await getBreedInfo(breedName, languageCode);
};
```

## Supported Languages

All 23 languages are supported through `LANGUAGE_NAMES` mapping:

```typescript
const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'hi': 'Hindi (हिन्दी)',
  'gu': 'Gujarati (ગુજરાતી)',
  'bn': 'Bengali (বাংলা)',
  'te': 'Telugu (తెలుగు)',
  'mr': 'Marathi (मराठी)',
  'ta': 'Tamil (தமிழ்)',
  'ur': 'Urdu (اردو)',
  'kn': 'Kannada (ಕನ್ನಡ)',
  'ml': 'Malayalam (മലയാളം)',
  'or': 'Odia (ଓଡ଼ିଆ)',
  'pa': 'Punjabi (ਪੰਜਾਬੀ)',
  'as': 'Assamese (অসমীয়া)',
  'mai': 'Maithili (मैथिली)',
  'sa': 'Sanskrit (संस्कृतम्)',
  'ks': 'Kashmiri (کٲشُر)',
  'ne': 'Nepali (नेपाली)',
  'sd': 'Sindhi (سنڌي)',
  'kok': 'Konkani (कोंकणी)',
  'doi': 'Dogri (डोगरी)',
  'mni': 'Manipuri (মৈতৈলোন্)',
  'sat': 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)',
  'bo': 'Bodo (बर'/बड़ो)'
};
```

## Testing Multilingual Responses

### Test Chatbot in Different Languages

1. Open app, go to Settings
2. Change language to Hindi (हिन्दी)
3. Go to Chatbot
4. Ask: "गिर गाय के बारे में बताएं" (Tell about Gir cattle)
5. Verify: AI responds in Hindi

**Expected Response:**

```
गिर गाय भारत की सबसे प्रसिद्ध देसी नस्लों में से एक है...
(Gir cattle is one of India's most famous indigenous breeds...)
```

### Test Gujarati

1. Change language to Gujarati (ગુજરાતી)
2. Ask: "ગાયનું ખોરાક શું આપવું?" (What feed to give cattle?)
3. Verify: Response in Gujarati

### Test Breed Information

```typescript
// In upload screen after breed detection
const { language } = useLanguage();

// Get breed details in user's language
const breedInfo = await getBreedInfo(detectedBreed, language);
console.log(breedInfo); // Should be in user's language
```

## Best Practices

### 1. Always Pass Language Parameter

```typescript
// ✅ Correct
const response = await sendMessageToGemini(message, history, language);
const breedInfo = await getBreedInfo(breedName, language);

// ❌ Wrong - will default to English
const response = await sendMessageToGemini(message, history);
```

### 2. Use Language Context Hook

```typescript
import { useLanguage } from "../src/contexts/LanguageContext";

const { t, language } = useLanguage();
// 't' for static translations
// 'language' for API calls
```

### 3. Handle Loading States

AI responses take time, especially for non-English languages:

```typescript
const [isLoading, setIsLoading] = useState(false);

const fetchBreedInfo = async () => {
  setIsLoading(true);
  try {
    const info = await getBreedInfo(breedName, language);
    // Use info
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);
  }
};
```

### 4. Cache Translations

For frequently accessed data:

```typescript
const translationCache = new Map();

const getCachedTranslation = async (
  key: string,
  text: string,
  lang: string
) => {
  const cacheKey = `${key}_${lang}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const translated = await translateText(text, lang);
  translationCache.set(cacheKey, translated);
  return translated;
};
```

### 5. Fallback to English

Always provide English fallback:

```typescript
const breedData =
  (await getBreedData(breedName, language)) ||
  (await getBreedData(breedName, "en"));
```

## Error Handling

### Handle API Quota Limits

```typescript
try {
  const response = await sendMessageToGemini(message, history, language);
  return response;
} catch (error) {
  if (error.message.includes("quota")) {
    // Fallback to English to save quota
    return await sendMessageToGemini(message, history, "en");
  }
  throw error;
}
```

### Handle Unsupported Languages

```typescript
const getSupportedLanguage = (lang: string): string => {
  return LANGUAGE_NAMES[lang] ? lang : "en";
};

const safeLang = getSupportedLanguage(language);
const response = await sendMessageToGemini(message, history, safeLang);
```

## Performance Optimization

### 1. Batch Translations

Translate multiple items at once:

```typescript
const translateBatch = async (texts: string[], targetLang: string) => {
  const prompt = `Translate these cattle-related terms to ${
    LANGUAGE_NAMES[targetLang]
  }:
${texts.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Provide translations in the same numbered format.`;

  const response = await sendMessageToGemini(prompt, [], "en");
  // Parse numbered response
  return response
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim());
};
```

### 2. Pre-warm AI Context

For faster responses, send system prompt in advance:

```typescript
// When user enters chatbot screen
useEffect(() => {
  // Pre-initialize AI with language context
  sendMessageToGemini("", [], language);
}, [language]);
```

## Debugging

Enable detailed logging:

```typescript
// In gemini.tsx
console.log("📤 Sending to Gemini (Language:", languageCode, "):", userMessage);
console.log(
  "🌐 System prompt:",
  getSystemPrompt(languageCode).substring(0, 100) + "..."
);
console.log("📥 Received from Gemini:", response.substring(0, 100) + "...");
```

Check language switching:

```typescript
// In chatbot.tsx
useEffect(() => {
  console.log("Current language:", language);
}, [language]);
```

## Implementation Checklist

- [x] `sendMessageToGemini()` accepts languageCode parameter
- [x] `getSystemPrompt()` generates language-specific prompts
- [x] `getBreedInfo()` supports language parameter
- [x] `getCareAdvice()` supports language parameter
- [x] `translateText()` utility for fallback translation
- [x] Chatbot passes language to API calls
- [ ] Upload screen uses `getBreedInfo()` with language
- [ ] Result screen displays translated breed data
- [ ] Firebase stores pre-translated breed data (optional)
- [ ] Error handling for unsupported languages
- [ ] Translation caching implemented
- [ ] Performance testing across all 23 languages

## Next Steps

1. **Test chatbot in multiple languages** - Verify AI responds correctly
2. **Update upload/result screens** - Pass language to breed detection
3. **Add breed data to Firebase** - Store translations for common breeds
4. **Performance testing** - Ensure response times are acceptable
5. **User feedback** - Gather feedback from regional language users

## Example: Complete Flow

```typescript
// User opens app, selects Hindi in Settings
const { language } = useLanguage(); // 'hi'

// User uploads cattle photo
const detectedBreed = await detectBreed(imageUri); // 'gir'

// Get breed info in Hindi
const breedInfo = await getBreedInfo(detectedBreed, language);
// Returns: "गिर गाय गुजरात की प्रमुख देसी नस्ल है..."

// User asks in chatbot: "दूध उत्पादन कैसे बढ़ाएं?"
const response = await sendMessageToGemini(question, history, language);
// Returns: "दूध उत्पादन बढ़ाने के लिए: 1. संतुलित आहार दें..."

// All dynamic content in Hindi! 🎉
```

## Summary

- ✅ **Chatbot**: AI responds directly in user's language
- ✅ **Breed Info**: Generated or fetched in user's language
- ✅ **Care Advice**: Provided in user's language
- ✅ **23 Languages**: All Indian languages supported
- ✅ **Performance**: Efficient (no post-translation needed)
- ✅ **Scalable**: Works for any new AI-generated content

The key insight: **Let AI do the translation during generation, not after!** This is faster, more natural, and leverages Gemini's multilingual capabilities.
