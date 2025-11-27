import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface BreedResult {
  breedName: string;
  confidence: number;
  image: string | null;
  characteristics: string[];
  careTips: string[];
}

/**
 * ResultScreen - Displays cattle breed detection results
 * Shows breed name, confidence score, characteristics, and care tips
 * User can save results or analyze another image
 */
export default function ResultScreen(): React.JSX.Element {
  const router = useRouter();

  // TODO: Get actual results from route params
  const mockResult: BreedResult = {
    breedName: 'Gir',
    confidence: 94.5,
    image: null, // Will be passed from UploadScreen
    characteristics: [
      'Origin: Gujarat, India',
      'Color: Red to yellow-brown with white patches',
      'Distinctive: Long pendulous ears',
      'Horns: Curved backward',
      'Purpose: Dairy cattle',
    ],
    careTips: [
      'Provide adequate water (40-50 liters/day)',
      'Feed green fodder and concentrate',
      'Regular health checkups',
      'Maintain clean shelter',
    ],
  };

  const analyzeAnother = () => {
    router.back();
  };

  const saveResult = () => {
    // TODO: Implement save to local storage or Firebase
    alert('Save functionality coming soon!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Result Header */}
        <View style={styles.resultHeader}>
          <Text style={styles.badge}>✅ Detected</Text>
          <Text style={styles.breedName}>{mockResult.breedName}</Text>
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence:</Text>
            <Text style={styles.confidenceValue}>
              {mockResult.confidence}%
            </Text>
          </View>
        </View>

        {/* Image Preview */}
        {mockResult.image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: mockResult.image }} style={styles.image} />
          </View>
        )}

        {/* Characteristics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Characteristics</Text>
          <View style={styles.list}>
            {mockResult.characteristics.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Care Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💚 Care Tips</Text>
          <View style={styles.list}>
            {mockResult.careTips.map((tip, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={analyzeAnother}
          >
            <Text style={styles.buttonText}>🔄 Analyze Another</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={saveResult}
          >
            <Text style={styles.buttonText}>💾 Save Result</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Want to know more? Ask our AI chatbot for detailed information
            about this breed!
          </Text>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => router.push('/chatbot' as any)}
          >
            <Text style={styles.chatButtonText}>💬 Ask Chatbot</Text>
          </TouchableOpacity>
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
  resultHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    backgroundColor: '#27ae60',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  breedName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  confidenceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  list: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: '#3498db',
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#34495e',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 10,
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#9b59b6',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#e8f4f8',
    padding: 20,
    borderRadius: 10,
    marginTop: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 15,
  },
  chatButton: {
    backgroundColor: '#2980b9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
