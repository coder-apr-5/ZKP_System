"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Lock, Activity, Users, Server, RefreshCw, AlertCircle, TrendingUp } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ThroughputPoint {
    time: string;
    value: number;
    users: number;
}

interface HistoryEntry {
    timestamp: string;
    concurrent_users: number;
    proof_gen_time_ms: number;
    verification_time_ms: number;
    proof_size_bytes: number;
    predicate_eval_ms: number;
    total_pipeline_ms: number;
}

interface BenchmarkData {
    proofGenTime: number;
    verificationTime: number;
    proofSize: number;
    privacyScore: string;
    entropyScore: number;
    throughput: ThroughputPoint[];
    p95LatencyMs: number;
    avgLatencyMs: number;
    concurrentUsers: number;
    history: HistoryEntry[];
}

// ─── Animated Counter ────────────────────────────────────────────────────────

function useAnimatedNumber(target: number, duration = 600) {
    const [displayed, setDisplayed] = useState(target);
    const prev = useRef(target);
    const raf = useRef<number | null>(null);

    useEffect(() => {
        const start = prev.current;
        const diff = target - start;
        if (diff === 0) return;

        const startTime = performance.now();
        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            setDisplayed(start + diff * ease);
            if (progress < 1) {
                raf.current = requestAnimationFrame(animate);
            } else {
                prev.current = target;
            }
        };
        raf.current = requestAnimationFrame(animate);
        return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    }, [target, duration]);

    return displayed;
}

// ─── Mini Sparkline Chart ─────────────────────────────────────────────────────

function Sparkline({ data }: { data: ThroughputPoint[] }) {
    if (!data.length) return (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Collecting data…
        </div>
    );

    const values = data.map(d => d.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const range = max - min || 1;

    // SVG path
    const W = 400;
    const H = 140;
    const pad = 10;
    const xs = data.map((_, i) => pad + (i / Math.max(data.length - 1, 1)) * (W - 2 * pad));
    const ys = data.map(d => H - pad - ((d.value - min) / range) * (H - 2 * pad));

    const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x},${ys[i]}`).join(" ");
    const areaPath = `${linePath} L ${xs[xs.length - 1]},${H - pad} L ${xs[0]},${H - pad} Z`;

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(221,83%,53%)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="hsl(221,83%,53%)" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(158,84%,39%)" />
                        <stop offset="100%" stopColor="hsl(221,83%,53%)" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map(f => (
                    <line key={f}
                        x1={pad} y1={pad + (1 - f) * (H - 2 * pad)}
                        x2={W - pad} y2={pad + (1 - f) * (H - 2 * pad)}
                        stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
                ))}

                {/* Area fill */}
                <path d={areaPath} fill="url(#chartGrad)" />

                {/* Line */}
                <path d={linePath} fill="none" stroke="url(#lineGrad)"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Dots on each point */}
                {xs.map((x, i) => (
                    <circle key={i} cx={x} cy={ys[i]} r="3"
                        fill="hsl(221,83%,53%)" stroke="white" strokeWidth="1.5" />
                ))}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] text-muted-foreground px-2 mt-1">
                {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 5)) === 0)
                    .map((d, i) => <span key={i}>{d.time}</span>)}
            </div>

            {/* Y-axis hint */}
            <div className="absolute top-1 right-2 text-[10px] text-muted-foreground">
                {Math.round(max)} req/s
            </div>
        </div>
    );
}

// ─── Entropy Bar ─────────────────────────────────────────────────────────────

function EntropyBar({ score }: { score: number }) {
    const pct = Math.min(100, (score / 8.0) * 100);
    return (
        <div>
            <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Proof Randomness</span>
                <span className="font-mono font-semibold text-green-500">
                    {score > 0 ? `${score} bits/byte` : "—"}
                </span>
            </div>
            <div className="h-2.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, hsl(158,84%,39%), hsl(221,83%,53%))"
                    }}
                />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0</span>
                <span>Max (8.0)</span>
            </div>
        </div>
    );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: number;
    suffix: string;
    decimals?: number;
    icon: React.ReactNode;
    color: string;
    sublabel: string;
    highlight?: boolean;
}

function StatCard({ label, value, suffix, decimals = 0, icon, color, sublabel, highlight }: StatCardProps) {
    const animated = useAnimatedNumber(value);
    const displayVal = decimals > 0 ? animated.toFixed(decimals) : Math.round(animated).toString();

    return (
        <Card className={`relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${highlight ? "ring-2 ring-primary/30" : ""}`}>
            {/* Gradient background accent */}
            <div
                className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at top right, ${color}, transparent 70%)` }}
            />
            <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                    {icon}
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div
                    className="text-3xl font-black tabular-nums tracking-tight"
                    style={{ color }}
                >
                    {displayVal}
                    <span className="text-lg font-semibold ml-1 opacity-70">{suffix}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{sublabel}</p>
            </CardContent>
        </Card>
    );
}

// ─── Privacy Score Badge ──────────────────────────────────────────────────────

function PrivacyBadge({ score }: { score: string }) {
    const gradeColor: Record<string, string> = {
        "A+": "#10B981",
        "A": "#34D399",
        "B+": "#60A5FA",
        "B": "#93C5FD",
        "C": "#F59E0B",
        "—": "#9CA3AF",
    };
    const color = gradeColor[score] ?? "#9CA3AF";
    return (
        <div className="flex flex-col items-start">
            <span
                className="text-5xl font-black tabular-nums leading-none transition-all duration-700"
                style={{ color }}
            >
                {score || "—"}
            </span>
            <span className="text-[11px] text-muted-foreground mt-1.5">Unlinkability Grade</span>
        </div>
    );
}

// ─── Live Pulse Indicator ─────────────────────────────────────────────────────

function LivePulse({ active }: { active: boolean }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
                {active && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${active ? "bg-green-500" : "bg-gray-400"}`} />
            </span>
            <span className="text-xs text-muted-foreground">{active ? "Live" : "Connecting…"}</span>
        </span>
    );
}

// ─── History Table ────────────────────────────────────────────────────────────

function HistoryTable({ history }: { history: HistoryEntry[] }) {
    const recent = [...history].reverse().slice(0, 8);
    if (!recent.length) return null;

    return (
        <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b bg-muted/30">
                        <th className="text-left p-2 text-muted-foreground font-medium">Time</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">Users</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">Gen (ms)</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">Verify (ms)</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">Size (B)</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">Pipeline (ms)</th>
                    </tr>
                </thead>
                <tbody>
                    {recent.map((row, i) => (
                        <tr key={i} className={`border-b last:border-0 transition-colors ${i === 0 ? "bg-primary/5" : "hover:bg-muted/20"}`}>
                            <td className="p-2 font-mono text-[10px] text-muted-foreground">
                                {new Date(row.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="text-right p-2 font-mono">
                                <span className="inline-flex items-center gap-1">
                                    <Users className="w-3 h-3 text-muted-foreground" />
                                    {row.concurrent_users}
                                </span>
                            </td>
                            <td className="text-right p-2 font-mono text-blue-500">{row.proof_gen_time_ms.toFixed(1)}</td>
                            <td className="text-right p-2 font-mono text-green-500">{row.verification_time_ms.toFixed(1)}</td>
                            <td className="text-right p-2 font-mono text-orange-500">{row.proof_size_bytes}</td>
                            <td className="text-right p-2 font-mono font-semibold">{row.total_pipeline_ms.toFixed(1)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;
// Try direct backend first, fall back to Next.js proxy
const BACKEND_URLS = [
    "http://localhost:8000/api/benchmarks",
    "/api/benchmarks",
];

/** Demo data shown when backend is unreachable */
function makeDemoData(): BenchmarkData {
    const now = new Date();
    const throughput: ThroughputPoint[] = Array.from({ length: 8 }, (_, i) => ({
        time: new Date(now.getTime() - (7 - i) * 5000).toLocaleTimeString(),
        value: Math.round(80 + Math.random() * 160),
        users: Math.floor(3 + Math.random() * 17),
    }));
    return {
        proofGenTime: parseFloat((115 + Math.random() * 25).toFixed(1)),
        verificationTime: parseFloat((70 + Math.random() * 20).toFixed(1)),
        proofSize: Math.floor(350 + Math.random() * 70),
        privacyScore: "A+",
        entropyScore: parseFloat((7.88 + Math.random() * 0.11).toFixed(2)),
        throughput,
        p95LatencyMs: parseFloat((190 + Math.random() * 40).toFixed(1)),
        avgLatencyMs: parseFloat((160 + Math.random() * 40).toFixed(1)),
        concurrentUsers: Math.floor(5 + Math.random() * 13),
        history: [],
    };
}

export default function BenchmarksPage() {
    const [data, setData] = useState<BenchmarkData | null>(null);
    const [loading, setLoading] = useState(true);
    const [backendDown, setBackendDown] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [nextIn, setNextIn] = useState(5);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastFetchRef = useRef<Date | null>(null);

    const fetchBenchmarks = useCallback(async () => {
        let succeeded = false;
        for (const url of BACKEND_URLS) {
            try {
                const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(4000) });
                if (!res.ok) continue;
                const json: BenchmarkData = await res.json();
                setData(json);
                setBackendDown(false);
                setIsLive(true);
                lastFetchRef.current = new Date();
                setLastUpdated(new Date());
                succeeded = true;
                break;
            } catch {
                // try next URL
            }
        }
        if (!succeeded) {
            // Backend unreachable — show demo data so metrics are never all-zero
            setData(prev => prev ?? makeDemoData());
            setBackendDown(true);
            setIsLive(false);
        }
        setLoading(false);
    }, []);

    // Initial fetch + polling
    useEffect(() => {
        fetchBenchmarks();
        intervalRef.current = setInterval(fetchBenchmarks, POLL_INTERVAL_MS);
        // Countdown timer
        const tickId = setInterval(() => {
            if (lastFetchRef.current) {
                const elapsed = Math.floor((Date.now() - lastFetchRef.current.getTime()) / 1000);
                setNextIn(Math.max(0, 5 - elapsed));
            }
        }, 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            clearInterval(tickId);
        };
    }, [fetchBenchmarks]);

    // nextIn is tracked in state above

    // ── Loading skeleton
    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <div className="mb-8">
                    <div className="h-10 w-72 bg-muted animate-pulse rounded-lg mb-3" />
                    <div className="h-5 w-96 bg-muted animate-pulse rounded-lg" />
                </div>
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                    ))}
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="h-72 bg-muted animate-pulse rounded-xl" />
                    <div className="h-72 bg-muted animate-pulse rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-8">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Performance Benchmarks
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Real-time ZK-Proof metrics under simulated concurrent load · BBS+ Signature Engine
                    </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <LivePulse active={isLive} />
                    {lastUpdated && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                            Next update in {nextIn}s
                        </span>
                    )}
                    <button
                        onClick={fetchBenchmarks}
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                        <RefreshCw className="w-3 h-3" /> Refresh now
                    </button>
                </div>
            </div>

            {/* ── Status Banner ─────────────────────────────────────────── */}
            {backendDown && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                        Backend disconnected — showing <strong>demo data</strong>. Will reconnect automatically every 5 seconds.
                    </span>
                </div>
            )}

            {/* ── Primary KPI Row ───────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Proof Gen Time"
                    value={data?.proofGenTime ?? 0}
                    suffix="ms"
                    decimals={1}
                    icon={<Zap className="w-3 h-3" />}
                    color="hsl(221,83%,53%)"
                    sublabel="Avg over last 50 runs"
                />
                <StatCard
                    label="Verification Time"
                    value={data?.verificationTime ?? 0}
                    suffix="ms"
                    decimals={1}
                    icon={<Server className="w-3 h-3" />}
                    color="hsl(158,84%,39%)"
                    sublabel="Server-side BBS+ verify"
                />
                <StatCard
                    label="Proof Size"
                    value={data?.proofSize ?? 0}
                    suffix="B"
                    icon={<Lock className="w-3 h-3" />}
                    color="hsl(34,90%,52%)"
                    sublabel="ZK Payload (latest)"
                />
                <StatCard
                    label="Concurrent Users"
                    value={data?.concurrentUsers ?? 0}
                    suffix=""
                    icon={<Users className="w-3 h-3" />}
                    color="hsl(270,70%,60%)"
                    sublabel="Simulated load this round"
                    highlight
                />
            </div>

            {/* ── Secondary KPI Row ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Avg Pipeline"
                    value={data?.avgLatencyMs ?? 0}
                    suffix="ms"
                    decimals={1}
                    icon={<Activity className="w-3 h-3" />}
                    color="hsl(200,80%,50%)"
                    sublabel="Mean end-to-end latency"
                />
                <StatCard
                    label="p95 Latency"
                    value={data?.p95LatencyMs ?? 0}
                    suffix="ms"
                    decimals={1}
                    icon={<TrendingUp className="w-3 h-3" />}
                    color="hsl(0,70%,55%)"
                    sublabel="95th percentile pipeline"
                />
                <StatCard
                    label="Entropy Score"
                    value={data?.entropyScore ?? 0}
                    suffix=""
                    decimals={2}
                    icon={<Lock className="w-3 h-3" />}
                    color="hsl(158,84%,39%)"
                    sublabel="bits/byte (max 8.0)"
                />
                {/* Privacy grade uses a custom badge */}
                <Card className="relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: "radial-gradient(circle at top right, #10B981, transparent 70%)" }} />
                    <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Lock className="w-3 h-3" /> Privacy Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <PrivacyBadge score={data?.privacyScore ?? "—"} />
                    </CardContent>
                </Card>
            </div>

            {/* ── Throughput Chart + Privacy Comparison ─────────────────── */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Throughput Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            System Throughput
                            <span className="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
                                req/s
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Sparkline data={data?.throughput ?? []} />
                        <p className="text-center text-[11px] text-muted-foreground mt-3">
                            Verifications per second — updated every 5s
                        </p>
                    </CardContent>
                </Card>

                {/* Privacy Comparison */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Lock className="w-4 h-4 text-primary" />
                            Privacy Comparison
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Traditional */}
                        <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800">
                            <div>
                                <p className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">Traditional OAuth (JWT)</p>
                                <p className="text-xs text-muted-foreground">Reveals User ID on every call</p>
                            </div>
                            <span className="text-red-500 font-bold text-sm whitespace-nowrap">Linkable 100%</span>
                        </div>

                        {/* MediGuard */}
                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <div>
                                <p className="font-semibold text-sm text-green-700 dark:text-green-400">MediGuard ZK-Proof</p>
                                <p className="text-xs text-muted-foreground">Randomized BBS+ proofs</p>
                            </div>
                            <span className="text-green-600 font-bold text-sm whitespace-nowrap">Unlinkable 0%</span>
                        </div>

                        {/* Entropy */}
                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-semibold mb-3 text-foreground">Entropy Analysis</h4>
                            <EntropyBar score={data?.entropyScore ?? 0} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Run History Table ─────────────────────────────────────── */}
            {data?.history?.length ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Activity className="w-4 h-4 text-primary" />
                            Recent Benchmark Runs
                            <span className="ml-auto text-xs font-normal text-muted-foreground">
                                Last {Math.min(data.history.length, 8)} of {data.history.length} stored
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <HistoryTable history={data.history} />
                    </CardContent>
                </Card>
            ) : null}

        </div>
    );
}
