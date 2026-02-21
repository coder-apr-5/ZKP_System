"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, List, Settings, Activity, Loader2 } from "lucide-react";

const BACKEND = "http://localhost:8000";

interface Stats {
    totalIssued: number;
    activeCredentials: number;
    activePercent: number;
    typesSupported: number;
}

export default function IssuerDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${BACKEND}/api/issuer/stats`, { cache: "no-store" })
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setStats(d); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const StatValue = ({ value, suffix = "" }: { value: number | string; suffix?: string }) => (
        loading
            ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            : <div className="text-4xl font-bold text-gray-900 dark:text-white">{value}{suffix}</div>
    );

    return (
        <div className="container mx-auto p-8 max-w-6xl font-primary">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Issuer Portal</h1>
                    <p className="text-gray-500 mt-1">Manage credentials and cryptographic keys.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/issuer/init"><Settings className="mr-2 w-4 h-4" /> Key Management</Link>
                </Button>
            </div>

            {/* Live stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Issued</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue value={stats?.totalIssued ?? 0} />
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-green-500" />
                            {stats?.totalIssued ? "Live count from store" : "No credentials yet"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Credentials</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue
                            value={stats ? `${stats.activePercent}%` : "—"}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {stats ? `${stats.activeCredentials} of ${stats.totalIssued} valid and unrevoked` : "Loading…"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-purple-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Types Supported</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue value={stats?.typesSupported ?? 3} />
                        <p className="text-xs text-gray-500 mt-1">Vaccine · Rx · Age</p>
                    </CardContent>
                </Card>
            </div>

            {/* Action cards */}
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="h-full hover:border-blue-400 transition-colors group cursor-pointer">
                    <Link href="/issuer/issue">
                        <CardHeader>
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <CardTitle className="text-xl">Issue New Credential</CardTitle>
                            <CardDescription>Create and sign a new verifiable credential for a user.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Vaccination Certificates</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Medical Prescriptions</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Age Verification IDs</li>
                            </ul>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="h-full hover:border-blue-400 transition-colors group cursor-pointer">
                    <Link href="/issuer/issued">
                        <CardHeader>
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 mb-4 group-hover:bg-gray-800 group-hover:text-white transition-colors">
                                <List className="w-6 h-6" />
                            </div>
                            <CardTitle className="text-xl">View Issued Log</CardTitle>
                            <CardDescription>Audit log of all credentials issued by this institution.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-4">
                                View privacy-preserving logs. No PII stored, only credential hashes and timestamps.
                            </p>
                            <Button variant="secondary" className="w-full">View Audit Log</Button>
                        </CardContent>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
