import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { getScanHistory, getRegistrations, ScanResult, Registration } from '../../src/services/db';

export default function HistoryScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [history, setHistory] = useState<ScanResult[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [activeTab, setActiveTab] = useState<'predictions' | 'registrations'>('predictions');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = async () => {
        if (user?.id === -1) {
            setLoading(false);
            return;
        }
        try {
            const data = await getScanHistory();
            setHistory(data);

            if (user?.role === 'flw') {
                const regData = await getRegistrations();
                setRegistrations(regData);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadHistory();
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderItem = ({ item }: { item: ScanResult }) => {
        const mainImage = item.imageUris[0];
        const topPrediction = item.predictions[0];

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    // Navigate to result screen with all details
                    router.push({
                        pathname: '/result',
                        params: {
                            breedName: topPrediction.breed,
                            confidence: topPrediction.confidence,
                            imageUrl: mainImage,
                            allImages: JSON.stringify(item.imageUris),
                            allPredictions: JSON.stringify(item.predictions),
                            // Pass location and timestamp
                            timestamp: item.timestamp,
                            locationName: item.locationName,
                            latitude: item.latitude,
                            longitude: item.longitude,
                            // We might need to fetch characteristics/careTips again or store them in DB
                            // For now, let result screen handle basic display or fetch if needed
                            // Ideally, we should store these in DB too, but for now we'll rely on result screen logic
                            // or simple defaults if offline and not cached.
                            // Actually, result screen expects these params. 
                            // Since we don't store full text in DB, we might miss them if offline.
                            // But `tflite.tsx` returns them. We should probably have stored them.
                            // For this iteration, let's pass empty arrays if not stored, 
                            // or maybe we should have stored them. 
                            // The user didn't explicitly ask to store descriptions, but it's good practice.
                            // Let's pass what we have.
                            description: `${topPrediction.breed} detected on ${formatDate(item.timestamp)}`,
                        }
                    } as any);
                }}
            >
                <Image source={{ uri: mainImage }} style={styles.thumbnail} />
                <View style={styles.cardContent}>
                    <View style={styles.headerRow}>
                        <Text style={styles.breedName}>{topPrediction.breed}</Text>
                        <Text style={styles.confidence}>{(topPrediction.confidence * 100).toFixed(0)}%</Text>
                    </View>

                    <Text style={styles.date}>{formatDate(item.timestamp)}</Text>

                    {item.locationName && (
                        <Text style={styles.location} numberOfLines={1}>
                            📍 {item.locationName}
                        </Text>
                    )}

                    <View style={styles.syncContainer}>
                        <Text style={[
                            styles.syncStatus,
                            item.isSynced ? styles.synced : styles.notSynced
                        ]}>
                            {item.isSynced ? '☁️ Synced' : '⏳ Pending Sync'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderRegistrationItem = ({ item }: { item: Registration }) => {
        const mainImage = item.imageUris[0];

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    router.push({
                        pathname: '/registration-detail',
                        params: {
                            registrationData: JSON.stringify(item)
                        }
                    } as any);
                }}
            >
                <Image source={{ uri: mainImage }} style={styles.thumbnail} />
                <View style={styles.cardContent}>
                    <View style={styles.headerRow}>
                        <Text style={styles.breedName}>{item.pashuAadharTagId}</Text>
                        <Text style={styles.confidence}>{item.breed}</Text>
                    </View>

                    <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
                    <Text style={styles.location}>{item.ownerName}</Text>

                    {item.locationName && (
                        <Text style={styles.location} numberOfLines={1}>
                            📍 {item.locationName}
                        </Text>
                    )}

                    <View style={styles.syncContainer}>
                        <Text style={[
                            styles.syncStatus,
                            item.isSynced ? styles.synced : styles.notSynced
                        ]}>
                            {item.isSynced ? '☁️ Synced' : '⏳ Pending Sync'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    if (user?.id === -1) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Scan History</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🔒</Text>
                    <Text style={styles.emptyText}>Login Required</Text>
                    <Text style={styles.emptySubtext}>Please login to track your scan history</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/login' as any)}
                    >
                        <Text style={styles.loginButtonText}>Login Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>History</Text>
            </View>

            {user?.role === 'flw' && (
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'predictions' && styles.activeTab]}
                        onPress={() => setActiveTab('predictions')}
                    >
                        <Text style={[styles.tabText, activeTab === 'predictions' && styles.activeTabText]}>Predictions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'registrations' && styles.activeTab]}
                        onPress={() => setActiveTab('registrations')}
                    >
                        <Text style={[styles.tabText, activeTab === 'registrations' && styles.activeTabText]}>Registrations</Text>
                    </TouchableOpacity>
                </View>
            )}

            {activeTab === 'predictions' ? (
                history.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No scans yet</Text>
                        <Text style={styles.emptySubtext}>Your identification history will appear here</Text>
                    </View>
                ) : (
                    <FlatList
                        data={history}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    />
                )
            ) : (
                registrations.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No registrations yet</Text>
                        <Text style={styles.emptySubtext}>Your cattle registrations will appear here</Text>
                    </View>
                ) : (
                    <FlatList
                        data={registrations}
                        renderItem={renderRegistrationItem}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    />
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        height: 100,
    },
    thumbnail: {
        width: 100,
        height: '100%',
        resizeMode: 'cover',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    breedName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    confidence: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2ecc71',
        backgroundColor: '#e8f8f5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    date: {
        fontSize: 12,
        color: '#95a5a6',
        marginBottom: 4,
    },
    location: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    syncContainer: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
    synced: {
        color: '#27ae60',
    },
    notSynced: {
        color: '#f39c12',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#bdc3c7',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#95a5a6',
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    loginButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        marginRight: 20,
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#3498db',
    },
    tabText: {
        fontSize: 16,
        color: '#95a5a6',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#3498db',
    },
});
