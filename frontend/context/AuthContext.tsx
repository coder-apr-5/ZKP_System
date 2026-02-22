/**
 * context/AuthContext.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Global Firebase auth state — wraps the whole app in layout.tsx.
 *
 * Exports:
 *   <AuthProvider>      — wrap your layout with this
 *   useAuth()           — hook to read currentUser / loading / authStatus
 */
"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { logoutUser } from "@/lib/auth";

// ── Types ──────────────────────────────────────────────────────────────────────
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface BackendProfile {
    user_id: string;
    firebase_uid: string;
    name: string;
    email: string;
    docs_uploaded: boolean;
    role: string;
}

interface AuthContextValue {
    currentUser: User | null;
    backendProfile: BackendProfile | null;
    loading: boolean;
    authStatus: AuthStatus;
    idToken: string | null;          // Firebase JWT for backend calls
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
    currentUser: null,
    backendProfile: null,
    loading: true,
    authStatus: "loading",
    idToken: null,
    logout: async () => { },
    refreshProfile: async () => { },
});

// ── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    // TEMPORARILY MODIFIED: Defaulting to authenticated for demo/dev
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [backendProfile, setBackendProfile] = useState<BackendProfile | null>({
        user_id: "DEMO-USER-01",
        firebase_uid: "demo-uid",
        name: "PrivaSeal Admin",
        email: "admin@privaseal.io",
        docs_uploaded: true,
        role: "admin"
    });
    const [loading, setLoading] = useState(false);
    const [idToken, setIdToken] = useState<string | null>("demo-token");

    const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

    const refreshProfile = useCallback(async () => {
        // No-op in demo mode
    }, []);

    const logout = useCallback(async () => {
        // No-op in demo mode
    }, []);

    const authStatus: AuthStatus = "authenticated";

    const value = useMemo(() => ({
        currentUser,
        backendProfile,
        loading,
        authStatus,
        idToken,
        logout,
        refreshProfile,
    }), [currentUser, backendProfile, loading, authStatus, idToken, logout, refreshProfile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
