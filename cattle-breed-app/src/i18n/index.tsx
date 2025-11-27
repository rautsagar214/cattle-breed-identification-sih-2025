import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import 'intl-pluralrules';

// Import translations - All 23 Indian Languages
import en from './locales/en.json';
import hi from './locales/hi.json';
import gu from './locales/gu.json';
// import bn from './locales/bn.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import ta from './locales/ta.json';
import ur from './locales/ur.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import or from './locales/or.json';
import pa from './locales/pa.json';
import as from './locales/as.json';
import mai from './locales/mai.json';
import sa from './locales/sa.json';
import ks from './locales/ks.json';
import ne from './locales/ne.json';
import sd from './locales/sd.json';
import kok from './locales/kok.json';
import doi from './locales/doi.json';
import mni from './locales/mni.json';
import sat from './locales/sat.json';
import bo from './locales/bo.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  gu: { translation: gu },
  // bn: { translation: bn },
  te: { translation: te },
  mr: { translation: mr },
  ta: { translation: ta },
  ur: { translation: ur },
  kn: { translation: kn },
  ml: { translation: ml },
  or: { translation: or },
  pa: { translation: pa },
  as: { translation: as },
  mai: { translation: mai },
  sa: { translation: sa },
  ks: { translation: ks },
  ne: { translation: ne },
  sd: { translation: sd },
  kok: { translation: kok },
  doi: { translation: doi },
  mni: { translation: mni },
  sat: { translation: sat },
  bo: { translation: bo },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0]?.languageCode || 'en', // Auto-detect device language
    fallbackLng: 'en',
    compatibilityJSON: 'v3' as const, // Use v3 for better React Native compatibility
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
