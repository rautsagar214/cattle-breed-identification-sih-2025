# 🔥 Firebase Security Rules Deployment Guide

## Quick Start (5 Minutes)

### Step 1: Initialize Firebase CLI

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
cd cattle-breed-app
firebase init firestore
```

**During initialization:**

- Select: "Use an existing project"
- Choose: Your Firebase project from list
- Firestore rules file: Press Enter (use default `firestore.rules`)
- Firestore indexes file: Press Enter (use default `firestore.indexes.json`)

---

### Step 2: Deploy Security Rules

```bash
# Deploy only Firestore rules (fast)
firebase deploy --only firestore:rules

# Expected output:
# ✔  Deploy complete!
# Resource: https://console.firebase.google.com/project/<your-project>/firestore
```

---

### Step 3: Verify Deployment

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules**
4. You should see the deployed rules
5. Click **Publish** if needed

---

## 🧪 Test Security Rules

### Test 1: Authenticated Access (Should PASS)

```typescript
// In your app, after login:
const result = await saveResult({
  userId: currentUser.uid,
  breedName: "Gir",
  confidence: 0.95,
  imageUrl: "data:image/jpeg;base64,...",
  timestamp: new Date(),
});
// ✅ Should succeed - user is authenticated and owns the document
```

### Test 2: Unauthorized Access (Should FAIL)

```typescript
// Try to read another user's data:
const db = getFirestore();
const otherUserDoc = doc(db, "detectionResults", "other-user-doc-id");
const snapshot = await getDoc(otherUserDoc);
// ❌ Should fail with "Missing or insufficient permissions"
```

### Test 3: Image Size Validation (Should FAIL)

```typescript
// Try to upload >5MB image:
const largeImageUrl = "data:image/jpeg;base64," + "A".repeat(7 * 1024 * 1024);
await saveResult({
  userId: currentUser.uid,
  imageUrl: largeImageUrl,
  // ...other fields
});
// ❌ Should fail - exceeds 5MB limit
```

### Test 4: Rate Limiting (Should FAIL on 2nd attempt)

```typescript
// Upload 1st image
await saveResult({...}); // ✅ Success

// Immediately upload 2nd image
await saveResult({...}); // ❌ Should fail - rate limited (1 min cooldown)

// Wait 1 minute, try again
setTimeout(async () => {
  await saveResult({...}); // ✅ Success
}, 60000);
```

---

## 🔍 Firebase Rules Simulator

Test rules without deploying:

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to **Firestore Database** → **Rules**
3. Click **Rules Playground**
4. Set simulation type: `get`, `create`, `update`, `delete`
5. Set location: `detectionResults/{docId}`
6. Set auth: `Authenticated` with UID
7. Set data:

```json
{
  "userId": "test-user-123",
  "breedName": "Gir",
  "confidence": 0.95,
  "imageUrl": "data:...",
  "timestamp": "2024-11-18T10:00:00Z"
}
```

8. Click **Run** → Should show "✅ Allowed" or "❌ Denied"

---

## 📊 What These Rules Do

### ✅ ALLOWED Operations

1. **User reads their own detection results**

   ```typescript
   // ✅ Allowed
   const results = await getResults(currentUser.uid);
   ```

2. **User creates new detection result**

   ```typescript
   // ✅ Allowed (if under 5MB and not rate limited)
   await saveResult({
     userId: currentUser.uid,
     breedName: "Gir",
     confidence: 0.95,
     imageUrl: "base64...",
     timestamp: new Date(),
   });
   ```

3. **User deletes their own data**

   ```typescript
   // ✅ Allowed
   await deleteDoc(doc(db, "detectionResults", myDocId));
   ```

4. **User reads/writes their own profile**
   ```typescript
   // ✅ Allowed
   await setDoc(doc(db, "users", currentUser.uid), {
     email: "test@test.com",
     createdAt: new Date(),
   });
   ```

### ❌ BLOCKED Operations

1. **Unauthenticated access**

   ```typescript
   // ❌ Blocked - Must be logged in
   await getResults("any-user-id");
   ```

2. **Reading other user's data**

   ```typescript
   // ❌ Blocked - Can't read other user's results
   await getResults("other-user-id");
   ```

3. **Uploading files >5MB**

   ```typescript
   // ❌ Blocked - Image too large
   await saveResult({
     imageUrl: "base64...", // 10MB image
   });
   ```

4. **Rapid uploads (rate limiting)**

   ```typescript
   // ❌ Blocked - Must wait 1 minute between uploads
   await saveResult({...}); // Upload 1 ✅
   await saveResult({...}); // Upload 2 (immediate) ❌
   ```

5. **Updating detection results**

   ```typescript
   // ❌ Blocked - Detection results are immutable
   await updateDoc(doc(db, "detectionResults", docId), {
     confidence: 0.99,
   });
   ```

6. **Writing to analytics collection**
   ```typescript
   // ❌ Blocked - Only server can write analytics
   await setDoc(doc(db, 'analytics', 'stats'), {...});
   ```

---

## 🛡️ Security Features Explained

### 1. User Isolation

```javascript
function isOwner(userId) {
  return request.auth.uid == userId;
}
```

- Ensures users can only access their own data
- Prevents data leaks between users

### 2. Image Size Limit (DoS Prevention)

```javascript
function isValidImageSize() {
  return request.resource.size < 5 * 1024 * 1024; // 5MB
}
```

- Prevents denial-of-service via large file uploads
- Keeps database costs low

### 3. Rate Limiting

```javascript
function isNotRateLimited() {
  return request.time > resource.data.lastWrite + duration.value(1, "m");
}
```

- Prevents spam/abuse
- 1 minute cooldown between uploads
- **Note:** Currently disabled in rules (add to `create` condition if needed)

### 4. Data Validation

```javascript
request.resource.data.keys().hasAll(["userId", "breedName", "confidence"]);
```

- Ensures all required fields are present
- Prevents incomplete/malformed data

### 5. Immutable Records

```javascript
allow update: if false;
```

- Detection results cannot be modified after creation
- Maintains data integrity and audit trail

---

## 🚨 Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause:** User is not authenticated or trying to access unauthorized data

**Solution:**

```typescript
// Check if user is logged in
const user = auth.currentUser;
if (!user) {
  console.error("User not authenticated");
  return;
}

// Verify userId matches current user
if (data.userId !== user.uid) {
  console.error("UserId mismatch");
  return;
}
```

### Error: "Document exceeds maximum size"

**Cause:** Image is >5MB

**Solution:**

```typescript
// Compress image before upload
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

const compressed = await manipulateAsync(
  imageUri,
  [{ resize: { width: 1024 } }], // Resize to max 1024px width
  { compress: 0.7, format: SaveFormat.JPEG } // 70% quality
);
```

### Error: "Permission denied" on read

**Cause:** Trying to read another user's data

**Solution:**

```typescript
// Only fetch current user's results
const userId = auth.currentUser?.uid;
if (!userId) return;

const q = query(
  collection(db, "detectionResults"),
  where("userId", "==", userId) // Filter by current user
);
const snapshot = await getDocs(q);
```

---

## 🔄 Updating Rules

### Modify Rules

1. Edit `firestore.rules` file
2. Test locally with Firebase Emulator:
   ```bash
   firebase emulators:start --only firestore
   ```
3. Deploy changes:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Rollback Rules

```bash
# View deployment history
firebase firestore:releases:list

# Rollback to previous version
firebase firestore:releases:rollback <release-id>
```

---

## 📚 Additional Security Measures

### Firebase App Check (Recommended)

Protects backend APIs from abuse by bots:

```bash
# Enable in Firebase Console
# Dashboard → Build → App Check → Get Started
```

```typescript
// In app initialization
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("YOUR_RECAPTCHA_KEY"),
  isTokenAutoRefreshEnabled: true,
});
```

### Storage Rules (If using Firebase Storage)

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow write: if request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
  }
}
```

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Firebase CLI installed (`firebase --version`)
- [ ] Logged in to Firebase (`firebase login`)
- [ ] Project initialized (`firebase.json` exists)
- [ ] Rules file created (`firestore.rules`)
- [ ] Rules tested locally (`firebase emulators:start`)
- [ ] Rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Rules verified in Firebase Console
- [ ] Manual testing performed (auth, unauthorized access, rate limiting)
- [ ] App tested with deployed rules
- [ ] Rollback plan documented

---

## 🎯 Summary

**Time to Deploy: 5 minutes**

```bash
# Quick deployment commands:
firebase login
cd cattle-breed-app
firebase init firestore
firebase deploy --only firestore:rules
```

**Impact:**

- ✅ Users can only access their own data
- ✅ Prevents unauthorized reads/writes
- ✅ Blocks large file uploads (>5MB)
- ✅ Enforces data validation
- ✅ Maintains data integrity (immutable records)

**Before Hackathon:**

1. Deploy these rules (5 min)
2. Test authentication flow (10 min)
3. Test unauthorized access (5 min)
4. Document in presentation (2 min)

---

**Need Help?**

- [Firebase Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firestore Security Best Practices](https://firebase.google.com/docs/firestore/security/get-started)
