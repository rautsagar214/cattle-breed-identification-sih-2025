import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { logoutUser } from '../../src/services/authService';


export default function SettingsScreen(): React.JSX.Element {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const { t, language } = useLanguage();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);


    const handleLogout = async () => {
        Alert.alert(
            t('settings.logout'),
            'Are you sure you want to logout?',
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('settings.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logoutUser();
                            setUser(null);
                            router.replace('/login' as any);
                        } catch (error: any) {
                            Alert.alert(t('common.error'), error.message);
                        }
                    },
                },
            ]
        );
    };



    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{t('settings.title')}</Text>
                    <Text style={styles.subtitle}>Customize your experience</Text>
                </View>

                {/* User Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileIcon}>
                        <Text style={styles.profileIconText}>
                            {user?.id === -1 ? 'G' : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.id === -1 ? 'Guest User' : (user?.name || 'User')}</Text>
                        <Text style={styles.profileEmail}>{user?.id === -1 ? 'Not logged in' : (user?.email || 'user@example.com')}</Text>
                    </View>
                </View>




                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ℹ️ {t('settings.about')}</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuText}>{t('settings.version')}</Text>
                            <Text style={styles.menuValue}>1.0.0</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => Alert.alert('Help', 'Help & Support coming soon!')}
                        >
                            <Text style={styles.menuText}>Help & Support</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => Alert.alert('Privacy', 'Privacy Policy coming soon!')}
                        >
                            <Text style={styles.menuText}>Privacy Policy</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => Alert.alert('Terms', 'Terms of Service coming soon!')}
                        >
                            <Text style={styles.menuText}>Terms of Service</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout/Login Button */}
                {user && (
                    <TouchableOpacity
                        style={[styles.logoutButton, user.id === -1 && styles.loginButton]}
                        onPress={user.id === -1 ? () => router.replace('/login' as any) : handleLogout}
                    >
                        <Text style={styles.logoutButtonText}>
                            {user.id === -1 ? '🔑 Login' : `🚪 ${t('settings.logout')}`}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Made with ❤️ for Smart India Hackathon 2025
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 20,
        paddingTop: 50,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 30,
    },
    backButton: {
        fontSize: 16,
        color: '#3498db',
        marginBottom: 15,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profileIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2ecc71',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    profileIconText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 12,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    languageOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    languageLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageFlag: {
        fontSize: 24,
        marginRight: 12,
    },
    languageName: {
        fontSize: 16,
        color: '#2c3e50',
        fontWeight: '600',
    },
    currentLanguage: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 2,
    },
    checkmark: {
        fontSize: 20,
        color: '#2ecc71',
        fontWeight: 'bold',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 13,
        color: '#7f8c8d',
    },
    divider: {
        height: 1,
        backgroundColor: '#dee2e6',
        marginVertical: 12,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    menuText: {
        fontSize: 16,
        color: '#2c3e50',
    },
    menuValue: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    menuArrow: {
        fontSize: 22,
        color: '#7f8c8d',
    },
    logoutButton: {
        backgroundColor: '#e74c3c',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    loginButton: {
        backgroundColor: '#3498db',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        fontSize: 13,
        color: '#95a5a6',
        textAlign: 'center',
        marginTop: 10,
    },
});
