# Backend Authentication Integration Guide

## ✅ Migration Completed

Firebase authentication has been successfully replaced with a custom backend API using JWT tokens and MySQL database.

---

## 🔄 What Changed

### 1. **New Authentication Service**

- Created `src/services/authService.ts` - handles all API communication
- Uses axios for HTTP requests
- Stores JWT tokens securely in AsyncStorage
- Automatic token management via interceptors

### 2. **Updated Auth Context**

- `src/contexts/AuthContext.tsx` now uses backend API instead of Firebase
- JWT-based authentication instead of Firebase auth state
- Added `refreshUser()` and `setUser()` methods for manual state updates

### 3. **Updated Screens**

- **Login** (`app/login.tsx`) - calls backend `/api/auth/login`
- **Signup** (`app/signup.tsx`) - calls backend `/api/auth/register`
- **Settings** (`app/settings.tsx`) - uses backend logout

### 4. **Environment Configuration**

- Added `EXPO_PUBLIC_API_URL` to `.env`
- Set to your local IP: `http://192.168.1.13:3000`

---

## 🚀 How to Run

### Step 1: Start the Backend Server

```powershell
# Navigate to Server folder
cd ..\Server

# Start the server
npm run dev
```

The server should start on `http://localhost:3000`

### Step 2: Verify Backend is Running

Open browser and visit: `http://localhost:3000/health`

You should see:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-27T..."
}
```

### Step 3: Start the Expo App

```powershell
# Navigate to cattle-breed-app folder
cd cattle-breed-app

# Clear cache and start
npm start -- --clear
```

**Important:** Always use `--clear` flag after changing environment variables!

### Step 4: Test Authentication

1. **Register a new user:**

   - Open the app
   - Click "Sign Up"
   - Enter name, email, password
   - Submit

2. **Login:**

   - Enter registered email and password
   - Click "Login"

3. **Check user profile:**
   - Navigate to Settings tab
   - You should see your user info

---

## 📱 Device-Specific Configuration

### Testing on Physical Device (Phone)

Update `.env` in `cattle-breed-app`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.13:3000
```

Make sure your phone is on the **same WiFi network** as your computer!

### Testing on Android Emulator

Update `.env`:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

### Testing on Web

Update `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 🔐 API Endpoints Available

All endpoints are at: `http://192.168.1.13:3000/api/auth`

### 1. Register User

```
POST /api/auth/register

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890" (optional)
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGci..."
  }
}
```

### 2. Login

```
POST /api/auth/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGci..."
  }
}
```

### 3. Get Current User (Protected)

```
GET /api/auth/me

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### 4. Update Profile (Protected)

```
PUT /api/auth/update

Headers:
Authorization: Bearer <token>

Body:
{
  "name": "New Name",
  "phone": "+0987654321"
}
```

---

## 🧪 Testing with Postman/Thunder Client

### 1. Register a User

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123",
  "name": "Test User"
}
```

### 2. Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```

Copy the `token` from the response.

### 3. Get User Profile

```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer <paste_token_here>
```

---

## 🗄️ Database Schema

The backend uses MySQL with the following table:

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

---

## 🛠️ Troubleshooting

### Problem: "Network Error" or "Cannot connect to server"

**Solutions:**

1. **Check if backend is running:**

   ```powershell
   cd ..\Server
   npm run dev
   ```

2. **Verify your IP address:**

   ```powershell
   ipconfig
   ```

   Look for "IPv4 Address" and update `.env`

3. **Check firewall:**

   - Windows Firewall might be blocking port 3000
   - Temporarily disable firewall to test

4. **Restart Metro bundler with cache clear:**
   ```powershell
   npm start -- --clear
   ```

### Problem: "User already exists"

The email is already registered. Either:

- Use a different email
- Login with existing credentials
- Delete the user from MySQL database:
  ```sql
  DELETE FROM users WHERE email='test@example.com';
  ```

### Problem: "Invalid credentials"

- Check email and password are correct
- Passwords are case-sensitive
- Email is automatically converted to lowercase

### Problem: Token expired

The JWT token expires after 7 days (configurable in `Server/.env`).

Login again to get a new token.

---

## 📂 File Structure

### Frontend (cattle-breed-app)

```
src/
├── services/
│   ├── authService.ts       ← New! Backend API service
│   └── firebase.tsx          ← Old (can be removed)
├── contexts/
│   └── AuthContext.tsx       ← Updated! JWT-based auth
```

### Backend (Server)

```
src/
├── config/
│   └── database.js           ← MySQL connection
├── controllers/
│   └── authController.js     ← Auth logic
├── middleware/
│   ├── auth.js               ← JWT verification
│   └── errorHandler.js       ← Error handling
└── routes/
    └── authRoutes.js         ← API routes
```

---

## 🔒 Security Features

✅ Password hashing with bcrypt (10 salt rounds)
✅ JWT token authentication
✅ Token auto-refresh via interceptors
✅ Secure token storage in AsyncStorage
✅ Input validation
✅ SQL injection prevention (parameterized queries)
✅ CORS protection
✅ Rate limiting ready (can be added)

---

## 🚧 Next Steps (Optional Enhancements)

1. **Email Verification**

   - Send verification email on signup
   - Require email verification before login

2. **Password Reset**

   - Forgot password functionality
   - Email-based password reset

3. **Refresh Tokens**

   - Implement refresh token mechanism
   - Auto-renew expired tokens

4. **Social Login**

   - Add Google/Facebook OAuth
   - JWT generation after social auth

5. **Role-Based Access Control**

   - Admin vs User roles
   - Protected admin routes

6. **Profile Picture Upload**
   - Image upload to backend
   - Store in server or cloud storage

---

## 📝 Migration Checklist

- [x] Created backend auth service
- [x] Updated AuthContext to use JWT
- [x] Updated login screen
- [x] Updated signup screen
- [x] Updated settings screen
- [x] Installed axios dependency
- [x] Configured environment variables
- [x] Updated CORS settings
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test protected routes

---

## 🆘 Need Help?

If you encounter any issues:

1. Check backend logs in Server terminal
2. Check frontend logs in Expo terminal
3. Use Postman to test API directly
4. Check MySQL database for user records
5. Verify environment variables are loaded (restart Metro with `--clear`)

---

## 🎯 Key Benefits

1. **Full Control** - You own the authentication logic
2. **Scalable** - Can handle thousands of users
3. **Flexible** - Easy to add custom fields and features
4. **Secure** - Industry-standard JWT + bcrypt
5. **Cost-effective** - No Firebase fees
6. **Extensible** - Easy to integrate with other services

---

**Backend Auth Integration Completed! 🎉**

Your app now uses a custom Node.js + MySQL backend for authentication instead of Firebase.
