# 🔒 Switching Firebase from Test Mode to Production Mode

## Current Status: Test Mode ✅

Your Firebase project is currently in **test mode**, which means:

- ✅ Anyone can read/write data (good for learning)
- ⚠️ No security (temporary - expires after 30 days)
- 🎓 Perfect for development and testing

---

## Why Switch to Production Mode?

When you're ready to deploy your app to real users, you need production mode:

- 🔒 Only authenticated users can access their own data
- 🛡️ Prevents unauthorized access
- 📊 Better control over who can read/write data
- 🚫 Stops malicious users from deleting/modifying data

---

## When to Switch?

**Stay in Test Mode if:**

- ✅ You're still learning Firebase
- ✅ Building/testing features
- ✅ App is not public yet
- ✅ No sensitive user data yet

**Switch to Production Mode when:**

- 🚀 Ready to launch app to users
- 👥 Adding real user accounts
- 💾 Storing sensitive data
- 📱 Publishing to App Store/Play Store

---

## How to Switch to Production Mode

### Step 1: Update Firestore Security Rules (Database)

1. **Go to Firebase Console:**

   - https://console.firebase.google.com/
   - Select your project: `cattle-breed-app`

2. **Navigate to Firestore Rules:**

   - Click "Firestore Database" in left sidebar
   - Click the "Rules" tab at the top

3. **Replace Test Mode Rules with Production Rules:**

   **Current Test Mode Rules:**

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2025, 12, 31);
       }
     }
   }
   ```

   **Production Mode Rules (Secure):**

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       // Detection Results Collection
       match /detectionResults/{resultId} {
         // Users can only read their own results
         allow read: if request.auth != null &&
                       request.auth.uid == resource.data.userId;

         // Users can only create results for themselves
         allow create: if request.auth != null &&
                         request.auth.uid == request.resource.data.userId;

         // Users can update/delete their own results
         allow update, delete: if request.auth != null &&
                                 request.auth.uid == resource.data.userId;
       }

       // User Profiles Collection (if you add it later)
       match /users/{userId} {
         // Users can only read/write their own profile
         allow read, write: if request.auth != null &&
                              request.auth.uid == userId;
       }

       // Deny all other access by default
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

4. **Click "Publish"** button to save the rules

✅ **Firestore is now secured!**

---

### Step 2: Update Firebase Storage Security Rules (Images)

1. **Navigate to Storage Rules:**

   - Click "Storage" in left sidebar
   - Click the "Rules" tab at the top

2. **Replace Test Mode Rules with Production Rules:**

   **Current Test Mode Rules:**

   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.time < timestamp.date(2025, 12, 31);
       }
     }
   }
   ```

   **Production Mode Rules (Secure):**

   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {

       // Cattle Photos - users can only access their own photos
       match /cattle_images/{userId}/{filename} {
         // Anyone logged in can read (for sharing features)
         allow read: if request.auth != null;

         // Users can only upload to their own folder
         allow write: if request.auth != null &&
                        request.auth.uid == userId &&
                        request.resource.size < 10 * 1024 * 1024 && // Max 10MB
                        request.resource.contentType.matches('image/.*'); // Only images
       }

       // User Profile Pictures
       match /profile_photos/{userId}/{filename} {
         allow read: if request.auth != null;
         allow write: if request.auth != null &&
                        request.auth.uid == userId &&
                        request.resource.size < 5 * 1024 * 1024; // Max 5MB
       }

       // Deny all other access
       match /{allPaths=**} {
         allow read, write: if false;
       }
     }
   }
   ```

3. **Click "Publish"** to save the rules

✅ **Storage is now secured!**

---

### Step 3: Test Production Rules

After switching to production mode, test that everything still works:

1. **Test User Registration:**

   - Open your app
   - Register a new test user
   - Should work ✅

2. **Test Saving Results:**

   - Upload a cattle image
   - Save detection result
   - Should work ✅

3. **Test Fetching Results:**

   - View history/results page
   - Should see only YOUR results ✅

4. **Test Security (Important!):**
   - Try to access another user's data (will fail ✅)
   - Try to upload without login (will fail ✅)
   - This confirms security is working!

---

## Production Security Rules Explained

### Firestore Rules Breakdown:

```javascript
// This checks if user is logged in
request.auth != null;

// This checks if the logged-in user owns the data
request.auth.uid == resource.data.userId;

// This checks if user is creating data for themselves
request.auth.uid == request.resource.data.userId;
```

### Storage Rules Breakdown:

```javascript
// Only allow image uploads
request.resource.contentType.matches("image/.*");

// Limit file size to 10MB
request.resource.size < 10 * 1024 * 1024;

// User can only upload to their own folder
request.auth.uid == userId;
```

---

## Additional Security Best Practices

### 1. Enable App Check (Advanced)

Prevents API abuse from unauthorized apps:

- Go to Firebase Console → App Check
- Register your app
- Add App Check to your code

### 2. Set Up Budget Alerts

Prevent unexpected charges:

- Go to Firebase Console → Usage and billing
- Set spending limit (e.g., ₹1000/month)
- Enable email alerts

### 3. Enable Email Verification

Force users to verify their email:

```typescript
import { sendEmailVerification } from "firebase/auth";

// After registration
await sendEmailVerification(user);
Alert.alert("Check your email", "Please verify your email address");
```

### 4. Add Password Reset

Let users recover their accounts:

```typescript
import { sendPasswordResetEmail } from "firebase/auth";

await sendPasswordResetEmail(auth, email);
Alert.alert("Check your email", "Password reset link sent");
```

### 5. Use Different Projects for Dev/Production

Best practice:

- **Development:** `cattle-breed-app-dev` (test mode)
- **Production:** `cattle-breed-app-prod` (production mode)
- Switch between them using `.env` files

---

## Rollback to Test Mode (If Needed)

If something breaks after switching to production:

1. **Go to Firebase Console**
2. **Firestore → Rules → Edit**
3. **Paste test mode rules back:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2025, 12, 31);
       }
     }
   }
   ```
4. **Storage → Rules → Edit** (same process)
5. **Publish** both

⚠️ Remember: Test mode expires after the date you set!

---

## Common Issues After Switching

### Issue 1: "Missing or insufficient permissions"

**Problem:** Security rules are too strict

**Solution:** Check that:

- User is logged in (`getCurrentUser()` returns user)
- Data has correct `userId` field
- User is trying to access their own data

### Issue 2: "Storage upload fails"

**Problem:** File is too large or wrong type

**Solution:**

- Keep images under 10MB
- Only upload image files (.jpg, .png)
- Compress images before upload

### Issue 3: "Can't read other users' results"

**Problem:** This is actually correct behavior! 🎉

**Solution:** If you want public data:

```javascript
// In Firestore rules, for public reads:
match /publicBreeds/{breedId} {
  allow read: if true; // Anyone can read
  allow write: if request.auth != null; // Only logged-in users can write
}
```

---

## Testing Production Rules Locally

Before deploying, test rules locally:

```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
cd c:\Users\Gauri\Desktop\SIH\cattle-breed-app
firebase init

# Test Firestore rules
firebase emulators:start --only firestore
```

Then update your app to use local emulator:

```typescript
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";

if (__DEV__) {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}
```

---

## Summary Checklist

When switching to production mode:

- [ ] Update Firestore security rules
- [ ] Update Storage security rules
- [ ] Publish both rule sets
- [ ] Test user registration
- [ ] Test data saving
- [ ] Test data fetching
- [ ] Verify security (try accessing other users' data)
- [ ] Set up budget alerts
- [ ] Add email verification (optional)
- [ ] Add password reset (optional)
- [ ] Monitor Firebase Console for errors

---

## 🎯 Recommendation for Your Project

**For now (learning phase):**

- ✅ Keep test mode enabled
- ✅ Focus on building features
- ✅ Test everything thoroughly

**Before SIH Demo/Submission:**

- 🔒 Switch to production mode
- 🧪 Test all features again
- 📝 Document security measures
- 🎓 Mention in presentation: "We implemented Firebase security rules to protect user data"

**After SIH (if continuing project):**

- 🚀 Keep production mode
- 📊 Monitor usage in Firebase Console
- 💰 Set up billing alerts
- 🔐 Add email verification

---

**Your Firebase is configured and ready to use!** You can switch between test and production mode anytime by following this guide.
