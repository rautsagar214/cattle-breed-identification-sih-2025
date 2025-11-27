import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../src/contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoIcon}>🐄</Text>
              </View>
              <Text style={styles.appName}>CattleAI</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t('welcome.badge')}</Text>
              </View>
            </View>

            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>{t('welcome.title')}</Text>
              <Text style={styles.heroSubtitle}>
                {t('welcome.subtitle')}
              </Text>
            </View>
          </View>

          {/* Feature Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}></Text>
              <Text style={styles.featureTitle}>{t('welcome.features.aiScan')}</Text>
              <Text style={styles.featureDesc}>{t('welcome.features.aiScanDesc')}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}></Text>
              <Text style={styles.featureTitle}>{t('welcome.features.expertAI')}</Text>
              <Text style={styles.featureDesc}>{t('welcome.features.expertAIDesc')}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}></Text>
              <Text style={styles.featureTitle}>{t('welcome.features.offline')}</Text>
              <Text style={styles.featureDesc}>{t('welcome.features.offlineDesc')}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}></Text>
              <Text style={styles.featureTitle}>{t('welcome.features.multiLang')}</Text>
              <Text style={styles.featureDesc}>{t('welcome.features.multiLangDesc')}</Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.primaryCTA}
              onPress={() => router.push('/signup' as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.ctaGradient}
              >
                <Text style={styles.primaryCTAText}>{t('welcome.getStarted')}</Text>
                <Text style={styles.ctaArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCTA}
              onPress={() => router.push('/login' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryCTAText}>{t('welcome.login')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>{t('welcome.footer')}</Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  logoIcon: {
    fontSize: 50,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    lineHeight: 42,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featureEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  ctaContainer: {
    marginTop: 20,
  },
  primaryCTA: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCTAText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },
  ctaArrow: {
    fontSize: 20,
    color: '#667eea',
    fontWeight: 'bold',
  },
  secondaryCTA: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
  },
  secondaryCTAText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '600',
  },
});
