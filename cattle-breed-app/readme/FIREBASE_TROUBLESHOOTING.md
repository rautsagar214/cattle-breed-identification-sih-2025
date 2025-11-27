# 🔥 Firebase Authentication Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: "Invalid email or password" (auth/invalid-credential)

**Symptoms:**

- Login fails with "Invalid email or password"
- Even when you know the credentials are correct

**Causes:**

1. Email/password authentication not enabled in Firebase Console
2. Wrong email format (extra spaces, wrong case)
3. Actually incorrect credentials
4. Firebase project not properly configured

**Solutions:**

#### Step 1: Check Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: `cattle-breed-app`
3. Click "Authentication" → "Sign-in method"
4. Make sure **"Email/Password"** is **ENABLED** (toggle should be blue/on)
5. If disabled, click it and enable it

#### Step 2: Verify Email Format

- Emails are case-insensitive but must be valid format
- Check for leading/trailing spaces
- The app now auto-trims and lowercases emails

#### Step 3: Test with a Fresh Account

```powershell
# In your app:
1. Go to Signup screen
2. Create NEW account: test123@example.com / Password123!
3. Try logging in with same credentials
4. Should work immediately
```

---

### Issue 2: "Email already in use" (auth/email-already-in-use)

**Symptoms:**

- Can't register a new account
- Says email is already registered

**Solutions:**

1. **Use Login instead of Signup**

   - This email is already registered
   - Click "Login" and use your existing password

2. **Reset Password (if forgot)**

   - Currently not implemented
   - Workaround: Use Firebase Console to reset
     - Go to Authentication → Users
     - Find user → Click three dots → Reset password

3. **Use Different Email**
   - Try a different email address for testing

---

### Issue 3: "Network error" (auth/network-request-failed)

**Symptoms:**

- "Network error. Please check your internet connection"
- Can't connect to Firebase

**Solutions:**

1. **Check Internet Connection**

   - Make sure device/emulator is online
   - Try opening a browser

2. **Check Firebase Configuration**

   ```powershell
   cd C:\Users\Gauri\Desktop\SIH\cattle-breed-app
   Get-Content .env
   ```

   Verify you see:

   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=cattle-breed-app.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=cattle-breed-app
   ```

3. **Restart App with Clear Cache**
   ```powershell
   npx expo start --clear
   ```

---

### Issue 4: "Too many requests" (auth/too-many-requests)

**Symptoms:**

- "Too many failed attempts"
- Temporarily blocked from logging in

**Causes:**

- Multiple failed login attempts in short time
- Firebase's security throttling kicked in

**Solutions:**

1. **Wait 5-15 Minutes**

   - Firebase automatically unblocks after cooldown period

2. **Use Different Test Account**

   - Create a new test account while waiting

3. **Clear Rate Limiter (Development Only)**
   - Close and restart the app
   - Rate limiter resets on app restart

---

### Issue 5: "App configuration error"

**Symptoms:**

- "App configuration error. Contact support"
- auth/configuration-not-found
- auth/invalid-api-key

**Causes:**

- Missing or incorrect Firebase config in `.env`
- API key restricted in Firebase Console

**Solutions:**

#### Step 1: Verify `.env` File

```powershell
cd C:\Users\Gauri\Desktop\SIH\cattle-breed-app
Get-Content .env
```

Check that ALL these are present and not empty:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

#### Step 2: Check API Key Restrictions

1. Go to https://console.cloud.google.com/apis/credentials
2. Select your project
3. Find your API key
4. Click "Edit"
5. Under "Application restrictions":
   - Set to "None" for development
   - Or whitelist your domain/app

#### Step 3: Regenerate Config

If config is wrong:

1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps"
3. Click web app (</>) icon
4. Copy the new config
5. Update `.env` file
6. Restart: `npx expo start --clear`

---

### Issue 6: Password Too Weak

**Symptoms:**

- "Password must be at least 6 characters long"
- Can't register

**Solution:**

- Firebase requires minimum 6 characters
- Use: `Test123!` or stronger
- Recommended: At least 8 chars with uppercase, lowercase, number

---

### Issue 7: Can't See Registered Users

**Symptoms:**

- Registration seems successful but can't login
- Users not showing in Firebase Console

**Solutions:**

1. **Check Firebase Console**

   - Go to Authentication → Users tab
   - Users should appear immediately after registration
   - If empty, registration didn't actually succeed

2. **Check Console Logs**
   - Open browser console (F12)
   - Look for error messages
   - Share errors for debugging

---

## Testing Checklist

Before reporting issues, verify:

- [ ] Internet connection is working
- [ ] Firebase Email/Password auth is enabled
- [ ] `.env` file exists and has all required fields
- [ ] App was restarted with `--clear` flag after editing `.env`
- [ ] Password is at least 6 characters
- [ ] Email format is valid (no spaces)
- [ ] Not hitting rate limits (wait a few minutes)
- [ ] Firestore rules allow read/write (test mode)

---

## Quick Test Flow

**1. Fresh Registration:**

```
Email: test$(date +%s)@example.com  (unique)
Password: Test123!
```

**2. Immediate Login:**

- Use same credentials
- Should work without delay

**3. Check Firebase Console:**

- User should appear in Authentication → Users

---

## Common Error Codes Reference

| Error Code                    | Meaning                  | Fix                                   |
| ----------------------------- | ------------------------ | ------------------------------------- |
| `auth/invalid-credential`     | Wrong email/password     | Check credentials, enable auth method |
| `auth/email-already-in-use`   | Email registered         | Use login instead                     |
| `auth/weak-password`          | Password < 6 chars       | Use stronger password                 |
| `auth/user-not-found`         | No account with email    | Register first                        |
| `auth/wrong-password`         | Incorrect password       | Check password                        |
| `auth/too-many-requests`      | Rate limited             | Wait 5-15 minutes                     |
| `auth/network-request-failed` | No internet/wrong config | Check connection & config             |
| `auth/invalid-email`          | Bad email format         | Fix email format                      |
| `auth/user-disabled`          | Account disabled         | Contact support                       |
| `auth/operation-not-allowed`  | Auth method disabled     | Enable in Firebase Console            |

---

## Still Having Issues?

1. **Check Firebase Status:**

   - https://status.firebase.google.com/

2. **Enable Debug Mode:**

   - Check browser console (F12)
   - Look for red error messages
   - Note the exact error code

3. **Test in Browser First:**

   - Run: `npx expo start --web`
   - Open browser console
   - Try auth there (easier to debug)

4. **Share These Details:**
   - Exact error message
   - Error code (e.g., `auth/invalid-credential`)
   - Steps to reproduce
   - Screenshots of Firebase Console settings

---

## Production Checklist

Before deploying:

- [ ] Enable reCAPTCHA for web
- [ ] Set Firestore security rules (not test mode)
- [ ] Set Storage security rules
- [ ] Use separate Firebase project for production
- [ ] Add authorized domains in Firebase Console
- [ ] Enable Email Enumeration Protection
- [ ] Set up Firebase App Check
- [ ] Add password reset functionality
- [ ] Implement email verification
- [ ] Set up Firebase monitoring

---

**Last Updated:** November 20, 2025
