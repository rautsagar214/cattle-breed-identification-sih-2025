# 🐄 Cattle Breed Identification App

**Smart India Hackathon 2025**

A comprehensive mobile application for identifying cattle breeds using AI/ML with a custom authentication backend.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This application helps farmers, veterinarians, and cattle enthusiasts identify different cattle breeds using machine learning. Users can upload images of cattle, and the app provides:
- Breed identification with confidence scores
- Breed characteristics and information
- Care tips and recommendations
- Multi-language support
- User authentication and history

## ✨ Features

### Frontend (Mobile App)
- 📸 **Camera Integration** - Capture cattle images
- 🖼️ **Image Upload** - Upload from gallery
- 🤖 **AI Breed Detection** - TensorFlow Lite model
- 🌍 **Multilingual Support** - English, Hindi, Marathi, Bengali, Tamil, Telugu
- 💬 **AI Chatbot** - Gemini AI powered assistance
- 👤 **User Profiles** - Personal account management
- 📊 **Detection History** - Track past identifications
- 🎨 **Beautiful UI** - Modern, intuitive design
- 📱 **Offline Support** - Works without internet

### Backend (Authentication Server)
- 🔐 **JWT Authentication** - Secure token-based auth
- 🗄️ **MySQL Database** - Robust data storage
- 🔒 **Password Hashing** - Bcrypt security
- ✅ **Input Validation** - Data integrity
- 🌐 **CORS Support** - Cross-origin requests
- 📝 **User Management** - Profile CRUD operations
- 🛡️ **Error Handling** - Comprehensive error management

## 🛠️ Tech Stack

### Frontend
- **Framework:** React Native + Expo
- **Language:** TypeScript
- **Navigation:** Expo Router
- **State Management:** React Context
- **AI/ML:** TensorFlow Lite
- **API Client:** Axios
- **Storage:** AsyncStorage
- **Internationalization:** i18next
- **AI Chatbot:** Google Gemini API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** express-validator
- **CORS:** cors middleware

## 📁 Project Structure

```
cattle-breed-sih-2025/
├── cattle-breed-app/          # React Native Frontend
│   ├── app/                   # Screens (Expo Router)
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # Context providers
│   │   ├── services/          # API services
│   │   ├── i18n/              # Translations
│   │   └── utils/             # Utilities
│   ├── assets/                # Images, models
│   └── package.json
│
├── Server/                    # Node.js Backend
│   ├── src/
│   │   ├── config/            # Database config
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Auth, error handling
│   │   ├── routes/            # API routes
│   │   └── scripts/           # Database init
│   ├── .env.example           # Environment template
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MySQL** (v5.7 or higher)
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **Git**

### System Requirements

- **Android:** Android 5.0 (API 21) or higher
- **iOS:** iOS 13.0 or higher
- **Web:** Modern browsers (Chrome, Firefox, Safari)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/cattle-breed-sih-2025.git
cd cattle-breed-sih-2025
```

### 2. Backend Setup

```bash
cd Server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Initialize database
npm run init-db
```

**Configure `.env` file:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cattle_breed_db
DB_PORT=3306

JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

PORT=3000
NODE_ENV=development

ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081
```

### 3. Frontend Setup

```bash
cd ../cattle-breed-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL
```

**Configure `.env` file:**
```env
# Backend API
EXPO_PUBLIC_API_URL=http://192.168.1.YOUR_IP:3000

# Gemini AI (optional)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## 🏃‍♂️ Running the Project

### Start Backend Server

```bash
cd Server
npm run dev
```

Server will start at `http://localhost:3000`

### Start Frontend App

```bash
cd cattle-breed-app
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser
- Scan QR code with Expo Go app for physical device

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api/auth
```

### Endpoints

#### **POST** `/register`
Register a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGci..."
  }
}
```

#### **POST** `/login`
Login user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGci..."
  }
}
```

#### **GET** `/me`
Get current user (Protected)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

#### **PUT** `/update`
Update user profile (Protected)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "New Name",
  "phone": "+0987654321"
}
```

## 🖼️ Screenshots

(Add screenshots here)

## 🧪 Testing

### Backend Tests
```bash
cd Server
npm test
```

### Frontend Tests
```bash
cd cattle-breed-app
npm test
```

## 🔒 Security

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication
- SQL injection prevention (parameterized queries)
- Input validation and sanitization
- CORS protection
- Environment variable security

## 🌐 Network Configuration

### For Physical Device
1. Find your computer's IP address:
   ```bash
   ipconfig    # Windows
   ifconfig    # Mac/Linux
   ```

2. Update `cattle-breed-app/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```

3. Update `Server/.env`:
   ```env
   ALLOWED_ORIGINS=exp://YOUR_IP:8081
   ```

4. Ensure both devices are on the same WiFi network

### For Android Emulator
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

### For Web
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## 📚 Documentation

- [Backend API Guide](./Server/README.md)
- [Frontend Setup Guide](./cattle-breed-app/readme/QUICK_START.md)
- [Authentication Integration](./cattle-breed-app/readme/BACKEND_AUTH_INTEGRATION.md)
- [Multilingual Support](./cattle-breed-app/readme/MULTILINGUAL_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Team Name:** [Your Team Name]
- **Smart India Hackathon 2025**

## 🙏 Acknowledgments

- TensorFlow Lite for model deployment
- Google Gemini AI for chatbot
- Expo team for the amazing framework
- All contributors and testers

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

---

**Made with ❤️ for Smart India Hackathon 2025**
