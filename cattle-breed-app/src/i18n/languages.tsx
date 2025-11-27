// Internationalization (i18n) - Multi-language support
// Supports: English, Hindi, Gujarati, Marathi, Tamil

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
}

/**
 * Language translations
 * Add more languages as needed
 */
const translations: Translations = {
  en: {
    // Home Screen
    appName: 'Cattle Breed App',
    welcomeMessage: 'Identify cattle breeds instantly using AI',
    uploadPhoto: 'Upload Photo',
    uploadPhotoDesc: 'Take or upload cattle photo',
    chatAssistant: 'Chat Assistant',
    chatAssistantDesc: 'Ask questions about breeds',
    settings: 'Settings',
    settingsDesc: 'Language & preferences',
    howItWorks: 'How it works:',
    step1: 'Take a photo of the cattle',
    step2: 'AI analyzes the image',
    step3: 'Get breed information instantly',

    // Upload Screen
    uploadTitle: 'Upload Cattle Photo',
    uploadSubtitle: 'Take a clear photo or choose from gallery',
    takePhoto: 'Take Photo',
    chooseGallery: 'Choose from Gallery',
    analyzeBreed: 'Analyze Breed',
    analyzing: 'Analyzing...',
    noImageSelected: 'No image selected',
    
    // Tips
    tipsTitle: 'Tips for best results:',
    tip1: 'Use good lighting',
    tip2: 'Capture full body of cattle',
    tip3: 'Avoid blurry images',
    tip4: 'Take photo from side angle',

    // Result Screen
    detected: 'Detected',
    confidence: 'Confidence',
    characteristics: 'Characteristics',
    careTips: 'Care Tips',
    analyzeAnother: 'Analyze Another',
    saveResult: 'Save Result',
    askChatbot: 'Ask Chatbot',

    // Chatbot
    chatbotTitle: 'Cattle Care Assistant',
    chatbotSubtitle: 'Ask me anything!',
    typeMessage: 'Type your question...',
    typing: 'Typing...',

    // Settings
    language: 'Language',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    clearCache: 'Clear Cache',
    about: 'About App',
    privacyPolicy: 'Privacy Policy',
    rateUs: 'Rate Us',
    
    // Common
    comingSoon: 'Coming Soon',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    ok: 'OK',
  },

  hi: {
    // होम स्क्रीन
    appName: 'पशु नस्ल ऐप',
    welcomeMessage: 'AI का उपयोग करके तुरंत पशु नस्लों की पहचान करें',
    uploadPhoto: 'फोटो अपलोड करें',
    uploadPhotoDesc: 'पशु की फोटो लें या अपलोड करें',
    chatAssistant: 'चैट सहायक',
    chatAssistantDesc: 'नस्लों के बारे में प्रश्न पूछें',
    settings: 'सेटिंग्स',
    settingsDesc: 'भाषा और प्राथमिकताएं',
    howItWorks: 'यह कैसे काम करता है:',
    step1: 'पशु की फोटो लें',
    step2: 'AI छवि का विश्लेषण करता है',
    step3: 'तुरंत नस्ल की जानकारी प्राप्त करें',

    // अपलोड स्क्रीन
    uploadTitle: 'पशु फोटो अपलोड करें',
    uploadSubtitle: 'स्पष्ट फोटो लें या गैलरी से चुनें',
    takePhoto: 'फोटो लें',
    chooseGallery: 'गैलरी से चुनें',
    analyzeBreed: 'नस्ल का विश्लेषण करें',
    analyzing: 'विश्लेषण हो रहा है...',
    noImageSelected: 'कोई छवि नहीं चुनी गई',

    // टिप्स
    tipsTitle: 'सर्वोत्तम परिणामों के लिए टिप्स:',
    tip1: 'अच्छी रोशनी का उपयोग करें',
    tip2: 'पशु का पूरा शरीर कैप्चर करें',
    tip3: 'धुंधली छवियों से बचें',
    tip4: 'साइड एंगल से फोटो लें',

    // रिजल्ट स्क्रीन
    detected: 'पहचाना गया',
    confidence: 'विश्वास',
    characteristics: 'विशेषताएं',
    careTips: 'देखभाल युक्तियाँ',
    analyzeAnother: 'दूसरा विश्लेषण करें',
    saveResult: 'परिणाम सहेजें',
    askChatbot: 'चैटबॉट से पूछें',

    // चैटबॉट
    chatbotTitle: 'पशु देखभाल सहायक',
    chatbotSubtitle: 'मुझसे कुछ भी पूछें!',
    typeMessage: 'अपना प्रश्न टाइप करें...',
    typing: 'टाइप कर रहे हैं...',

    // सेटिंग्स
    language: 'भाषा',
    darkMode: 'डार्क मोड',
    notifications: 'सूचनाएं',
    clearCache: 'कैश साफ करें',
    about: 'ऐप के बारे में',
    privacyPolicy: 'गोपनीयता नीति',
    rateUs: 'हमें रेट करें',

    // सामान्य
    comingSoon: 'जल्द आ रहा है',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    ok: 'ठीक है',
  },

  gu: {
    // હોમ સ્ક્રીન
    appName: 'પશુ જાતિ એપ',
    welcomeMessage: 'AI નો ઉપયોગ કરીને તરત પશુ જાતિઓને ઓળખો',
    uploadPhoto: 'ફોટો અપલોડ કરો',
    uploadPhotoDesc: 'પશુનો ફોટો લો અથવા અપલોડ કરો',
    chatAssistant: 'ચેટ સહાયક',
    chatAssistantDesc: 'જાતિઓ વિશે પ્રશ્નો પૂછો',
    settings: 'સેટિંગ્સ',
    settingsDesc: 'ભાષા અને પસંદગીઓ',
    howItWorks: 'તે કેવી રીતે કામ કરે છે:',
    step1: 'પશુનો ફોટો લો',
    step2: 'AI છબીનું વિશ્લેષણ કરે છે',
    step3: 'તરત જાતિની માહિતી મેળવો',

    // Common words
    takePhoto: 'ફોટો લો',
    analyzeBreed: 'જાતિનું વિશ્લેષણ કરો',
    comingSoon: 'ટૂંક સમયમાં આવી રહ્યું છે',
    success: 'સફળતા',
    cancel: 'રદ કરો',
  },

  mr: {
    // होम स्क्रीन
    appName: 'गुरे जाती अॅप',
    welcomeMessage: 'AI वापरून त्वरित गुरे जाती ओळखा',
    uploadPhoto: 'फोटो अपलोड करा',
    uploadPhotoDesc: 'गुराचा फोटो घ्या किंवा अपलोड करा',
    chatAssistant: 'चॅट सहाय्यक',
    chatAssistantDesc: 'जातींबद्दल प्रश्न विचारा',
    settings: 'सेटिंग्ज',
    howItWorks: 'हे कसे कार्य करते:',
    
    // Common
    takePhoto: 'फोटो घ्या',
    analyzeBreed: 'जातीचे विश्लेषण करा',
    success: 'यश',
    cancel: 'रद्द करा',
  },

  ta: {
    // முகப்பு திரை
    appName: 'கால்நடை இன பயன்பாடு',
    welcomeMessage: 'AI பயன்படுத்தி உடனடியாக கால்நடை இனங்களை அடையாளம்',
    uploadPhoto: 'புகைப்படம் பதிவேற்று',
    uploadPhotoDesc: 'கால்நடையின் புகைப்படம் எடு அல்லது பதிவேற்று',
    chatAssistant: 'அரட்டை உதவியாளர்',
    settings: 'அமைப்புகள்',
    howItWorks: 'இது எப்படி வேலை செய்கிறது:',
    
    // Common
    takePhoto: 'புகைப்படம் எடு',
    analyzeBreed: 'இனத்தை பகுப்பாய்வு செய்',
    success: 'வெற்றி',
    cancel: 'ரத்து செய்',
  },
};

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {string} language - Language code (en, hi, gu, etc.)
 * @returns {string} - Translated text
 */
export const t = (key: string, language: string = 'en'): string => {
  const lang = translations[language] || translations['en'];
  return lang[key] || translations['en'][key] || key;
};

/**
 * Get all translations for a language
 * @param {string} language - Language code
 * @returns {Object} - All translations for that language
 */
export const getLanguageTranslations = (language: string): { [key: string]: string } => {
  return translations[language] || translations['en'];
};

/**
 * Available languages
 */
export const AVAILABLE_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

/**
 * Check if language is supported
 */
export const isLanguageSupported = (languageCode: string): boolean => {
  return AVAILABLE_LANGUAGES.some(lang => lang.code === languageCode);
};

// Export translations object for direct access
export { translations };

export default {
  t,
  getLanguageTranslations,
  AVAILABLE_LANGUAGES,
  isLanguageSupported,
  translations,
};
