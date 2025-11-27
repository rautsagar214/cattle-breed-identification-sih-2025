"""
Convert TFLite model to TensorFlow.js format for offline web usage
This allows your trained model to run directly in the browser without internet!
"""

import tensorflow as tf
import tensorflowjs as tfjs
import numpy as np
import os

print("🔄 TFLite to TensorFlow.js Converter")
print("=" * 50)

# Paths
TFLITE_MODEL_PATH = "../assets/models/model_fp32.tflite"
OUTPUT_DIR = "../assets/models/tfjs_model"

def convert_tflite_to_tfjs():
    """
    Convert TFLite model to TensorFlow.js format
    """
    try:
        print(f"\n📂 Loading TFLite model from: {TFLITE_MODEL_PATH}")
        
        # Load the TFLite model
        interpreter = tf.lite.Interpreter(model_path=TFLITE_MODEL_PATH)
        interpreter.allocate_tensors()
        
        # Get input and output details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print(f"\n✅ TFLite model loaded successfully!")
        print(f"📊 Input shape: {input_details[0]['shape']}")
        print(f"📊 Output shape: {output_details[0]['shape']}")
        
        # Get model info
        input_shape = input_details[0]['shape']
        num_classes = output_details[0]['shape'][-1]
        
        print(f"\n📋 Model Info:")
        print(f"   Input: {input_shape}")
        print(f"   Number of classes: {num_classes}")
        
        # Create a Keras model that mimics the TFLite behavior
        print(f"\n🔨 Building equivalent Keras model...")
        
        # Create a simple wrapper model
        # Note: This is a simplified conversion - for complex models, 
        # you might need the original training code
        inputs = tf.keras.Input(shape=input_shape[1:])
        
        # Try to recreate model architecture
        # This is a placeholder - actual architecture depends on your training
        x = tf.keras.layers.Conv2D(32, 3, activation='relu')(inputs)
        x = tf.keras.layers.MaxPooling2D()(x)
        x = tf.keras.layers.Conv2D(64, 3, activation='relu')(x)
        x = tf.keras.layers.MaxPooling2D()(x)
        x = tf.keras.layers.Conv2D(128, 3, activation='relu')(x)
        x = tf.keras.layers.GlobalAveragePooling2D()(x)
        x = tf.keras.layers.Dense(128, activation='relu')(x)
        outputs = tf.keras.layers.Dense(num_classes, activation='softmax')(x)
        
        model = tf.keras.Model(inputs=inputs, outputs=outputs)
        
        print("⚠️  WARNING: Using generic architecture - predictions may not match!")
        print("💡 For best results, provide the original model or training code")
        
        # Create output directory
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        # Convert to TensorFlow.js
        print(f"\n🔄 Converting to TensorFlow.js format...")
        tfjs.converters.save_keras_model(model, OUTPUT_DIR)
        
        print(f"\n✅ Conversion complete!")
        print(f"📁 Model saved to: {OUTPUT_DIR}")
        print(f"\n📝 Files created:")
        for file in os.listdir(OUTPUT_DIR):
            print(f"   - {file}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Conversion failed: {e}")
        print(f"\n💡 Alternative: Provide original model (SavedModel or .h5)")
        return False

def alternative_method():
    """
    Alternative: Extract model info and create labels file
    """
    print("\n" + "=" * 50)
    print("📋 Extracting Model Information")
    print("=" * 50)
    
    try:
        interpreter = tf.lite.Interpreter(model_path=TFLITE_MODEL_PATH)
        interpreter.allocate_tensors()
        
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print(f"\n✅ Model Details:")
        print(f"   Input shape: {input_details[0]['shape']}")
        print(f"   Input dtype: {input_details[0]['dtype']}")
        print(f"   Output shape: {output_details[0]['shape']}")
        print(f"   Number of classes: {output_details[0]['shape'][-1]}")
        
        # Test with dummy input
        input_shape = input_details[0]['shape']
        dummy_input = np.random.rand(*input_shape).astype(np.float32)
        
        interpreter.set_tensor(input_details[0]['index'], dummy_input)
        interpreter.invoke()
        output = interpreter.get_tensor(output_details[0]['index'])
        
        print(f"\n🧪 Test inference successful!")
        print(f"   Output shape: {output.shape}")
        print(f"   Sample predictions: {output[0][:5]}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("\n🎯 Attempting conversion...")
    print("Note: This may not produce accurate results without the original model")
    print("=" * 50)
    
    # Try conversion (may not work perfectly)
    # convert_tflite_to_tfjs()
    
    # Extract model info instead
    alternative_method()
    
    print("\n" + "=" * 50)
    print("📝 RECOMMENDATION:")
    print("=" * 50)
    print("""
For best results, provide:
1. Original SavedModel directory (before TFLite conversion)
2. OR Keras .h5 model file
3. OR Training code that saved the model

Then we can convert properly with:
  tensorflowjs_converter \\
    --input_format=tf_saved_model \\
    saved_model/ \\
    web_model/
    
For now, I'll create a backend API that uses your TFLite directly!
This will work on web (with internet) and mobile (offline).
    """)
