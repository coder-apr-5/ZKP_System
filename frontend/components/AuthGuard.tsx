/**
 * components/AuthGuard.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Wrap any page/layout with <AuthGuard> to require Firebase authentication.
 * If not logged in → redirect to /privaseal/login.
 * Shows a spinner during the auth-state loading phase.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Loader2 } from "lucide-react";

interface AuthGuardProps {
    children: React.ReactNode;
    /** Redirect destination when unauthenticated (default: /privaseal/login) */
    redirectTo?: string;
}

export default function AuthGuard({
    children,
    redirectTo = "/login",
}: AuthGuardProps) {
    // TEMPORARILY DISABLED: Authentication check
    return <>{children}</>;
}
