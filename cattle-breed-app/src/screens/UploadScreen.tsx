import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { Camera } from 'expo-camera';

/**
 * UploadScreen - Allows users to take or upload cattle photos
 * Handles camera and gallery permissions
 * Sends image to TFLite model for breed detection
 */
export default function UploadScreen(): React.JSX.Element {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // TODO: Implement after installing expo-image-picker
  const pickImageFromGallery = async () => {
    Alert.alert('Coming Soon', 'Gallery picker will be implemented next!');
    // const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsEditing: true,
    //   aspect: [4, 3],
    //   quality: 1,
    // });
    // if (!result.canceled) {
    //   setSelectedImage(result.assets[0].uri);
    // }
  };

  // TODO: Implement after installing expo-camera
  const takePhoto = async () => {
    Alert.alert('Coming Soon', 'Camera will be implemented next!');
    // const { status } = await Camera.requestCameraPermissionsAsync();
    // if (status === 'granted') {
    //   // Open camera
    // }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first!');
      return;
    }

    setIsAnalyzing(true);
    // TODO: Call TFLite model here
    setTimeout(() => {
      setIsAnalyzing(false);
      Alert.alert('Success', 'Breed detection will be implemented soon!');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Cattle Photo</Text>
      <Text style={styles.subtitle}>
        Take a clear photo or choose from gallery
      </Text>

      {/* Image Preview */}
      <View style={styles.imageContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonIcon}>📸</Text>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={pickImageFromGallery}
        >
          <Text style={styles.buttonIcon}>🖼️</Text>
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Analyze Button */}
      {selectedImage && (
        <TouchableOpacity
          style={[styles.analyzeButton, isAnalyzing && styles.buttonDisabled]}
          onPress={analyzeImage}
          disabled={isAnalyzing}
        >
          <Text style={styles.analyzeButtonText}>
            {isAnalyzing ? '🔄 Analyzing...' : '🔍 Analyze Breed'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Tips */}
      <View style={styles.tipsBox}>
        <Text style={styles.tipsTitle}>📝 Tips for best results:</Text>
        <Text style={styles.tipText}>• Use good lighting</Text>
        <Text style={styles.tipText}>• Capture full body of cattle</Text>
        <Text style={styles.tipText}>• Avoid blurry images</Text>
        <Text style={styles.tipText}>• Take photo from side angle</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
  },
  placeholderIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#95a5a6',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  button: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#9b59b6',
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  tipsBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
});
