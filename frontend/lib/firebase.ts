/**
 * lib/firebase.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Firebase initialisation — exported as lazy singletons so they are safe
 * in Next.js SSR environments (only materialise on the client).
 */
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
    getAuth,
    Auth,
    GoogleAuthProvider,
    browserLocalPersistence,
    setPersistence,
} from "firebase/auth";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

// ── Config from environment variables ─────────────────────────────────────────
const firebaseConfig = {
    apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "").trim(),
    authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "").trim(),
    projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim(),
    storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "").trim(),
    messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
    appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "").trim(),
    measurementId: (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "").trim(),
};

// ── Lazy singletons ────────────────────────────────────────────────────────────
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _analytics: Analytics | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

function getFirebaseApp(): FirebaseApp {
    if (!_app) {
        if (!firebaseConfig.apiKey) {
            console.warn("⚠️ Firebase API Key is missing. Check .env.local");
        }
        _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        console.log("🔥 Firebase Initialized for Project:", firebaseConfig.projectId);
    }
    return _app;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
    if (typeof window !== "undefined" && !_analytics) {
        const supported = await isSupported();
        if (supported) {
            _analytics = getAnalytics(getFirebaseApp());
        }
    }
    return _analytics;
}

export function getFirebaseAuth(): Auth {
    if (!_auth) {
        _auth = getAuth(getFirebaseApp());
        // Persist session across page refreshes
        if (typeof window !== "undefined") {
            setPersistence(_auth, browserLocalPersistence).catch(() => { });
        }
    }
    return _auth;
}

export function getGoogleProvider(): GoogleAuthProvider {
    if (!_googleProvider) {
        _googleProvider = new GoogleAuthProvider();
        _googleProvider.addScope("email");
        _googleProvider.addScope("profile");
        _googleProvider.setCustomParameters({ prompt: "select_account" });
    }
    return _googleProvider;
}

// Default named export for convenience
export const firebaseApp = (): FirebaseApp => getFirebaseApp();
export default getFirebaseAuth;
