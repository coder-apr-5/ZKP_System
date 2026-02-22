"use client";

import { useState, useEffect, useCallback } from "react";
import {
    ShieldAlert, CheckCircle2, XCircle, Clock, Loader2, FileText,
    RotateCcw, ArrowLeft, User, AlertTriangle, ScrollText, Upload,
    Eye, Camera, ChevronDown, ChevronUp, BadgeCheck, ZapIcon,
    Activity, TrendingUp
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api/privaseal";


interface Request {
    id: string; user_name: string; user_email: string; doc_type: string;
    status: string; submitted_at: string; reviewed_at: string | null;
    reject_reason: string | null; reupload_reason: string | null; privaseal_id: string | null;
}
interface RequestDetail extends Request {
    front_image: string | null; back_image: string | null; selfie_image: string | null;
}
interface Stats { total: number; pending: number; approved: number; rejected: number; reupload: number; }

// ── Image Preview Helper ───────────────────────────────────────────────────────
function DocImage({ src, label }: { src: string | null; label: string }) {
    const [zoom, setZoom] = useState(false);
    if (!src) return (
        <div className="bg-slate-900/60 rounded-xl h-28 flex flex-col items-center justify-center gap-1">
            <FileText className="w-5 h-5 text-slate-600" />
            <p className="text-slate-600 text-xs">{label} (not provided)</p>
        </div>
    );
    return (
        <>
            <div className="group relative rounded-xl overflow-hidden border border-white/10 cursor-pointer" onClick={() => setZoom(true)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={label} className="w-full h-28 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{label}</div>
            </div>
            {zoom && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setZoom(false)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={label} className="max-w-full max-h-full rounded-2xl shadow-2xl" />
                    <button className="absolute top-4 right-4 text-white text-xl" onClick={() => setZoom(false)}>✕</button>
                </div>
            )}
        </>
    );
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
    const m: Record<string, string> = {
        pending: "bg-amber-900/40 border-amber-700/60 text-amber-300",
        approved: "bg-green-900/40 border-green-700/60 text-green-300",
        rejected: "bg-red-900/40 border-red-700/60 text-red-300",
        reupload_requested: "bg-orange-900/40 border-orange-700/60 text-orange-300",
    };
    const icons: Record<string, React.ReactNode> = {
        pending: <Clock className="w-3 h-3" />,
        approved: <CheckCircle2 className="w-3 h-3" />,
        rejected: <XCircle className="w-3 h-3" />,
        reupload_requested: <Upload className="w-3 h-3" />,
    };
    const labels: Record<string, string> = {
        pending: "Pending", approved: "Approved", rejected: "Rejected", reupload_requested: "Reupload",
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold capitalize ${m[status] || "text-slate-400 border-slate-700 bg-slate-800"}`}>
            {icons[status]} {labels[status] || status}
        </span>
    );
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────
function AdminPanelContent() {
    const { backendProfile, logout } = useAuth();
    const admin_id = backendProfile?.user_id || "admin-001";

    const [requests, setR] = useState<Request[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, reupload: 0 });
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);
    const [detail, setDetail] = useState<RequestDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [reuploadReason, setReuploadReason] = useState("");
    const [actionMode, setActionMode] = useState<"none" | "reject" | "reupload">("none");
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "reupload_requested">("all");
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const [auditLog, setAuditLog] = useState<{ action: string; timestamp: string; detail: string }[]>([]);
    const [showAudit, setShowAudit] = useState(false);

    const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 4000); };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`${API}/admin/requests?status=${filter === "all" ? "" : filter}&per_page=50`);
            if (r.ok) {
                const j = await r.json();
                setR(j.data);
                setStats({ total: j.total, pending: j.pending, approved: j.approved, rejected: j.rejected, reupload: j.reupload || 0 });
            }
        } catch { /* silent */ } finally { setLoading(false); }
    }, [filter]);

    const loadAudit = async () => {
        const r = await fetch(`${API}/audit?per_page=30`);
        if (r.ok) { const j = await r.json(); setAuditLog(j.data); }
    };

    useEffect(() => { load(); }, [load]);

    const openDetail = async (req: Request) => {
        setDetail(null); setActionMode("none"); setRejectReason(""); setReuploadReason("");
        setLoadingDetail(true);
        try {
            const r = await fetch(`${API}/admin/requests/${req.id}`);
            if (r.ok) { const j = await r.json(); setDetail(j.request); }
        } catch { /* silent */ } finally { setLoadingDetail(false); }
    };

    const approve = async () => {
        if (!detail) return;
        setActing(detail.id);
        try {
            const r = await fetch(`${API}/admin/approve/${detail.id}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ admin_id: admin_id }),
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.detail);
            showToast(`✅ Approved! PrivaSeal ID: ${j.privaseal_id}`);
            setDetail(null); load();
        } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Error", false); }
        finally { setActing(null); }
    };

    const reject = async () => {
        if (!detail) return;
        setActing(detail.id);
        try {
            const r = await fetch(`${API}/admin/reject/${detail.id}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ admin_id: admin_id, reason: rejectReason || "Does not meet requirements" }),
            });
            if (!r.ok) throw new Error("Reject failed");
            showToast("Request rejected.");
            setDetail(null); load();
        } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Error", false); }
        finally { setActing(null); }
    };

    const requestReupload = async () => {
        if (!detail) return;
        setActing(detail.id);
        try {
            const r = await fetch(`${API}/admin/request-reupload/${detail.id}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ admin_id: admin_id, reason: reuploadReason || "Documents are unclear or incomplete" }),
            });
            if (!r.ok) throw new Error("Reupload request failed");
            showToast("User notified to reupload documents.");
            setDetail(null); load();
        } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Error", false); }
        finally { setActing(null); }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950 via-slate-900 to-slate-950 p-4 md:p-8">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl transition-all ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                    {toast.msg}
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-slate-400 hover:text-white transition-colors mr-1"><ArrowLeft className="w-5 h-5" /></Link>
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <ShieldAlert className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl tracking-tight">Admin Panel</h1>
                            <p className="text-slate-400 text-xs">Auth: {backendProfile?.name || admin_id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={logout} className="text-slate-500 hover:text-white text-xs transition-colors">Sign out</button>

                        <button onClick={() => { setShowAudit(!showAudit); if (!showAudit) loadAudit(); }}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg">
                            <ScrollText className="w-4 h-4" /> Audit Log
                            {showAudit ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <button onClick={load} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Audit log dropdown */}
                {showAudit && (
                    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 mb-6 max-h-48 overflow-y-auto">
                        {auditLog.length === 0 ? <p className="text-slate-500 text-sm text-center">No audit entries</p> : auditLog.map((a, i) => (
                            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0 text-xs">
                                <span className="text-slate-500 w-36 shrink-0">{new Date(a.timestamp).toLocaleTimeString()}</span>
                                <span className={`font-mono font-semibold w-32 shrink-0 ${a.action.includes("APPROVE") ? "text-green-400" : a.action.includes("REJECT") ? "text-red-400" : "text-blue-400"}`}>{a.action}</span>
                                <span className="text-slate-400 truncate">{a.detail}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-white font-bold text-lg">Verification Requests</h2>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                {/* Local Requests Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: "Total", value: stats.total, color: "border-t-slate-500", icon: <FileText className="w-4 h-4 text-slate-400" /> },
                        { label: "Pending", value: stats.pending, color: "border-t-amber-500", icon: <Clock className="w-4 h-4 text-amber-400" /> },
                        { label: "Approved", value: stats.approved, color: "border-t-green-500", icon: <CheckCircle2 className="w-4 h-4 text-green-400" /> },
                        { label: "Rejected", value: stats.rejected, color: "border-t-red-500", icon: <XCircle className="w-4 h-4 text-red-400" /> },
                        { label: "Reupload", value: stats.reupload, color: "border-t-orange-500", icon: <Upload className="w-4 h-4 text-orange-400" /> },
                    ].map(s => (
                        <div key={s.label} className={`bg-slate-800/60 border border-white/10 border-t-4 ${s.color} rounded-2xl px-4 py-4 backdrop-blur-sm`}>
                            <div className="flex items-center gap-1.5 mb-1">{s.icon}<span className="text-slate-500 text-xs uppercase tracking-wider">{s.label}</span></div>
                            <div className="text-white text-3xl font-bold tabular-nums">{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1.5 mb-5 bg-slate-900/60 border border-white/10 rounded-xl p-1 w-fit">
                    {(["all", "pending", "approved", "rejected", "reupload_requested"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}>
                            {f === "reupload_requested" ? "Reupload" : f}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-5 gap-6">
                    {/* Request list */}
                    <div className="md:col-span-3 bg-slate-800/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                        {loading ? (
                            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin" /> Loading…
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <ScrollText className="w-8 h-8 text-slate-600 mb-2" />
                                <p className="text-slate-400 text-sm">No {filter !== "all" ? filter : ""} requests</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500">User</th>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 hidden sm:table-cell">Doc</th>
                                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => (
                                        <tr key={req.id} onClick={() => openDetail(req)}
                                            className={`border-b border-white/5 cursor-pointer transition-colors ${detail?.id === req.id ? "bg-purple-900/20" : "hover:bg-white/5"}`}>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center shrink-0">
                                                        <User className="w-3.5 h-3.5 text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-medium leading-tight">{req.user_name}</p>
                                                        <p className="text-slate-500 text-xs">{new Date(req.submitted_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-400 text-xs hidden sm:table-cell">{req.doc_type}</td>
                                            <td className="px-4 py-3.5"><StatusPill status={req.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Detail panel */}
                    <div className="md:col-span-2">
                        {loadingDetail ? (
                            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-8 flex items-center justify-center backdrop-blur-sm">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                            </div>
                        ) : detail ? (
                            <div className="bg-slate-800/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                                {/* User info */}
                                <div className="border-b border-white/10 px-5 py-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{detail.user_name}</p>
                                            <p className="text-slate-400 text-xs">{detail.user_email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                        <div className="bg-slate-900/60 rounded-lg px-3 py-2">
                                            <p className="text-slate-500">Doc Type</p>
                                            <p className="text-white font-medium">{detail.doc_type}</p>
                                        </div>
                                        <div className="bg-slate-900/60 rounded-lg px-3 py-2">
                                            <p className="text-slate-500">Status</p>
                                            <StatusPill status={detail.status} />
                                        </div>
                                    </div>
                                </div>

                                {/* Document images */}
                                <div className="border-b border-white/10 px-5 py-4">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Camera className="w-3.5 h-3.5" /> Document Images (Admin Only)
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <DocImage src={detail.front_image} label="Front" />
                                        <DocImage src={detail.back_image} label="Back" />
                                        <DocImage src={detail.selfie_image} label="Selfie" />
                                    </div>
                                </div>

                                {/* Rejection/Reupload reason notice */}
                                {detail.reject_reason && (
                                    <div className="px-5 py-3 border-b border-white/10 bg-red-900/10">
                                        <p className="text-red-400 text-xs">Rejection: {detail.reject_reason}</p>
                                    </div>
                                )}
                                {detail.reupload_reason && (
                                    <div className="px-5 py-3 border-b border-white/10 bg-orange-900/10">
                                        <p className="text-orange-400 text-xs">Reupload requested: {detail.reupload_reason}</p>
                                    </div>
                                )}
                                {detail.privaseal_id && (
                                    <div className="px-5 py-3 border-b border-white/10 bg-green-900/10 flex items-center gap-2">
                                        <BadgeCheck className="w-4 h-4 text-green-400" />
                                        <p className="text-green-300 text-sm font-mono font-semibold">{detail.privaseal_id}</p>
                                    </div>
                                )}

                                {/* Action buttons */}
                                {(detail.status === "pending" || detail.status === "reupload_requested") && (
                                    <div className="px-5 py-4 space-y-3">
                                        {actionMode === "none" && (
                                            <div className="space-y-2">
                                                <button onClick={approve} disabled={!!acting}
                                                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                                                    {acting === detail.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve & Issue PrivaSeal ID
                                                </button>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button onClick={() => setActionMode("reupload")} disabled={!!acting}
                                                        className="bg-orange-900/30 border border-orange-700/50 hover:bg-orange-700 text-orange-300 hover:text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
                                                        <Upload className="w-3.5 h-3.5" /> Request Reupload
                                                    </button>
                                                    <button onClick={() => setActionMode("reject")} disabled={!!acting}
                                                        className="bg-red-900/30 border border-red-700/50 hover:bg-red-700 text-red-300 hover:text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
                                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {actionMode === "reject" && (
                                            <div className="space-y-2">
                                                <textarea placeholder="Rejection reason (required)" rows={2} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                                    className="w-full bg-slate-900/60 border border-red-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-xs resize-none" />
                                                <div className="flex gap-2">
                                                    <button onClick={reject} disabled={!!acting}
                                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
                                                        {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />} Confirm Reject
                                                    </button>
                                                    <button onClick={() => setActionMode("none")} className="px-4 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs transition-colors">Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                        {actionMode === "reupload" && (
                                            <div className="space-y-2">
                                                <textarea placeholder="What needs to be fixed?" rows={2} value={reuploadReason} onChange={e => setReuploadReason(e.target.value)}
                                                    className="w-full bg-slate-900/60 border border-orange-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-xs resize-none" />
                                                <div className="flex gap-2">
                                                    <button onClick={requestReupload} disabled={!!acting}
                                                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
                                                        {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Send Request
                                                    </button>
                                                    <button onClick={() => setActionMode("none")} className="px-4 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs transition-colors">Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center h-full min-h-48">
                                <ZapIcon className="w-8 h-8 text-slate-600" />
                                <p className="text-slate-400 text-sm">Select a request<br />to review documents</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminPanel() {
    return (
        <RoleGuard allowedRoles={["admin"]}>
            <AdminPanelContent />
        </RoleGuard>
    );
}
