"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
    ShieldCheck,
    ShieldX,
    QrCode,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    RotateCcw,
    Play,
    Send,
    Activity,
    BarChart3,
    History,
    Zap,
} from "lucide-react";

// ─── Config ──────────────────────────────────────────────────────────────────

const BACKEND = "http://localhost:8000";
const POLL_INTERVAL = 3000; // 3 s

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerificationRequest {
    id: string;
    predicateKey: string;
    predicateLabel: string;
    predicateDesc: string;
    predicateIcon: string;
    credentialType: string;
    status: string;
    statusLabel: string;
    qrUri: string;
    createdAt: string;
    expiresAt: string;
    verifiedAt: string | null;
    proofHash: string | null;
    errorMsg: string | null;
}

interface Stats {
    totalRequests: number;
    verified: number;
    failed: number;
    pending: number;
    successRate: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusConfig(status: string): {
    color: string; dotColor: string; icon: React.ReactNode; label: string;
} {
    switch (status) {
        case "verified":
            return {
                color: "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                dotColor: "bg-green-500",
                icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                label: "Verified",
            };
        case "failed":
            return {
                color: "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
                dotColor: "bg-red-500",
                icon: <XCircle className="w-3.5 h-3.5" />,
                label: "Failed",
            };
        case "verifying":
            return {
                color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
                dotColor: "bg-blue-500 animate-pulse",
                icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
                label: "Verifying",
            };
        case "waiting_proof":
        default:
            return {
                color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400",
                dotColor: "bg-amber-400 animate-pulse",
                icon: <Clock className="w-3.5 h-3.5" />,
                label: "Awaiting Proof",
            };
    }
}

function shortId(id: string) { return id.slice(0, 8).toUpperCase(); }
function fmtDate(iso: string) {
    try {
        return new Date(iso).toLocaleString("en-IN", {
            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        });
    } catch { return iso; }
}

// ─── QR Code (SVG-based, no external lib) ────────────────────────────────────

function QRPlaceholder({ uri, size = 180 }: { uri: string; size?: number }) {
    // Simple visual QR placeholder — in production replace with a real QR lib
    const cells = 21;
    const cell = size / cells;

    // Deterministic pattern from URI hash
    const hash = Array.from(uri).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0);
    const pattern = Array.from({ length: cells * cells }, (_, i) => {
        const row = Math.floor(i / cells);
        const col = i % cells;
        // Finder patterns (corners)
        if ((row < 8 && col < 8) ||
            (row < 8 && col > cells - 9) ||
            (row > cells - 9 && col < 8)) return true;
        // Data modules (deterministic)
        return ((hash >> ((i % 32))) & 1) === 1;
    });

    return (
        <div
            className="inline-block p-3 bg-white rounded-xl shadow-inner border border-gray-100"
            title={uri}
            aria-label="Verification QR Code"
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {pattern.map((filled, i) => {
                    const row = Math.floor(i / cells);
                    const col = i % cells;
                    return filled ? (
                        <rect
                            key={i}
                            x={col * cell}
                            y={row * cell}
                            width={cell}
                            height={cell}
                            fill="#111827"
                            rx={cell * 0.1}
                        />
                    ) : null;
                })}
            </svg>
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: {
    label: string; value: number | string; sub: string; accent: string;
}) {
    return (
        <Card className={`border-t-4 ${accent}`}>
            <CardHeader className="pb-1 pt-4 px-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
                <div className="text-3xl font-bold text-foreground">{value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
        </Card>
    );
}

// ─── Predicate options ────────────────────────────────────────────────────────

const PREDICATE_OPTIONS = [
    { key: "age_gt_18", label: "🪪  Age > 18", desc: "Proves holder is over 18" },
    { key: "age_gt_21", label: "🍺  Age > 21", desc: "Proves holder is over 21" },
    { key: "vaccinated", label: "💉  Vaccinated", desc: "Valid vaccination record" },
    { key: "prescription_valid", label: "💊  Prescription Valid", desc: "Active prescription" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VerifierPage() {
    const { toast } = useToast();
    const router = useRouter();

    // Request creation state
    const [predicateKey, setPredicateKey] = useState("age_gt_18");
    const [creating, setCreating] = useState(false);
    const [activeRequest, setActiveRequest] = useState<VerificationRequest | null>(null);

    // Simulation state
    const [simulating, setSimulating] = useState(false);

    // History
    const [history, setHistory] = useState<VerificationRequest[]>([]);
    const [histLoading, setHistLoading] = useState(true);

    // Stats
    const [stats, setStats] = useState<Stats | null>(null);

    // Polling ref
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Fetch stats ─────────────────────────────────────────────────────

    const fetchStats = useCallback(async () => {
        try {
            const r = await fetch(`${BACKEND}/api/verifier/stats`, { cache: "no-store" });
            if (r.ok) setStats(await r.json());
        } catch { /* silent */ }
    }, []);

    // ── Fetch history ───────────────────────────────────────────────────

    const fetchHistory = useCallback(async () => {
        try {
            const r = await fetch(`${BACKEND}/api/verifier/requests?per_page=20`, { cache: "no-store" });
            if (r.ok) {
                const j = await r.json();
                setHistory(j.data ?? []);
            }
        } catch { /* silent */ }
        finally { setHistLoading(false); }
    }, []);

    // ── Poll active request status ───────────────────────────────────────

    const pollActiveRequest = useCallback(async (id: string) => {
        try {
            const r = await fetch(`${BACKEND}/api/verifier/requests/${id}`, { cache: "no-store" });
            if (!r.ok) return;
            const j = await r.json();
            const req: VerificationRequest = j.request;
            setActiveRequest(req);

            if (req.status === "verified" || req.status === "failed") {
                // Stop polling
                if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
                fetchHistory();
                fetchStats();
                toast({
                    title: req.status === "verified" ? "✅ Proof Verified!" : "❌ Verification Failed",
                    description: req.status === "verified"
                        ? `Predicate "${req.predicateLabel}" satisfied.`
                        : req.errorMsg ?? "Proof did not satisfy the predicate.",
                    variant: req.status === "verified" ? "default" : "destructive",
                });
            }
        } catch { /* silent */ }
    }, [fetchHistory, fetchStats, toast]);

    // ── Create request ───────────────────────────────────────────────────

    const handleCreateRequest = async () => {
        setCreating(true);
        try {
            const r = await fetch(`${BACKEND}/api/verifier/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ predicate_key: predicateKey }),
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const j = await r.json();
            setActiveRequest(j.request);

            toast({ title: "Verification Request Created", description: "Show QR code to the user's wallet." });

            // Start polling
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = setInterval(() => pollActiveRequest(j.request.id), POLL_INTERVAL);
        } catch (err: unknown) {
            toast({ title: "Failed", description: String(err), variant: "destructive" });
        } finally {
            setCreating(false);
        }
    };

    // ── Simulate wallet submitting proof (demo mode) ─────────────────────

    const handleSimulateProof = async () => {
        if (!activeRequest) return;
        setSimulating(true);
        try {
            // Mark as received on backend
            setActiveRequest(prev => prev ? { ...prev, status: "verifying", statusLabel: "Verifying…" } : prev);

            const r = await fetch(`${BACKEND}/api/verifier/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    request_id: activeRequest.id,
                    proof: `demo-proof-${Date.now()}`,
                    revealed_attributes: { demo: true },
                }),
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const j = await r.json();
            setActiveRequest(j.request);

            if (j.request.status === "verified" || j.request.status === "failed") {
                if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
                fetchHistory();
                fetchStats();
                toast({
                    title: j.request.status === "verified" ? "✅ Verified!" : "❌ Failed",
                    description: j.request.status === "verified"
                        ? "ZK Proof validated successfully."
                        : j.request.errorMsg ?? "Proof failed.",
                    variant: j.request.status === "verified" ? "default" : "destructive",
                });
            }
        } catch (err: unknown) {
            toast({ title: "Simulation Failed", description: String(err), variant: "destructive" });
        } finally {
            setSimulating(false);
        }
    };

    // ── Reset ───────────────────────────────────────────────────────────

    const handleReset = () => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        setActiveRequest(null);
    };

    // ── Init & cleanup ──────────────────────────────────────────────────

    useEffect(() => {
        fetchHistory();
        fetchStats();
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [fetchHistory, fetchStats]);

    // ── Derived ─────────────────────────────────────────────────────────

    const selectedPred = PREDICATE_OPTIONS.find(p => p.key === predicateKey)!;
    const activeStatus = activeRequest ? statusConfig(activeRequest.status) : null;
    const isTerminal = activeRequest?.status === "verified" || activeRequest?.status === "failed";
    const canSimulate = activeRequest && !isTerminal && !simulating;

    // ════════════════════════════════════════════════════════════════════

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl font-primary space-y-8">

            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </span>
                        Verifier Portal
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1 ml-[52px]">
                        Zero-Knowledge Proof verification · BBS+ Selective Disclosure
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { fetchHistory(); fetchStats(); }}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </div>

            {/* ── Stats Row ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Requests"
                    value={stats?.totalRequests ?? 0}
                    sub="All time"
                    accent="border-t-blue-500"
                />
                <StatCard
                    label="Verified"
                    value={stats?.verified ?? 0}
                    sub={`${stats?.successRate ?? 0}% success rate`}
                    accent="border-t-green-500"
                />
                <StatCard
                    label="Failed"
                    value={stats?.failed ?? 0}
                    sub="Proof rejected"
                    accent="border-t-red-500"
                />
                <StatCard
                    label="Pending"
                    value={stats?.pending ?? 0}
                    sub="Awaiting proof"
                    accent="border-t-amber-500"
                />
            </div>

            {/* ── Main Grid ─────────────────────────────────────── */}
            <div className="grid lg:grid-cols-5 gap-6">

                {/* ── Left col: Create + QR ──────────────── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Create Request Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Play className="w-4 h-4 text-blue-600" />
                                New Verification Request
                            </CardTitle>
                            <CardDescription>Select predicate and generate a QR code for the user&apos;s wallet.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Predicate</label>
                                <Select value={predicateKey} onValueChange={setPredicateKey} disabled={!!activeRequest && !isTerminal}>
                                    <SelectTrigger id="predicate-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PREDICATE_OPTIONS.map(p => (
                                            <SelectItem key={p.key} value={p.key}>
                                                <span className="flex flex-col">
                                                    <span>{p.label}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">{selectedPred.desc}</p>
                            </div>

                            {!activeRequest || isTerminal ? (
                                <Button
                                    id="generate-request-btn"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                    onClick={handleCreateRequest}
                                    disabled={creating}
                                >
                                    {creating
                                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                                        : <><QrCode className="w-4 h-4 mr-2" /> Generate Verification Request</>
                                    }
                                </Button>
                            ) : (
                                <Button
                                    id="cancel-request-btn"
                                    variant="outline"
                                    className="w-full text-muted-foreground"
                                    onClick={handleReset}
                                >
                                    Cancel Request
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* QR Card */}
                    {activeRequest && (
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <QrCode className="w-4 h-4 text-blue-600" />
                                    Scan QR to Verify
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    User scans this from their PrivaSeal Wallet
                                </p>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4 py-6">
                                <QRPlaceholder uri={activeRequest.qrUri} size={168} />
                                <div className="text-center space-y-1">
                                    <p className="text-xs font-mono text-muted-foreground bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border">
                                        REQ·{shortId(activeRequest.id)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {activeRequest.predicateIcon} {activeRequest.predicateLabel}
                                    </p>
                                </div>

                                {/* Demo mode: simulate wallet */}
                                {canSimulate && (
                                    <div className="w-full pt-2 border-t space-y-2">
                                        <p className="text-center text-[11px] text-muted-foreground">
                                            — Demo Mode —
                                        </p>
                                        <Button
                                            id="simulate-proof-btn"
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                                            onClick={handleSimulateProof}
                                            disabled={simulating}
                                        >
                                            {simulating
                                                ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Verifying…</>
                                                : <><Send className="w-3.5 h-3.5 mr-2" /> Simulate Wallet Proof</>
                                            }
                                        </Button>
                                    </div>
                                )}

                                {isTerminal && (
                                    <Button
                                        id="new-request-btn"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={handleReset}
                                    >
                                        New Request
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* ── Right col: Status + History ────────── */}
                <div className="lg:col-span-3 space-y-5">

                    {/* Status Panel */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="w-4 h-4 text-blue-600" />
                                Verification Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!activeRequest ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                        <ShieldCheck className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium">No active request</p>
                                    <p className="text-muted-foreground text-xs mt-1">Generate a verification request to begin</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Status indicator */}
                                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${activeStatus!.color}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full ${activeStatus!.dotColor} shrink-0`} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 font-semibold">
                                                {activeStatus!.icon}
                                                {activeRequest.statusLabel}
                                            </div>
                                            {activeRequest.status === "waiting_proof" && (
                                                <p className="text-xs mt-0.5 opacity-80">Polling every {POLL_INTERVAL / 1000}s…</p>
                                            )}
                                            {activeRequest.status === "verified" && activeRequest.proofHash && (
                                                <p className="text-xs mt-0.5 font-mono opacity-80">Proof hash: #{activeRequest.proofHash}</p>
                                            )}
                                            {activeRequest.status === "failed" && activeRequest.errorMsg && (
                                                <p className="text-xs mt-0.5 opacity-80">{activeRequest.errorMsg}</p>
                                            )}
                                        </div>
                                        {activeRequest.status === "waiting_proof" && (
                                            <Loader2 className="w-4 h-4 animate-spin shrink-0 opacity-60" />
                                        )}
                                    </div>

                                    {/* Request metadata */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {[
                                            { label: "Request ID", value: `REQ·${shortId(activeRequest.id)}` },
                                            { label: "Predicate", value: `${activeRequest.predicateIcon} ${activeRequest.predicateLabel}` },
                                            { label: "Created", value: fmtDate(activeRequest.createdAt) },
                                            { label: "Expires", value: fmtDate(activeRequest.expiresAt) },
                                            ...(activeRequest.verifiedAt ? [
                                                { label: "Resolved At", value: fmtDate(activeRequest.verifiedAt) }
                                            ] : []),
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-muted/40 rounded-lg px-3 py-2">
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
                                                <p className="font-medium text-foreground mt-0.5 truncate text-sm">{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Step progress */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verification Pipeline</p>
                                        {[
                                            { key: "waiting_proof", label: "Request Created", icon: <Zap className="w-3 h-3" /> },
                                            { key: "proof_received", label: "Proof Received", icon: <Send className="w-3 h-3" /> },
                                            { key: "verifying", label: "ZKP Verifying", icon: <Loader2 className="w-3 h-3" /> },
                                            { key: "verified", label: "Result", icon: <ShieldCheck className="w-3 h-3" /> },
                                        ].map((step, i) => {
                                            const order = ["waiting_proof", "proof_received", "verifying", "verified", "failed"];
                                            const cur = order.indexOf(activeRequest.status);
                                            const me = order.indexOf(step.key);
                                            const done = cur > me || activeRequest.status === "verified";
                                            const active = cur === me;
                                            const failed = activeRequest.status === "failed" && step.key === "verified";
                                            return (
                                                <div key={step.key} className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border-2 transition-colors
                                                        ${failed ? "bg-red-100 border-red-400 text-red-600" :
                                                            done ? "bg-green-100 border-green-400 text-green-600" :
                                                                active ? "bg-blue-100 border-blue-400 text-blue-600 animate-pulse" :
                                                                    "bg-gray-100 border-gray-200 text-gray-400"}`}
                                                    >
                                                        {failed ? "✕" : done ? "✓" : i + 1}
                                                    </div>
                                                    <span className={`text-sm ${done || active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                                        {step.label}
                                                        {failed && <span className="text-red-500 ml-2">Failed</span>}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* History Table */}
                    <Card>
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <History className="w-4 h-4 text-blue-600" />
                                Verification History
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">{history.length} record{history.length !== 1 ? "s" : ""}</span>
                        </CardHeader>
                        <CardContent className="p-0">
                            {histLoading ? (
                                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <BarChart3 className="w-8 h-8 text-gray-300 mb-2" />
                                    <p className="text-sm text-muted-foreground">No verification history yet.</p>
                                    <p className="text-xs text-muted-foreground mt-1">Create a request above to get started.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="text-xs uppercase tracking-wider">
                                                <TableHead>Request ID</TableHead>
                                                <TableHead>Predicate</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {history.map(req => {
                                                const sc = statusConfig(req.status);
                                                return (
                                                    <TableRow
                                                        key={req.id}
                                                        className={`hover:bg-muted/30 transition-colors ${req.id === activeRequest?.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                                                    >
                                                        <TableCell>
                                                            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded" title={req.id}>
                                                                REQ·{shortId(req.id)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm">{req.predicateIcon} {req.predicateLabel}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sc.color}`}>
                                                                {sc.icon}
                                                                {sc.label}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                            {fmtDate(req.createdAt)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>

        </div>
    );
}
