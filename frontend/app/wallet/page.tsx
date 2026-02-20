"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Shield, User, Info, Scan, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function WalletPage() {
    const [credentials, setCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading from IndexedDB
        setTimeout(() => {
            setCredentials([
                { id: "1", type: "Vaccination Record", issuer: "Apollo Hospital", date: "2024-01-15" },
                { id: "2", type: "Age Verification", issuer: "UIDAI", date: "2025-02-20" }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="container mx-auto p-4 max-w-md font-primary min-h-screen pb-24 relative">
            <header className="flex justify-between items-center mb-6 pt-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
                <Button size="icon" variant="ghost">
                    <User className="w-5 h-5" />
                </Button>
            </header>

            <div className="bg-gradient-to-r from-privaseal-blue to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-1/4 -translate-y-1/4">
                    <Shield className="w-32 h-32" />
                </div>
                <p className="text-blue-100 text-sm font-medium mb-1">PrivaSeal ID</p>
                <h2 className="text-2xl font-bold mb-4">Arjun Mehta</h2>
                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <p className="text-xs text-blue-200">Wallet Status</p>
                        <p className="font-semibold flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Active</p>
                    </div>
                    <QrCode className="w-8 h-8 opacity-90" />
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">My Credentials</h3>
                <Button variant="ghost" size="sm" className="text-privaseal-blue hover:text-privaseal-blue-dark hover:bg-privaseal-blue/10">See All</Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-privaseal-blue w-8 h-8" /></div>
            ) : (
                <div className="space-y-4">
                    {credentials.map((cred) => (
                        <Card key={cred.id} className="border-l-4 border-l-privaseal-blue shadow-sm hover:shadow-md transition-all cursor-pointer group">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-privaseal-blue transition-colors">{cred.type}</h4>
                                    <p className="text-sm text-gray-500">{cred.issuer}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium border border-green-200">Verified</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button variant="outline" className="w-full border-dashed border-2 py-8 text-gray-500 hover:border-privaseal-blue hover:text-privaseal-blue hover:bg-blue-50/50 transition-all">
                        <Plus className="mr-2 w-5 h-5" /> Add New Credential
                    </Button>
                </div>
            )}

            {/* Mobile Bottom Nav - Centered Scan Button */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
                <div className="bg-gray-900/90 backdrop-blur-md text-white px-6 py-2 rounded-full shadow-2xl flex items-center gap-10 border border-gray-800">
                    <Link href="/wallet" className="text-privaseal-blue transition-colors"><User className="w-6 h-6" /></Link>

                    <div className="relative -top-6">
                        <Link href="/wallet/scan">
                            <div className="bg-privaseal-blue w-14 h-14 rounded-full shadow-lg shadow-privaseal-blue/40 border-4 border-gray-50 dark:border-gray-900 flex items-center justify-center transform hover:scale-105 transition-transform">
                                <Scan className="w-6 h-6 text-white" />
                            </div>
                        </Link>
                    </div>

                    <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Info className="w-6 h-6" /></Link>
                </div>
            </div>
        </div>
    );
}
