"use client";

import { useAuth } from "@/context/AuthContext";
import { useDemoData } from "@/context/DemoContext";
import {
    Users, ShieldCheck, ShieldAlert, Activity,
    TrendingUp, ArrowUpRight, ArrowDownRight,
    Clock, Plus, Filter, Download, MoreHorizontal,
    Building2, Fingerprint, Lock, Shield, Info,
    CheckCircle2, AlertCircle, Zap
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
    Cell, PieChart, Pie
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Mock data for charts
const activityData = [
    { name: "01 Feb", issued: 12, checks: 45 },
    { name: "02 Feb", issued: 19, checks: 52 },
    { name: "03 Feb", issued: 15, checks: 38 },
    { name: "04 Feb", issued: 22, checks: 65 },
    { name: "05 Feb", issued: 30, checks: 48 },
    { name: "06 Feb", issued: 25, checks: 55 },
    { name: "07 Feb", issued: 28, checks: 72 },
];

function StatCard({ title, value, subValue, trend, icon: Icon, color }: any) {
    return (
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 pointer-events-none ${color}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</CardTitle>
                <div className={`p-2 rounded-xl bg-slate-800/50 text-slate-300 group-hover:${color.replace('bg-', 'text-')} transition-colors`}>
                    <Icon className="w-4 h-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-black text-white tabular-nums tracking-tighter">{value}</div>
                    {trend && (
                        <div className={`flex items-center text-[10px] font-bold ${trend > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">{subValue}</p>
            </CardContent>
        </Card>
    );
}

export default function IssuerDashboard() {
    const { credentials, verificationLogs, auditLogs } = useDemoData();
    const { backendProfile } = useAuth();

    const stats = {
        total: credentials.length,
        active: credentials.filter(c => c.status === "Active").length,
        revoked: credentials.filter(c => c.status === "Revoked").length,
        checks: verificationLogs.length,
        growth: 12.5
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Top Bar */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
                        Issuer Portal
                    </h1>
                    <p className="text-slate-400 font-medium mt-1 flex items-center gap-2">
                        Trusted Node Status: <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Certified Operational</span>
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link href="/benchmarks">
                        <Button variant="outline" className="bg-slate-900/50 border-white/10 text-slate-400 hover:text-white gap-2 h-11 px-6 rounded-xl">
                            <Zap className="w-4 h-4 fill-current text-blue-400" /> Run Performance Test
                        </Button>
                    </Link>
                    <Link href="/issuer/issue">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black gap-2 h-11 px-8 rounded-xl shadow-lg shadow-blue-500/20 uppercase text-xs tracking-widest">
                            <Plus className="w-4 h-4" /> Issue Credential
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1️⃣ ISSUER IDENTITY PANEL */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600/10 via-slate-900/40 to-slate-900/40 border-blue-500/10 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Building2 className="w-40 h-40 text-blue-400" />
                    </div>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] font-black uppercase tracking-widest mb-4">Trusted Authority</Badge>
                                <CardTitle className="text-3xl font-black text-white tracking-tight leading-none uppercase italic italic">
                                    {backendProfile?.name || "PrivaSeal Root Issuer"}
                                </CardTitle>
                                <CardDescription className="text-slate-400 mt-2 font-medium">Certified Organization: Government Entity / Central Registry</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest">
                                <CheckCircle2 className="w-3 h-3 mr-2" /> Trust Verified
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Fingerprint className="w-3 h-3" /> Issuer DID
                                </p>
                                <p className="text-xs font-mono text-white truncate">did:privaseal:issuer:0x8821...XP91</p>
                            </div>
                            <div className="space-y-2 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="w-3 h-3" /> Signature Scheme
                                </p>
                                <p className="text-xs font-bold text-white">BBS+ (Multi-Message signatures)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                            <Info className="w-5 h-5 text-blue-400 shrink-0" />
                            <p className="text-[11px] text-slate-400 font-medium italic">
                                "The Issuer signs credentials used for Zero-Knowledge Proofs but does **NOT** track user activity or proof usage across third-party verifiers."
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 8️⃣ PRIVACY GUARANTEE PANEL */}
                <Card className="bg-slate-900 border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Lock className="w-20 h-20 text-emerald-500" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-white text-md font-black uppercase tracking-widest">Privacy Guarantees</CardTitle>
                        <CardDescription className="text-slate-500">How your issuance is secured.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { label: "Selective Disclosure", desc: "Users can share only specific attributes.", icon: CheckCircle2 },
                            { label: "Unlinkability", desc: "No correlation between multiple proof runs.", icon: CheckCircle2 },
                            { label: "Minimal Data Exposure", desc: "Verifiers never see raw identity data.", icon: CheckCircle2 },
                        ].map((claim, i) => (
                            <div key={i} className="flex gap-4 items-start p-3 bg-white/5 rounded-2xl border border-transparent hover:border-emerald-500/20 transition-all">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                                    <claim.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-tight">{claim.label}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{claim.desc}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Issued"
                    value={stats.total}
                    subValue="Overall platform count"
                    trend={stats.growth}
                    icon={ShieldCheck}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Registry"
                    value={stats.active}
                    subValue="Current unrevoked proofs"
                    trend={5.2}
                    icon={Activity}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Revocations"
                    value={stats.revoked}
                    subValue="Manual/Auto revoked"
                    trend={-2.1}
                    icon={ShieldAlert}
                    color="bg-rose-500"
                />
                <StatCard
                    title="Today's Checks"
                    value={stats.checks}
                    subValue="Across all nodes"
                    trend={18.4}
                    icon={Clock}
                    color="bg-purple-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-slate-900/40 border-white/5 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-white text-lg font-bold tracking-tight">Issuance Flux</CardTitle>
                            <CardDescription className="text-slate-500">7-day volume tracking</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Issued
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-teal-500/10 text-[10px] font-bold text-teal-400 border border-teal-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Verifications
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorChecks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#64748B' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#64748B' }}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="issued" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorIssued)" />
                                <Area type="monotone" dataKey="checks" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#colorChecks)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Audit Logs */}
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl h-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-white text-md font-bold tracking-widest uppercase opacity-60">System Audit</CardTitle>
                        </div>
                        <Link href="/issuer/logs">
                            <Button variant="ghost" size="sm" className="text-blue-400 font-bold text-[10px] uppercase">View History</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {auditLogs.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex gap-4 group">
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_8px_#3b82f6]" />
                                        <div className="w-[1px] h-full bg-white/5 mt-1" />
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-[10px] font-black text-white tracking-widest uppercase italic">{log.action.replace('_', ' ')}</span>
                                            <span className="text-[9px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{log.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
