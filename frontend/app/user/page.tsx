"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
    ShieldCheck, UserCircle, Upload, FileText, Camera, ChevronRight,
    ChevronLeft, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle,
    QrCode, ArrowLeft, RefreshCw, Eye, BadgeCheck, Wallet, Mail,
    Smartphone, Calendar, MapPin, Globe, Home, Hash, CreditCard
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api/privaseal";

// ── Types ─────────────────────────────────────────────────────────────────────
type DocStep = "upload";
type MainStep = "dashboard" | "profile" | "wallet";
type Step = DocStep | MainStep;


interface StatusData {
    docs_uploaded: boolean;
    profile_completed: boolean;
    request: { id: string | null; status: string; submitted_at: string | null; reject_reason: string | null; reupload_reason: string | null; };
    credential: { privaseal_id: string | null; age_verified: boolean | null; issued_at: string | null; qr_uri: string | null; status: string | null; } | null;
}

// ── QR Code SVG Generator ─────────────────────────────────────────────────────
function QRDisplay({ uri, size = 180 }: { uri: string; size?: number }) {
    const cells = 21, cell = size / cells;
    const seed = Array.from(uri).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0);
    const pat = Array.from({ length: cells * cells }, (_, i) => {
        const r = Math.floor(i / cells), c2 = i % cells;
        if ((r < 8 && c2 < 8) || (r < 8 && c2 > cells - 9) || (r > cells - 9 && c2 < 8)) return true;
        return ((seed >> (i % 32)) & 1) === 1;
    });
    return (
        <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {pat.map((f, i) => f ? (
                    <rect key={i} x={(i % cells) * cell} y={Math.floor(i / cells) * cell} width={cell - 0.5} height={cell - 0.5} fill="#0f172a" rx={cell * 0.15} />
                ) : null)}
            </svg>
        </div>
    );
}

// ── Image Upload Box ──────────────────────────────────────────────────────────
function ImageBox({ label, icon, value, onChange, required = true }: {
    label: string; icon: React.ReactNode; value: string; onChange: (b64: string) => void; required?: boolean;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => onChange(ev.target?.result as string);
        reader.readAsDataURL(file);
    };
    return (
        <div onClick={() => ref.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden
        ${value ? "border-blue-500/40 bg-blue-500/5" : "border-white/10 bg-white/3 hover:border-white/30 hover:bg-white/5"}`}
            style={{ minHeight: 130 }}>
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {value ? (
                <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt={label} className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium">Click to change</p>
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-6 h-full">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                        {icon}
                    </div>
                    <p className="text-slate-300 text-sm font-medium">{label}</p>
                    <p className="text-slate-500 text-xs">{required ? "Required" : "Optional"} · Click to upload</p>
                </div>
            )}
        </div>
    );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
        not_submitted: { color: "text-slate-400 bg-slate-800/80 border-slate-700", icon: <FileText className="w-3.5 h-3.5" />, label: "Not Submitted" },
        pending: { color: "text-amber-300 bg-amber-900/30 border-amber-700/50", icon: <Clock className="w-3.5 h-3.5" />, label: "Under Review" },
        approved: { color: "text-green-300 bg-green-900/30 border-green-700/50", icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Approved ✓" },
        rejected: { color: "text-red-300 bg-red-900/30 border-red-700/50", icon: <XCircle className="w-3.5 h-3.5" />, label: "Rejected" },
        reupload_requested: { color: "text-orange-300 bg-orange-900/30 border-orange-700/50", icon: <Upload className="w-3.5 h-3.5" />, label: "Reupload Required" },
    };
    const c = cfg[status] || cfg.not_submitted;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${c.color}`}>
            {c.icon} {c.label}
        </span>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
function UserPortalContent() {
    const { backendProfile, authStatus, loading: authLoading, logout } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState<MainStep | DocStep>("dashboard");
    const [status, setStatus] = useState<StatusData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    // Doc upload form
    const [docForm, setDocForm] = useState({
        doc_type: "AADHAAR", doc_number: "", front: "", back: "", selfie: "",
    });
    const [uploadStep, setUploadStep] = useState(0); // 0=type, 1=images, 2=review

    // Profile form
    const [profileForm, setProfileForm] = useState({
        full_name: "", phone_number: "", email: "", dob: "", gender: "",
        country: "", state: "", city: "", pin_code: "",
        id_type: "AADHAAR", id_number: ""
    });

    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    const loadStatus = useCallback(async (uid: string) => {
        try {
            const r = await fetch(`${API}/user/${uid}/status`);
            if (r.ok) setStatus(await r.json());
        } catch { /* silent */ }
    }, []);

    const loadProfile = useCallback(async (uid: string) => {
        try {
            const r = await fetch(`${API}/user/profile?user_id=${uid}`);
            if (r.ok) {
                const data = await r.json();
                setProfileForm(data);
            }
        } catch { /* silent */ }
    }, []);

    const handleSaveProfile = async () => {
        if (!backendProfile) return;
        if (!profileForm.full_name || !profileForm.phone_number) {
            setError("Full Name and Mobile Number are required");
            return;
        }
        setLoading(true); setError("");
        try {
            const r = await fetch(`${API}/user/profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...profileForm, user_id: backendProfile.user_id }),
            });
            if (!r.ok) throw new Error("Failed to save profile");
            showToast("Profile saved successfully!");
            await loadStatus(backendProfile.user_id);
            setStep("dashboard");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error saving profile");
        } finally {
            setLoading(false);
        }
    };

    // Hydrate status when backendProfile is available
    useEffect(() => {
        if (backendProfile?.user_id) {
            loadStatus(backendProfile.user_id);
            loadProfile(backendProfile.user_id);
        }
    }, [backendProfile, loadStatus, loadProfile]);

    // ── Doc Upload ───────────────────────────────────────────────────────────────
    const handleDocUpload = async () => {
        if (!backendProfile) return;
        if (!docForm.front) { setError("Front image is required"); return; }
        if (!docForm.selfie) { setError("Selfie is required"); return; }
        setLoading(true); setError("");
        try {
            const r = await fetch(`${API}/user/upload-documents`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: backendProfile.user_id, doc_type: docForm.doc_type, doc_number: docForm.doc_number || "DEMO-0000",
                    front_image: docForm.front, back_image: docForm.back || null, selfie_image: docForm.selfie,
                }),
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.detail || "Upload failed");

            await loadStatus(backendProfile.user_id);
            showToast("Documents uploaded successfully!");
            setStep("dashboard");
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "Upload error"); }
        finally { setLoading(false); }
    };

    // ── Submit Request ───────────────────────────────────────────────────────────
    const handleSubmitRequest = async () => {
        if (!backendProfile) return;
        setLoading(true); setError("");
        try {
            const r = await fetch(`${API}/user/request`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: backendProfile.user_id }),
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.detail || "Request failed");
            await loadStatus(backendProfile.user_id);
            showToast("Verification request submitted!");
            setStep("dashboard");
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
        finally { setLoading(false); }
    };

    if (authLoading) return null; // Let AuthGuard handle this

    // ═══════════════════ RENDER ══════════════════════════════════════════════════


    // ── Identity Profile Page ──────────────────────────────────────────────────
    if (step === "profile") return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-slate-900 to-slate-950 p-4">
            <div className="max-w-2xl mx-auto pb-12">
                <div className="flex items-center justify-between mb-8 pt-4">
                    <button onClick={() => setStep("dashboard")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-white font-bold text-xl">My Identity Profile</h1>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Section: Basic Info */}
                    <div className="bg-slate-800/60 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
                        <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-blue-400" /> Basic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    value={profileForm.full_name}
                                    onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                    placeholder="Enter your full name"
                                    className="w-full bg-slate-900/60 border border-white/5 rounded-2xl px-4 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">Mobile Number</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input
                                        value={profileForm.phone_number}
                                        onChange={e => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                                        placeholder="+91 00000 00000"
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">Email (Firebase)</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                                    <input
                                        disabled
                                        value={backendProfile?.email || ""}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">Date of Birth</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input
                                        type="date"
                                        value={profileForm.dob}
                                        onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">Gender</label>
                                <select
                                    value={profileForm.gender}
                                    onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Address Info */}
                    <div className="bg-slate-800/60 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
                        <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-400" /> Address Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">Country</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input
                                        value={profileForm.country}
                                        onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                                        placeholder="India"
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">State / Province</label>
                                <input
                                    value={profileForm.state}
                                    onChange={e => setProfileForm({ ...profileForm, state: e.target.value })}
                                    placeholder="West Bengal"
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">City</label>
                                <div className="relative">
                                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input
                                        value={profileForm.city}
                                        onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                                        placeholder="Kolkata"
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">PIN / ZIP Code</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input
                                        value={profileForm.pin_code}
                                        onChange={e => setProfileForm({ ...profileForm, pin_code: e.target.value })}
                                        placeholder="700001"
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Identity Info */}
                    <div className="bg-slate-800/60 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
                        <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-amber-400" /> Government Identity
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">ID Document Type</label>
                                <select
                                    value={profileForm.id_type}
                                    onChange={e => setProfileForm({ ...profileForm, id_type: e.target.value })}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                                >
                                    <option value="AADHAAR">Aadhaar Card</option>
                                    <option value="PASSPORT">Passport</option>
                                    <option value="VOTER_ID">Voter ID</option>
                                    <option value="DRIVING_LICENSE">Driving License</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider ml-1">Identity Number</label>
                                <input
                                    value={profileForm.id_number}
                                    onChange={e => setProfileForm({ ...profileForm, id_number: e.target.value })}
                                    placeholder="Enter your ID number"
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-700/30 rounded-2xl p-4 flex gap-3 items-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-5 h-5" /> Save Identity Profile</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );


    // ── Document Upload Page ─────────────────────────────────────────────────────
    if (step === "upload") return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-slate-900 to-slate-950 p-4">
            {toast && <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl ${toast.ok ? "bg-green-600" : "bg-red-600"} text-white`}>{toast.msg}</div>}
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8 pt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl">Upload Identity Documents</h1>
                            <p className="text-slate-400 text-xs">Required before verification request</p>
                        </div>
                    </div>
                    <span className="text-slate-500 text-sm">{backendProfile?.name}</span>
                </div>

                {/* Progress steps */}
                <div className="flex items-center gap-2 mb-8">
                    {["Document Type", "Upload Images", "Review & Submit"].map((label, i) => (
                        <div key={i} className="flex items-center gap-2 flex-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                ${i < uploadStep ? "bg-green-500 text-white" : i === uploadStep ? "bg-blue-600 text-white ring-2 ring-blue-500/30" : "bg-slate-800 text-slate-500"}`}>
                                {i < uploadStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-xs font-medium hidden sm:block ${i === uploadStep ? "text-white" : "text-slate-500"}`}>{label}</span>
                            {i < 2 && <div className={`h-px flex-1 hidden sm:block ${i < uploadStep ? "bg-green-500" : "bg-slate-700"}`} />}
                        </div>
                    ))}
                </div>

                <div className="bg-slate-800/60 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">

                    {/* Step 0: Document Type */}
                    {uploadStep === 0 && (
                        <div className="space-y-5">
                            <div>
                                <label className="text-slate-300 text-sm font-medium mb-2 block">Document Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: "AADHAAR", label: "Aadhaar Card", emoji: "🪪" },
                                        { value: "PASSPORT", label: "Passport", emoji: "📘" },
                                        { value: "VOTER_ID", label: "Voter ID", emoji: "🗳️" },
                                        { value: "DRIVING_LICENSE", label: "Driving License", emoji: "🚗" },
                                    ].map(opt => (
                                        <button key={opt.value} onClick={() => setDocForm({ ...docForm, doc_type: opt.value })}
                                            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all
                        ${docForm.doc_type === opt.value
                                                    ? "bg-blue-600/20 border-blue-500/60 text-white"
                                                    : "bg-slate-900/40 border-white/10 text-slate-300 hover:border-white/20"}`}>
                                            <span className="text-2xl">{opt.emoji}</span>
                                            <span className="text-sm font-medium">{opt.label}</span>
                                            {docForm.doc_type === opt.value && <CheckCircle2 className="w-4 h-4 text-blue-400 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-300 text-sm font-medium mb-2 block">Document Number</label>
                                <input placeholder={docForm.doc_type === "AADHAAR" ? "1234 5678 9012" : "Enter document number"}
                                    value={docForm.doc_number} onChange={e => setDocForm({ ...docForm, doc_number: e.target.value })}
                                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm" />
                                <p className="text-slate-600 text-xs mt-1.5">🔒 Immediately hashed — never stored in plain text</p>
                            </div>
                            <button onClick={() => setUploadStep(1)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                                Continue <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Step 1: Upload Images */}
                    {uploadStep === 1 && (
                        <div className="space-y-5">
                            <p className="text-slate-400 text-sm">Please upload clear photos. All images are encrypted and visible only to verification admins.</p>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <ImageBox label="Document Front" icon={<FileText className="w-5 h-5" />}
                                    value={docForm.front} onChange={v => setDocForm({ ...docForm, front: v })} />
                                <ImageBox label="Document Back" icon={<Eye className="w-5 h-5" />}
                                    value={docForm.back} onChange={v => setDocForm({ ...docForm, back: v })} required={false} />
                                <ImageBox label="Selfie with Doc" icon={<Camera className="w-5 h-5" />}
                                    value={docForm.selfie} onChange={v => setDocForm({ ...docForm, selfie: v })} />
                            </div>
                            {error && <p className="text-red-400 text-sm flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" />{error}</p>}
                            <div className="flex gap-3">
                                <button onClick={() => { setUploadStep(0); setError(""); }}
                                    className="px-5 py-3 border border-white/10 text-slate-400 hover:text-white rounded-xl text-sm transition-colors flex items-center gap-1.5">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={() => {
                                    if (!docForm.front) { setError("Please upload document front image"); return; }
                                    if (!docForm.selfie) { setError("Please upload a selfie with document"); return; }
                                    setError(""); setUploadStep(2);
                                }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                                    Review <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Review */}
                    {uploadStep === 2 && (
                        <div className="space-y-5">
                            <h3 className="text-white font-semibold">Review Before Submission</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-slate-900/60 rounded-xl px-4 py-3">
                                    <p className="text-slate-400 text-xs mb-0.5">Document Type</p>
                                    <p className="text-white font-medium">{docForm.doc_type}</p>
                                </div>
                                <div className="bg-slate-900/60 rounded-xl px-4 py-3">
                                    <p className="text-slate-400 text-xs mb-0.5">Number (hashed)</p>
                                    <p className="text-white font-mono text-xs">••••••••••</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[{ label: "Front", src: docForm.front }, { label: "Back", src: docForm.back }, { label: "Selfie", src: docForm.selfie }].map(img => (
                                    img.src ? (
                                        <div key={img.label} className="space-y-1">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img.src} alt={img.label} className="w-full h-24 object-cover rounded-xl border border-white/10" />
                                            <p className="text-slate-400 text-xs text-center">{img.label}</p>
                                        </div>
                                    ) : (
                                        <div key={img.label} className="h-24 bg-slate-900/40 rounded-xl border border-white/5 flex items-center justify-center">
                                            <p className="text-slate-600 text-xs">{img.label} (optional)</p>
                                        </div>
                                    )
                                ))}
                            </div>
                            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3 text-xs text-blue-300">
                                ℹ️ Documents are visible only to authorised verification admins. They are never shared with verifiers or third parties.
                            </div>
                            {error && <p className="text-red-400 text-sm flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" />{error}</p>}
                            <div className="flex gap-3">
                                <button onClick={() => { setUploadStep(1); setError(""); }}
                                    className="px-5 py-3 border border-white/10 text-slate-400 hover:text-white rounded-xl text-sm transition-colors flex items-center gap-1.5">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={handleDocUpload} disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Submit Documents</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // ── Dashboard ────────────────────────────────────────────────────────────────
    if (step === "dashboard") return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-slate-900 to-slate-950 p-4">
            {toast && <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl ${toast.ok ? "bg-green-600" : "bg-red-600"} text-white`}>{toast.msg}</div>}
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl">Hi, {backendProfile?.name?.split(" ")[0] || "User"} 👋</h1>
                            <p className="text-slate-400 text-xs">Identity Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => loadStatus(backendProfile!.user_id)} className="text-slate-400 hover:text-white transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={logout} className="text-slate-500 hover:text-white text-xs transition-colors">Sign out</button>
                    </div>
                </div>

                {/* Checklist strip */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: "Profile Completed", done: status?.profile_completed, icon: <UserCircle className="w-4 h-4" /> },
                        { label: "Docs Uploaded", done: status?.docs_uploaded, icon: <Upload className="w-4 h-4" /> },
                        { label: "Verified", done: status?.request?.status === "approved", icon: <BadgeCheck className="w-4 h-4" /> },
                    ].map(step => (
                        <div key={step.label} className={`rounded-2xl px-3 py-3 border flex flex-col items-center gap-2 text-center ${step.done ? "bg-green-900/20 border-green-700/30" : "bg-slate-800/40 border-white/5"}`}>
                            <span className={step.done ? "text-green-400" : "text-slate-600"}>{step.icon}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${step.done ? "text-green-300" : "text-slate-500"}`}>{step.label}</span>
                        </div>
                    ))}
                </div>

                {/* Reupload alert */}
                {status?.request?.status === "reupload_requested" && (
                    <div className="bg-orange-900/20 border border-orange-700/40 rounded-2xl p-4 mb-5 flex gap-3 items-start">
                        <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-orange-300 font-semibold text-sm">Document Reupload Required</p>
                            <p className="text-slate-400 text-xs mt-1">{status.request.reupload_reason}</p>
                            <button onClick={() => { setUploadStep(0); setStep("upload"); }}
                                className="mt-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                                Upload New Documents →
                            </button>
                        </div>
                    </div>
                )}

                {/* Wallet (approved) */}
                {status?.credential && (
                    <button onClick={() => setStep("wallet")} className="w-full mb-5 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-700/40 hover:border-green-500/60 rounded-2xl p-5 flex items-center gap-4 transition-all group">
                        <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center shrink-0">
                            <Wallet className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-green-300 font-bold text-base">View Your PrivaSeal Credential</p>
                            <p className="text-slate-400 text-xs mt-0.5">ID: {status.credential.privaseal_id} · Age Verified ✓</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}

                {/* Status card */}
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Verification Status</h2>
                        <StatusBadge status={status?.request?.status || "not_submitted"} />
                    </div>
                    {status?.request?.reject_reason && (
                        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3 text-red-300 text-sm mb-3">
                            ❌ {status.request.reject_reason}
                        </div>
                    )}
                    {status?.request?.submitted_at && (
                        <p className="text-slate-500 text-xs">Submitted: {new Date(status.request.submitted_at).toLocaleString()}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button onClick={() => setStep("profile")}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold border ${status?.profile_completed ? "bg-slate-800/40 border-green-700/30 text-green-400" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"}`}>
                        <UserCircle className="w-5 h-5" />
                        {status?.profile_completed ? "Update Identity Profile ✓" : "Step 1: Complete Identity Profile"}
                    </button>

                    {!status?.docs_uploaded && (
                        <button
                            onClick={() => { setUploadStep(0); setStep("upload"); }}
                            disabled={!status?.profile_completed}
                            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg 
                                ${!status?.profile_completed
                                    ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5"
                                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-500/20 border-none"}`}>
                            <Upload className="w-5 h-5" />
                            {status?.profile_completed ? "Step 2: Upload Identity Documents" : "Complete Step 1 to unlock upload"}
                        </button>
                    )}
                </div>

                {status?.docs_uploaded && (status?.request?.status === "not_submitted" || status?.request?.status === "rejected") && (
                    <button onClick={handleSubmitRequest} disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : <><FileText className="w-5 h-5" /> Submit Verification Request</>}
                    </button>
                )}

                {status?.request?.status === "pending" && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center text-amber-300 text-sm">
                        ⏳ Your documents are under admin review. We'll notify you once processed.
                    </div>
                )}
            </div>
        </div>
    );

    // ── Wallet Page ──────────────────────────────────────────────────────────────
    if (step === "wallet" && status?.credential) return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-green-950 to-slate-950 p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm">
                <button onClick={() => setStep("dashboard")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </button>

                {/* Credential card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-green-700/40 rounded-3xl overflow-hidden shadow-2xl shadow-green-500/10">
                    {/* Header band */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-white" />
                            <div>
                                <p className="text-white font-bold text-base">PrivaSeal</p>
                                <p className="text-green-100 text-xs">Identity Credential</p>
                            </div>
                        </div>
                        <BadgeCheck className="w-8 h-8 text-white/80" />
                    </div>

                    <div className="px-6 py-6 space-y-5">
                        {/* QR Code */}
                        <div className="flex justify-center">
                            <QRDisplay uri={status.credential.qr_uri || `privaseal://verify?id=${status.credential.privaseal_id}`} size={160} />
                        </div>

                        {/* ID + Status */}
                        <div className="bg-slate-900/60 rounded-2xl px-5 py-4 text-center">
                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">PrivaSeal ID</p>
                            <p className="text-white font-mono font-bold text-2xl tracking-widest">{status.credential.privaseal_id}</p>
                        </div>

                        <div className="bg-green-900/30 border border-green-700/40 rounded-2xl px-5 py-4 flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                            <div>
                                <p className="text-green-300 font-bold">Age Verified ✓</p>
                                <p className="text-slate-400 text-xs">Issued by PrivaSeal Authority</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Issued</span>
                            <span className="text-slate-300">{status.credential.issued_at ? new Date(status.credential.issued_at).toLocaleDateString() : "—"}</span>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-700/20 rounded-xl p-3 text-center">
                            <p className="text-blue-300 text-xs">🔐 Show this QR to any PrivaSeal verifier — your name, DOB & documents are never revealed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return null;
}

export default function UserPortal() {
    return (
        <RoleGuard allowedRoles={["user"]}>
            <UserPortalContent />
        </RoleGuard>
    );
}
