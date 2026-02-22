"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck, Mail, Phone, Loader2, AlertTriangle,
    ArrowLeft, Eye, EyeOff, CheckCircle2, ChevronRight,
    Smartphone
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
    signUpWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginWithPhoneOTP,
    confirmPhoneOTP,
} from "@/lib/auth";

type TabMode = "email" | "phone";
type FormMode = "login" | "signup";

// ── Google G logo SVG ─────────────────────────────────────────────────────────
function GoogleLogo() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

export default function LoginPage() {
    const { authStatus, backendProfile } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState<TabMode>("email");
    const [formMode, setFormMode] = useState<FormMode>("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPw, setShowPw] = useState(false);

    // Email form
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    // Phone OTP
    const [phone, setPhone] = useState("+91");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpCountdown, setOtpCountdown] = useState(0);

    // Redirect if already logged in
    useEffect(() => {
        if (authStatus === "authenticated" && backendProfile) {
            if (backendProfile.role === "admin") router.replace("/admin");
            else if (backendProfile.role === "verifier") router.replace("/verifier");
            else router.replace("/user");
        }
    }, [authStatus, backendProfile, router]);

    // OTP countdown timer
    useEffect(() => {
        if (otpCountdown <= 0) return;
        const t = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [otpCountdown]);

    // ── Handlers ────────────────────────────────────────────────────────────────
    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");
        const result = formMode === "signup"
            ? await signUpWithEmail(email, password, name)
            : await loginWithEmail(email, password);
        if (result.error) { setError(result.error); setLoading(false); return; }
        router.replace("/user");
    };

    const handleGoogle = async () => {
        setLoading(true); setError("");
        const result = await loginWithGoogle();
        if (result.error) { setError(result.error); setLoading(false); return; }
        router.replace("/user");
    };

    const handleSendOTP = async () => {
        if (!phone || phone.length < 10) { setError("Enter a valid phone number with country code"); return; }
        setLoading(true); setError("");
        const result = await loginWithPhoneOTP(phone);
        if (result.error) { setError(result.error); setLoading(false); return; }
        setOtpSent(true);
        setOtpCountdown(60);
        setLoading(false);
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) { setError("Enter the 6-digit OTP"); return; }
        setLoading(true); setError("");
        const result = await confirmPhoneOTP(otp);
        if (result.error) { setError(result.error); setLoading(false); return; }
        router.replace("/user");
    };

    if (authStatus === "loading") return null;

    // ═══════════ RENDER ══════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            {/* Hidden recaptcha container for Phone OTP */}
            <div id="recaptcha-container" />

            <div className="w-full max-w-md">
                {/* Back link */}
                <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to PrivaSeal
                </Link>

                {/* Logo + title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl shadow-blue-500/30 mb-4">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-white font-black text-3xl tracking-tight">
                        {formMode === "login" ? "Welcome back" : "Create account"}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {formMode === "login" ? "Sign in to your PrivaSeal account" : "Join PrivaSeal — verify your identity once"}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/60 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">

                    {/* Google button — always visible */}
                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 font-semibold py-3.5 rounded-2xl transition-all mb-5 shadow-lg">
                        <GoogleLogo />
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-slate-500 text-xs">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Tab selector */}
                    <div className="flex bg-slate-900/60 rounded-2xl p-1 mb-5 gap-1">
                        <button onClick={() => { setTab("email"); setError(""); setOtpSent(false); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "email" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                            <Mail className="w-4 h-4" /> Email
                        </button>
                        <button onClick={() => { setTab("phone"); setError(""); setOtpSent(false); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "phone" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                            <Smartphone className="w-4 h-4" /> Mobile OTP
                        </button>
                    </div>

                    {/* ── EMAIL TAB ─────────────────────────────────────────────────────── */}
                    {tab === "email" && (
                        <>
                            {/* Login / Signup toggle */}
                            <div className="flex gap-2 mb-5">
                                {(["login", "signup"] as FormMode[]).map(m => (
                                    <button key={m} onClick={() => { setFormMode(m); setError(""); }}
                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize
                      ${formMode === m ? "border-blue-500 text-blue-300 bg-blue-500/10" : "border-white/10 text-slate-500 hover:text-white"}`}>
                                        {m === "login" ? "Sign In" : "Sign Up"}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                {formMode === "signup" && (
                                    <div>
                                        <label className="text-slate-300 text-xs font-medium mb-1.5 block">Full Name</label>
                                        <input required placeholder="Riya Sharma" value={name} onChange={e => setName(e.target.value)}
                                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-sm transition-all" />
                                    </div>
                                )}
                                <div>
                                    <label className="text-slate-300 text-xs font-medium mb-1.5 block">Email</label>
                                    <input required type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-sm transition-all" />
                                </div>
                                <div>
                                    <label className="text-slate-300 text-xs font-medium mb-1.5 block">Password</label>
                                    <div className="relative">
                                        <input required type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-sm transition-all" />
                                        <button type="button" onClick={() => setShowPw(p => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {formMode === "signup" && (
                                        <p className="text-slate-600 text-xs mt-1.5">Minimum 6 characters</p>
                                    )}
                                </div>

                                {error && (
                                    <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">
                                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-red-300 text-sm">{error}</p>
                                    </div>
                                )}

                                <button type="submit" disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 mt-1">
                                    {loading
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> {formMode === "signup" ? "Creating…" : "Signing in…"}</>
                                        : <>{formMode === "signup" ? "Create Account" : "Sign In"} <ChevronRight className="w-4 h-4" /></>}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── PHONE TAB ─────────────────────────────────────────────────────── */}
                    {tab === "phone" && (
                        <div className="space-y-4">
                            {!otpSent ? (
                                <>
                                    <div>
                                        <label className="text-slate-300 text-xs font-medium mb-1.5 block">Phone Number</label>
                                        <input placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)}
                                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm font-mono tracking-wide transition-all" />
                                        <p className="text-slate-600 text-xs mt-1.5">International format required (e.g. +91XXXXXXXXXX)</p>
                                    </div>
                                    {error && (
                                        <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">
                                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                            <p className="text-red-300 text-sm">{error}</p>
                                        </div>
                                    )}
                                    <button onClick={handleSendOTP} disabled={loading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</> : <><Phone className="w-4 h-4" /> Send OTP</>}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-center bg-green-900/20 border border-green-700/30 rounded-xl p-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                                        <p className="text-green-300 text-sm font-semibold">OTP sent to {phone}</p>
                                        <p className="text-slate-500 text-xs mt-0.5">Check your SMS</p>
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-xs font-medium mb-1.5 block">Enter OTP</label>
                                        <input placeholder="••••••" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-center text-2xl font-mono tracking-[0.4em] transition-all" />
                                    </div>

                                    {error && (
                                        <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">
                                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                            <p className="text-red-300 text-sm">{error}</p>
                                        </div>
                                    )}

                                    <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : "Verify & Continue"}
                                    </button>

                                    <button onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                                        disabled={otpCountdown > 0}
                                        className="w-full text-slate-500 hover:text-slate-300 disabled:opacity-40 text-sm py-1 transition-colors">
                                        {otpCountdown > 0 ? `Resend OTP in ${otpCountdown}s` : "Resend OTP"}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer note */}
                <p className="text-center text-slate-600 text-xs mt-6 leading-relaxed">
                    🔒 Powered by Firebase Authentication — your password is never stored by PrivaSeal.
                </p>
            </div>
        </div>
    );
}
