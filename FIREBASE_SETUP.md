# 🔥 Firebase Authentication Setup Guide — PrivaSeal

## Step 1: Create a Firebase Project

1. Go to **[Firebase Console](https://console.firebase.google.com)**
2. Click **"Add project"** → name it `privaseal`
3. Disable Google Analytics (optional) → **Create project**

---

## Step 2: Enable Authentication Providers

In your Firebase project:

1. Left sidebar → **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable these providers:

| Provider | Steps |
|---|---|
| **Email/Password** | Enable → Save |
| **Google** | Enable → select support email → Save |
| **Phone** | Enable → Save |

---

## Step 3: Register Your Web App

1. Project Overview → click **`</>`** (Web) icon
2. App nickname: `privaseal-web` → **Register app**
3. You'll see your **Firebase config object** — copy the values:

```js
const firebaseConfig = {
  apiKey:            "AIza...",         // ← NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain:        "your-id.firebaseapp.com", // ← NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId:         "your-project-id",  // ← NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket:     "your-id.firebasestorage.app", // ← NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",        // ← NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId:             "1:123:web:abc",    // ← NEXT_PUBLIC_FIREBASE_APP_ID
};
```

---

## Step 4: Fill in .env.local

Edit `frontend/.env.local` and paste your values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Step 5: Authorise Localhost for Google Sign-In

1. Firebase Console → **Authentication** → **Settings** tab
2. **Authorised domains** section → **Add domain**
3. Add: `localhost`

---

## Step 6: Enable Phone Auth (For OTP)

Phone auth uses **reCAPTCHA**. For local development:

1. Firebase Console → **Authentication** → **Settings** → **reCAPTCHA configuration**
2. Add `localhost` to authorised domains (already done in Step 5)
3. The app uses **invisible reCAPTCHA** — no extra setup needed client-side

---

## Step 7: Restart the Dev Server

```bash
# In the frontend directory:
npm run dev
```

---

## ✅ Test the Auth Flow

| URL | What to test |
|---|---|
| `http://localhost:3000/privaseal/login` | Login page |
| Click **Continue with Google** | Google OAuth popup |
| Click **Email** tab → Sign Up | Email/password registration |
| Click **Mobile OTP** tab | Phone OTP flow |
| After login → auto-redirects to `/privaseal/user` | Protected route check |

---

## Architecture Overview

```
Firebase Auth (Google/Email/Phone)
        │
        │ onAuthStateChanged
        ▼
  AuthContext (context/AuthContext.tsx)
        │ currentUser, authStatus, idToken
        │
        ├── AuthGuard (components/AuthGuard.tsx)
        │       └── Protects /privaseal/user, /admin, /verifier
        │
        └── syncUserToBackend (lib/auth.ts)
                │
                ▼
        POST /api/privaseal/user/firebase-sync
        (creates/updates backend user record keyed to Firebase UID)
```

## Files Created

| File | Purpose |
|---|---|
| `frontend/.env.local` | Firebase credentials |
| `frontend/lib/firebase.ts` | Firebase app init (lazy, SSR-safe) |
| `frontend/lib/auth.ts` | signUpWithEmail, loginWithEmail, loginWithGoogle, loginWithPhoneOTP, confirmPhoneOTP, logoutUser |
| `frontend/context/AuthContext.tsx` | Global auth state — useAuth() hook |
| `frontend/components/AuthGuard.tsx` | Route protection HOC |
| `frontend/app/privaseal/login/page.tsx` | Full login UI (Google + Email + Phone OTP) |
| `frontend/app/privaseal/layout.tsx` | Guards all /privaseal/* routes except landing + login |
| `backend/.../routes.py` | POST /user/firebase-sync + GET /user/firebase/{uid} |
