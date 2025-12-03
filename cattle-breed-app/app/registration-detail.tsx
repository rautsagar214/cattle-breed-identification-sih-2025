import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Registration } from '../src/services/db';

const { width } = Dimensions.get('window');

export default function RegistrationDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse the registration object passed as a string or handle individual params
    // Ideally, we pass the ID and fetch, but passing the object is faster for now
    // Since params are strings, we might need to parse if we passed a JSON string
    // But history.tsx passes individual params usually? 
    // Wait, history.tsx in my plan said "navigate to the new detailed registration page".
    // I need to decide how to pass data. Passing the whole object via params can be tricky if it's large.
    // But for now, let's assume we pass the ID and fetch, OR pass the object.
    // Let's pass the object as a JSON string 'registrationData'.

    let registration: Registration | null = null;
    try {
        if (params.registrationData) {
            registration = JSON.parse(params.registrationData as string);
        }
    } catch (e) {
        console.error('Failed to parse registration data', e);
    }

    if (!registration) {
        return (
            <View style={styles.container}>
                <Text>Error loading registration details</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cattle Details</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Images */}
                <ScrollView horizontal pagingEnabled style={styles.imageSlider}>
                    {registration.imageUris.map((uri, index) => (
                        <Image key={index} source={{ uri }} style={styles.image} />
                    ))}
                </ScrollView>

                <View style={styles.detailsContainer}>
                    <View style={styles.statusRow}>
                        <Text style={styles.tagId}>Tag: {registration.pashuAadharTagId}</Text>
                        <View style={[styles.badge, registration.isSynced ? styles.syncedBadge : styles.pendingBadge]}>
                            <Text style={styles.badgeText}>{registration.isSynced ? 'Synced' : 'Pending'}</Text>
                        </View>
                    </View>

                    <Text style={styles.date}>Registered on {formatDate(registration.timestamp)}</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Animal Information</Text>
                        <DetailRow label="Species" value={registration.species} />
                        <DetailRow label="Breed" value={registration.breed} />
                        {registration.isBreedOverridden && (
                            <View style={styles.overrideBox}>
                                <Text style={styles.overrideText}>Breed Overridden</Text>
                                <Text style={styles.overrideReason}>Reason: {registration.overrideReason}</Text>

                                {registration.predictions && registration.predictions.length > 0 && (
                                    <View style={styles.aiPredictionContainer}>
                                        <Text style={styles.aiLabel}>AI Predicted:</Text>
                                        <Text style={styles.aiValue}>
                                            {registration.predictions[0].breed} ({(registration.predictions[0].confidence * 100).toFixed(1)}%)
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                        <DetailRow label="Sex" value={registration.sex} />
                        <DetailRow label="Age" value={`${registration.ageYears} Y ${registration.ageMonths} M`} />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Physical Traits</Text>
                        <DetailRow label="Phenotype" value={registration.phenotypicCharacteristics} />
                        <DetailRow label="Marks" value={registration.identificationMarks} />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Health & Production</Text>
                        <DetailRow label="Breeding History" value={registration.reproductiveBreedingHistory} />
                        <DetailRow label="Vaccination" value={registration.healthVaccinationRecords} />
                        <DetailRow label="Milk Yield" value={registration.milkYieldInfo} />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Owner Details</Text>
                        <DetailRow label="Name" value={registration.ownerName} />
                        <DetailRow label="Contact" value={registration.ownerContact} />
                        <DetailRow label="Address" value={registration.ownerAddress} />
                        <DetailRow label="Premises" value={`${registration.premisesType} - ${registration.premisesLocation}`} />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location</Text>
                        <Text style={styles.value}>{registration.locationName || 'Unknown Location'}</Text>
                        {registration.latitude && registration.longitude && (
                            <Text style={styles.subValue}>{registration.latitude.toFixed(6)}, {registration.longitude.toFixed(6)}</Text>
                        )}
                    </View>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const DetailRow = ({ label, value }: { label: string, value?: string }) => {
    if (!value) return null;
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backBtn: {
        marginRight: 15,
    },
    backBtnText: {
        fontSize: 16,
        color: '#3498db',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    content: {
        flex: 1,
    },
    imageSlider: {
        width: width,
        height: 250,
        backgroundColor: '#eee',
    },
    image: {
        width: width,
        height: 250,
        resizeMode: 'cover',
    },
    detailsContainer: {
        padding: 20,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    tagId: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    syncedBadge: {
        backgroundColor: '#d4edda',
    },
    pendingBadge: {
        backgroundColor: '#fff3cd',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#155724',
    },
    date: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 20,
    },
    section: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f2f6',
        paddingBottom: 5,
    },
    row: {
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        color: '#95a5a6',
        marginBottom: 2,
    },
    value: {
        fontSize: 15,
        color: '#2c3e50',
    },
    subValue: {
        fontSize: 13,
        color: '#7f8c8d',
    },
    overrideBox: {
        backgroundColor: '#fff3cd',
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
    },
    overrideText: {
        color: '#856404',
        fontWeight: 'bold',
        fontSize: 12,
    },
    overrideReason: {
        color: '#856404',
        fontSize: 12,
    },
    aiPredictionContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(133, 100, 4, 0.2)',
    },
    aiLabel: {
        fontSize: 11,
        color: '#856404',
        fontWeight: '600',
    },
    aiValue: {
        fontSize: 13,
        color: '#856404',
        fontWeight: 'bold',
    },
    backButton: {
        color: '#3498db',
        marginTop: 20,
    },
});
