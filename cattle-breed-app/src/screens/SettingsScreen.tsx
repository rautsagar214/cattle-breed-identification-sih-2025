import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';

interface Language {
  code: string;
  name: string;
}

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
}

interface SectionHeaderProps {
  title: string;
}

/**
 * SettingsScreen - App configuration and preferences
 * Language selection, theme toggle, notifications, about info
 */
export default function SettingsScreen(): React.JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  const languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
  ];

  const selectLanguage = (language: Language): void => {
    setSelectedLanguage(language.name);
    // TODO: Implement i18n language change
    Alert.alert('Language Selected', `Switched to ${language.name}`);
  };

  const clearCache = (): void => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear app cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cache clearing
            Alert.alert('Success', 'Cache cleared successfully!');
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent }: SettingItemProps) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent && <View style={styles.settingRight}>{rightComponent}</View>}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: SectionHeaderProps) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appIcon}>🐄</Text>
          <Text style={styles.appName}>Cattle Breed App</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* Language Settings */}
        <SectionHeader title="LANGUAGE" />
        <View style={styles.section}>
          <SettingItem
            icon="🌐"
            title="Language"
            subtitle={selectedLanguage}
            rightComponent={<Text style={styles.arrow}>›</Text>}
          />
          <View style={styles.languageList}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  selectedLanguage === lang.name && styles.languageItemSelected,
                ]}
                onPress={() => selectLanguage(lang)}
              >
                <Text
                  style={[
                    styles.languageText,
                    selectedLanguage === lang.name && styles.languageTextSelected,
                  ]}
                >
                  {lang.name}
                </Text>
                {selectedLanguage === lang.name && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preferences */}
        <SectionHeader title="PREFERENCES" />
        <View style={styles.section}>
          <SettingItem
            icon="🌙"
            title="Dark Mode"
            subtitle="Change app theme"
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: '#ccc', true: '#3498db' }}
                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              />
            }
          />
          <View style={styles.divider} />
          <SettingItem
            icon="🔔"
            title="Notifications"
            subtitle="Enable push notifications"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#ccc', true: '#3498db' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Storage */}
        <SectionHeader title="STORAGE" />
        <View style={styles.section}>
          <SettingItem
            icon="🗑️"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={clearCache}
            rightComponent={<Text style={styles.arrow}>›</Text>}
          />
        </View>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={styles.section}>
          <SettingItem
            icon="ℹ️"
            title="About App"
            subtitle="Learn more about the app"
            rightComponent={<Text style={styles.arrow}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="📄"
            title="Privacy Policy"
            rightComponent={<Text style={styles.arrow}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="⭐"
            title="Rate Us"
            rightComponent={<Text style={styles.arrow}>›</Text>}
          />
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={styles.creditsText}>Made for Smart India Hackathon 2025</Text>
          <Text style={styles.creditsText}>🇮🇳 Empowering Indian Farmers</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 30,
  },
  appInfo: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 20,
  },
  appIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    color: '#95a5a6',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingLeft: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 10,
  },
  arrow: {
    fontSize: 24,
    color: '#bdc3c7',
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginLeft: 60,
  },
  languageList: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 5,
  },
  languageItemSelected: {
    backgroundColor: '#e8f4f8',
  },
  languageText: {
    fontSize: 15,
    color: '#2c3e50',
  },
  languageTextSelected: {
    fontWeight: 'bold',
    color: '#2980b9',
  },
  checkmark: {
    fontSize: 18,
    color: '#2980b9',
  },
  credits: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  creditsText: {
    fontSize: 13,
    color: '#95a5a6',
    marginBottom: 5,
    textAlign: 'center',
  },
});
