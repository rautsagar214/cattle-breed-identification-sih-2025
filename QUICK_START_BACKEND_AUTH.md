# 🚀 Quick Start Guide - Backend Authentication

## ✅ What's Been Done

Firebase authentication has been completely replaced with a custom backend API:

1. ✅ Backend server created in `Server/` folder
2. ✅ MySQL database initialized with users table
3. ✅ Frontend authentication service updated
4. ✅ Login/Signup/Settings screens updated
5. ✅ JWT token authentication implemented
6. ✅ Environment variables configured

---

## 🎯 How to Test

### Terminal 1: Start Backend Server

```powershell
cd C:\Users\Gauri\Desktop\SIH\Server
npm run dev
```

You should see:

```
✅ MySQL Database connected successfully
🚀 Server is running on port 3000
🔐 Auth API: http://localhost:3000/api/auth
```

### Terminal 2: Start React Native App

```powershell
cd C:\Users\Gauri\Desktop\SIH\cattle-breed-app
npm start -- --clear
```

Press:

- `a` for Android
- `i` for iOS
- `w` for Web

---

## 📱 Testing the App

### 1. Register New User

1. Open the app
2. Click **"Sign Up"**
3. Enter:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123`
   - Confirm Password: `test123`
4. Click **Sign Up** button

**Expected:** You should be logged in and redirected to the home screen.

### 2. Login

1. If logged in, go to Settings and logout
2. Click **"Login"**
3. Enter:
   - Email: `test@example.com`
   - Password: `test123`
4. Click **Login** button

**Expected:** You should be logged in and see the home screen.

### 3. Check User Profile

1. Navigate to **Settings** tab
2. You should see your user info (name and email)

### 4. Logout

1. In Settings, click **Logout** button
2. Confirm logout

**Expected:** You should be redirected to the login screen.

---

## 🔧 Configuration

### Backend API URL

Your backend is configured for:

- **IP Address:** `192.168.1.13:3000`
- **Localhost:** `localhost:3000`

#### For Physical Device (Phone):

In `cattle-breed-app/.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.13:3000
```

Make sure your phone is on the **same WiFi** as your computer!

#### For Android Emulator:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

#### For Web:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**After changing .env, restart with:**

```powershell
npm start -- --clear
```

---

## 🧪 Testing with API Client (Postman/Thunder Client)

### 1. Health Check

```http
GET http://localhost:3000/health
```

Response:

```json
{
  "success": true,
  "message": "Server is running"
}
```

### 2. Register

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

### 3. Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123"
}
```

Copy the `token` from response.

### 4. Get User Info

```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ⚠️ Common Issues

### Issue: "Network Error"

**Solutions:**

1. Check backend is running (Terminal 1)
2. Verify your IP in `.env` matches your computer's IP:
   ```powershell
   ipconfig
   ```
3. Restart Metro with cache clear:
   ```powershell
   npm start -- --clear
   ```
4. Check firewall isn't blocking port 3000

### Issue: "User already exists"

Use a different email or delete from database:

```sql
DELETE FROM users WHERE email='test@example.com';
```

### Issue: "Cannot connect to database"

1. Make sure MySQL is running
2. Check credentials in `Server/.env`:
   ```env
   DB_USER=root
   DB_PASSWORD=sagar123
   DB_NAME=cattle_breed_db
   ```
3. Run database initialization:
   ```powershell
   cd Server
   npm run init-db
   ```

---

## 📊 Database Access

View registered users in MySQL:

```sql
USE cattle_breed_db;
SELECT id, email, name, created_at FROM users;
```

---

## 🎉 Success Criteria

You know everything is working when:

1. ✅ Backend server starts without errors
2. ✅ Can register a new user from the app
3. ✅ Can login with registered credentials
4. ✅ User info shows in Settings tab
5. ✅ Can logout successfully
6. ✅ JWT token is stored in AsyncStorage

---

## 📚 Documentation

For detailed information, see:

- `readme/BACKEND_AUTH_INTEGRATION.md` - Complete integration guide
- `Server/README.md` - Backend API documentation

---

## 🔄 Architecture Overview

```
┌─────────────────┐
│  React Native   │
│   Expo App      │
│  (Frontend)     │
└────────┬────────┘
         │ HTTP/HTTPS
         │ (axios)
         ▼
┌─────────────────┐
│   Node.js API   │
│   Express.js    │
│  (Backend)      │
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│  MySQL Database │
│   (Storage)     │
└─────────────────┘
```

**Flow:**

1. User enters credentials in app
2. App sends HTTP request to backend
3. Backend validates and generates JWT token
4. Token stored in AsyncStorage
5. Token sent with all future requests
6. Backend validates token and returns data

---

**Ready to test! Your backend authentication is fully integrated. 🚀**
