import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNetwork } from '../../src/contexts/NetworkContext';
import { useLanguage } from '../../src/contexts/LanguageContext';

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { t } = useLanguage();
  const { isOnline, pendingUploads } = useNetwork();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Modern Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('home.greeting')}</Text>
          <Text style={styles.tagline}>{t('home.tagline')}</Text>
        </View>
        {isOnline ? (
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>{t('home.online')}</Text>
          </View>
        ) : (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>📵 {t('home.offline')}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Primary Action Card */}
        <TouchableOpacity
          style={styles.primaryCard}
          onPress={() => router.push('/upload' as any)}
          activeOpacity={0.9}
        >
          <View style={styles.primaryCardContent}>
            <View>
              <Text style={styles.primaryCardTitle}>{t('home.identifyBreed')}</Text>
              <Text style={styles.primaryCardDesc}>{t('home.identifyDesc')}</Text>
            </View>
            <View style={styles.primaryCardIcon}>
              <Text style={styles.primaryCardEmoji}>📷</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/chatbot' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionEmoji}>🤖</Text>
            </View>
            <Text style={styles.actionTitle}>{t('home.aiAssistant')}</Text>
            <Text style={styles.actionDesc}>{t('home.aiAssistantDesc')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/settings' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionEmoji}>⚙️</Text>
            </View>
            <Text style={styles.actionTitle}>{t('home.settings')}</Text>
            <Text style={styles.actionDesc}>{t('home.settingsDesc')}</Text>
          </TouchableOpacity>
        </View>

        {/* Sync Status */}
        {pendingUploads > 0 && (
          <View style={styles.syncCard}>
            <View style={styles.syncIcon}>
              <Text>🔄</Text>
            </View>
            <View style={styles.syncContent}>
              <Text style={styles.syncTitle}>{t('home.syncPending')}</Text>
              <Text style={styles.syncDesc}>{pendingUploads} {t('home.syncDesc')}</Text>
            </View>
          </View>
        )}

        {/* Breeds Section */}
        <View style={styles.breedsSection}>
          <Text style={styles.sectionTitle}>{t('home.popularBreeds')}</Text>
          <View style={styles.breedTags}>
            {['Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Rathi', 'Kankrej', 
              'Ongole', 'Hariana', 'Kangayam', 'Hallikar', 'Khillari', 'Deoni'].map((breed, index) => (
              <View key={index} style={styles.breedTag}>
                <Text style={styles.breedTagText}>{breed}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  tagline: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  offlineBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  offlineText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  primaryCard: {
    backgroundColor: '#667eea',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryCardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  primaryCardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  primaryCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryCardEmoji: {
    fontSize: 28,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 26,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  syncCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  syncIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fde68a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  syncContent: {
    flex: 1,
    justifyContent: 'center',
  },
  syncTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 2,
  },
  syncDesc: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '500',
  },
  breedsSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  breedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  breedTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    margin: 4,
  },
  breedTagText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '600',
  },
});
