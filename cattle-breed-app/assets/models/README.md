# TensorFlow Lite Model Directory

## Place your trained cattle breed detection model here

### Model File

- **File name**: `cattle_model.tflite`
- **Format**: TensorFlow Lite (.tflite)
- **Input size**: 224x224x3 (RGB image)
- **Output**: Probabilities for each cattle breed class

### Model Training

You can train your model using:

1. TensorFlow + Keras
2. Google Teachable Machine (easiest for beginners)
3. Transfer Learning with MobileNet/EfficientNet

### Example Structure

```
assets/
  └── models/
      ├── cattle_model.tflite  <-- Place your model here
      ├── labels.txt           <-- Optional: List of breed names
      └── README.md            <-- This file
```

### Breeds to Train (Example)

- Gir
- Sahiwal
- Red Sindhi
- Tharparkar
- Hariana
- Kangayam
- Ongole
- Kankrej
- Deoni
- Holstein Friesian
- Jersey

### Resources

- TensorFlow Lite Guide: https://www.tensorflow.org/lite
- Model Maker: https://www.tensorflow.org/lite/models/modify/model_maker
- Teachable Machine: https://teachablemachine.withgoogle.com/

### Testing Your Model

Once you place your model here, update the `src/services/tflite.js` file to load and use it.
