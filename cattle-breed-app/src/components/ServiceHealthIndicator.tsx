import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useServiceHealth, HealthStatus } from '../hooks/useServiceHealth';

export const ServiceHealthIndicator = () => {
    const { status, checkHealth } = useServiceHealth();

    if (status === 'active') {
        return (
            <View style={[styles.container, styles.activeContainer]}>
                <View style={styles.dot} />
                <Text style={styles.text}>Service Active</Text>
            </View>
        );
    }

    if (status === 'checking') {
        return (
            <View style={[styles.container, styles.checkingContainer]}>
                <ActivityIndicator size="small" color="#667eea" />
                <Text style={styles.text}>Checking service status...</Text>
            </View>
        );
    }

    if (status === 'waking_up') {
        return (
            <View style={[styles.container, styles.wakingContainer]}>
                <ActivityIndicator size="small" color="#d97706" />
                <Text style={styles.text}>Waking up server (this may take a minute)...</Text>
            </View>
        );
    }

    return (
        <TouchableOpacity onPress={checkHealth} style={[styles.container, styles.offlineContainer]}>
            <Text style={styles.offlineIcon}>⚠️</Text>
            <Text style={styles.text}>Service Offline. Tap to retry.</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 20,
        alignSelf: 'center',
    },
    activeContainer: {
        backgroundColor: '#d1fae5', // Light green
    },
    checkingContainer: {
        backgroundColor: '#e0e7ff', // Light indigo
    },
    wakingContainer: {
        backgroundColor: '#fef3c7', // Light yellow
    },
    offlineContainer: {
        backgroundColor: '#fee2e2', // Light red
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#059669', // Green
        marginRight: 8,
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 8,
    },
    offlineIcon: {
        fontSize: 14,
    },
});
