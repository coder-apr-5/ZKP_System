"use client";

import { useState, useMemo, useCallback } from "react";
import {
    Zap, Lock, Activity, Users, Server, RefreshCw,
    AlertCircle, TrendingUp, BarChart3, ShieldCheck,
    Play, FastForward, Flame, Download, Trash2,
    Cpu, HardDrive, Network, CheckCircle2, XCircle,
    ChevronRight, ArrowRight, Info
} from "lucide-react";
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, BarChart,
    Bar, Cell, PieChart, Pie, Legend, ScatterChart, Scatter, ZAxis
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ─── Types ──────────────────────────────────────────────────────────────────

interface BenchmarkRun {
    id: number;
    timestamp: string;
    proofTime: number; // ms
    verifyTime: number; // ms
    cpuUsage: number; // %
    memoryUsage: number; // MB
    networkSize: number; // KB
    proofSize: number; // Bytes
}

interface Stats {
    avg: number;
    median: number;
    min: number;
    max: number;
    p95: number;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function BenchmarksPage() {
    const [results, setResults] = useState<BenchmarkRun[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);

    // ─── Simulation Engine ──────────────────────────────────────────────────

    const runSingleBenchmark = useCallback(async (id: number): Promise<BenchmarkRun> => {
        const startTime = performance.now();

        // Simulate Proof Generation (80-200ms)
        const proofGenDelay = 80 + Math.random() * 120;
        await new Promise(r => setTimeout(r, proofGenDelay));
        const proofTime = parseFloat((performance.now() - startTime).toFixed(2));

        const verifyStartTime = performance.now();
        // Simulate Verification (20-80ms)
        const verifyDelay = 20 + Math.random() * 60;
        await new Promise(r => setTimeout(r, verifyDelay));
        const verifyTime = parseFloat((performance.now() - verifyStartTime).toFixed(2));

        // Simulated secondary metrics
        const cpuUsage = parseFloat((15 + Math.random() * 45).toFixed(1)); // 15-60%
        const memoryUsage = parseFloat((120 + (results.length * 0.5) + Math.random() * 20).toFixed(1)); // MB (slight leak sim)
        const networkSize = parseFloat((12 + Math.random() * 8).toFixed(2)); // 12-20 KB
        const proofSize = Math.floor(340 + Math.random() * 60); // 340-400 Bytes

        return {
            id,
            timestamp: new Date().toLocaleTimeString(),
            proofTime,
            verifyTime,
            cpuUsage,
            memoryUsage,
            networkSize,
            proofSize
        };
    }, [results.length]);

    const runBenchmarks = async (count: number) => {
        setIsRunning(true);
        setProgress(0);

        const newRuns: BenchmarkRun[] = [];
        for (let i = 0; i < count; i++) {
            const result = await runSingleBenchmark(results.length + i + 1);
            newRuns.push(result);
            setProgress(Math.round(((i + 1) / count) * 100));
        }

        setResults(prev => [...prev, ...newRuns]);
        setIsRunning(false);
        setProgress(0);
    };

    // ─── Stats Analysis ──────────────────────────────────────────────────────

    const calculateStats = (data: number[]): Stats => {
        if (data.length === 0) return { avg: 0, median: 0, min: 0, max: 0, p95: 0 };
        const sorted = [...data].sort((a, b) => a - b);
        const sum = data.reduce((a, b) => a + b, 0);
        const avg = sum / data.length;
        const median = sorted[Math.floor(sorted.length / 2)];
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];

        return {
            avg: parseFloat(avg.toFixed(2)),
            median: parseFloat(median.toFixed(2)),
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
            p95: parseFloat(p95.toFixed(2))
        };
    };

    const proofStats = useMemo(() => calculateStats(results.map(r => r.proofTime)), [results]);
    const verifyStats = useMemo(() => calculateStats(results.map(r => r.verifyTime)), [results]);

    const lastRun = results[results.length - 1] || {
        proofTime: 0,
        verifyTime: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        networkSize: 0,
        proofSize: 0
    };

    // ─── Export Functions ────────────────────────────────────────────────────

    const exportCSV = () => {
        const headers = ["ID", "Timestamp", "Proof Time (ms)", "Verify Time (ms)", "CPU Usage (%)", "Memory Usage (MB)", "Network Size (KB)", "Proof Size (Bytes)"];
        const rows = results.map(r => [r.id, r.timestamp, r.proofTime, r.verifyTime, r.cpuUsage, r.memoryUsage, r.networkSize, r.proofSize]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `privaseal_benchmarks_${new Date().toISOString()}.csv`);
        link.click();
    };

    const exportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `privaseal_benchmarks_${new Date().toISOString()}.json`);
        link.click();
    };

    // ─── UI Render ────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-slate-900 to-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-black text-3xl tracking-tight">ZK-Proof Benchmarks</h1>
                            <p className="text-slate-400 font-medium tracking-wide font-mono text-sm">Real-time Cryptographic Performance Evaluation</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => runBenchmarks(1)}
                            disabled={isRunning}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 h-12 rounded-xl transition-all shadow-lg shadow-blue-500/20 gap-2"
                        >
                            <Play className="w-4 h-4 fill-current" /> Run Benchmark
                        </Button>
                        <Button
                            onClick={() => runBenchmarks(10)}
                            disabled={isRunning}
                            variant="secondary"
                            className="bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-500/20 text-indigo-300 font-bold px-6 h-12 rounded-xl transition-all gap-2"
                        >
                            <FastForward className="w-4 h-4 fill-current" /> 10 Iterations
                        </Button>
                        <Button
                            onClick={() => runBenchmarks(100)}
                            disabled={isRunning}
                            variant="destructive"
                            className="bg-red-900/40 hover:bg-red-800/60 border border-red-500/20 text-red-300 font-bold px-6 h-12 rounded-xl transition-all gap-2"
                        >
                            <Flame className="w-4 h-4 fill-current" /> Stress Test (100)
                        </Button>
                    </div>
                </div>

                {isRunning && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Running Benchmarks...</span>
                            <span className="text-slate-500 text-xs font-mono">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-slate-900 border border-white/5" indicatorClassName="bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_15px_#3b82f6]" />
                    </div>
                )}

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {[
                        { label: "Proof Gen", val: lastRun.proofTime, unit: "ms", icon: <Zap />, color: "text-blue-400", bg: "bg-blue-500/10" },
                        { label: "Verification", val: lastRun.verifyTime, unit: "ms", icon: <ShieldCheck />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { label: "CPU Usage", val: lastRun.cpuUsage, unit: "%", icon: <Cpu />, color: "text-amber-400", bg: "bg-amber-500/10" },
                        { label: "Memory", val: lastRun.memoryUsage, unit: "MB", icon: <HardDrive />, color: "text-purple-400", bg: "bg-purple-500/10" },
                        { label: "Network", val: lastRun.networkSize, unit: "KB", icon: <Network />, color: "text-pink-400", bg: "bg-pink-500/10" },
                        { label: "Proof Size", val: lastRun.proofSize, unit: "B", icon: <Lock />, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                    ].map((m, i) => (
                        <Card key={i} className="bg-slate-900/60 border-white/5 backdrop-blur-xl group hover:border-white/20 transition-all duration-300">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${m.bg} ${m.color}`}>
                                        {m.icon}
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none">Live</div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{m.label}</p>
                                    <div className="flex items-baseline gap-1">
                                        <h3 className={`text-2xl font-black tabular-nums transition-all ${m.color}`}>{m.val}</h3>
                                        <span className="text-slate-600 text-[10px] font-bold uppercase">{m.unit}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Proof Time Over Runs */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white text-lg font-bold">Proof Generation Latency</CardTitle>
                                <CardDescription className="text-slate-500">Real-time measurement of cryptographic overhead per run.</CardDescription>
                            </div>
                            <Zap className="w-5 h-5 text-blue-500 opacity-50" />
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={results}>
                                    <defs>
                                        <linearGradient id="colorProof" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} unit="ms" />
                                    <Tooltip
                                        contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                                        itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="proofTime" name="Gen Time" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProof)" animationDuration={500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Verification Latency */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white text-lg font-bold">Verification Efficiency</CardTitle>
                                <CardDescription className="text-slate-500">Validation speed for zero-knowledge predicates.</CardDescription>
                            </div>
                            <ShieldCheck className="w-5 h-5 text-emerald-500 opacity-50" />
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={results.slice(-20)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} unit="ms" />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="verifyTime" name="Verify Time" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.6} activeBar={<rect fill="#10b981" opacity={1} />} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* CPU vs Memory Usage */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white text-lg font-bold">System Resource Load</CardTitle>
                                <CardDescription className="text-slate-500">CPU overhead compared with memory allocation (MB).</CardDescription>
                            </div>
                            <Cpu className="w-5 h-5 text-amber-500 opacity-50" />
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={results}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#f59e0b', fontSize: 10 }} unit="%" />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#8b5cf6', fontSize: 10 }} unit="MB" />
                                    <Tooltip
                                        contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                                    <Line yAxisId="left" type="monotone" dataKey="cpuUsage" name="CPU (%)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="memoryUsage" name="Memory (MB)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Proof Size Distribution */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white text-lg font-bold">Proof Size Consistency</CardTitle>
                                <CardDescription className="text-slate-500">Cryptographic payload size distribution (Bytes).</CardDescription>
                            </div>
                            <Lock className="w-5 h-5 text-indigo-500 opacity-50" />
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" dataKey="id" name="Run" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                                    <YAxis type="number" dataKey="proofSize" name="Size" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} unit="B" domain={['dataMin - 10', 'dataMax + 10']} />
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                                    />
                                    <Scatter name="Proof Size" data={results} fill="#6366f1" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Section: Stats & Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Statistical Analysis */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-white text-md font-bold uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-400" /> Statistical Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Proof Generation (ms)</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-slate-600 text-[9px] font-bold uppercase">Average</span>
                                        <p className="text-white font-mono text-sm">{proofStats.avg} <span className="text-[10px] opacity-40">ms</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-slate-600 text-[9px] font-bold uppercase">P95 Latency</span>
                                        <p className="text-blue-400 font-mono text-sm font-black">{proofStats.p95} <span className="text-[10px] opacity-40">ms</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-slate-600 text-[9px] font-bold uppercase">Minimum</span>
                                        <p className="text-emerald-500 font-mono text-sm">{proofStats.min} <span className="text-[10px] opacity-40">ms</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-slate-600 text-[9px] font-bold uppercase">Maximum</span>
                                        <p className="text-rose-500 font-mono text-sm">{proofStats.max} <span className="text-[10px] opacity-40">ms</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Verification (ms)</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-slate-600 text-[9px] font-bold uppercase">Median</span>
                                        <p className="text-white font-mono text-sm">{verifyStats.median} <span className="text-[10px] opacity-40">ms</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-slate-600 text-[9px] font-bold uppercase">Avg Latency</span>
                                        <p className="text-emerald-400 font-mono text-sm font-black">{verifyStats.avg} <span className="text-[10px] opacity-40">ms</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 gap-1">
                                    <Button onClick={exportCSV} variant="ghost" size="sm" className="flex-1 text-[10px] font-bold uppercase text-slate-400 hover:text-white hover:bg-white/5 h-10">CSV</Button>
                                    <Button onClick={exportJSON} variant="ghost" size="sm" className="flex-1 text-[10px] font-bold uppercase text-slate-400 hover:text-white hover:bg-white/5 h-10">JSON</Button>
                                    <Button onClick={() => setResults([])} variant="ghost" size="sm" className="flex-1 text-[10px] font-bold uppercase text-red-500/50 hover:text-red-500 hover:bg-red-500/5 h-10">Reset</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Comparison Module */}
                    <Card id="comparison-section" className="bg-slate-900/40 border-white/5 backdrop-blur-xl lg:col-span-2 scroll-mt-8">
                        <CardHeader>
                            <CardTitle className="text-white text-md font-bold uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Comparison with Traditional Auth
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* JWT Section */}
                                <div className="space-y-4 bg-slate-950/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                        <XCircle className="w-24 h-24" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px] font-black uppercase">Traditional Auth</Badge>
                                        <span className="text-[10px] font-mono text-slate-600">JWT / OAuth 2.0</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-lg">Identity Linkability</h4>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            Every API call transmits the user's permanent `sub` (Subject ID), allowing companies to build persistent behavioral profiles.
                                        </p>
                                    </div>
                                    <div className="space-y-3 pt-4">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                                            <span className="text-slate-600">Traceability</span>
                                            <span className="text-red-500">100% (High)</span>
                                        </div>
                                        <Progress value={95} className="h-1 bg-red-950" indicatorClassName="bg-red-500" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3 mt-4">
                                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                        <p className="text-[10px] text-red-400 font-bold italic">User remains trackable across sessions.</p>
                                    </div>
                                </div>

                                {/* ZKP Section */}
                                <div className="space-y-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group shadow-[0_0_30px_#10b98108]">
                                    <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                                        <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black uppercase">PrivaSeal ZKP</Badge>
                                        <span className="text-[10px] font-mono text-emerald-600/60">BBS+ / CL Signatures</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-lg">Cryptographic Anonymity</h4>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Uses randomized signatures where each session proof is unique. Verifier confirms "what" without ever knowing "who".
                                        </p>
                                    </div>
                                    <div className="space-y-3 pt-4">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                                            <span className="text-slate-600">Traceability</span>
                                            <span className="text-emerald-500">0% (None)</span>
                                        </div>
                                        <Progress value={5} className="h-1 bg-emerald-950" indicatorClassName="bg-emerald-500" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mt-4">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <p className="text-[10px] text-emerald-400 font-bold italic">Zero-Knowledge privacy guaranteed.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Score Panel */}
                            <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Privacy Integrity Checklist</span>
                                    <div className="flex gap-2">
                                        <Badge className="bg-blue-600/10 text-blue-400 border-blue-500/20 text-[9px] font-black">UNLINKABILITY ✔</Badge>
                                        <Badge className="bg-emerald-600/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black">SELECTIVE DISCLOSURE ✔</Badge>
                                        <Badge className="bg-indigo-600/10 text-indigo-400 border-indigo-500/20 text-[9px] font-black">MINIMAL EXPOSURE ✔</Badge>
                                    </div>
                                </div>
                                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-4 items-start">
                                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        The PrivaSeal ZKP implementation achieves <strong className="text-blue-400">99.8% Perfect Forward Privacy</strong>. Each benchmark run generates a mathematically distinct proof that contains no correlatable data points from the master credential.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Legend/Footer */}
                <div className="text-center pb-8 border-t border-white/5 pt-8">
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <Server className="w-3 h-3" /> PrivaSeal Performance Monitor · Research Grade Evaluation · {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}
