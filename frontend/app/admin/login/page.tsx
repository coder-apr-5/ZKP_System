"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Mail, Lock, Loader2, AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { loginWithEmail } from "@/lib/auth";

export default function AdminLoginPage() {
    const { authStatus, backendProfile } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (authStatus === "authenticated" && backendProfile?.role === "admin") {
            router.replace("/admin");
        }
    }, [authStatus, backendProfile, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");
        const result = await loginWithEmail(email, password);
        if (result.error) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1e] to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-8 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Portal
                </Link>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl mb-6 shadow-2xl shadow-red-500/5">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-white font-bold text-3xl tracking-tight mb-2">Admin Access</h1>
                    <p className="text-slate-500">PrivaSeal Management Authority Only</p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="text-slate-400 text-xs font-medium mb-2 block uppercase tracking-wider">Internal Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    required type="email"
                                    placeholder="admin@privaseal.com"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-700 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/10 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-400 text-xs font-medium mb-2 block uppercase tracking-wider">Access Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    required type="password"
                                    placeholder="••••••••"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-700 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/10 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-red-200 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 mt-2"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</> : <><ShieldAlert className="w-5 h-5" /> Authorized Login</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
