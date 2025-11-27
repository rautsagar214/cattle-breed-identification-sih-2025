import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'International' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'North India' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal, Bangladesh' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra Pradesh, Telangana' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'North India' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjab' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', region: 'Bihar, Jharkhand' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', region: 'Classical' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', region: 'Kashmir' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'Sikkim, Nepal' },
  { code: 'sd', name: 'Sindhi', nativeName: 'सिन्धी', region: 'Western India' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', region: 'Goa, Maharashtra' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', region: 'Jammu & Kashmir' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', region: 'Manipur' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'Jharkhand, Odisha' },
  { code: 'bo', name: 'Bodo', nativeName: 'बड़ो', region: 'Assam' },
];

export const LanguageSelector: React.FC = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Language</Text>
        <Text style={styles.subtitle}>अपनी भाषा चुनें • ভাষা নির্বাচন করুন • మీ భాషను ఎంచుకోండి</Text>
      </View>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageButton,
            language === lang.code && styles.selectedLanguage,
          ]}
          onPress={() => changeLanguage(lang.code)}
        >
          <View style={styles.languageContent}>
            <Text
              style={[
                styles.languageName,
                language === lang.code && styles.selectedText,
              ]}
            >
              {lang.nativeName}
            </Text>
            <Text
              style={[
                styles.languageSubtext,
                language === lang.code && styles.selectedText,
              ]}
            >
              {lang.name} • {lang.region}
            </Text>
          </View>
          {language === lang.code && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🇮🇳 Covering all 22 official Indian languages + English</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedLanguage: {
    backgroundColor: '#f3f4ff',
    borderColor: '#667eea',
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  languageSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectedText: {
    color: '#667eea',
  },
  checkmark: {
    fontSize: 24,
    color: '#667eea',
    fontWeight: 'bold',
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});
