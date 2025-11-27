import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * HomeScreen - Main landing page of the app
 * Shows welcome message and quick access buttons to main features
 */
export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🐄 Cattle Breed App</Text>
        <Text style={styles.subtitle}>
          Identify cattle breeds instantly using AI
        </Text>

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/upload' as any)}
          >
            <Text style={styles.cardIcon}>📸</Text>
            <Text style={styles.cardTitle}>Upload Photo</Text>
            <Text style={styles.cardDescription}>
              Take or upload cattle photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/chatbot' as any)}
          >
            <Text style={styles.cardIcon}>💬</Text>
            <Text style={styles.cardTitle}>Chat Assistant</Text>
            <Text style={styles.cardDescription}>
              Ask questions about breeds
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/settings' as any)}
          >
            <Text style={styles.cardIcon}>⚙️</Text>
            <Text style={styles.cardTitle}>Settings</Text>
            <Text style={styles.cardDescription}>
              Language & preferences
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>1. Take a photo of the cattle</Text>
          <Text style={styles.infoText}>2. AI analyzes the image</Text>
          <Text style={styles.infoText}>3. Get breed information instantly</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  cardsContainer: {
    gap: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoBox: {
    backgroundColor: '#e8f4f8',
    padding: 20,
    borderRadius: 10,
    marginTop: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2980b9',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
});
