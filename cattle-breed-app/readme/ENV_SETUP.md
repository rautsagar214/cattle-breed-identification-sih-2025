# 🔐 Environment Variables Setup Guide

## Why Use Environment Variables?

**Current Problem:**

```typescript
// ❌ API keys hardcoded in source code
export const GEMINI_API_KEY = "AIzaSyDjXP6mS-h_Lcwbc-i3uSdoonZJcPZTRRw";
```

**Risks:**

- API keys visible in Git history
- Keys extractable from app bundle
- Keys exposed if repository is public
- Cannot use different keys for dev/staging/production

**Solution:** Environment Variables

---

## Step 1: Create .env File (2 minutes)

Create file: `cattle-breed-app/.env`

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDjXP6mS-h_Lcwbc-i3uSdoonZJcPZTRRw
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=cattle-breed-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=cattle-breed-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=cattle-breed-id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123

# Google Gemini AI
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyDjXP6mS-h_Lcwbc-i3uSdoonZJcPZTRRw

# App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

**Note:** Prefix with `EXPO_PUBLIC_` to make variables accessible in Expo app

---

## Step 2: Add .env to .gitignore (1 minute)

```bash
# Add to .gitignore
cd cattle-breed-app
echo "" >> .gitignore
echo "# Environment variables" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

---

## Step 3: Create .env.example (Template)

Create file: `cattle-breed-app/.env.example`

```env
# Firebase Configuration
# Get these from: https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123

# Google Gemini AI
# Get from: https://makersuite.google.com/app/apikey
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

**Purpose:** Team members can copy this and fill in their own keys

---

## Step 4: Update constants.tsx (3 minutes)

**Before:**

```typescript
// ❌ Hardcoded API keys
export const GEMINI_API_KEY = "AIzaSyDjXP6mS-h_Lcwbc-i3uSdoonZJcPZTRRw";

export const firebaseConfig = {
  apiKey: "AIzaSyDjXP6mS-h_Lcwbc-i3uSdoonZJcPZTRRw",
  authDomain: "cattle-breed-id.firebaseapp.com",
  // ...
};
```

**After:**

```typescript
// ✅ Read from environment variables
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Validation: Ensure keys are loaded
if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not found in environment variables");
}

if (!firebaseConfig.apiKey) {
  console.error("❌ Firebase configuration missing! Check .env file");
}
```

---

## Step 5: Install dotenv (Optional - for better IDE support)

```bash
npm install --save-dev dotenv
```

---

## Step 6: Test Environment Variables

```typescript
// Test in any component:
useEffect(() => {
  console.log("Environment:", process.env.EXPO_PUBLIC_APP_ENV);
  console.log(
    "Gemini Key:",
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ? "Loaded ✅" : "Missing ❌"
  );
  console.log(
    "Firebase Key:",
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? "Loaded ✅" : "Missing ❌"
  );
}, []);
```

**Expected Output:**

```
Environment: development
Gemini Key: Loaded ✅
Firebase Key: Loaded ✅
```

---

## Step 7: Different Environments

### Development (.env)

```env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_GEMINI_API_KEY=dev_key_here
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Staging (.env.staging)

```env
EXPO_PUBLIC_APP_ENV=staging
EXPO_PUBLIC_GEMINI_API_KEY=staging_key_here
EXPO_PUBLIC_API_BASE_URL=https://staging-api.example.com
```

### Production (.env.production)

```env
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_GEMINI_API_KEY=prod_key_here
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

**Load specific environment:**

```bash
# Use staging environment
cp .env.staging .env
expo start

# Use production environment
cp .env.production .env
expo build:android
```

---

## Security Best Practices

### ✅ DO

1. **Use .env for API keys**

   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
   ```

2. **Add .env to .gitignore**

   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

3. **Provide .env.example template**

   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
   ```

4. **Validate environment variables**

   ```typescript
   if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
     throw new Error("Missing GEMINI_API_KEY");
   }
   ```

5. **Use different keys for dev/prod**

   ```env
   # Development: Lower quota, testing only
   EXPO_PUBLIC_GEMINI_API_KEY=dev_key

   # Production: Higher quota, rate limited
   EXPO_PUBLIC_GEMINI_API_KEY=prod_key
   ```

### ❌ DON'T

1. **DON'T commit .env to Git**

   ```bash
   # If accidentally committed:
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   ```

2. **DON'T hardcode API keys**

   ```typescript
   // ❌ Bad
   const API_KEY = "AIzaSy...";

   // ✅ Good
   const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
   ```

3. **DON'T log full API keys**

   ```typescript
   // ❌ Bad
   console.log("API Key:", API_KEY);

   // ✅ Good
   console.log("API Key:", maskApiKey(API_KEY));
   ```

4. **DON'T expose backend keys in frontend**

   ```typescript
   // ❌ Bad - Database admin key in React Native
   const ADMIN_KEY = process.env.EXPO_PUBLIC_ADMIN_KEY;

   // ✅ Good - Only public keys in frontend
   const PUBLIC_KEY = process.env.EXPO_PUBLIC_API_KEY;
   ```

---

## Troubleshooting

### Issue: Environment variables not loading

**Solution 1: Restart Expo**

```bash
# Clear cache and restart
expo start -c
```

**Solution 2: Verify .env location**

```
cattle-breed-app/
├── .env          ← Should be here (project root)
├── app/
├── src/
└── package.json
```

**Solution 3: Check variable names**

```env
# ✅ Correct - Starts with EXPO_PUBLIC_
EXPO_PUBLIC_GEMINI_API_KEY=abc123

# ❌ Wrong - No EXPO_PUBLIC_ prefix
GEMINI_API_KEY=abc123
```

### Issue: Variables undefined in app

**Cause:** Expo only exposes variables with `EXPO_PUBLIC_` prefix

**Solution:**

```env
# ❌ Not accessible
API_KEY=abc123

# ✅ Accessible in app
EXPO_PUBLIC_API_KEY=abc123
```

### Issue: Old values still loading

**Solution: Clear cache**

```bash
# Method 1: Expo CLI
expo start -c

# Method 2: Clear node cache
rm -rf node_modules/.cache
npm start
```

---

## For Team Members

### First Time Setup

1. **Clone repository**

   ```bash
   git clone <repo-url>
   cd cattle-breed-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create .env from template**

   ```bash
   cp .env.example .env
   ```

4. **Fill in your API keys**

   - Get Firebase keys from [Firebase Console](https://console.firebase.google.com/)
   - Get Gemini key from [Google AI Studio](https://makersuite.google.com/app/apikey)

5. **Start app**
   ```bash
   npm start
   ```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/build.yml
name: Build App

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Create .env file
        run: |
          echo "EXPO_PUBLIC_GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}" >> .env
          echo "EXPO_PUBLIC_FIREBASE_API_KEY=${{ secrets.FIREBASE_API_KEY }}" >> .env

      - name: Build app
        run: |
          npm install
          expo build:android
```

**Add secrets in GitHub:**
Settings → Secrets → Actions → New repository secret

---

## Summary

**Setup Time: 5 minutes**

**Before:**

```typescript
const API_KEY = "AIzaSy..."; // ❌ Hardcoded, insecure
```

**After:**

```typescript
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; // ✅ From .env, secure
```

**Benefits:**

- ✅ API keys not in Git
- ✅ Different keys for dev/prod
- ✅ Team members use their own keys
- ✅ Easier to rotate keys
- ✅ More secure

**Files to create:**

1. `.env` (contains actual keys - NOT in Git)
2. `.env.example` (template - IN Git)
3. Update `.gitignore` (ignore .env files)
4. Update `constants.tsx` (use process.env)

---

**Resources:**

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [12 Factor App Config](https://12factor.net/config)
