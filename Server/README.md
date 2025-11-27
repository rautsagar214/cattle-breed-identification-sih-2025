# Cattle Breed Authentication Server

A secure authentication backend API built with Node.js, Express, MySQL, and JWT.

## Features

- ✅ User registration with email and password
- ✅ User login with JWT token generation
- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Protected routes with middleware
- ✅ User profile management
- ✅ MySQL database integration
- ✅ CORS enabled for mobile apps
- ✅ Input validation and error handling

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd Server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cattle_breed_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081
```

### 3. Initialize Database

Run the database initialization script:

```bash
npm run init-db
```

This will:

- Create the database (if it doesn't exist)
- Create `users` table
- Create `sessions` table

### 4. Start the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Base URL

```
http://localhost:3000/api/auth
```

### 1. Register User

**POST** `/api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Current User (Protected)

**GET** `/api/auth/me`

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "role": "user",
      "created_at": "2025-11-27T12:00:00.000Z"
    }
  }
}
```

### 4. Update Profile (Protected)

**PUT** `/api/auth/update`

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**

```json
{
  "name": "Jane Doe",
  "phone": "+0987654321"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Jane Doe",
      "phone": "+0987654321",
      "role": "user"
    }
  }
}
```

### 5. Health Check

**GET** `/health`

**Response (200):**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-27T12:00:00.000Z"
}
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
```

## Integrating with React Native/Expo Frontend

### 1. Install axios in your frontend:

```bash
cd cattle-breed-app
npm install axios
```

### 2. Create an API service file (`src/services/authService.js`):

```javascript
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.100:3000/api/auth"; // Change to your server IP

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const register = async (userData) => {
  const response = await api.post("/register", userData);
  if (response.data.data.token) {
    await AsyncStorage.setItem("token", response.data.data.token);
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post("/login", credentials);
  if (response.data.data.token) {
    await AsyncStorage.setItem("token", response.data.data.token);
  }
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put("/update", userData);
  return response.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem("token");
};
```

### 3. Usage in your React Native screens:

```javascript
import { login, register } from "../services/authService";

// In your login screen
const handleLogin = async () => {
  try {
    const result = await login({ email, password });
    console.log("Login successful:", result.data.user);
    // Navigate to home screen
  } catch (error) {
    console.error("Login failed:", error.response?.data?.message);
  }
};
```

## Error Codes

- `200` - Success
- `201` - Created (registration successful)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials or token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (user already exists)
- `500` - Internal Server Error

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token authentication
- ✅ Token expiration (configurable)
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS protection
- ✅ Role-based access control ready

## Project Structure

```
Server/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   └── errorHandler.js      # Error handling middleware
│   ├── routes/
│   │   └── authRoutes.js        # API route definitions
│   ├── scripts/
│   │   └── initDatabase.js      # Database initialization
│   └── server.js                # Express server entry point
├── .env                          # Environment variables (not in git)
├── .env.example                  # Example environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env` file
- Ensure database port (3306) is not blocked

### CORS Errors

- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
- For mobile development, use your computer's IP address (not localhost)

### Token Issues

- Ensure JWT_SECRET is set in `.env`
- Check token expiration time
- Verify token is sent in `Authorization: Bearer <token>` header

## Testing with Postman/Thunder Client

1. **Register**: POST `http://localhost:3000/api/auth/register`
2. **Login**: POST `http://localhost:3000/api/auth/login`
3. Copy the token from login response
4. **Get Profile**: GET `http://localhost:3000/api/auth/me`
   - Add header: `Authorization: Bearer <token>`

## Next Steps

- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add refresh token mechanism
- [ ] Implement rate limiting
- [ ] Add logging system
- [ ] Create admin panel APIs
- [ ] Add user roles and permissions

## Support

For issues or questions, please check the troubleshooting section or contact the development team.
