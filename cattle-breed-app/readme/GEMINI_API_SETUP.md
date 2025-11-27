# 🤖 Gemini AI Chatbot Setup Guide

Complete step-by-step guide to enable AI chatbot in your Cattle Breed App.

---

## 📋 Prerequisites

- Google account (Gmail)
- Internet connection
- 5 minutes of time

---

## 🎯 Step 1: Get Your Free Gemini API Key

### Option A: Google AI Studio (Recommended - Easiest)

1. **Open Google AI Studio**

   - Go to: https://aistudio.google.com/
   - Click **"Get API key"** button in top right

2. **Sign in with Google**

   - Use your Gmail account
   - Accept terms if prompted

3. **Create API Key**

   - Click **"Get API key"** or **"Create API key"**
   - Select **"Create API key in new project"** (recommended)
   - Wait 2-3 seconds for key generation

4. **Copy Your API Key**
   - You'll see something like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Click the **Copy** icon
   - ⚠️ **Keep this key safe!** Don't share it publicly

### Option B: Google Cloud Console (Advanced)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key

---

## 🔐 Step 2: Add API Key to Your App

### Windows (PowerShell)

1. **Open PowerShell in your project folder**

   ```powershell
   cd C:\Users\Gauri\Desktop\SIH\cattle-breed-app
   ```

2. **Check if `.env` file exists**

   ```powershell
   Test-Path .env
   ```

   - If it says `False`, create it:
     ```powershell
     New-Item -Path .env -ItemType File
     ```

3. **Add your API key to `.env`**

   ```powershell
   # Replace YOUR_API_KEY_HERE with your actual key
   Add-Content -Path .env -Value "EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```

   **OR** manually edit `.env` file:

   - Open `.env` in VS Code or Notepad
   - Add this line (replace with your actual key):
     ```
     EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     ```
   - Save the file

4. **Verify the key was added**
   ```powershell
   Get-Content .env
   ```
   You should see your API key line.

---

## ✅ Step 3: Restart Your App

**IMPORTANT:** Expo needs to reload environment variables!

1. **Stop your current app** (if running)

   - Press `Ctrl+C` in the terminal

2. **Clear cache and restart**

   ```powershell
   npm start -- --clear
   ```

3. **Scan QR code** or press `a` for Android / `i` for iOS

---

## 🧪 Step 4: Test the Chatbot

1. **Open your app** on phone/emulator

2. **Navigate to Chatbot screen**

   - Usually in bottom navigation or settings

3. **Send a test message**

   - Try: "What is a Gir cow?"
   - Try: "How to care for dairy cattle?"

4. **Check for response**
   - ✅ If you get a detailed AI response → **Success!**
   - ❌ If you see "offline mode" message → Check steps below

---

## 🐛 Troubleshooting

### Issue 1: "API key not configured" or "offline mode"

**Problem:** App can't read the API key

**Solutions:**

1. Make sure `.env` file is in the **project root** (same folder as `package.json`)
2. Check the variable name is **exactly**: `EXPO_PUBLIC_GEMINI_API_KEY`
3. No spaces around `=` sign
4. No quotes around the key
5. **Restart with clear cache:** `npm start -- --clear`

### Issue 2: "API request failed: 400"

**Problem:** Invalid API key format

**Solutions:**

1. Double-check you copied the **entire key** (starts with `AIza`)
2. No extra spaces before/after the key
3. Key should be ~39 characters long
4. Regenerate a new key from AI Studio

### Issue 3: "API request failed: 403"

**Problem:** API key not activated or quota exceeded

**Solutions:**

1. Wait 1-2 minutes after creating the key (activation time)
2. Check your Google Cloud Console for quota limits
3. Free tier: 60 requests per minute (should be plenty for testing)

### Issue 4: "API request failed: 429"

**Problem:** Rate limit exceeded

**Solutions:**

1. Wait 1 minute and try again
2. Free tier limit: 60 requests/minute
3. Upgrade to paid tier if needed (very cheap)

### Issue 5: App doesn't see `.env` changes

**Problem:** Metro bundler cache

**Solutions:**

```powershell
# Clear all caches
npm start -- --clear

# OR nuclear option:
Remove-Item -Recurse -Force node_modules\.cache
npm start -- --clear
```

---

## 📊 API Key Limits (Free Tier)

- **Requests:** 60 per minute
- **Tokens:** 1,500 per minute
- **Daily:** 1,500 requests per day
- **Cost:** FREE forever for these limits

Perfect for development and small apps!

---

## 🔒 Security Best Practices

### ⚠️ DO NOT:

- ❌ Commit `.env` to Git (it's in `.gitignore` already)
- ❌ Share your API key in screenshots
- ❌ Use the same key for production and dev

### ✅ DO:

- ✅ Keep `.env` local only
- ✅ Use different keys for dev/production
- ✅ Rotate keys periodically
- ✅ Monitor usage in Google Cloud Console

### 🚀 Production Setup (Later):

For production, use a backend proxy:

1. Create a simple Node.js/Firebase Cloud Function
2. Store API key on server only
3. App calls your backend, backend calls Gemini
4. This hides the key from app users

---

## 📖 What You Can Ask the Chatbot

Once working, try these questions:

**Cattle Breeds:**

- "Tell me about Gir cattle"
- "What is the best dairy breed in India?"
- "Compare Sahiwal and Red Sindhi"

**Health & Care:**

- "How to prevent mastitis in dairy cows?"
- "What vaccines do cattle need?"
- "Signs of sick cattle"

**Feeding:**

- "Best diet for lactating cows"
- "Green fodder recommendations"
- "Mineral supplements for cattle"

**General:**

- "How to increase milk production?"
- "Best practices for Indian dairy farming"
- "Climate suitable for Tharparkar breed"

The AI knows about Indian cattle breeds and farming conditions!

---

## 📚 Additional Resources

- **Get API Key:** https://aistudio.google.com/
- **Gemini API Docs:** https://ai.google.dev/docs
- **API Key Management:** https://console.cloud.google.com/apis/credentials
- **Pricing:** https://ai.google.dev/pricing (free tier is generous!)

---

## ✅ Quick Checklist

Before asking for help, verify:

- [ ] I went to https://aistudio.google.com/
- [ ] I created and copied an API key (starts with `AIza`)
- [ ] I added it to `.env` as `EXPO_PUBLIC_GEMINI_API_KEY=...`
- [ ] The `.env` file is in project root (next to `package.json`)
- [ ] I restarted the app with `npm start -- --clear`
- [ ] I tested the chatbot in the app

---

## 🎉 Success!

Once you see AI responses in the chatbot, you're all set!

The chatbot now has:

- ✅ Real-time AI responses
- ✅ Context-aware conversations
- ✅ Cattle farming expertise
- ✅ Multilingual support (ask in Hindi, it responds in Hindi!)

**Next:** Explore other features like breed detection, offline mode, and history!

---

**Need help?** Check the troubleshooting section or file an issue.
