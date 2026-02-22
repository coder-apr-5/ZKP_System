"use client";

import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // The landing page handles its own navbar and doesn't need auth
    const isLanding = pathname === "/";

    // Public routes that should not be behind AuthGuard
    const publicRoutes = [
        "/",
        "/login",
        "/admin/login",
        "/verifier/login",
        "/unauthorized",
        "/docs"
    ];

    const isPublic = publicRoutes.includes(pathname);

    if (isLanding) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <div className="pt-16">
                {isPublic ? (
                    <>{children}</>
                ) : (
                    <AuthGuard redirectTo="/login">{children}</AuthGuard>
                )}
            </div>
        </div>
    );
}
