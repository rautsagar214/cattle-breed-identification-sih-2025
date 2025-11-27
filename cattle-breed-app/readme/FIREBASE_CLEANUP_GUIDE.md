# Firebase Cleanup Guide

## Overview

Now that backend authentication is integrated, you can optionally remove Firebase dependencies to reduce bundle size.

---

## ⚠️ Before You Remove Firebase

**Keep Firebase if:**

- You're using Firebase Storage for image uploads
- You're using Firestore for storing detection results
- You want to keep it as a backup authentication method

**Remove Firebase if:**

- You only used it for authentication
- You want to reduce app size
- You're moving all features to your backend

---

## Option 1: Keep Firebase for Storage Only

If you still need Firebase Storage for images but not authentication, keep the Firebase package but remove auth imports.

### Files to Update:

1. **src/services/firebase.tsx**
   - Remove all auth-related imports and functions
   - Keep storage and firestore functions

---

## Option 2: Complete Firebase Removal

If you don't need Firebase at all, follow these steps:

### 1. Remove Firebase Package

```powershell
cd cattle-breed-app
npm uninstall firebase
```

### 2. Delete Firebase Files

Delete these files:

```
src/services/firebase.tsx
readme/FIREBASE_*.md (all Firebase documentation)
```

### 3. Remove Firebase from .env

In `cattle-breed-app/.env`, remove:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### 4. Update Import Statements

If any other files still import from Firebase, update them:

**Search for:**

```typescript
import { ... } from '../services/firebase';
```

**Files that might need updates:**

- `app/upload.tsx` (if using Firebase Storage)
- Any component using `uploadImage` or `saveResult`

---

## Alternative: Implement Image Upload in Backend

If you were using Firebase Storage for images, you can implement it in your backend:

### Backend Implementation (Node.js)

```javascript
// Install multer for file uploads
npm install multer

// In your backend (e.g., src/routes/uploadRoutes.js)
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = `/uploads/${req.file.filename}`;

    // Save to database
    await db.query(
      'INSERT INTO detections (user_id, image_url, breed, confidence) VALUES (?, ?, ?, ?)',
      [req.user.id, imageUrl, req.body.breed, req.body.confidence]
    );

    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Frontend Implementation (React Native)

```typescript
// New service: src/services/uploadService.ts
import axios from "axios";
import { getToken } from "./authService";

export const uploadImage = async (
  uri: string,
  breed: string,
  confidence: number
) => {
  const formData = new FormData();
  formData.append("image", {
    uri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as any);
  formData.append("breed", breed);
  formData.append("confidence", confidence.toString());

  const token = await getToken();

  const response = await axios.post(
    `${process.env.EXPO_PUBLIC_API_URL}/api/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
```

---

## Current Firebase Usage in Your App

Based on the codebase, Firebase is currently used in:

1. **Authentication** ✅ REPLACED

   - `loginUser()` → Now uses backend
   - `registerUser()` → Now uses backend
   - `logoutUser()` → Now uses backend

2. **Image Storage** ⚠️ STILL IN USE?

   - `uploadImage()` in `app/upload.tsx`
   - Check if this is actively used

3. **Firestore Database** ⚠️ STILL IN USE?
   - `saveResult()` for storing detection results
   - Check if this is actively used

---

## Recommended Approach

### Phase 1: Authentication (COMPLETED ✅)

- Backend JWT authentication implemented
- Firebase auth removed from login/signup

### Phase 2: Storage Migration (NEXT)

1. Implement image upload in backend
2. Update `app/upload.tsx` to use backend
3. Test image uploads work

### Phase 3: Database Migration (NEXT)

1. Create database table for detection results
2. Implement API endpoints for saving/fetching results
3. Update frontend to use backend API
4. Migrate existing Firestore data (if any)

### Phase 4: Complete Removal (FINAL)

1. Remove Firebase package
2. Delete Firebase files
3. Clean up environment variables

---

## What NOT to Touch

Keep these as they are (not related to Firebase):

- TensorFlow Lite model
- i18n translations
- UI components
- Navigation
- Themes

---

## Size Savings

Removing Firebase will reduce your app size by approximately:

- **Firebase package:** ~300KB
- **Unused Firebase modules:** ~500KB
- **Total savings:** ~800KB - 1MB

---

## Testing After Removal

After removing Firebase, test:

1. ✅ Login still works
2. ✅ Signup still works
3. ✅ Logout still works
4. ✅ Image upload works (if migrated)
5. ✅ Detection history works (if migrated)
6. ✅ App builds successfully
7. ✅ No console errors

---

## Rollback Plan

If something breaks:

1. **Reinstall Firebase:**

   ```powershell
   npm install firebase
   ```

2. **Restore Firebase files from git:**

   ```powershell
   git checkout src/services/firebase.tsx
   ```

3. **Restore environment variables**

---

## Need Help?

If you encounter issues during Firebase removal:

1. Check console logs for import errors
2. Search codebase for remaining Firebase references:
   ```powershell
   cd cattle-breed-app
   Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String "firebase" | Select-Object -Unique Path
   ```
3. Keep Firebase until all features are migrated

---

**Current Status:** Authentication migrated ✅  
**Next Step:** Decide if you need Firebase for Storage/Firestore or can remove it completely.
